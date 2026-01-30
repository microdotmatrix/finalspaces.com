import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BASE_URL: z.string().min(1),
    // Clerk (required for auth)
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().optional(),
    // Uploadthing (required for media uploads)
    UPLOADTHING_TOKEN: z.string().min(1),
    // Resend (required for Phase 6 - collaborator invites)
    RESEND_API_KEY: z.string().optional(),
    // Spotify (required for Phase 10 - metadata + previews)
    SPOTIFY_CLIENT_ID: z.string().min(1).optional(),
    SPOTIFY_CLIENT_SECRET: z.string().min(1).optional(),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
});
