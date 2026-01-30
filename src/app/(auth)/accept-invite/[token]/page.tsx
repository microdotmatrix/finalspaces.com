import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import {
  acceptInvite,
  getInviteByToken,
} from "@/lib/actions/collaborator-actions";

interface AcceptInvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({
  params,
}: AcceptInvitePageProps) {
  const { token } = await params;

  const { invite, spaceName } = await getInviteByToken(token);

  // Invalid or expired token
  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center">
          <h1 className="mb-4 font-bold text-2xl text-destructive">
            Invalid Invitation
          </h1>
          <p className="text-muted-foreground">
            This invitation link is invalid or has expired. Please ask the
            memorial owner to send you a new invitation.
          </p>
        </div>
      </div>
    );
  }

  // Already accepted
  if (invite.status === "active") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md">
        <SignedOut>
          <div className="mb-6 rounded-lg border bg-card p-6 text-center">
            <h1 className="mb-2 font-semibold text-xl">
              You&apos;ve Been Invited
            </h1>
            <p className="text-muted-foreground">
              Sign in or create an account to collaborate on the memorial for{" "}
              <strong>{spaceName}</strong>.
            </p>
          </div>
          <SignIn
            fallbackRedirectUrl={`/accept-invite/${token}`}
            signUpFallbackRedirectUrl={`/accept-invite/${token}`}
          />
        </SignedOut>

        <SignedIn>
          <AcceptInviteForm spaceName={spaceName ?? ""} token={token} />
        </SignedIn>
      </div>
    </div>
  );
}

async function AcceptInviteForm({
  token,
  spaceName,
}: {
  token: string;
  spaceName: string;
}) {
  // Server-side accept
  const result = await acceptInvite(token);

  if (result.success) {
    redirect("/dashboard");
  }

  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <h1 className="mb-4 font-bold text-2xl text-destructive">
        Unable to Accept Invite
      </h1>
      <p className="mb-4 text-muted-foreground">{result.error}</p>
      <p className="text-muted-foreground text-sm">
        Please contact the memorial owner for assistance.
      </p>
    </div>
  );
}
