"use client";

import { useAtom } from "jotai";

import { Icon } from "@/components/ui/icon";
import { saveStatusAtom } from "@/lib/stores/wizard-state";
import { cn } from "@/lib/utils";

export function SaveStatusIndicator() {
  const [saveStatus] = useAtom(saveStatusAtom);

  const statusConfig = {
    idle: {
      icon: "mdi:cloud-outline",
      text: "Ready",
      color: "text-muted-foreground",
    },
    saving: {
      icon: "mdi:cloud-sync-outline",
      text: "Saving...",
      color: "text-blue-500",
    },
    saved: {
      icon: "mdi:cloud-check-outline",
      text: "Saved",
      color: "text-green-500",
    },
    error: { icon: "mdi:cloud-alert", text: "Error", color: "text-red-500" },
  };

  const config = statusConfig[saveStatus];

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", config.color)}>
      <Icon className="size-4" icon={config.icon} />
      <span>{config.text}</span>
    </div>
  );
}
