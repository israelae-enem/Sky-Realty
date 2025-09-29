import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "../lib/utils";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from '@clerk/nextjs'

// Use .className property when applying to body
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter", // optional, can help with Tailwind/var usage
});

export const metadata: Metadata = {
  title: "Sky-Realty",
  description: "A Property management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={cn("min-h-screen antialiased")}>
        <ClerkProvider appearance={{ variables: { colorPrimary: '#302cfc'}}}>
        <Navbar />
        {children}
        <Toaster position="top-center" richColors theme="dark" />
        </ClerkProvider>
      </body>
    </html>
  );
}