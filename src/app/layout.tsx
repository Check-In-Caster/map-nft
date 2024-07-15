import { coolvetica } from "@/fonts";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import React from "react";
import Applayout from "./Applayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onchain Property NFTs - Checkin “Checkin and Earn”",
  description:
    "With Property NFTs, you can own NFTs of your favourite properties from famous places like Eiffel Tower or your local cafe!",
  twitter: {
    images: "https://i.imgur.com/TzyLczi.png",
    title: "Onchain Property NFTs - Checkin “Checkin and Earn",
    description: `With Property NFTs, you can own NFTs of your favourite properties from famous places like Eiffel Tower or your local cafe!`,
  },
  openGraph: {
    images: "https://i.imgur.com/TzyLczi.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${coolvetica.className} tracking-wider`}>
        <Applayout>{children}</Applayout>
      </body>
    </html>
  );
}
