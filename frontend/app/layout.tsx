import type React from "react";
import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Providers } from "@/lib/providers";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mini Udemy - Premium Online Learning Platform",
  description:
    "Master new skills with expert-led courses. Join thousands of students learning from world-class instructors.",
  generator: "Mini Udemy Platform",
  keywords: ["online learning", "courses", "education", "skills", "training"],
  authors: [{ name: "Mini Udemy Team" }],
  openGraph: {
    title: "Mini Udemy - Premium Online Learning Platform",
    description: "Master new skills with expert-led courses",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} antialiased`}>
        <Providers>
          <Suspense fallback={null}>
            <AuthProvider>

              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster />
              </ThemeProvider>

            </AuthProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
