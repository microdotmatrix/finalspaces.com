import {
  Space_Mono as Code,
  Plus_Jakarta_Sans as Display,
  Figtree as Sans,
  Cinzel as Serif,
} from "next/font/google";
import localFont from "next/font/local";

export const display = Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const sans = Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const serif = Serif({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const code = Code({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});

export const veganPizza = localFont({
  src: "./fonts/VeganPizza-AqXm.ttf",
  variable: "--font-vegan-pizza",
});

export const skinny = localFont({
  src: "./fonts/Skinny-VnD0.ttf",
  variable: "--font-skinny",
});

export const clash = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
});

export const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
});

export const supreme = localFont({
  src: "./fonts/Supreme-Variable.woff2",
  variable: "--font-supreme",
});
