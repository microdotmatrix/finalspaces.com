import { Icon } from "@/components/ui/icon";

export function MediaPlaceholder() {
  return (
    <section className="rounded-xl border bg-card p-8 text-center shadow-sm">
      <div className="mb-4 flex justify-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Icon className="size-8 text-muted-foreground" icon="ph:film-strip" />
        </div>
      </div>
      <h3 className="mb-2 font-semibold text-xl">Media Gallery</h3>
      <p className="text-muted-foreground">
        A collection of videos and audio memories is coming soon.
      </p>
    </section>
  );
}
