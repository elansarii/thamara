import Image from 'next/image';
import Link from 'next/link';
import { WifiOff, Battery, Globe, Volume2 } from 'lucide-react';

export default function TopBar() {
  return (
    <header
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 border-b backdrop-blur-sm safe-top"
      style={{
        height: 'calc(56px + var(--safe-area-inset-top))',
        paddingTop: 'var(--safe-area-inset-top)',
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
        boxShadow: 'var(--thamara-shadow-sm)',
        zIndex: 100
      }}
    >
      {/* Logo - Compact */}
      <Link href="/" className="flex items-center gap-2 cursor-pointer touch-target">
        <Image
          src="/thamara_logo.svg"
          alt="Thamara"
          width={90}
          height={36}
          className="object-contain"
          priority
        />
      </Link>

      {/* Right actions - Streamlined */}
      <div className="flex items-center gap-1.5">
        {/* Text-to-Speech Button - Primary action */}
        <button
          className="flex items-center justify-center w-10 h-10 transition-all duration-200 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            borderRadius: 'var(--thamara-radius-md)',
            boxShadow: '0 2px 6px -1px rgba(124, 179, 66, 0.3)'
          }}
          aria-label="Read page aloud"
          title="Read page aloud"
        >
          <Volume2
            size={20}
            strokeWidth={2.5}
            style={{ color: 'var(--thamara-text-on-accent)' }}
          />
        </button>

        {/* Offline indicator - Icon only for maximum space efficiency */}
        <div
          className="flex items-center justify-center w-10 h-10"
          style={{
            background: 'var(--thamara-primary-50)',
            color: 'var(--thamara-primary-700)',
            borderRadius: 'var(--thamara-radius-md)',
          }}
          title="Offline mode"
        >
          <WifiOff size={18} strokeWidth={2.5} />
        </div>

        {/* Language toggle - Compact */}
        <button
          className="flex items-center justify-center w-10 h-10 text-xs font-bold transition-all active:scale-95"
          style={{
            background: 'var(--thamara-bg-secondary)',
            color: 'var(--thamara-text-secondary)',
            borderRadius: 'var(--thamara-radius-md)'
          }}
          aria-label="Change Language"
        >
          EN
        </button>
      </div>
    </header>
  );
}
