"use client";

import { Lexend, Roboto } from "next/font/google";
import { coolvetica, sanFransisco } from "@/fonts";
import { useLayoutEffect, useState } from "react";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const OSFont: React.FC<{
  children: React.ReactNode;
  as?:
    | "div"
    | "main"
    | "section"
    | "span"
    | "p"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";
  defaultFont: "coolvetica" | "lexend";
  className?: string;
}> = ({ children, as, defaultFont, className }) => {
  const [os, setOs] = useState<"default" | "android" | "ios">("default");

  useLayoutEffect(() => {
    try {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/android/i.test(userAgent)) {
        setOs("android");
      }
      if (/ipad|iphone|ipod/.test(userAgent)) {
        setOs("ios");
      }
    } catch {}
  }, []);

  const font =
    os === "default"
      ? defaultFont === "coolvetica"
        ? coolvetica
        : lexend
      : os === "android"
      ? roboto
      : sanFransisco;

  if (as === "span")
    return <span className={`${font.className} ${className}`}>{children}</span>;
  if (as === "p")
    return <p className={`${font.className} ${className}`}>{children}</p>;
  if (as === "h1")
    return <h1 className={`${font.className} ${className}`}>{children}</h1>;
  if (as === "h2")
    return <h2 className={`${font.className} ${className}`}>{children}</h2>;
  if (as === "h3")
    return <h3 className={`${font.className} ${className}`}>{children}</h3>;
  if (as === "h4")
    return <h4 className={`${font.className} ${className}`}>{children}</h4>;
  if (as === "h5")
    return <h5 className={`${font.className} ${className}`}>{children}</h5>;
  if (as === "h6")
    return <h6 className={`${font.className} ${className}`}>{children}</h6>;
  if (as === "main")
    return <main className={`${font.className} ${className}`}>{children}</main>;
  if (as === "section")
    return (
      <section className={`${font.className} ${className}`}>{children}</section>
    );
  else
    return <div className={`${font.className} ${className}`}>{children}</div>;
};

export default OSFont;
