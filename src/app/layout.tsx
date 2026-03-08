import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HEATDEBT — Urban Thermal Intelligence",
  description:
    "Real-time heat vulnerability monitoring for Montgomery, Alabama. 14 neighborhoods analyzed with Open-Meteo, Census ACS, EPA data, and Google Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
