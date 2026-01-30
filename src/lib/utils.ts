import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isBrowser = typeof window !== "undefined";

export interface ActionState {
  error?: string;
  success?: string;
  [key: string]: unknown;
}

type ValidatedActionFunction<S extends z.ZodType<unknown, unknown>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function action<S extends z.ZodType<unknown, unknown>, T>(
  schema: S,
  fn: ValidatedActionFunction<S, T>
) {
  return async (_prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.message } as T;
    }

    return await fn(result.data, formData);
  };
}

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : 8 + (r % 4);
    return v.toString(16);
  });
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

export const useDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export const getServerSideURL = () => {
  let url = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (!url) {
    url = "http://localhost:3000";
  }

  return url;
};

export const getClientSideURL = () => {
  if (useDOM) {
    const protocol = window.location.protocol;
    const domain = window.location.hostname;
    const port = window.location.port;

    return `${protocol}//${domain}${port ? `:${port}` : ""}`;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return process.env.NEXT_PUBLIC_SERVER_URL || "";
};

// Helper function to convert 24-hour time to 12-hour AM/PM format
export const formatTime = (time: string): string => {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":");
  const hour24 = Number.parseInt(hours, 10);
  let hour12 = hour24;
  if (hour24 === 0) {
    hour12 = 12;
  } else if (hour24 > 12) {
    hour12 = hour24 - 12;
  }
  const ampm = hour24 >= 12 ? "PM" : "AM";

  return `${hour12}:${minutes} ${ampm}`;
};

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  return formatDate(date);
}
