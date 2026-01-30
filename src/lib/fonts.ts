import {
  Space_Mono as Code,
  Oswald as Display,
  Saira as Sans,
  Cinzel as Serif,
} from "next/font/google";

export const display = Display({
  subsets: ["latin"],
  variable: "--display-family",
});

export const sans = Sans({
  subsets: ["latin"],
  variable: "--sans-family",
});

export const serif = Serif({
  subsets: ["latin"],
  variable: "--serif-family",
});

export const code = Code({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--code-family",
});
