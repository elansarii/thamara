'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { FAB_ROUTE, ROUTES } from '@/lib/routes';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcome = pathname === ROUTES.WELCOME;
  const isHome = pathname === ROUTES.HOME;

  // Welcome screen gets full screen treatment
  if (isWelcome) {
    return <div className="h-full" style={{ background: 'var(--thamara-bg)' }}>{children}</div>;
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'var(--thamara-bg)' }}>
      <TopBar />

      {/* Main content area with scroll */}
      <main className="flex-1 overflow-y-auto relative" style={{ minHeight: 0 }}>
        {children}

        {/* FAB - Floating Action Button - Only show on home screen */}
        {isHome && (
          <Link
            href={FAB_ROUTE}
            className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              boxShadow: '0 8px 16px -4px rgba(124, 179, 66, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Log Plot"
          >
            <Plus
              size={32}
              style={{ color: 'var(--thamara-text-on-accent)' }}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </Link>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
