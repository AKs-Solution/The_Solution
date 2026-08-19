/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/seo/structured-data", () => ({
  HomeStructuredData: () => null,
}));

import Home from "@/app/page";

describe("Home Page", () => {
  it("renders the main heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<Home />);
    expect(screen.getByText(/engine does not invent/i)).toBeInTheDocument();
  });

  it("renders key call-to-action buttons", () => {
    render(<Home />);
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });
});
