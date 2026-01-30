import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { env } from "@/lib/env/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!(svix_id && svix_timestamp && svix_signature)) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    await db.insert(users).values({
      clerkUserId: id,
      email: primaryEmail ?? null,
      firstName: first_name ?? null,
      lastName: last_name ?? null,
      profileImageUrl: image_url ?? null,
    });

    return new Response("User created", { status: 200 });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    await db
      .update(users)
      .set({
        email: primaryEmail ?? null,
        firstName: first_name ?? null,
        lastName: last_name ?? null,
        profileImageUrl: image_url ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkUserId, id));

    return new Response("User updated", { status: 200 });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      // Soft delete: mark user as inactive
      await db
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, id));
    }

    return new Response("User deleted", { status: 200 });
  }

  return new Response("Webhook received", { status: 200 });
}
