import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl space-y-8 text-center">
        <h1 className="font-bold text-4xl tracking-tight sm:text-6xl">
          FinalSpace
        </h1>
        <p className="text-lg text-muted-foreground">
          Create beautiful, personalized digital memorials for your loved ones.
          Share memories, photos, and stories that celebrate a life well lived.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm shadow-sm transition-colors hover:bg-primary/90">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 font-medium text-sm shadow-sm transition-colors hover:bg-accent">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm shadow-sm transition-colors hover:bg-primary/90"
              href="/dashboard"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
