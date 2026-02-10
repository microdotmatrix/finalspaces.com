import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ShieldCheck, Star, UsersThree } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    <section
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden"
    >
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
        alt="Hero background"
        fill
        className="object-cover absolute inset-0 -z-1 opacity-25 mix-blend-hard-light"
      />
      {/* Gradient background placeholder */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-secondary/50 via-background to-primary/20 dark:from-secondary/50 dark:via-background dark:to-primary/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--color-secondary)/0.2,transparent_100%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--color-secondary)/0.6,transparent_10%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-1/3 bg-linear-to-t from-background to-transparent"
      />

      {/* Content */}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center">
        <h1 className="text-5xl leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
          <span className="block font-light text-foreground/80">Remember</span>
          <span className="block font-normal text-primary">Celebrate</span>
          <span className="block font-light text-secondary">Honor</span>
        </h1>

        <p className="max-w-xl text-balance text-lg text-muted-foreground sm:text-xl">
          Create meaningful memorial spaces that celebrate life's journey.
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
