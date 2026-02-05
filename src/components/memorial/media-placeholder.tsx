import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export function MediaPlaceholder() {
  return (
    <Card className="text-center">
      <CardContent>
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Icon
              className="size-8 text-muted-foreground"
              icon="ph:film-strip"
            />
          </div>
        </div>
        <h3 className="mb-2 font-semibold text-xl">Media Gallery</h3>
        <p className="text-muted-foreground">
          A collection of videos and audio memories is coming soon.
        </p>
      </CardContent>
    </Card>
  );
}
