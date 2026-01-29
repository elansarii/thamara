'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, BookOpen, Handshake, Droplets } from 'lucide-react';
import { BOTTOM_NAV_ITEMS } from '@/lib/routes';

const iconMap = {
  Map,
  BookOpen,
  Handshake,
  Droplets,
};

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      id="bottom-nav"
      className="absolute bottom-0 left-0 right-0 flex items-start justify-around border-t backdrop-blur-sm flex-shrink-0 safe-bottom"
      style={{
        height: 'calc(64px + var(--safe-area-inset-bottom))',
        paddingBottom: 'var(--safe-area-inset-bottom)',
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
        boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.05)',
        zIndex: 100
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const isActive = pathname === item.route;

        return (
          <Link
            key={item.id}
            href={item.route}
            className="flex flex-col items-center justify-center gap-0.5 py-2 px-2 flex-1 transition-all duration-200 relative touch-target"
          >
            {/* Active indicator line */}
            {isActive && (
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full"
                style={{
                  width: '24px',
                  background: 'var(--thamara-accent-500)',
                }}
              />
            )}

            {/* Icon with background on active */}
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
              style={{
                background: isActive
                  ? 'var(--thamara-accent-500)'
                  : 'transparent',
              }}
            >
              <Icon
                size={22}
                strokeWidth={2.2}
                style={{
                  color: isActive
                    ? 'var(--thamara-text-on-accent)'
                    : 'var(--thamara-text-muted)'
                }}
              />
            </div>

            {/* Label - More compact */}
            <span
              className="text-[10px] font-semibold leading-tight transition-all duration-200"
              style={{
                color: isActive
                  ? 'var(--thamara-accent-600)'
                  : 'var(--thamara-text-muted)',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
