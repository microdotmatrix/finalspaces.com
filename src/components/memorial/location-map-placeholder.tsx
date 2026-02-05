import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export function LocationMapPlaceholder() {
  return (
    <Card className="text-center">
      <CardContent>
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Icon
              className="size-8 text-muted-foreground"
              icon="ph:map-trifold"
            />
          </div>
        </div>
        <h3 className="mb-2 font-semibold text-xl">Interactive Map</h3>
        <p className="text-muted-foreground">
          Explore important places and locations on an interactive map. Coming
          soon.
        </p>
      </CardContent>
    </Card>
  );
}
