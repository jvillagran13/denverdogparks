# Auth & Accounts Design

## Goal

Add user authentication so saved parks and reviews persist across devices. Support Google/Apple OAuth plus email/password. Business accounts are a role upgrade on regular accounts, not a separate account type.

## Architecture

Supabase Auth handles all authentication — Google OAuth, Apple OAuth, email/password fallback. A `profiles` table extends `auth.users` with app-specific data (display name, role, avatar URL). Roles are `user` (default) and `sponsor` (unlocked when they start a sponsorship).

Session management uses Supabase middleware that refreshes the auth session on every request. Server components read the session to conditionally render (e.g., "Sign in" vs avatar in TopNav). Client components access the user via a `useUser()` hook from the providers context.

Saved parks move from localStorage to a `saved_parks` table (user_id + park_slug). On login, any localStorage saves merge into the DB, then localStorage is cleared. Logged-out users still get localStorage saves (graceful degradation).

## Data Model

### New Tables

**profiles**
- `id` UUID PRIMARY KEY (FK to `auth.users.id`)
- `display_name` TEXT
- `avatar_url` TEXT (nullable)
- `role` TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'sponsor'))
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

**saved_parks**
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL (FK to profiles.id ON DELETE CASCADE)
- `park_slug` TEXT NOT NULL (FK to parks.slug ON DELETE CASCADE)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- UNIQUE (user_id, park_slug)

### RLS Policies

**profiles:**
- Public read (display names/avatars visible to everyone)
- Users can update their own row (`auth.uid() = id`)
- Insert handled by trigger (not user-facing)

**saved_parks:**
- Users can SELECT their own rows (`auth.uid() = user_id`)
- Users can INSERT their own rows (`auth.uid() = user_id`)
- Users can DELETE their own rows (`auth.uid() = user_id`)

### Trigger

Auto-create a `profiles` row when a new user signs up via a Postgres trigger on `auth.users`. Populate `display_name` from `raw_user_meta_data->>'full_name'` (set by Google/Apple OAuth) and `avatar_url` from `raw_user_meta_data->>'avatar_url'`.

## Auth Flow

1. **Sign in** — TopNav shows "Sign in" button. Clicking it navigates to `/login` page with Google, Apple, and email/password options.
2. **OAuth callback** — Supabase handles the OAuth redirect. Session is set via cookies. Middleware refreshes on every request.
3. **Signed in** — TopNav shows avatar + display name with a dropdown (My saves, Dashboard if sponsor, Sign out). Saved parks sync: localStorage saves merge into DB on first sign-in, then localStorage is cleared.
4. **Sign up (email)** — Email/password form with email confirmation. Profile auto-created by trigger.
5. **Role upgrade** — When a user starts a sponsorship via the business checkout flow, their profile role is updated to `'sponsor'`, unlocking the dashboard with real data tied to their account.

## UI Changes

### TopNav
- **Logged out:** "Sign in" button in the right section (replacing or alongside "For Businesses" / "Dashboard")
- **Logged in:** Avatar circle + display name with dropdown menu:
  - "My saves" → `/saved`
  - "Dashboard" → `/dashboard` (only if role === 'sponsor')
  - "For Businesses" → `/business`
  - Divider
  - "Sign out"

### Login Page (`/login`)
- Clean page matching Sniff editorial aesthetic
- Wordmark at top
- "Sign in to Sniff" heading
- Google sign-in button (primary)
- Apple sign-in button
- Divider ("or")
- Email + password form with "Sign up" / "Sign in" toggle
- "Forgot password?" link (Supabase handles reset flow)
- Redirect to previous page after sign-in (or home if none)

### Saved Page
- **Logged out:** Show localStorage saves + banner: "Sign in to sync your saves across devices"
- **Logged in:** Show DB saves. No localStorage involved.

### Park Cards
- Save button works the same visually
- **Logged in:** Toggle writes to/deletes from `saved_parks` table
- **Logged out:** Toggle writes to localStorage (current behavior)

## Middleware

Next.js middleware at `middleware.ts` (or `proxy.ts` for Next.js 16) that:
1. Creates a Supabase server client
2. Calls `supabase.auth.getUser()` to refresh the session
3. Passes the response through (no route protection needed — all pages are public, auth is opt-in)

## Client-Side State

Update `AppProvider` in `providers.tsx`:
- Add `user` state (from Supabase auth)
- Add `useUser()` hook that returns `{ user, profile, loading }`
- When user signs in: fetch their `saved_parks` from DB, merge with localStorage, clear localStorage, update savedSet state
- When user signs out: clear savedSet state (they go back to localStorage mode)
- Save/unsave operations: if logged in, write to DB + update local state. If logged out, write to localStorage.

## Auth Providers Setup

Supabase project needs OAuth providers configured:
- Google: requires Google Cloud Console OAuth client ID + secret
- Apple: requires Apple Developer account with Sign in with Apple service ID

These are configured in the Supabase dashboard (Authentication > Providers). The redirect URL is `https://<project-ref>.supabase.co/auth/v1/callback`.

For local development, the redirect URL also needs `http://localhost:3000/auth/callback` added.

## Routes

- `/login` — Login/signup page
- `/auth/callback` — OAuth callback handler (server route that exchanges code for session)

## Testing Criteria

- Google OAuth sign-in creates profile and redirects
- Email/password sign-up sends confirmation, sign-in works after confirmation
- Saves made while logged out merge into DB on first sign-in
- Saves sync across devices when logged in
- Sign out clears session, reverts to localStorage saves
- TopNav shows correct state for logged-in/out
- Saved page shows correct saves for logged-in/out
- Role upgrade to sponsor shows Dashboard in dropdown
