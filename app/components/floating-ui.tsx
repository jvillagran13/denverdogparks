"use client";

import { usePathname } from "next/navigation";
import { useAppState } from "./providers";
import { AnchorAd } from "./ad-slot";
import CompareTray from "./compare-tray";
import type { Park, AdCreative } from "@/app/data";

export default function FloatingUI({ parks, anchorAd }: { parks: Park[]; anchorAd: AdCreative | null }) {
  const pathname = usePathname();
  const { showAds, compareIds } = useAppState();

  const hideAnchor = pathname === "/business" || pathname === "/dashboard";
  const hideCompare = pathname === "/compare";

  return (
    <>
      {showAds && !hideAnchor && anchorAd && <AnchorAd ad={anchorAd} />}
      {!hideCompare && compareIds.length > 0 && <CompareTray parks={parks} />}
    </>
  );
}
