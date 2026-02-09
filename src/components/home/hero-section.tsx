import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ShieldCheck, Star, UsersThree } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const trustBadges = [
  {
    icon: ShieldCheck,
    label: "Secure &amp; Private",
  },
  {
    icon: Star,
    label: "Beautiful Memorials",
  },
  {
    icon: UsersThree,
    label: "Share with Family",
  },
] as const;

export const HeroSection = () => {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden">
      {/* Gradient background placeholder */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-secondary/10 via-background to-primary/5 dark:from-secondary/5 dark:via-background dark:to-primary/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--color-secondary)/0.12,transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--color-secondary)/0.06,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-1/3 bg-linear-to-t from-background to-transparent"
      />

      {/* Content */}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center">
        <h1 className="font-(family-name:--font-clash) text-5xl leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
          <span className="block text-foreground/80">Remember.</span>
          <span className="block text-primary">Celebrate.</span>
          <span className="block text-secondary">Honor.</span>
        </h1>

        <p className="max-w-xl text-balance text-lg text-muted-foreground sm:text-xl">
          Create meaningful memorial spaces that celebrate life&#39;s journey.
          Share stories, preserve memories, and honor those we love with dignity
          and warmth.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <SignedOut>
            <SignUpButton mode="modal">
              <Button className="h-12 px-8 text-base" size="lg">
                Get Started
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button
                className="h-12 px-8 text-base"
                size="lg"
                variant="outline"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Button
              className="h-12 px-8 text-base"
              nativeButton={false}
              render={<Link href="/dashboard" />}
              size="lg"
            >
              Go to Dashboard
            </Button>
            <Button
              className="h-12 px-8 text-base"
              nativeButton={false}
              render={<Link href="/finalspaces/new" />}
              size="lg"
              variant="outline"
            >
              Create a Memorial
            </Button>
          </SignedIn>
        </div>

        {/* Trust badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-muted-foreground text-sm">
          {trustBadges.map((badge) => (
            <div className="flex items-center gap-2" key={badge.label}>
              <badge.icon className="size-4 text-secondary" weight="fill" />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
