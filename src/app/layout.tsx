import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/providers";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Morningstar Solution",
  description:
    "Engineering Reality Platform — verifying engineering truth through deterministic, evidence-based reasoning",
};

// Next.js 16.2.x fails to statically prerender pages because its prerender
// machinery reads the request workStore before it is initialized
// (InvariantError E1068 "Expected workStore to be initialized"). Every page
// in this platform is an authenticated, data-driven segment, so all routes
// render on-demand instead of being statically prerendered.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full w-full overflow-hidden bg-[#06090e] text-slate-100 flex flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
