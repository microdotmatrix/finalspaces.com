"use client";

import { UserPlus } from "lucide-react";
import { type SubmitEventHandler, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type InviteCollaboratorInput,
  inviteCollaborator,
} from "@/lib/actions/collaborator-actions";

interface InviteFormProps {
  finalSpaceId: string;
  onSuccess?: () => void;
}

export function InviteForm({ finalSpaceId, onSuccess }: InviteFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const input: InviteCollaboratorInput = {
      finalSpaceId,
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
    };

    startTransition(async () => {
      const result = await inviteCollaborator(input);

      if (result.success) {
        toast.success("Invitation sent!");
        (event.target as HTMLFormElement).reset();
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            disabled={isPending}
            id="firstName"
            name="firstName"
            placeholder="First name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            disabled={isPending}
            id="lastName"
            name="lastName"
            placeholder="Last name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          disabled={isPending}
          id="email"
          name="email"
          placeholder="collaborator@example.com"
          required
          type="email"
        />
      </div>

      <Button disabled={isPending} type="submit">
        <UserPlus className="mr-2 size-4" />
        {isPending ? "Sending Invite..." : "Send Invitation"}
      </Button>
    </form>
  );
}
