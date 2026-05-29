"use client";

import React from "react";

interface AppState {
  savedSet: Set<string>;
  toggleSave: (id: string) => void;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  setCompareIds: (ids: string[]) => void;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [savedSet, setSavedSet] = React.useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem("sniff:saved") || "[]")); } catch { return new Set(); }
  });
  const [compareIds, setCompareIds] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("sniff:compare") || "[]"); } catch { return []; }
  });

  const badgeStyle = "halo";
  const showAds = true;
  const adDensity = "standard";
  const rightNow = "hot";
  const showPromoted = true;

  React.useEffect(() => { localStorage.setItem("sniff:saved", JSON.stringify([...savedSet])); }, [savedSet]);
  React.useEffect(() => { localStorage.setItem("sniff:compare", JSON.stringify(compareIds)); }, [compareIds]);

  React.useEffect(() => {
    document.body.dataset.anchorAd = showAds ? "true" : "false";
  }, [showAds]);

  function toggleSave(id: string) {
    setSavedSet((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  const value: AppState = { savedSet, toggleSave, compareIds, toggleCompare, setCompareIds, badgeStyle, showAds, adDensity, rightNow, showPromoted };

  return <AppContext value={value}>{children}</AppContext>;
}
