import { z } from "zod";

export const SUPPORT_CATEGORIES = ["complaint", "support", "feedback"] as const;

export const supportInquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(254),
  category: z.enum(SUPPORT_CATEGORIES, {
    errorMap: () => ({ message: "Select a category" }),
  }),
  subject: z.string().trim().min(3, "Subject is required").max(200),
  message: z.string().trim().min(10, "Describe the issue").max(8000),
  diagnostics: z.string().trim().max(4000).optional(),
  companyUrl: z.string().max(200).optional(),
});

export type SupportInquiry = z.infer<typeof supportInquirySchema>;

export function isHoneypotTriggered(companyUrl: string | undefined): boolean {
  return Boolean(companyUrl && companyUrl.trim().length > 0);
}
