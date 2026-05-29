import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./sniff.css";
import { AppProvider } from "./components/providers";
import TopNav from "./components/top-nav";
import FloatingUI from "./components/floating-ui";
import { getAllParks, getAdCreatives } from "@/lib/queries";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sniff · Denver dog parks, scored.",
  description:
    "The fully scored guide to every off-leash park in Denver. 12 parks ranked across six things that actually matter.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [parks, ads] = await Promise.all([getAllParks(), getAdCreatives()]);
  const anchorAd = ads.length > 5 ? ads[5] : ads[0] || null;

  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body>
        <AppProvider>
          <TopNav />
          {children}
          <FloatingUI parks={parks} anchorAd={anchorAd} />
        </AppProvider>
      </body>
    </html>
  );
}
