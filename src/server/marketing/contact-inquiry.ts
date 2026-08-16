import { z } from "zod";
import { ENGINEERING_ROLES } from "@/features/marketing/content";

const CONSUMER_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
]);

const roleValues = ENGINEERING_ROLES.map((role) => role.value) as [
  (typeof ENGINEERING_ROLES)[number]["value"],
  ...(typeof ENGINEERING_ROLES)[number]["value"][],
];

export const contactInquirySchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  workEmail: z.string().trim().email("Enter a valid work email").max(254),
  organization: z.string().trim().min(2, "Organization is required").max(200),
  role: z.enum(roleValues, {
    errorMap: () => ({ message: "Select an engineering role" }),
  }),
  useCase: z
    .string()
    .trim()
    .min(10, "Describe the program or use case")
    .max(4000, "Keep the use case under 4,000 characters"),
});

export type ContactInquiry = z.infer<typeof contactInquirySchema>;

export function isConsumerEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return Boolean(domain && CONSUMER_EMAIL_DOMAINS.has(domain));
}
