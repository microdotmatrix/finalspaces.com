import {
  FacebookLogo,
  InstagramLogo,
  Lock,
  ShieldCheck,
  XLogo,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { CurrentYear } from "./current-year";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Examples", href: "/examples" },
      { label: "Security", href: "/security" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Live Chat", href: "/chat" },
      { label: "Community", href: "/community" },
      { label: "Documentation", href: "/docs" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "User Agreement", href: "/agreement" },
      { label: "Trust & Safety", href: "/trust" },
    ],
  },
} as const;

const socialLinks = [
  { icon: FacebookLogo, href: "https://facebook.com", label: "Facebook" },
  { icon: XLogo, href: "https://x.com", label: "X" },
  { icon: InstagramLogo, href: "https://instagram.com", label: "Instagram" },
] as const;

export const SiteFooter = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground dark:bg-card dark:text-card-foreground">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link
              className="font-(family-name:--font-clash) inline-flex items-center gap-2.5 font-medium text-lg"
              href="/"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/15 font-semibold text-xs">
                FS
              </span>
              Final Spaces
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-80">
              Empowering individuals to create meaningful digital legacies that
              honor their life stories and bring comfort to those they leave
              behind.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  aria-label={social.label}
                  className="flex size-8 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100"
                  href={social.href}
                  key={social.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <social.icon className="size-4" weight="bold" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-(family-name:--font-clash) font-semibold text-sm tracking-wide">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-sm opacity-70 transition-opacity hover:opacity-100"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-white/10 border-t dark:border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row">
          <p className="text-xs opacity-60">
            &copy; <CurrentYear /> Final Spaces. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs opacity-60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" weight="bold" />
              SOC 2 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="size-3.5" weight="bold" />
              256-bit Encryption
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
