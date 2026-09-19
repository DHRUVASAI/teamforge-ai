import type { Metadata } from "next";
import "./globals.css";
import SoundAndIntro from "./components/SoundAndIntro";

export const metadata: Metadata = {
  title: "TeamForge - Mission Control",
  description: "Your AI engineering mentor. From idea to shipped product.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SoundAndIntro />
        {children}
      </body>
    </html>
  );
}
