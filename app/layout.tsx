import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./sniff.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
