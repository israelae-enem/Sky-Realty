import type { Metadata } from "next";
import { Inter, Roboto, Audiowide } from "next/font/google";
import { cn } from "../lib/utils";
// @ts-ignore
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from '@clerk/nextjs';

// Primary body font
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter",
});

// Techy / futuristic font for headings
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-orbitron",
});

// Accent font (dramatic, stylish)
const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-audiowide",
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
    <html
      lang="en"
      className={cn(inter.variable, roboto.variable, audiowide.variable)}
    >
      <body className={cn("min-h-screen antialiased font-[var(--font-inter)]")}>
        <ClerkProvider appearance={{ variables: { colorPrimary: '#302cfc' } }}>
          <Navbar/>
          {children}
          <Toaster position="top-center" richColors theme="dark" />
        </ClerkProvider>
      </body>
    </html>
  );
}