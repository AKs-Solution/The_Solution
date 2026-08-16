import type { Metadata } from "next";
import { AppProvider } from "@/providers";
import { RootStructuredData } from "@/components/seo/structured-data";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  TITLE_TEMPLATE,
} from "@/features/marketing/content";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: DEFAULT_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full font-sans antialiased">
      <body className="m-0 min-h-screen bg-slate-50 p-0 text-slate-900">
        <RootStructuredData />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
