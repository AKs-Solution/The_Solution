import { Resend } from "resend";
import { config } from "@/shared/config";

const EMAIL_FROM = process.env.EMAIL_FROM ?? "Consecuencia <onboarding@resend.dev>";

let client: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

function appUrl(): string {
  return config.appUrl.replace(/\/$/, "");
}

async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[Mail] RESEND_API_KEY is not configured. Skipping "${opts.subject}" to ${opts.to}. Set RESEND_API_KEY in your environment to enable email delivery.`,
    );
    return;
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
  } catch (err) {
    console.error("[Mail] Failed to send email:", err);
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const resetUrl = `${appUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;
  await sendMail({
    to,
    subject: "Reset your Consecuencia password",
    text: [
      "You requested a password reset for your Consecuencia account.",
      "",
      `Open this link to choose a new password: ${resetUrl}`,
      "",
      "This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #18181b;">Reset your Consecuencia password</h2>
        <p style="color: #3f3f46;">You requested a password reset for your Consecuencia account.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #18181b; color: #fafafa; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600;">Reset password</a>
        </p>
        <p style="font-size: 13px; color: #71717a;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendInvitationEmail(
  to: string,
  organizationName: string,
  role: string,
  recipientName?: string,
): Promise<void> {
  const invitationsUrl = `${appUrl()}/invitations`;
  const greeting = recipientName?.trim() ? `Hi ${recipientName.trim()},` : "";
  await sendMail({
    to,
    subject: `You're invited to join ${organizationName} on Consecuencia`,
    text: [
      greeting,
      `You've been invited to join the ${organizationName} workspace on Consecuencia as ${role}.`,
      "",
      `Sign in to review and accept the invitation: ${invitationsUrl}`,
      "",
      "This invitation expires in 7 days.",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #18181b;">You're invited to ${organizationName}</h2>
        ${greeting ? `<p style="color: #3f3f46;">${greeting}</p>` : ""}
        <p style="color: #3f3f46;">You've been invited to join the ${organizationName} workspace on Consecuencia as <strong>${role}</strong>.</p>
        <p>
          <a href="${invitationsUrl}" style="display: inline-block; background: #18181b; color: #fafafa; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600;">Review invitation</a>
        </p>
        <p style="font-size: 13px; color: #71717a;">This invitation expires in 7 days.</p>
      </div>
    `,
  });
}
