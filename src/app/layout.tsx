import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sehatia — Pelacak Kalori & Nutrisi Cerdas via WhatsApp",
  description:
    "Foto makananmu di WhatsApp, AI Sehatia langsung menghitung kalori, protein, karbohidrat, dan lemak dengan standar masakan Indonesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] selection:bg-emerald-500/20">
        {children}
      </body>
    </html>
  );
}
