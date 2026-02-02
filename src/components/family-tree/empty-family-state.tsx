"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface EmptyFamilyStateProps {
  onAddFirst: () => void;
}

export function EmptyFamilyState({ onAddFirst }: EmptyFamilyStateProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-muted-foreground/25 border-dashed bg-muted/30 px-6 py-16 text-center"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 rounded-full bg-primary/10 p-4">
        <Icon
          className="size-10 text-primary"
          icon="ph:tree-structure-duotone"
        />
      </div>

      <h3 className="mb-2 font-semibold text-xl">Build Your Family Tree</h3>

      <p className="mb-6 max-w-sm text-muted-foreground">
        Add family members to create a visual family tree. Start with immediate
        family like parents, siblings, or children.
      </p>

      <Button onClick={onAddFirst} size="lg">
        <Icon className="mr-2 size-4" icon="ph:plus" />
        Add First Family Member
      </Button>

      <div className="mt-8 grid grid-cols-2 gap-4 text-muted-foreground text-sm sm:grid-cols-4">
        <div className="flex flex-col items-center gap-1">
          <Icon className="size-5" icon="ph:user-circle" />
          <span>Parents</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon className="size-5" icon="ph:users" />
          <span>Siblings</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon className="size-5" icon="ph:heart" />
          <span>Spouse</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon className="size-5" icon="ph:baby" />
          <span>Children</span>
        </div>
      </div>
    </motion.div>
  );
}
