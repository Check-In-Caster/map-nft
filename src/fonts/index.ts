import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const coolvetica = localFont({
  src: [
    {
      path: "./coolvetica-rg.otf",
      weight: "400",
      style: "normal",
    },
  ],
});

export const sanFransisco = localFont({
  src: [
    {
      path: "./SF-light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./SF-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./SF-medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
});

export const inter = Inter({ subsets: ["latin"] });
