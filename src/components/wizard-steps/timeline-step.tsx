"use client";

import { useAtom } from "jotai";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { LifeTimeline } from "@/components/timeline/life-timeline";
import { TimelineEventForm } from "@/components/timeline/timeline-event-form";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  autoCreateBirthDeathEvents,
  getTimelineCategories,
  getTimelineEventsWithCategories,
  type TimelineCategory,
  type TimelineEventWithCategory,
} from "@/lib/actions/timeline-actions";
import { draftIdAtom, wizardDataAtom } from "@/lib/stores/wizard-state";

export function TimelineStep() {
  const [draftId] = useAtom(draftIdAtom);
  const [wizardData] = useAtom(wizardDataAtom);
  const [events, setEvents] = useState<TimelineEventWithCategory[]>([]);
  const [categories, setCategories] = useState<TimelineCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [hasAutoCreated, setHasAutoCreated] = useState(false);

  const displayName =
    wizardData.useNicknameOnly && wizardData.nickname
      ? wizardData.nickname
      : `${wizardData.firstName || ""} ${wizardData.lastName || ""}`.trim() ||
        wizardData.name;

  const loadData = useCallback(async () => {
    if (!draftId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [eventsData, categoriesData] = await Promise.all([
        getTimelineEventsWithCategories(draftId),
        getTimelineCategories(),
      ]);
      setEvents(eventsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load timeline data:", error);
      toast.error("Failed to load timeline events");
    } finally {
      setIsLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-create birth/death events once when dates exist and no birth event yet
  useEffect(() => {
    if (
      !draftId ||
      hasAutoCreated ||
      isLoading ||
      !(wizardData.birthDate || wizardData.deathDate)
    ) {
      return;
    }

    const hasBirthEvent = events.some((e) => e.eventType === "birth");
    if (!hasBirthEvent && (wizardData.birthDate || wizardData.deathDate)) {
      startTransition(async () => {
        try {
          await autoCreateBirthDeathEvents(
            draftId,
            displayName,
            wizardData.birthDate || null,
            wizardData.deathDate || null,
            wizardData.placeOfBirth || null
          );
          setHasAutoCreated(true);
          await loadData();
        } catch (error) {
          console.error("Failed to auto-create events:", error);
        }
      });
    } else {
      setHasAutoCreated(true);
    }
  }, [
    draftId,
    hasAutoCreated,
    isLoading,
    events,
    wizardData.birthDate,
    wizardData.deathDate,
    wizardData.placeOfBirth,
    displayName,
    loadData,
  ]);

  const handleEventSuccess = () => {
    setIsSheetOpen(false);
    loadData();
  };

  if (!draftId) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-bold text-2xl">Timeline</h2>
          <p className="text-muted-foreground">
            Create a visual timeline of their life journey.
          </p>
        </div>
        <div className="rounded-lg border-2 border-muted-foreground/25 border-dashed p-8 text-center">
          <Icon
            className="mx-auto mb-3 size-12 text-muted-foreground"
            icon="mdi:timeline-clock-outline"
          />
          <p className="font-medium text-muted-foreground">
            Complete the previous steps first
          </p>
          <p className="text-muted-foreground text-sm">
            Timeline events will be available once you&apos;ve started your
            FinalSpace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl">Timeline</h2>
          <p className="text-muted-foreground">
            Create a visual timeline of their life journey.
          </p>
        </div>
        <Sheet onOpenChange={setIsSheetOpen} open={isSheetOpen}>
          <SheetTrigger
            render={
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Add Event
              </Button>
            }
          />
          <SheetContent className="overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Add Timeline Event</SheetTitle>
              <SheetDescription>
                Add a milestone, achievement, or memorable moment.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 px-4">
              <TimelineEventForm
                categories={categories}
                finalSpaceId={draftId}
                onSuccess={handleEventSuccess}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icon
            className="size-8 animate-spin text-primary"
            icon="mdi:loading"
          />
        </div>
      ) : (
        <LifeTimeline events={events} />
      )}

      {events.length > 0 && (
        <div className="rounded-lg bg-muted p-4 text-sm">
          <div className="flex gap-3">
            <Icon
              className="size-5 shrink-0 text-muted-foreground"
              icon="mdi:information-outline"
            />
            <div>
              <p className="font-medium text-foreground">
                {events.length} {events.length === 1 ? "event" : "events"} added
              </p>
              <p className="text-muted-foreground">
                You can continue to add more events after publishing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
