import { coolvetica } from "@/fonts";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import React from "react";
import Applayout from "./Applayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAPs by Checkin",
  description: "Curate, Mint, Earn. Your Recommendations, onchain.",
  twitter: {
    images: "https://i.imgur.com/4zk2g3M.png",
    title: "MAPs by Checkin",
    description: `Curate, Mint, Earn. Your Recommendations, onchain.`,
  },
  openGraph: {
    images: "https://i.imgur.com/4zk2g3M.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-custom-gray-30">
      <body className={`${coolvetica.className} tracking-wider`}>
        <Applayout>{children}</Applayout>
      </body>
    </html>
  );
}
