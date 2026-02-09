interface TimelineYearMarkerProps {
  year: number | null;
}

export function TimelineYearMarker({ year }: TimelineYearMarkerProps) {
  return (
    <div className="relative flex items-center gap-4 py-4">
      <div className="shrink-0">
        <span
          className="rounded-full px-3 py-1 font-semibold text-primary text-sm"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--primary) 5%, var(--background))",
          }}
        >
          {year ?? "Unknown"}
        </span>
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
