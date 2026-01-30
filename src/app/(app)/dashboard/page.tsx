import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getUserFinalSpaces } from "@/lib/actions/final-space-actions";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const spaces = await getUserFinalSpaces();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            {user.firstName ?? user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* Your FinalSpaces */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-xl">Your FinalSpaces</h2>
          <Link
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
            href="/finalspaces/new"
          >
            + Create New
          </Link>
        </div>

        {spaces.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
            <p className="text-muted-foreground">
              You haven&apos;t created any memorials yet.
            </p>
            <Link
              className="mt-4 inline-flex items-center font-medium text-primary text-sm hover:underline"
              href="/finalspaces/new"
            >
              Create your first FinalSpace →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <div
                className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                key={space.id}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-bold text-lg text-primary">
                      {(space.firstName || space.name).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {space.firstName && space.lastName
                          ? `${space.firstName} ${space.lastName}`
                          : space.name}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        /{space.slug}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      space.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {space.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Link
                    className="text-primary hover:underline"
                    href={`/finalspaces/${space.id}/edit`}
                  >
                    Edit
                  </Link>
                  {space.status === "published" && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <Link
                        className="text-muted-foreground hover:text-foreground"
                        href={`/m/${space.slug}`}
                      >
                        View
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Collaborations</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Memorials you&apos;ve been invited to help with.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Recent Activity</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            No recent activity to show.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-3xl">{spaces.length}</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Total FinalSpaces
          </p>
        </div>
      </section>
    </div>
  );
}
