import type { Metadata } from "next";
import "./globals.css";
import AppFrame from "@/components/AppFrame";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Thamara - Farm Recovery & Coordination",
  description: "Ultra-lightweight, offline-first farm recovery app for Gaza",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AppFrame>
          <AppShell>{children}</AppShell>
        </AppFrame>
      </body>
    </html>
  );
}
