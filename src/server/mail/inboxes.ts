/** Public destination addresses — not secrets. Override with env in production if needed. */
export const DEFAULT_INTEREST_INBOX = "ak.consecuencia@gmail.com";
export const DEFAULT_CUSTOMER_CARE_INBOX = "customercare.consecuencia@outlook.com";

export function interestInbox(): string {
  return process.env.INTEREST_INBOX?.trim() || DEFAULT_INTEREST_INBOX;
}

export function customerCareInbox(): string {
  return process.env.CUSTOMER_CARE_INBOX?.trim() || DEFAULT_CUSTOMER_CARE_INBOX;
}
