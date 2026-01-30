import Link from "next/link";

export default function MemorialNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-6xl">🕊️</div>
      <h1 className="mb-4 font-bold text-2xl">Memorial Not Found</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        The memorial you&apos;re looking for doesn&apos;t exist or may have been
        removed.
      </p>
      <Link
        className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
        href="/"
      >
        Go Home
      </Link>
    </main>
  );
}
