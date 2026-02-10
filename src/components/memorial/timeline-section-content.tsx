"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FamilyTreeTabContent } from "@/components/memorial/family-tree-tab-content";
import { LifeTimeline } from "@/components/timeline/life-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FamilyMember } from "@/lib/actions/family-actions";
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
  canEdit: boolean;
  events: TimelineEventWithCategory[];
  familyMembers: FamilyMember[];
  finalSpaceId: string;
  subjectName: string;
}

type TimelineTab = "timeline" | "map" | "family";

function resolveTab(
  requestedTab: string | null,
  mapEnabled: boolean
): TimelineTab {
  if (requestedTab === "timeline" || requestedTab === "family") {
    return requestedTab;
  }
  if (requestedTab === "map" && mapEnabled) {
    return "map";
  }
  return "timeline";
}

export function TimelineSectionContent({
  canEdit,
  events,
  familyMembers,
  finalSpaceId,
  subjectName,
}: TimelineSectionContentProps) {
  const mapEnabled = features.timelineMapEnabled;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTabFromQuery = useMemo(
    () => resolveTab(searchParams.get("tab"), mapEnabled),
    [searchParams]
  );

  const [activeTab, setActiveTab] = useState<TimelineTab>(activeTabFromQuery);

  useEffect(() => {
    setActiveTab(activeTabFromQuery);
  }, [activeTabFromQuery]);

  const updateTabQuery = useCallback(
    (nextTab: TimelineTab) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextTab === "timeline") {
        params.delete("tab");
      } else {
        params.set("tab", nextTab);
      }

      const queryString = params.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleTabChange = useCallback(
    (value: string | number | null) => {
      if (typeof value !== "string") {
        return;
      }

      const resolvedTab = resolveTab(value, mapEnabled);
      setActiveTab(resolvedTab);
      updateTabQuery(resolvedTab);
    },
    [updateTabQuery]
  );

  return (
    <Tabs onValueChange={handleTabChange} value={activeTab}>
      <TabsList variant="line">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        {mapEnabled && <TabsTrigger value="map">Map</TabsTrigger>}
        <TabsTrigger value="family">Family Tree</TabsTrigger>
      </TabsList>

      <TabsContent value="timeline">
        <LifeTimeline events={events} hideHeader />
      </TabsContent>

      {mapEnabled && (
        <TabsContent value="map">
          <TimelineMap events={events} />
        </TabsContent>
      )}

      <TabsContent value="family">
        <FamilyTreeTabContent
          canEdit={canEdit}
          familyMembers={familyMembers}
          finalSpaceId={finalSpaceId}
          subjectName={subjectName}
        />
      </TabsContent>
    </Tabs>
  );
}
