import { Icon } from "@/components/ui/icon";

export function TimelineStep() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Timeline</h2>
        <p className="text-muted-foreground">
          Create a visual timeline of their life journey.
        </p>
      </div>

      <div className="space-y-6">
        {/* Timeline Placeholder */}
        <div className="rounded-lg border-2 border-muted-foreground/25 border-dashed p-8 text-center">
          <Icon
            className="mx-auto mb-3 size-12 text-muted-foreground"
            icon="mdi:timeline-clock-outline"
          />
          <p className="font-medium text-muted-foreground">Life Timeline</p>
          <p className="text-muted-foreground text-sm">
            Add milestones, achievements, and memorable moments. Coming in Phase
            8.
          </p>
        </div>

        {/* Timeline Categories Preview */}
        <div>
          <h3 className="mb-3 font-medium">Event Categories</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { icon: "mdi:school", label: "Education" },
              { icon: "mdi:briefcase", label: "Career" },
              { icon: "mdi:heart", label: "Family" },
              { icon: "mdi:trophy", label: "Achievements" },
              { icon: "mdi:airplane", label: "Travel" },
              { icon: "mdi:star", label: "Personal" },
            ].map(({ icon, label }) => (
              <div
                className="flex items-center gap-2 rounded-lg border bg-card p-3 opacity-60"
                key={label}
              >
                <Icon className="size-5 text-muted-foreground" icon={icon} />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950/30">
        <div className="flex gap-3">
          <Icon
            className="size-5 flex-shrink-0 text-blue-500"
            icon="mdi:information-outline"
          />
          <div>
            <p className="font-medium text-blue-700 dark:text-blue-400">
              Skip for now
            </p>
            <p className="text-blue-600 dark:text-blue-300">
              Timeline events can be added after publishing. Continue to the
              next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
