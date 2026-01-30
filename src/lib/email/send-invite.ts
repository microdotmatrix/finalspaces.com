import { Resend } from "resend";

import { InviteEmail } from "./invite-email";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInviteEmailParams {
  to: string;
  firstName: string;
  inviterName: string;
  spaceName: string;
  acceptUrl: string;
}

export async function sendInviteEmail({
  to,
  firstName,
  inviterName,
  spaceName,
  acceptUrl,
}: SendInviteEmailParams): Promise<{ success: boolean; error?: string }> {
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    console.error("RESEND_FROM_EMAIL not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `You're invited to collaborate on a FinalSpace memorial`,
      react: InviteEmail({
        firstName,
        inviterName,
        spaceName,
        acceptUrl,
      }),
    });

    if (error) {
      console.error("Error sending invite email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error sending invite email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}
