import type { Metadata } from "next";
import "./globals.css";
import AppFrame from "@/components/AppFrame";
import AppShell from "@/components/AppShell";
import { PlotProvider } from "@/lib/plotStore";
import PWARegister from "@/components/PWARegister";
import InstallPrompt from "@/components/InstallPrompt";
import DatabaseProvider from "@/components/DatabaseProvider";

export const metadata: Metadata = {
  title: "Thamara - Farm Recovery & Coordination",
  description: "Ultra-lightweight, offline-first farm recovery app for Gaza",
  manifest: "/manifest.json",
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Thamara',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <DatabaseProvider>
          <PlotProvider>
            <AppFrame>
              <AppShell>{children}</AppShell>
            </AppFrame>
          </PlotProvider>
        </DatabaseProvider>
        <PWARegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
