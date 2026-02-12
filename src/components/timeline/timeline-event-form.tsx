"use client";

import { XIcon } from "lucide-react";
import Image from "next/image";
import { type SubmitEventHandler, useState, useTransition } from "react";
import { toast } from "sonner";
import { getMemorialMediaUrl } from "@/components/memorial/memorial-header-utils";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { ImageUploader } from "@/components/ui/image-uploader";
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
  type TimelineEventWithCategory,
  updateTimelineEvent,
} from "@/lib/actions/timeline-actions";

interface TimelineEventFormProps {
  categories: TimelineCategory[];
  event?: TimelineEventWithCategory;
  finalSpaceId: string;
  onSuccess?: () => void;
}

const EVENT_TYPES = [
  { value: "milestone", label: "Milestone" },
  { value: "achievement", label: "Achievement" },
  { value: "celebration", label: "Celebration" },
  { value: "memory", label: "Memory" },
  { value: "other", label: "Other" },
];

const getDateFromParts = ({
  year,
  month,
  day,
}: {
  year: number | null | undefined;
  month: number | null | undefined;
  day: number | null | undefined;
}): Date | undefined => {
  if (!(year && month && day)) {
    return undefined;
  }

  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
};

const getDateFormValues = (
  date: Date | undefined
): { month: string; day: string; year: string } => {
  if (!date) {
    return { month: "", day: "", year: "" };
  }

  return {
    month: String(date.getMonth() + 1),
    day: String(date.getDate()),
    year: String(date.getFullYear()),
  };
};

const getSubmitLabel = ({
  isPending,
  isEditing,
}: {
  isPending: boolean;
  isEditing: boolean;
}): string => {
  if (isPending) {
    return isEditing ? "Saving..." : "Adding...";
  }

  if (isEditing) {
    return "Save Changes";
  }

  return "Add Event";
};

export function TimelineEventForm({
  categories,
  event,
  finalSpaceId,
  onSuccess,
}: TimelineEventFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!event;
  const submitLabel = getSubmitLabel({ isPending, isEditing });
  const categoryOptions = categories.filter(
    (category) => category.key !== "accomplishments"
  );

  // Track uploaded photo: mediaId for submission, previewUrl for display
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(
    event?.mediaId ?? null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    getMemorialMediaUrl(event?.storageKey ?? null)
  );
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    getDateFromParts({
      year: event?.eventYear,
      month: event?.eventMonth,
      day: event?.eventDay,
    })
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() =>
    getDateFromParts({
      year: event?.endYear,
      month: event?.endMonth,
      day: event?.endDay,
    })
  );
  const startDateValues = getDateFormValues(startDate);
  const endDateValues = getDateFormValues(endDate);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (formEvent) => {
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
      mediaId: uploadedMediaId,
      isPublic: formData.get("isPublic") === "on",
    };

    startTransition(async () => {
      const { finalSpaceId: _finalSpaceId, ...updatePayload } = data;

      const result = isEditing
        ? await updateTimelineEvent({ id: event.id, ...updatePayload })
        : await createTimelineEvent(data);

      if (result.success) {
        toast.success(isEditing ? "Event updated" : "Event created");
        if (!isEditing) {
          (formEvent.target as HTMLFormElement).reset();
          setUploadedMediaId(null);
          setPreviewUrl(null);
          setStartDate(undefined);
          setEndDate(undefined);
        }
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  };

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
            <SelectTrigger className="w-full">
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
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

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <legend className="font-medium text-sm">Start Date</legend>
          <div className="relative">
            <DatePicker
              date={startDate}
              label="Pick start date"
              setDate={setStartDate}
            />
            {startDate && (
              <button
                aria-label="Clear start date"
                className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                onClick={() => setStartDate(undefined)}
                type="button"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
          <input
            name="eventMonth"
            type="hidden"
            value={startDateValues.month}
          />
          <input name="eventDay" type="hidden" value={startDateValues.day} />
          <input name="eventYear" type="hidden" value={startDateValues.year} />
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-medium text-sm">End Date (optional)</legend>
          <div className="relative">
            <DatePicker
              date={endDate}
              label="Pick end date"
              setDate={setEndDate}
            />
            {endDate && (
              <button
                aria-label="Clear end date"
                className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                onClick={() => setEndDate(undefined)}
                type="button"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
          <input name="endMonth" type="hidden" value={endDateValues.month} />
          <input name="endDay" type="hidden" value={endDateValues.day} />
          <input name="endYear" type="hidden" value={endDateValues.year} />
        </fieldset>
      </div>

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

      {/* Event Photo */}
      <div className="space-y-2">
        <Label>Event Photo</Label>
        {previewUrl ? (
          <div className="relative w-full max-w-xs overflow-hidden rounded-lg border">
            <Image
              alt="Event photo"
              className="aspect-video w-full object-cover"
              height={200}
              src={previewUrl}
              width={320}
            />
            <button
              aria-label="Remove photo"
              className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setUploadedMediaId(null);
                setPreviewUrl(null);
              }}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <ImageUploader
            endpoint="timelineEventImage"
            finalSpaceId={finalSpaceId}
            maxFiles={1}
            onUploadComplete={(files) => {
              if (files[0]) {
                setUploadedMediaId(files[0].id);
                setPreviewUrl(files[0].url);
              }
            }}
            variant="default"
          />
        )}
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
        {submitLabel}
      </Button>
    </form>
  );
}
