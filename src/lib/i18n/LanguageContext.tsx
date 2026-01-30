'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations, TranslationKeys } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationKeys;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'thamara_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  // Update document direction and lang attribute when language changes
  useEffect(() => {
    if (mounted) {
      const isRTL = language === 'ar';
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      
      // Add/remove RTL class for additional styling hooks
      if (isRTL) {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }
  }, [language, mounted]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  }, [language, setLanguage]);

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const t = translations[language];

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{
          language: 'en',
          setLanguage,
          toggleLanguage,
          t: translations.en,
          isRTL: false,
          dir: 'ltr',
        }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL,
        dir,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper hook for quick translation access
export function useTranslation() {
  const { t, language, isRTL } = useLanguage();
  return { t, language, isRTL };
}
