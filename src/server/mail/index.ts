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

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[Mail] RESEND_API_KEY is not configured. Skipping "${opts.subject}" to ${opts.to}. Set RESEND_API_KEY in your environment to enable email delivery.`,
    );
    return false;
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    return true;
  } catch (err) {
    console.error("[Mail] Failed to send email:", err);
    return false;
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
  inviteUrl: string,
  recipientName?: string,
): Promise<boolean> {
  const greeting = recipientName?.trim() ? `Hi ${recipientName.trim()},` : "";
  return sendMail({
    to,
    subject: `You're invited to join ${organizationName} on Consecuencia`,
    text: [
      greeting,
      `You've been invited to join the ${organizationName} workspace on Consecuencia as ${role}.`,
      "",
      `Accept the invitation: ${inviteUrl}`,
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
          <a href="${inviteUrl}" style="display: inline-block; background: #2563eb; color: #fafafa; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600;">Accept invitation</a>
        </p>
        <p style="font-size: 13px; color: #71717a;">This invitation expires in 7 days.</p>
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendDemoInquiryEmail(input: {
  fullName: string;
  workEmail: string;
  organization: string;
  role: string;
  useCase: string;
}): Promise<void> {
  const inbox = process.env.CONTACT_INBOX ?? process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  const roleLabel = input.role.replaceAll("_", " ");
  const subject = `Technical evaluation request — ${input.organization}`;
  const text = [
    "New Consecuencia technical evaluation request",
    "",
    `Name: ${input.fullName}`,
    `Work email: ${input.workEmail}`,
    `Organization: ${input.organization}`,
    `Role: ${roleLabel}`,
    "",
    "Primary program / use case:",
    input.useCase,
  ].join("\n");

  await sendMail({
    to: inbox,
    subject,
    text,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <h2>Technical evaluation request</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.fullName)}</p>
        <p><strong>Work email:</strong> ${escapeHtml(input.workEmail)}</p>
        <p><strong>Organization:</strong> ${escapeHtml(input.organization)}</p>
        <p><strong>Role:</strong> ${escapeHtml(roleLabel)}</p>
        <p><strong>Primary program / use case</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(input.useCase)}</p>
      </div>
    `,
  });
}
