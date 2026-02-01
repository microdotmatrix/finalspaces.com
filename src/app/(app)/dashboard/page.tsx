import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getUserFinalSpaces } from "@/lib/actions/final-space-actions";

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    notFound();
  }

  const spaces = await getUserFinalSpaces();

  const userDisplayName =
    clerkUser.firstName ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";

  return <DashboardContent spaces={spaces} userDisplayName={userDisplayName} />;
}
