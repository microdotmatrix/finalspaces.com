import type { Metadata, Viewport } from "next";
import { AppContext } from "@/components/context";
import { SiteFooter } from "@/components/home/site-footer";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { meta } from "@/lib/config";
import {
  clash,
  code,
  display,
  sans,
  satoshi,
  serif,
  supreme,
} from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL ?? meta.url),
  title: {
    template: `%s | ${meta.title}`,
    default: meta.title,
  },
  description: meta.description,
  keywords: meta.keywords,
  authors: [{ name: meta.author }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: meta.url,
    title: meta.title,
    description: meta.description,
    siteName: meta.title,
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: `${meta.colors.dark}` },
    { media: "(prefers-color-scheme: light)", color: `${meta.colors.light}` },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className="[--header-height:4rem]"
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={cn(
          display.variable,
          sans.variable,
          serif.variable,
          code.variable,
          clash.variable,
          satoshi.variable,
          supreme.variable,
          "antialiased"
        )}
      >
        <AppContext>
          <div className="root">
            <div className="fixed top-4 right-4 z-50">
              <ThemeSwitcher />
            </div>
            {children}
            <SiteFooter />
          </div>
        </AppContext>
      </body>
    </html>
  );
}
