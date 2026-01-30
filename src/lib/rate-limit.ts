"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/lib/db";
import { rateLimitEvents } from "@/lib/db/schema";

const RATE_LIMIT_CONFIG = {
  guestbook: { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
  flag: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
} as const;

type RateLimitAction = keyof typeof RATE_LIMIT_CONFIG;

/**
 * Get the client IP address from headers
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return realIp ?? "unknown";
}

/**
 * Check if the IP is rate limited for a given action
 * @returns true if rate limited, false if allowed
 */
export async function isRateLimited(
  ip: string,
  action: RateLimitAction
): Promise<boolean> {
  const config = RATE_LIMIT_CONFIG[action];
  const windowStart = new Date(Date.now() - config.windowMs);

  const [result] = await db
    .select({ count: count() })
    .from(rateLimitEvents)
    .where(
      and(
        eq(rateLimitEvents.ipAddress, ip),
        eq(rateLimitEvents.action, action),
        gt(rateLimitEvents.createdAt, windowStart)
      )
    );

  return (result?.count ?? 0) >= config.limit;
}

/**
 * Record a rate limit event
 */
export async function recordRateLimitEvent(
  ip: string,
  action: RateLimitAction
): Promise<void> {
  await db.insert(rateLimitEvents).values({
    ipAddress: ip,
    action,
  });
}

/**
 * Check rate limit and record event if allowed
 * @returns true if allowed, false if rate limited
 */
export async function checkAndRecordRateLimit(
  ip: string,
  action: RateLimitAction
): Promise<boolean> {
  const limited = await isRateLimited(ip, action);

  if (limited) {
    return false;
  }

  await recordRateLimitEvent(ip, action);
  return true;
}

/**
 * Clean up old rate limit events (run periodically via cron)
 */
export async function cleanupRateLimitEvents(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  await db.delete(rateLimitEvents).where(gt(rateLimitEvents.createdAt, cutoff));
}
