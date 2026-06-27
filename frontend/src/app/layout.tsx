import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import AuthWrapper from "@/components/AuthWrapper";

export const metadata: Metadata = {
  title: "NeuroLens",
  description: "Your Mindful Journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-[#FDFCF8] text-[#1A1A1A] overflow-x-hidden relative">
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
