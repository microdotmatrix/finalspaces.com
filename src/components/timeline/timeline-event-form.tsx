"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  type CreateTimelineEventInput,
  createTimelineEvent,
  type TimelineCategory,
  type TimelineEvent,
  updateTimelineEvent,
} from "@/lib/actions/timeline-actions";

interface TimelineEventFormProps {
  categories: TimelineCategory[];
  event?: TimelineEvent;
  finalSpaceId: string;
  onSuccess?: () => void;
}

const EVENT_TYPES = [
  { value: "birth", label: "Birth" },
  { value: "milestone", label: "Milestone" },
  { value: "achievement", label: "Achievement" },
  { value: "family", label: "Family" },
  { value: "career", label: "Career" },
  { value: "travel", label: "Travel" },
  { value: "memory", label: "Memory" },
  { value: "other", label: "Other" },
];

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function TimelineEventForm({
  categories,
  event,
  finalSpaceId,
  onSuccess,
}: TimelineEventFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!event;

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.currentTarget);

    const data: CreateTimelineEventInput = {
      finalSpaceId,
      categoryId: (formData.get("categoryId") as string) || null,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      organization: (formData.get("organization") as string) || null,
      eventType: formData.get(
        "eventType"
      ) as CreateTimelineEventInput["eventType"],
      eventMonth: formData.get("eventMonth")
        ? Number(formData.get("eventMonth"))
        : null,
      eventDay: formData.get("eventDay")
        ? Number(formData.get("eventDay"))
        : null,
      eventYear: formData.get("eventYear")
        ? Number(formData.get("eventYear"))
        : null,
      endMonth: formData.get("endMonth")
        ? Number(formData.get("endMonth"))
        : null,
      endDay: formData.get("endDay") ? Number(formData.get("endDay")) : null,
      endYear: formData.get("endYear") ? Number(formData.get("endYear")) : null,
      location: (formData.get("location") as string) || null,
      isPublic: formData.get("isPublic") === "on",
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateTimelineEvent({ id: event.id, ...data })
        : await createTimelineEvent(data);

      if (result.success) {
        toast.success(isEditing ? "Event updated" : "Event created");
        if (!isEditing) {
          (formEvent.target as HTMLFormElement).reset();
        }
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          defaultValue={event?.title ?? ""}
          disabled={isPending}
          id="title"
          maxLength={200}
          name="title"
          placeholder="e.g. Graduated from University"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="eventType">Event Type *</Label>
          <Select
            defaultValue={event?.eventType ?? "milestone"}
            name="eventType"
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select defaultValue={event?.categoryId ?? ""} name="categoryId">
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          defaultValue={event?.description ?? ""}
          disabled={isPending}
          id="description"
          maxLength={2000}
          name="description"
          placeholder="Tell us more about this event..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">Organization / Institution</Label>
        <Input
          defaultValue={event?.organization ?? ""}
          disabled={isPending}
          id="organization"
          maxLength={200}
          name="organization"
          placeholder="e.g. Harvard University"
        />
      </div>

      {/* Start Date */}
      <fieldset className="space-y-2">
        <legend className="font-medium text-sm">Start Date</legend>
        <div className="grid grid-cols-3 gap-2">
          <Select
            defaultValue={event?.eventMonth?.toString() ?? ""}
            name="eventMonth"
          >
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            defaultValue={event?.eventDay ?? ""}
            disabled={isPending}
            max={31}
            min={1}
            name="eventDay"
            placeholder="Day"
            type="number"
          />
          <Input
            defaultValue={event?.eventYear ?? ""}
            disabled={isPending}
            max={new Date().getFullYear() + 10}
            min={1800}
            name="eventYear"
            placeholder="Year"
            type="number"
          />
        </div>
      </fieldset>

      {/* End Date */}
      <fieldset className="space-y-2">
        <legend className="font-medium text-sm">End Date (optional)</legend>
        <div className="grid grid-cols-3 gap-2">
          <Select
            defaultValue={event?.endMonth?.toString() ?? ""}
            name="endMonth"
          >
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            defaultValue={event?.endDay ?? ""}
            disabled={isPending}
            max={31}
            min={1}
            name="endDay"
            placeholder="Day"
            type="number"
          />
          <Input
            defaultValue={event?.endYear ?? ""}
            disabled={isPending}
            max={new Date().getFullYear() + 10}
            min={1800}
            name="endYear"
            placeholder="Year"
            type="number"
          />
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          defaultValue={event?.location ?? ""}
          disabled={isPending}
          id="location"
          maxLength={500}
          name="location"
          placeholder="e.g. Cambridge, MA"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          defaultChecked={event?.isPublic ?? true}
          id="isPublic"
          name="isPublic"
        />
        <Label htmlFor="isPublic">Show on public memorial page</Label>
      </div>

      <Button disabled={isPending} type="submit">
        {isPending
          ? isEditing
            ? "Saving..."
            : "Adding..."
          : isEditing
            ? "Save Changes"
            : "Add Event"}
      </Button>
    </form>
  );
}
