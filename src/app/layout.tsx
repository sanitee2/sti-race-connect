import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { NextAuthProvider } from '@/providers/session-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { FloatingTestButton } from "@/components/floating-test-button";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const satoshi = localFont({
  src: [
    {
      path: "../fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi-VariableItalic.woff2",
      weight: "300 900",
      style: "italic",
    }
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "STI Race Connect",
  description: "Event management platform for STI running events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${satoshi.variable} ${inter.variable} font-sans antialiased`}>
        <NextAuthProvider>
          <ThemeProvider>
            {children}
            <FloatingTestButton />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
