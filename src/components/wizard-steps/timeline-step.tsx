"use client";

import { useAtom } from "jotai";
import { Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { ActionButton } from "@/components/elements/action-button";
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
  deleteTimelineEvent,
  getTimelineCategories,
  getTimelineEventsWithCategories,
  type TimelineCategory,
  type TimelineEventWithCategory,
} from "@/lib/actions/timeline-actions";
import { draftIdAtom, wizardDataAtom } from "@/lib/stores/wizard-state";

async function fetchTimelineData(draftId: string) {
  const [eventsData, categoriesData] = await Promise.all([
    getTimelineEventsWithCategories(draftId),
    getTimelineCategories(),
  ]);

  return { categoriesData, eventsData };
}

export function TimelineStep() {
  const [draftId] = useAtom(draftIdAtom);
  const [wizardData] = useAtom(wizardDataAtom);
  const [events, setEvents] = useState<TimelineEventWithCategory[]>([]);
  const [categories, setCategories] = useState<TimelineCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] =
    useState<TimelineEventWithCategory | null>(null);
  const [, startTransition] = useTransition();
  const [hasAutoCreated, setHasAutoCreated] = useState(false);

  const displayName =
    wizardData.useNicknameOnly && wizardData.nickname
      ? wizardData.nickname
      : `${wizardData.firstName || ""} ${wizardData.lastName || ""}`.trim() ||
        wizardData.name;

  const refreshData = async () => {
    if (!draftId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { categoriesData, eventsData } = await fetchTimelineData(draftId);
      setEvents(eventsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load timeline data:", error);
      toast.error("Failed to load timeline events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!draftId) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const { categoriesData, eventsData } = await fetchTimelineData(draftId);
        if (!isCancelled) {
          setEvents(eventsData);
          setCategories(categoriesData);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to load timeline data:", error);
          toast.error("Failed to load timeline events");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [draftId]);

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
          const { categoriesData, eventsData } =
            await fetchTimelineData(draftId);
          setEvents(eventsData);
          setCategories(categoriesData);
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
  ]);

  const handleEventSuccess = () => {
    setIsSheetOpen(false);
    setSelectedEvent(null);
    refreshData();
  };

  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen);
    if (!isOpen) {
      setSelectedEvent(null);
    }
  };

  const handleDeleteEvent = async (
    event: TimelineEventWithCategory
  ): Promise<{ error: boolean; message?: string }> => {
    const result = await deleteTimelineEvent(event.id);

    if (!result.success) {
      return {
        error: true,
        message: result.error,
      };
    }

    toast.success("Event deleted");
    await refreshData();
    return { error: false };
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
            Timeline events will be available once you've started your
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
        <Sheet onOpenChange={handleSheetOpenChange} open={isSheetOpen}>
          <SheetTrigger
            render={
              <Button
                onClick={() => {
                  setSelectedEvent(null);
                }}
                size="sm"
              >
                <Plus className="mr-2 size-4" />
                Add Event
              </Button>
            }
          />
          <SheetContent className="overflow-y-auto sm:data-[side=right]:max-w-lg">
            <SheetHeader>
              <SheetTitle>
                {selectedEvent ? "Edit Timeline Event" : "Add Timeline Event"}
              </SheetTitle>
              <SheetDescription>
                {selectedEvent
                  ? "Update this timeline event's details."
                  : "Add a milestone, achievement, or memorable moment."}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 px-4">
              <TimelineEventForm
                categories={categories}
                event={selectedEvent ?? undefined}
                finalSpaceId={draftId}
                key={selectedEvent?.id ?? "new-event"}
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
        <LifeTimeline
          events={events}
          renderEventActions={(event) => (
            <div className="flex items-center gap-1">
              <Button
                onClick={() => {
                  setSelectedEvent(event);
                  setIsSheetOpen(true);
                }}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Icon className="size-4" icon="mdi:pencil-outline" />
                <span className="sr-only">Edit event</span>
              </Button>
              <ActionButton
                action={() => handleDeleteEvent(event)}
                areYouSureDescription={`This will permanently delete "${event.title}" from the timeline.`}
                requireAreYouSure
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Icon className="size-4" icon="mdi:trash-can-outline" />
                <span className="sr-only">Delete event</span>
              </ActionButton>
            </div>
          )}
        />
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
