"use client";

import { motion } from "motion/react";
import Link from "next/link";

import type { FinalSpace } from "@/lib/actions/final-space-actions";

interface DashboardSpaceCardProps {
  space: FinalSpace;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;

export function DashboardSpaceCard({ space }: DashboardSpaceCardProps) {
  const displayName =
    space.firstName && space.lastName
      ? `${space.firstName} ${space.lastName}`
      : space.name;
  const initial = (space.firstName || space.name).charAt(0).toUpperCase();

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-lg transition-all hover:shadow-2xl"
      transition={{ duration: 0.3 }}
      variants={itemVariants}
      whileHover={{ y: -4 }}
    >
      {/* Placeholder Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-24 items-center justify-center rounded-full border-4 border-background bg-primary/20 font-bold text-5xl text-primary backdrop-blur-sm">
            {initial}
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`rounded-full px-3 py-1 font-medium text-xs shadow-lg backdrop-blur-sm ${
              space.status === "published"
                ? "bg-green-500/90 text-white"
                : "bg-yellow-500/90 text-white"
            }`}
          >
            {space.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="mb-1 font-bold text-xl tracking-tight">{displayName}</h3>
        <p className="mb-4 font-mono text-muted-foreground text-sm">
          /{space.slug}
        </p>

        <div className="flex items-center gap-3">
          <Link
            className="flex-1 rounded-lg bg-primary/10 px-4 py-2 text-center font-medium text-primary text-sm transition-colors hover:bg-primary/20"
            href={`/finalspaces/${space.id}/edit`}
          >
            Edit
          </Link>
          {space.status === "published" && (
            <Link
              className="flex-1 rounded-lg border border-border/40 bg-card px-4 py-2 text-center font-medium text-sm transition-colors hover:bg-accent"
              href={`/m/${space.slug}`}
            >
              View Live
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
