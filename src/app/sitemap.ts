import type { MetadataRoute } from "next";
import { SITE_URL } from "@/features/marketing/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-16T00:00:00Z");
  const paths = [
    "/",
    "/demo",
    "/contact",
    "/pricing",
    "/use-cases/flight-systems",
    "/use-cases/as9100-compliance",
    "/vs/predictive-ai",
  ];

  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
