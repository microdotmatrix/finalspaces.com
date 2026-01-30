"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MemorialError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Memorial page error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-6xl">💐</div>
      <h1 className="mb-4 font-bold text-2xl">Something went wrong</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        We encountered an error loading this memorial. This might be temporary.
        Please try again.
      </p>
      <button
        className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
        onClick={reset}
        type="button"
      >
        Try Again
      </button>
    </main>
  );
}
