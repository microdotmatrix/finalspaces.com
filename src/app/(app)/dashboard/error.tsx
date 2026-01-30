"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-6xl">⚠️</div>
      <h1 className="mb-4 font-bold text-2xl">Something went wrong</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        We encountered an error loading this page. This might be temporary.
      </p>
      <div className="flex gap-4">
        <button
          className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
          onClick={reset}
          type="button"
        >
          Try Again
        </button>
        <Link
          className="rounded-lg border px-6 py-2 font-medium transition hover:bg-muted"
          href="/dashboard"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
