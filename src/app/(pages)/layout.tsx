"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTheme } from "@/providers/theme-provider";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
} 