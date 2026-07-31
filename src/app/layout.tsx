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
  title: "ExportOps",
  description: "Freelancer Export Ops Cockpit — runway vs Monotributo tope",
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
