"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type SubmitGuestbookInput,
  submitGuestbookEntry,
} from "@/lib/actions/guestbook-actions";

type GuestbookFormProps = {
  finalSpaceId: string;
  displayName?: string;
  onSuccess?: () => void;
};

export function GuestbookForm({
  finalSpaceId,
  displayName,
  onSuccess,
}: GuestbookFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isAnonymous, setIsAnonymous] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const input: SubmitGuestbookInput = {
      finalSpaceId,
      authorName: formData.get("authorName") as string,
      authorEmail: formData.get("authorEmail") as string,
      relationship: formData.get("relationship") as string,
      tributeTitle: formData.get("tributeTitle") as string,
      message: formData.get("message") as string,
      isAnonymous,
      honeypot: formData.get("website") as string, // Honeypot field
    };

    startTransition(async () => {
      const result = await submitGuestbookEntry(input);

      if (result.success) {
        toast.success("Thank you for your message!");
        (event.target as HTMLFormElement).reset();
        setIsAnonymous(false);
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="authorName">Your Name *</Label>
          <Input
            disabled={isPending}
            id="authorName"
            maxLength={100}
            name="authorName"
            placeholder="Your name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorEmail">Email (optional)</Label>
          <Input
            disabled={isPending}
            id="authorEmail"
            name="authorEmail"
            placeholder="your@email.com"
            type="email"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="relationship">Your Relationship (optional)</Label>
          <Input
            disabled={isPending}
            id="relationship"
            maxLength={100}
            name="relationship"
            placeholder="e.g. Friend, Colleague, Family"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tributeTitle">Tribute Title (optional)</Label>
          <Input
            disabled={isPending}
            id="tributeTitle"
            maxLength={150}
            name="tributeTitle"
            placeholder="e.g. A Beautiful Soul"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Your Message {displayName && `for ${displayName}`} *
        </Label>
        <Textarea
          disabled={isPending}
          id="message"
          maxLength={2000}
          name="message"
          placeholder="Share a memory, tribute, or message..."
          required
          rows={5}
        />
        <p className="text-muted-foreground text-xs">Maximum 2000 characters</p>
      </div>

      {/* Honeypot field - hidden from users, bots will fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <Input autoComplete="off" name="website" tabIndex={-1} type="text" />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAnonymous}
          disabled={isPending}
          id="isAnonymous"
          onCheckedChange={(checked) => setIsAnonymous(checked === true)}
        />
        <Label className="cursor-pointer text-sm" htmlFor="isAnonymous">
          Post anonymously (your name will be hidden)
        </Label>
      </div>

      <Button disabled={isPending} type="submit">
        {isPending ? "Sending..." : "Leave a Message"}
      </Button>
    </form>
  );
}
