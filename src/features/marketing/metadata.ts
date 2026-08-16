import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_URL } from "@/features/marketing/content";

export function pageMetadata(
  title: string,
  description = DEFAULT_DESCRIPTION,
  path = "/",
): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}
