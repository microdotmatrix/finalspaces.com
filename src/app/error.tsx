"use client";

import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    // Log client-side so we can surface unexpected issues
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] w-full items-center justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-destructive/10 px-3 py-1 font-semibold text-destructive text-xs shadow-sm">
          <Icon className="size-4" icon="mdi:alert-octagon-outline" />
          <span>Something went wrong</span>
        </div>
        <div className="space-y-3">
          <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            We hit a snag while loading this page.
          </h1>
          <p className="text-muted-foreground">
            Please try again. If the issue keeps happening, our team will look
            into it.
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
          <a
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto"
            )}
            href="/"
          >
            <Icon className="size-5" icon="mdi:home-outline" />
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
