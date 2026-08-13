import type { Metadata } from "next";
import { AppProvider } from "@/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Consecuencia by AK — Aerospace Intelligence",
    template: "%s — Consecuencia Aerospace Intelligence",
  },
  description:
    "Engineering Reality Platform — verifying engineering truth through deterministic, evidence-based reasoning",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="m-0 flex h-screen w-screen flex-col overflow-hidden bg-zinc-50 p-0 text-zinc-900">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
