"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface AppState {
  user: User | null;
  profile: Profile | null;
  authLoading: boolean;
  savedSet: Set<string>;
  toggleSave: (id: string) => void;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  setCompareIds: (ids: string[]) => void;
  signOut: () => Promise<void>;
  badgeStyle: string;
  showAds: boolean;
  adDensity: string;
  rightNow: string;
  showPromoted: boolean;
}

const AppContext = React.createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

function getLocalSaves(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem("sniff:saved") || "[]"));
  } catch {
    return new Set();
  }
}

function setLocalSaves(set: Set<string>) {
  localStorage.setItem("sniff:saved", JSON.stringify([...set]));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [savedSet, setSavedSet] = React.useState<Set<string>>(getLocalSaves);
  const [compareIds, setCompareIds] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("sniff:compare") || "[]");
    } catch {
      return [];
    }
  });

  const supabase = React.useMemo(() => createClient(), []);

  const badgeStyle = "halo";
  const showAds = true;
  const adDensity = "standard";
  const rightNow = "hot";
  const showPromoted = true;

  // Initialize auth + fetch saved parks from DB
  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setUser(u);

      if (u) {
        // Fetch profile
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single();
        if (!cancelled) setProfile(p);

        // Fetch DB saves
        const { data: dbSaves } = await supabase
          .from("saved_parks")
          .select("park_slug")
          .eq("user_id", u.id);
        const dbSet = new Set(
          (dbSaves || []).map((r: { park_slug: string }) => r.park_slug)
        );

        // Merge localStorage into DB
        const localSaves = getLocalSaves();
        const toMerge = [...localSaves].filter((s) => !dbSet.has(s));
        if (toMerge.length > 0) {
          await supabase.from("saved_parks").upsert(
            toMerge.map((park_slug) => ({ user_id: u.id, park_slug })),
            { onConflict: "user_id,park_slug" }
          );
          toMerge.forEach((s) => dbSet.add(s));
        }

        // Clear localStorage, use DB as source of truth
        localStorage.removeItem("sniff:saved");
        if (!cancelled) setSavedSet(dbSet);
      }

      if (!cancelled) setAuthLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single();
        setProfile(p);

        const { data: dbSaves } = await supabase
          .from("saved_parks")
          .select("park_slug")
          .eq("user_id", u.id);
        setSavedSet(
          new Set(
            (dbSaves || []).map((r: { park_slug: string }) => r.park_slug)
          )
        );
        localStorage.removeItem("sniff:saved");
      } else {
        setProfile(null);
        setSavedSet(getLocalSaves());
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Persist compare to localStorage
  React.useEffect(() => {
    localStorage.setItem("sniff:compare", JSON.stringify(compareIds));
  }, [compareIds]);

  React.useEffect(() => {
    document.body.dataset.anchorAd = showAds ? "true" : "false";
  }, [showAds]);

  async function toggleSave(id: string) {
    const next = new Set(savedSet);
    if (next.has(id)) {
      next.delete(id);
      if (user) {
        await supabase
          .from("saved_parks")
          .delete()
          .eq("user_id", user.id)
          .eq("park_slug", id);
      }
    } else {
      next.add(id);
      if (user) {
        await supabase
          .from("saved_parks")
          .insert({ user_id: user.id, park_slug: id });
      }
    }
    setSavedSet(next);
    if (!user) setLocalSaves(next);
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSavedSet(getLocalSaves());
  }

  const value: AppState = {
    user,
    profile,
    authLoading,
    savedSet,
    toggleSave,
    compareIds,
    toggleCompare,
    setCompareIds,
    signOut,
    badgeStyle,
    showAds,
    adDensity,
    rightNow,
    showPromoted,
  };

  return <AppContext value={value}>{children}</AppContext>;
}
