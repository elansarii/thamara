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
      className="sticky bottom-0 h-20 flex items-center justify-around border-t backdrop-blur-sm z-50"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
        boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const isActive = pathname === item.route;

        return (
          <Link
            key={item.id}
            href={item.route}
            className="flex flex-col items-center gap-1.5 py-2.5 px-4 flex-1 transition-all duration-200 relative group"
            style={{
              transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            {/* Active indicator pill */}
            {isActive && (
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 rounded-full transition-all"
                style={{ 
                  width: '32px',
                  background: 'var(--thamara-accent-500)',
                }}
              />
            )}
            
            {/* Icon with background on active */}
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200"
              style={{
                background: isActive 
                  ? 'var(--thamara-accent-500)' 
                  : 'transparent',
              }}
            >
              <Icon 
                size={24} 
                strokeWidth={2.2}
                style={{ 
                  color: isActive 
                    ? 'var(--thamara-text-on-accent)' 
                    : 'var(--thamara-text-muted)'
                }}
              />
            </div>
            
            {/* Label */}
            <span 
              className="text-xs font-semibold transition-all duration-200"
              style={{ 
                color: isActive 
                  ? 'var(--thamara-accent-600)' 
                  : 'var(--thamara-text-muted)',
                letterSpacing: '0.3px'
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
