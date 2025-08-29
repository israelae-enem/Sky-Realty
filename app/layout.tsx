import type { Metadata } from "next"
import { Inter } from "next/font/google";
import { cn } from '../lib/utils';
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";





const inter = Inter ({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  
});

export const metadata: Metadata = {
  title: "Sky-Realty",
  description: "A Property management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en">
      
      <body
        className={cn("min-h-screen  antialiased", inter.variable)}>
          <Navbar/>
          
          {children}
        
          <Toaster position="top-center" richColors theme="dark" />
         
      </body>
    </html>
  );
}