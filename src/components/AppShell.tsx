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
    <div className="h-full flex flex-col overflow-hidden relative" style={{ background: 'var(--thamara-bg)' }}>
      <TopBar />

      {/* Main content area with scroll */}
      <main
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{
          minHeight: 0,
          paddingBottom: 'calc(64px + var(--safe-area-inset-bottom))'
        }}
      >
        {children}
      </main>

      {/* FAB - Floating Action Button - Only show on home screen */}
      {isHome && (
        <Link
          href={FAB_ROUTE}
          className="fixed right-4 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 group touch-target"
          style={{
            bottom: 'calc(80px + var(--safe-area-inset-bottom))',
            background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            boxShadow: '0 6px 16px -4px rgba(124, 179, 66, 0.5), 0 4px 8px -2px rgba(0, 0, 0, 0.1)',
            zIndex: 50
          }}
          aria-label="Log Plot"
        >
          <Plus
            size={28}
            style={{ color: 'var(--thamara-text-on-accent)' }}
            strokeWidth={2.5}
            className="transition-transform duration-200 group-hover:rotate-90"
          />
        </Link>
      )}

      <BottomNav />
    </div>
  );
}
