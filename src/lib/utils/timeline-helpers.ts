import type { TimelineEventWithCategory } from "@/lib/actions/timeline-actions";

export type { TimelineEventWithCategory };

export interface GroupedTimelineEvents {
  year: number | null;
  events: TimelineEventWithCategory[];
}

/**
 * Group timeline events by year, sorted in descending order (most recent first)
 */
export function groupEventsByYear(
  events: TimelineEventWithCategory[]
): GroupedTimelineEvents[] {
  const grouped = new Map<number | null, TimelineEventWithCategory[]>();

  for (const event of events) {
    const year = event.eventYear;
    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)?.push(event);
  }

  // Convert to array and sort by year (descending, null years at the end)
  const result: GroupedTimelineEvents[] = [];
  const years = Array.from(grouped.keys()).sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return b - a;
  });

  for (const year of years) {
    const yearEvents = grouped.get(year) ?? [];
    // Sort events within year by month, then day (most recent first)
    yearEvents.sort((a, b) => {
      const monthA = a.eventMonth ?? 0;
      const monthB = b.eventMonth ?? 0;
      if (monthA !== monthB) return monthB - monthA;
      const dayA = a.eventDay ?? 0;
      const dayB = b.eventDay ?? 0;
      return dayB - dayA;
    });
    result.push({ year, events: yearEvents });
  }

  return result;
}

/**
 * Format event date for display
 * Examples: "Apr, 1953", "Sep 16, 1960 - Jun 4, 1967", "1969"
 */
export function formatEventDateRange(event: TimelineEventWithCategory): string {
  const startParts: string[] = [];
  const endParts: string[] = [];

  // Format start date
  if (event.eventMonth) {
    const month = new Date(2000, event.eventMonth - 1).toLocaleString(
      "default",
      { month: "short" }
    );
    if (event.eventDay) {
      startParts.push(`${month} ${event.eventDay}`);
    } else {
      startParts.push(month);
    }
  }
  if (event.eventYear) {
    startParts.push(String(event.eventYear));
  }

  // Format end date if different from start
  const hasEndDate =
    event.endYear ||
    (event.endMonth && event.endMonth !== event.eventMonth) ||
    (event.endDay && event.endDay !== event.eventDay);

  if (hasEndDate) {
    if (event.endMonth) {
      const month = new Date(2000, event.endMonth - 1).toLocaleString(
        "default",
        { month: "short" }
      );
      if (event.endDay) {
        endParts.push(`${month} ${event.endDay}`);
      } else {
        endParts.push(month);
      }
    }
    if (event.endYear) {
      endParts.push(String(event.endYear));
    }
  }

  const startStr = startParts.join(", ");
  const endStr = endParts.join(", ");

  if (endStr && endStr !== startStr) {
    return `${startStr} - ${endStr}`;
  }
  return startStr;
}

/**
 * Generate inline styles for category badge based on hex color
 */
export function getCategoryBadgeStyles(color: string | null): {
  backgroundColor: string;
  borderColor: string;
  color: string;
} {
  if (!color) {
    return {
      backgroundColor: "hsl(var(--muted))",
      borderColor: "hsl(var(--border))",
      color: "hsl(var(--muted-foreground))",
    };
  }

  // Convert hex to rgba for transparency
  const hex = color.replace("#", "");
  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
    color,
  };
}

/**
 * Get card border style based on category color
 */
export function getCardBorderStyle(color: string | null): string {
  if (!color) {
    return "border-border";
  }
  return color;
}

/**
 * Map event type to a display-friendly label
 */
export function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    birth: "Birth",
    milestone: "Milestone",
    achievement: "Achievement",
    family: "Family",
    career: "Career",
    travel: "Travel",
    memory: "Memory",
    other: "Other",
  };
  return labels[eventType] ?? eventType;
}
