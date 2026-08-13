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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark font-sans">
      <body className="h-screen w-screen overflow-hidden bg-[#090d14] text-slate-100 flex flex-col m-0 p-0">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
