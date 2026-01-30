"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen w-full items-center justify-center bg-background px-6 py-16 sm:py-24">
          <div className="w-full max-w-2xl space-y-6 text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-destructive/10 px-3 py-1 font-semibold text-destructive text-xs shadow-sm">
              <Icon className="size-4" icon="mdi:skull-outline" />
              <span>Unexpected error</span>
            </div>
            <div className="space-y-3">
              <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
                Our servers stumbled. We are on it.
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Please try again, and if it
                persists we will investigate.
              </p>
              {error.digest ? (
                <p className="text-muted-foreground/80 text-xs">
                  Error reference: {error.digest}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                className={cn(buttonVariants({ size: "lg" }))}
                onClick={reset}
                type="button"
              >
                <Icon className="size-5" icon="mdi:refresh" />
                Try again
              </button>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto"
                )}
                href="/"
              >
                <Icon className="size-5" icon="mdi:home-outline" />
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
