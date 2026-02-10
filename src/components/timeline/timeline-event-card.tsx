"use client";

import { Building2, ChevronDown, Clock, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { ImageDialog } from "@/components/elements/image-dialog";
import { getMemorialMediaUrl } from "@/components/memorial/memorial-header-utils";
import { Card, CardContent } from "@/components/ui/card";
import type { TimelineEventWithCategory } from "@/lib/actions/timeline-actions";
import { cn } from "@/lib/utils";
import {
  formatEventDateRange,
  getCategoryBadgeStyles,
} from "@/lib/utils/timeline-helpers";

interface TimelineEventCardProps {
  event: TimelineEventWithCategory;
  actions?: ReactNode;
}

export function TimelineEventCard({ event, actions }: TimelineEventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasExpandableContent = !!event.description;

  const categoryStyles = getCategoryBadgeStyles(event.category?.color ?? null);
  const dateString = formatEventDateRange(event);
  const imageUrl = getMemorialMediaUrl(event.storageKey ?? null);

  return (
    <div className="relative flex items-start gap-4 pl-4">
      {/* Timeline dot */}
      <div
        className="absolute top-6 left-0 size-2 -translate-x-1/2 rounded-full"
        style={{
          backgroundColor:
            event.category?.color ?? "hsl(var(--muted-foreground))",
        }}
      />

      {/* Card */}
      <Card className="flex-1 transition-shadow hover:shadow-md">
        <CardContent>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              {/* Title and badge */}
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{event.title}</h3>
                {event.category && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium text-xs"
                    style={{
                      backgroundColor: categoryStyles.backgroundColor,
                      borderColor: categoryStyles.borderColor,
                      color: categoryStyles.color,
                    }}
                  >
                    {event.category.name}
                  </span>
                )}
              </div>

              {/* Date */}
              {dateString && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Clock className="size-3.5" />
                  <span>{dateString}</span>
                </div>
              )}

              {/* Organization */}
              {event.organization && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Building2 className="size-3.5" />
                  <span>{event.organization}</span>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="size-3.5" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {/* Right side: thumbnail + actions */}
            <div className="flex shrink-0 items-start gap-2">
              {imageUrl && (
                <div className="[&_img]:!h-full [&_img]:!w-full [&_img]:!object-cover size-16 overflow-hidden rounded-md border sm:size-20">
                  <ImageDialog alt={event.title} src={imageUrl} />
                </div>
              )}

              <div className="flex items-center gap-1">
                {actions}

                {/* Expand button */}
                {hasExpandableContent && (
                  <button
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded ? "Collapse details" : "Expand details"
                    }
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setIsExpanded(!isExpanded)}
                    type="button"
                  >
                    <ChevronDown
                      className={cn(
                        "size-5 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Expandable description */}
          {hasExpandableContent && (
            <div
              className={cn(
                "grid transition-all duration-200",
                isExpanded ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <p className="whitespace-pre-wrap border-t pt-3 text-muted-foreground text-sm">
                  {event.description}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
