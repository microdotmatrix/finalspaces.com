"use client";

import { Plus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export function DashboardEmptyState() {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 p-12 text-center shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto mb-6 inline-flex rounded-2xl bg-primary/10 p-6">
        <Plus className="size-12 text-primary" />
      </div>
      <h3 className="mb-2 font-bold text-2xl">No memorials yet</h3>
      <p className="mb-6 text-muted-foreground">
        Create your first FinalSpace to get started
      </p>
      <Link
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
        href="/finalspaces/new"
      >
        <Plus className="size-5" />
        Create FinalSpace
      </Link>
    </motion.div>
  );
}
