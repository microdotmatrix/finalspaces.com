"use client";

import { UserButton } from "@clerk/nextjs";
import { Calendar, Plus, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { FinalSpace } from "@/lib/actions/final-space-actions";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { DashboardSpaceCard } from "./dashboard-space-card";

interface DashboardContentProps {
  spaces: FinalSpace[];
  userDisplayName: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

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

export function DashboardContent({
  spaces,
  userDisplayName,
}: DashboardContentProps) {
  const publishedCount = spaces.filter((s) => s.status === "published").length;
  const draftCount = spaces.length - publishedCount;

  return (
    <div className="w-full">
      {/* Hero Header */}
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex items-center justify-between border-border/40 border-b pb-8"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1 className="mb-2 font-bold text-5xl tracking-tight">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back,{" "}
            <span className="font-medium text-foreground">
              {userDisplayName}
            </span>
          </p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </motion.header>

      {/* Stats Overview */}
      <motion.section
        animate="visible"
        className="mb-12 grid gap-6 md:grid-cols-3"
        initial="hidden"
        variants={containerVariants}
      >
        <motion.div
          className="group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 p-8 shadow-lg transition-all hover:shadow-xl"
          transition={{ duration: 0.3 }}
          variants={itemVariants}
          whileHover={{ y: -4 }}
        >
          <div className="absolute top-0 right-0 size-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
              <TrendingUp className="size-6 text-primary" />
            </div>
            <h3 className="mb-1 font-bold text-4xl tracking-tight">
              {spaces.length}
            </h3>
            <p className="text-muted-foreground text-sm">Total FinalSpaces</p>
          </div>
        </motion.div>

        <motion.div
          className="group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 p-8 shadow-lg transition-all hover:shadow-xl"
          transition={{ duration: 0.3 }}
          variants={itemVariants}
          whileHover={{ y: -4 }}
        >
          <div className="absolute top-0 right-0 size-32 translate-x-8 -translate-y-8 rounded-full bg-green-500/5" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-xl bg-green-500/10 p-3">
              <Calendar className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-1 font-bold text-4xl tracking-tight">
              {publishedCount}
            </h3>
            <p className="text-muted-foreground text-sm">Published</p>
          </div>
        </motion.div>

        <motion.div
          className="group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 p-8 shadow-lg transition-all hover:shadow-xl"
          transition={{ duration: 0.3 }}
          variants={itemVariants}
          whileHover={{ y: -4 }}
        >
          <div className="absolute top-0 right-0 size-32 translate-x-8 -translate-y-8 rounded-full bg-yellow-500/5" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-xl bg-yellow-500/10 p-3">
              <Users className="size-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="mb-1 font-bold text-4xl tracking-tight">
              {draftCount}
            </h3>
            <p className="text-muted-foreground text-sm">Drafts</p>
          </div>
        </motion.div>
      </motion.section>

      {/* Your FinalSpaces */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-1 font-bold text-3xl tracking-tight">
              Your FinalSpaces
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage and create memorial spaces
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              href="/finalspaces/new"
            >
              <Plus className="size-5" />
              Create New
            </Link>
          </motion.div>
        </div>

        {spaces.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <motion.div
            animate="visible"
            className="grid gap-6 md:grid-cols-2"
            initial="hidden"
            variants={containerVariants}
          >
            {spaces.map((space) => (
              <DashboardSpaceCard key={space.id} space={space} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
