import { Resend } from "resend";
import { config } from "@/shared/config";
import { customerCareInbox, interestInbox } from "./inboxes";

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
  const safeOrg = escapeHtml(organizationName);
  const safeRole = escapeHtml(role);
  const safeGreeting = recipientName?.trim() ? `Hi ${escapeHtml(recipientName.trim())},` : "";
  const safeInviteUrl = encodeURI(inviteUrl);
  const greetingText = recipientName?.trim() ? `Hi ${recipientName.trim()},` : "";
  return sendMail({
    to,
    subject: `You're invited to join ${organizationName} on Consecuencia`,
    text: [
      greetingText,
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
        <h2 style="color: #18181b;">You're invited to ${safeOrg}</h2>
        ${safeGreeting ? `<p style="color: #3f3f46;">${safeGreeting}</p>` : ""}
        <p style="color: #3f3f46;">You've been invited to join the ${safeOrg} workspace on Consecuencia as <strong>${safeRole}</strong>.</p>
        <p>
          <a href="${safeInviteUrl}" style="display: inline-block; background: #2563eb; color: #fafafa; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600;">Accept invitation</a>
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
}): Promise<boolean> {
  const inbox = interestInbox();
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

  return sendMail({
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

export async function sendCustomerCareEmail(input: {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  diagnostics?: string;
}): Promise<boolean> {
  const inbox = customerCareInbox();
  const categoryLabel = input.category.replaceAll("_", " ");
  const text = [
    `New Consecuencia ${categoryLabel} submission`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Category: ${categoryLabel}`,
    `Subject: ${input.subject}`,
    "",
    input.message,
    input.diagnostics ? `\n--- diagnostics ---\n${input.diagnostics}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return sendMail({
    to: inbox,
    subject: `[${categoryLabel}] ${input.subject}`,
    text,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <h2>${escapeHtml(categoryLabel)}</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
        <p style="white-space: pre-wrap;">${escapeHtml(input.message)}</p>
        ${
          input.diagnostics
            ? `<p><strong>Diagnostics</strong></p><pre style="white-space: pre-wrap; font-size: 12px; color: #334155;">${escapeHtml(input.diagnostics)}</pre>`
            : ""
        }
      </div>
    `,
  });
}

export async function sendAdminReplyEmail(input: {
  to: string;
  name?: string;
  originalSubject: string;
  body: string;
}): Promise<boolean> {
  const safeGreeting = input.name?.trim() ? `Hi ${escapeHtml(input.name.trim())},` : "";
  const subject = `Re: ${input.originalSubject}`;
  const text = [
    safeGreeting,
    "",
    "A Consecuencia team member replied to your inquiry:",
    "",
    input.body,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return sendMail({
    to: input.to,
    subject,
    text,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
        ${safeGreeting ? `<p style="color: #334155;">${safeGreeting}</p>` : ""}
        <p style="color: #334155;">A Consecuencia team member replied to your inquiry:</p>
        <p style="white-space: pre-wrap; border-left: 3px solid #2563eb; padding-left: 12px; color: #0f172a;">${escapeHtml(input.body)}</p>
      </div>
    `,
  });
}
