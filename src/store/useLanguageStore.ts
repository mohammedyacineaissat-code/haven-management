import { create } from 'zustand';
import { Language, Direction, Translations } from '../i18n/types';

// Fallback empty translation before the correct one loads
const emptyTranslations = {} as Translations;

interface LanguageState {
  currentLanguage: Language;
  dir: Direction;
  isRtl: boolean;
  t: Translations;
  isLoaded: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  initLanguage: () => Promise<void>;
}

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('haven_language') as Language;
      if (saved && (saved === 'en' || saved === 'fr' || saved === 'ar')) {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
  }
  return 'fr'; // Default French
};

const initialLang = getInitialLanguage();
const initialDir: Direction = initialLang === 'ar' ? 'rtl' : 'ltr';

if (typeof document !== 'undefined') {
  document.documentElement.dir = initialDir;
  document.documentElement.lang = initialLang;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: initialLang,
  dir: initialDir,
  isRtl: initialDir === 'rtl',
  t: emptyTranslations,
  isLoaded: false,

  initLanguage: async () => {
    if (get().isLoaded) return;
    await get().setLanguage(initialLang);
  },

  setLanguage: async (lang: Language) => {
    const isRtl = lang === 'ar';
    const dir: Direction = isRtl ? 'rtl' : 'ltr';

    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
    }

    try {
      localStorage.setItem('haven_language', lang);
    } catch {
      // Ignore storage errors in sandbox
    }
    
    // Dynamically import the translation file
    let newTranslations: Translations;
    if (lang === 'en') {
      newTranslations = (await import('../i18n/en')).default;
    } else if (lang === 'ar') {
      newTranslations = (await import('../i18n/ar')).default;
    } else {
      newTranslations = (await import('../i18n/fr')).default;
    }

    set({
      currentLanguage: lang,
      dir,
      isRtl,
      t: newTranslations,
      isLoaded: true
    });
  },
}));
