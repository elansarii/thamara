'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, WifiOff, Wifi, Volume2, Settings, Bell, Globe, HelpCircle, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, toggleLanguage, t, isRTL } = useLanguage();

  return (
    <>
      <header
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 border-b backdrop-blur-sm"
        style={{
          height: 'calc(56px + var(--safe-area-inset-top))',
          paddingTop: 'var(--safe-area-inset-top)',
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)',
          boxShadow: 'var(--thamara-shadow-sm)',
          zIndex: 100
        }}
      >
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex items-center justify-center w-10 h-10 transition-all duration-200 active:scale-95"
          style={{
            background: 'var(--thamara-bg-secondary)',
            borderRadius: 'var(--thamara-radius-md)',
          }}
          aria-label={menuOpen ? t.app.close : t.menu.title}
        >
          <Menu size={22} strokeWidth={2} style={{ color: 'var(--thamara-text-primary)' }} />
        </button>

        {/* Center - Logo */}
        <Link href="/" className="flex items-center justify-center cursor-pointer touch-target absolute left-1/2 transform -translate-x-1/2">
          <Image
            src="/thamara_logo.svg"
            alt={t.app.name}
            width={100}
            height={40}
            className="object-contain"
            priority
          />
        </Link>

        {/* Right - Connectivity Status */}
        <div
          className="flex items-center justify-center w-10 h-10"
          style={{
            background: 'var(--thamara-primary-50)',
            color: 'var(--thamara-primary-700)',
            borderRadius: 'var(--thamara-radius-md)',
          }}
          title={t.app.offline}
        >
          <WifiOff size={18} strokeWidth={2.5} />
        </div>
      </header>

      {/* Menu Overlay */}
      {menuOpen && (
        <div
          className="absolute inset-0 bg-black/50 z-[150]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`absolute top-0 h-full w-72 transform transition-transform duration-300 ease-out z-[200] ${isRTL ? 'right-0' : 'left-0'}`}
        style={{
          transform: menuOpen 
            ? 'translateX(0)' 
            : isRTL 
              ? 'translateX(100%)' 
              : 'translateX(-100%)',
          background: 'var(--thamara-surface)',
          boxShadow: menuOpen ? (isRTL ? '-4px 0 20px rgba(0,0,0,0.15)' : '4px 0 20px rgba(0,0,0,0.15)') : 'none',
        }}
      >
        {/* Menu Header */}
        <div
          className="flex items-center justify-between px-4 border-b"
          style={{
            height: 'calc(56px + var(--safe-area-inset-top))',
            paddingTop: 'var(--safe-area-inset-top)',
            borderColor: 'var(--thamara-border)',
          }}
        >
          <span className="font-semibold text-lg" style={{ color: 'var(--thamara-text-primary)' }}>
            {t.menu.title}
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center w-10 h-10 transition-all duration-200 active:scale-95"
            style={{
              background: 'var(--thamara-bg-secondary)',
              borderRadius: 'var(--thamara-radius-md)',
            }}
            aria-label={t.app.close}
          >
            <X size={22} strokeWidth={2} style={{ color: 'var(--thamara-text-primary)' }} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-3 space-y-1">
          {/* Text-to-Speech */}
          <button
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]"
            style={{ background: 'var(--thamara-accent-50)' }}
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              }}
            >
              <Volume2 size={20} style={{ color: 'var(--thamara-text-on-accent)' }} />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="font-medium" style={{ color: 'var(--thamara-text-primary)' }}>{t.menu.readAloud}</p>
              <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>{t.menu.readAloudDesc}</p>
            </div>
          </button>

          {/* Language */}
          <button
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] hover:bg-gray-50"
            onClick={() => {
              toggleLanguage();
            }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ background: 'var(--thamara-bg-secondary)' }}
            >
              <Globe size={20} style={{ color: 'var(--thamara-text-secondary)' }} />
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="font-medium" style={{ color: 'var(--thamara-text-primary)' }}>{t.menu.language}</p>
              <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>{t.menu.languageName}</p>
            </div>
            <span
              className="text-xs font-bold px-2 py-1 rounded"
              style={{ background: 'var(--thamara-accent-100)', color: 'var(--thamara-accent-700)' }}
            >
              {language === 'en' ? 'EN' : 'عربي'}
            </span>
          </button>

          {/* Notifications */}
          <button
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ background: 'var(--thamara-bg-secondary)' }}
            >
              <Bell size={20} style={{ color: 'var(--thamara-text-secondary)' }} />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="font-medium" style={{ color: 'var(--thamara-text-primary)' }}>{t.menu.notifications}</p>
              <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>{t.menu.notificationsDesc}</p>
            </div>
          </button>

          <div className="border-t my-2" style={{ borderColor: 'var(--thamara-border)' }} />

          {/* Settings */}
          <button
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ background: 'var(--thamara-bg-secondary)' }}
            >
              <Settings size={20} style={{ color: 'var(--thamara-text-secondary)' }} />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="font-medium" style={{ color: 'var(--thamara-text-primary)' }}>{t.menu.settings}</p>
              <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>{t.menu.settingsDesc}</p>
            </div>
          </button>

          {/* Help */}
          <button
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ background: 'var(--thamara-bg-secondary)' }}
            >
              <HelpCircle size={20} style={{ color: 'var(--thamara-text-secondary)' }} />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="font-medium" style={{ color: 'var(--thamara-text-primary)' }}>{t.menu.help}</p>
              <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>{t.menu.helpDesc}</p>
            </div>
          </button>

          {/* About */}
          <button
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ background: 'var(--thamara-bg-secondary)' }}
            >
              <Info size={20} style={{ color: 'var(--thamara-text-secondary)' }} />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="font-medium" style={{ color: 'var(--thamara-text-primary)' }}>{t.menu.about}</p>
              <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>{t.menu.aboutDesc}</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 border-t"
          style={{
            borderColor: 'var(--thamara-border)',
            paddingBottom: 'calc(16px + var(--safe-area-inset-bottom))'
          }}
        >
          <div className="flex items-center gap-2 justify-center">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--thamara-primary-50)' }}
            >
              <WifiOff size={16} style={{ color: 'var(--thamara-primary-700)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--thamara-primary-700)' }}>
                {t.app.offline}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
