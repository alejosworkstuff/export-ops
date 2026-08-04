import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExportOps — Runway fiscal para freelancers que exportan",
  description:
    "Sabé cuánto te queda de categoría antes de facturar de más. Cobros USD/EUR al BNA, acumulado 12 meses y alertas. Sin ARCA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${dmSans.variable} ${syne.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
