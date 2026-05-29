"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "./sniff-mark";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(
    searchParams.get("error") ? "Authentication failed. Please try again." : null
  );
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => createClient(), []);
  const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) setError(error.message);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) setError(error.message);
      else setMessage("Check your email for a confirmation link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/");
    }

    setLoading(false);
  }

  return (
    <div
      className="screen"
      style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block" }}>
            <Wordmark />
          </div>
        </div>
        <div className="side-card" style={{ padding: 28 }}>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: 26,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {mode === "signin" ? "Sign in to Sniff" : "Create an account"}
          </h2>

          <button
            className="btn-ghost"
            style={{
              width: "100%",
              marginBottom: 8,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onClick={() => handleOAuth("google")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <button
            className="btn-ghost"
            style={{
              width: "100%",
              marginBottom: 20,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onClick={() => handleOAuth("apple")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "16px 0",
              color: "var(--stone)",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <form onSubmit={handleEmailSubmit}>
            <label style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  marginTop: 4,
                  border: "1px solid var(--line-2)",
                  borderRadius: "var(--r-sm)",
                  fontFamily: "var(--sans)",
                  fontSize: 14,
                }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 16, fontSize: 13 }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  marginTop: 4,
                  border: "1px solid var(--line-2)",
                  borderRadius: "var(--r-sm)",
                  fontFamily: "var(--sans)",
                  fontSize: 14,
                }}
              />
            </label>

            {error && (
              <p style={{ color: "#c44", fontSize: 13, marginBottom: 12 }}>
                {error}
              </p>
            )}
            {message && (
              <p
                style={{
                  color: "var(--forest)",
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", padding: "10px 16px" }}
              disabled={loading}
            >
              {loading
                ? "..."
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: 16,
              fontSize: 13,
              color: "var(--stone)",
            }}
          >
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setMessage(null);
                  }}
                  style={{
                    background: "none",
                    border: 0,
                    color: "var(--forest)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    padding: 0,
                  }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have one?{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setMessage(null);
                  }}
                  style={{
                    background: "none",
                    border: 0,
                    color: "var(--forest)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    padding: 0,
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
