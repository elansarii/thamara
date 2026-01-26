import Image from 'next/image';
import Link from 'next/link';
import { Wifi, WifiOff, Battery, Globe, Volume2 } from 'lucide-react';

export default function TopBar() {
  return (
    <header 
      className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-5 border-b backdrop-blur-sm"
      style={{ 
        background: 'var(--thamara-surface)', 
        borderColor: 'var(--thamara-border)',
        boxShadow: 'var(--thamara-shadow-sm)',
        zIndex: 100
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <Image 
          src="/thamara_logo.svg" 
          alt="Thamara" 
          width={110} 
          height={110}
          className="object-contain"
        />
      </Link>

      {/* Status badges - Modern pill design */}
      <div className="flex items-center gap-2.5">
        {/* Text-to-Speech Button - Prominent for accessibility */}
        <button 
          className="flex items-center justify-center w-11 h-11 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ 
            background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            borderRadius: 'var(--thamara-radius-md)',
            boxShadow: '0 4px 8px -2px rgba(124, 179, 66, 0.3)'
          }}
          aria-label="Read page aloud"
          title="Read page aloud"
        >
          <Volume2 
            size={22} 
            strokeWidth={2.5}
            style={{ color: 'var(--thamara-text-on-accent)' }}
          />
        </button>

        {/* Divider */}
        <div 
          className="h-8 w-px"
          style={{ background: 'var(--thamara-border)' }}
        />

        {/* Offline indicator with icon */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all"
          style={{ 
            background: 'var(--thamara-primary-50)', 
            color: 'var(--thamara-primary-700)',
            borderRadius: 'var(--thamara-radius-full)',
            border: '1px solid var(--thamara-primary-200)'
          }}
        >
          <WifiOff size={12} strokeWidth={2.5} />
          <span className="hidden sm:inline">Offline</span>
        </div>

        {/* Battery saver indicator with icon */}
        <div 
          className="flex items-center justify-center w-8 h-8 transition-all hover:bg-opacity-80"
          style={{ 
            background: 'var(--thamara-bg-secondary)', 
            color: 'var(--thamara-primary-600)',
            borderRadius: 'var(--thamara-radius-md)'
          }}
          title="Battery Saver Mode"
        >
          <Battery size={16} strokeWidth={2.5} />
        </div>

        {/* Language toggle - Modern button */}
        <button 
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-all hover:bg-opacity-80"
          style={{ 
            background: 'var(--thamara-bg-secondary)', 
            color: 'var(--thamara-text-secondary)',
            borderRadius: 'var(--thamara-radius-md)'
          }}
          aria-label="Change Language"
        >
          <Globe size={13} strokeWidth={2.5} />
          <span>EN</span>
        </button>
      </div>
    </header>
  );
}
