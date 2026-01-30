"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const NotFoundPage = () => (
  <main className="flex min-h-[70vh] w-full items-center justify-center px-6 py-16 sm:py-24">
    <div className="w-full max-w-2xl space-y-6 text-center">
      <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-xs shadow-sm">
        <Icon className="size-4" icon="mdi:alert-circle-outline" />
        <span>Page not found</span>
      </div>
      <div className="space-y-3">
        <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
          We could not find what you were looking for.
        </h1>
        <p className="text-muted-foreground">
          The page might have moved or no longer exists. Double-check the URL or
          head back to your dashboard.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link className={cn(buttonVariants({ size: "lg" }))} href="/dashboard">
          <Icon className="size-5" icon="mdi:view-dashboard-outline" />
          Go to dashboard
        </Link>
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
);

export default NotFoundPage;
