import { headers } from "next/headers";
import {
  DATE_MODIFIED,
  DATE_PUBLISHED,
  DEFAULT_DESCRIPTION,
  MARKETING_FAQS,
  SITE_NAME,
  SITE_URL,
} from "@/features/marketing/content";

interface StructuredDataProps {
  data: Record<string, unknown> | ReadonlyArray<Record<string, unknown>>;
}

export async function StructuredData({ data }: StructuredDataProps) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    description: DEFAULT_DESCRIPTION,
    foundingDate: "2026-01-15",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: `${SITE_URL}/contact`,
      availableLanguage: ["English"],
    },
    sameAs: ["https://github.com/AKs-Solution/The_Solution"],
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "Service"],
    name: "Consecuencia",
    brand: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "EngineeringSoftware",
    operatingSystem: "Web",
    description: DEFAULT_DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    offers: {
      "@type": "Offer",
      price: "Custom",
      priceCurrency: "USD",
      url: `${SITE_URL}/pricing`,
    },
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function faqPageJsonLd(
  faqs: ReadonlyArray<{ question: string; answer: string }> = MARKETING_FAQS,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export async function RootStructuredData() {
  return <StructuredData data={[organizationJsonLd(), softwareApplicationJsonLd()]} />;
}

export async function HomeStructuredData() {
  return <StructuredData data={faqPageJsonLd()} />;
}
