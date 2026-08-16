import { describe, expect, it } from "vitest";
import {
  customerCareInbox,
  DEFAULT_CUSTOMER_CARE_INBOX,
  DEFAULT_INTEREST_INBOX,
  interestInbox,
} from "@/server/mail/inboxes";

describe("mail inboxes", () => {
  it("defaults interest to the product inbox and customer care to Outlook", () => {
    expect(DEFAULT_INTEREST_INBOX).toBe("ak.consecuencia@gmail.com");
    expect(DEFAULT_CUSTOMER_CARE_INBOX).toBe("customercare.consecuencia@outlook.com");
    expect(interestInbox()).toBe(DEFAULT_INTEREST_INBOX);
    expect(customerCareInbox()).toBe(DEFAULT_CUSTOMER_CARE_INBOX);
  });
});
