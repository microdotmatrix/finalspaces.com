"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { LifeTimeline } from "@/components/timeline/life-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TimelineEventWithCategory } from "@/lib/actions/timeline-actions";
import { features } from "@/lib/config";

const TimelineMap = dynamic<{ events: TimelineEventWithCategory[] }>(
  () =>
    import("@/components/timeline/timeline-map").then((mod) => mod.TimelineMap),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Loading map...
      </div>
    ),
  }
);

interface TimelineSectionContentProps {
  events: TimelineEventWithCategory[];
}

export function TimelineSectionContent({
  events,
}: TimelineSectionContentProps) {
  const [activeTab, setActiveTab] = useState("timeline");

  if (!features.timelineMapEnabled) {
    return <LifeTimeline events={events} hideHeader />;
  }

  return (
    <Tabs
      onValueChange={(value) => {
        if (typeof value === "string") {
          setActiveTab(value);
        }
      }}
      value={activeTab}
    >
      <TabsList variant="line">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="map">Map</TabsTrigger>
      </TabsList>

      <TabsContent value="timeline">
        <LifeTimeline events={events} hideHeader />
      </TabsContent>

      <TabsContent value="map">
        <TimelineMap events={events} />
      </TabsContent>
    </Tabs>
  );
}
