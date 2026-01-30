"use client";

import { MonitorIcon, MoonStarIcon, SunIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import type { JSX } from "react";
import { useCallback } from "react";

import { useIsHydrated } from "@/hooks/use-hydrated";
import { useMetaColor } from "@/hooks/use-meta-color";
import { meta } from "@/lib/config";
import { cn } from "@/lib/utils";

function ThemeOption({
  icon,
  value,
  isActive,
  onClick,
}: {
  icon: JSX.Element;
  value: string;
  isActive?: boolean;
  onClick: (value: string) => void;
}) {
  return (
    <label
      className={cn(
        "relative flex size-8 cursor-pointer items-center justify-center rounded-full transition-[color] [&_svg]:size-4",
        isActive
          ? "text-zinc-950 dark:text-zinc-50"
          : "text-zinc-400 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-50"
      )}
    >
      <input
        aria-label={`Switch to ${value} theme`}
        checked={isActive}
        className="sr-only"
        name="theme-option"
        onChange={() => onClick(value)}
        type="radio"
        value={value}
      />
      {icon}

      {isActive ? (
        <motion.div
          className="absolute inset-0 rounded-full border border-zinc-200 dark:border-zinc-700"
          layoutId="theme-option"
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        />
      ) : null}
    </label>
  );
}

const THEME_OPTIONS = [
  {
    icon: <MonitorIcon />,
    value: "system",
  },
  {
    icon: <SunIcon />,
    value: "light",
  },
  {
    icon: <MoonStarIcon />,
    value: "dark",
  },
];

function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setMetaColor } = useMetaColor();

  const cycleTheme = useCallback(
    (value: string) => {
      setTheme(value);

      // For system theme, use the resolved theme to determine meta color
      const effectiveTheme = value === "system" ? resolvedTheme : value;
      setMetaColor(
        effectiveTheme === "dark" ? meta.colors.dark : meta.colors.light
      );
    },
    [resolvedTheme, setTheme, setMetaColor]
  );

  const isMounted = useIsHydrated();

  if (!isMounted) {
    return <div className="flex h-8 w-24" />;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="inline-flex items-center overflow-hidden rounded-full bg-white ring-1 ring-zinc-200 ring-inset dark:bg-zinc-950 dark:ring-zinc-700"
      initial={{ opacity: 0 }}
      key={String(isMounted)}
      role="radiogroup"
      transition={{ duration: 0.3 }}
    >
      {THEME_OPTIONS.map((option) => (
        <ThemeOption
          icon={option.icon}
          isActive={theme === option.value}
          key={option.value}
          onClick={(value) => cycleTheme(value)}
          value={option.value}
        />
      ))}
    </motion.div>
  );
}

export { ThemeSwitcher };
