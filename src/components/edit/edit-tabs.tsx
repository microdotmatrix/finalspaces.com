"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Icon } from "@/components/ui/icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlbumsStep } from "@/components/wizard-steps/albums-step";
import { BioStep } from "@/components/wizard-steps/bio-step";
import { DatesStep } from "@/components/wizard-steps/dates-step";
import { FamilyStep } from "@/components/wizard-steps/family-step";
import { FavoritesStep } from "@/components/wizard-steps/favorites-step";
import { IdentityStep } from "@/components/wizard-steps/identity-step";
import { LocationsStep } from "@/components/wizard-steps/locations-step";
import { PhotosStep } from "@/components/wizard-steps/photos-step";
import { SocialStep } from "@/components/wizard-steps/social-step";
import { TimelineStep } from "@/components/wizard-steps/timeline-step";

const EDIT_TABS = [
  {
    key: "basic",
    label: "Basic Info",
    icon: "mdi:account-outline",
    description: "Identity, dates, locations, and biography",
  },
  {
    key: "media",
    label: "Media",
    icon: "mdi:image-outline",
    description: "Photos and albums",
  },
  {
    key: "social",
    label: "Social",
    icon: "mdi:share-variant-outline",
    description: "YouTube, Spotify, and social links",
  },
  {
    key: "timeline",
    label: "Timeline",
    icon: "mdi:timeline-clock-outline",
    description: "Life events and milestones",
  },
  {
    key: "family",
    label: "Family",
    icon: "ph:tree-structure-duotone",
    description: "Family tree and relationships",
  },
  {
    key: "favorites",
    label: "Favorites",
    icon: "ph:star-duotone",
    description: "Books, movies, music, and more",
  },
] as const;

type TabKey = (typeof EDIT_TABS)[number]["key"];

function TabSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-4 w-64 rounded bg-muted" />
      <div className="space-y-4">
        <div className="h-10 w-full rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
        <div className="h-10 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t pt-8" />;
}

function BasicInfoContent() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<TabSkeleton />}>
        <IdentityStep />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<TabSkeleton />}>
        <DatesStep />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<TabSkeleton />}>
        <LocationsStep />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<TabSkeleton />}>
        <BioStep />
      </Suspense>
    </div>
  );
}

function MediaContent() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<TabSkeleton />}>
        <PhotosStep />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<TabSkeleton />}>
        <AlbumsStep />
      </Suspense>
    </div>
  );
}

function SocialContent() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <SocialStep />
    </Suspense>
  );
}

function TimelineContent() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <TimelineStep />
    </Suspense>
  );
}

function FamilyContent() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <FamilyStep />
    </Suspense>
  );
}

function FavoritesContent() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <FavoritesStep />
    </Suspense>
  );
}

function EditTabsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get("tab") || "basic") as TabKey;

  const handleTabChange = (value: string | number | null) => {
    if (value && typeof value === "string") {
      router.push(`?tab=${value}`, { scroll: false });
    }
  };

  return (
    <Tabs onValueChange={handleTabChange} value={currentTab}>
      <TabsList className="mb-6 w-full justify-start" variant="line">
        {EDIT_TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TabsTrigger
              className="after:hidden! cursor-pointer"
              key={tab.key}
              value={tab.key}
            >
              <Icon className="size-4" icon={tab.icon} />
              <motion.span
                animate={{
                  width: isActive ? "auto" : 0,
                  opacity: isActive ? 1 : 0,
                }}
                className="overflow-hidden whitespace-nowrap sm:hidden"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {tab.label}
              </motion.span>
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive ? (
                <motion.div
                  className="absolute inset-x-0 bottom-[-5px] h-0.5 bg-foreground"
                  layoutId="active-tab-indicator"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              ) : null}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          initial={{ opacity: 0, x: 20 }}
          key={currentTab}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {currentTab === "basic" && <BasicInfoContent />}
          {currentTab === "media" && <MediaContent />}
          {currentTab === "social" && <SocialContent />}
          {currentTab === "timeline" && <TimelineContent />}
          {currentTab === "family" && <FamilyContent />}
          {currentTab === "favorites" && <FavoritesContent />}
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
}

export function EditTabs() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <EditTabsContent />
    </Suspense>
  );
}
