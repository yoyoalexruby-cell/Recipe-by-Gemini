import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  TranslationKey, 
  LanguageOption,
  getCategoryLabel as helperCategoryLabel,
  getSubcategoryLabel as helperSubcategoryLabel,
  getDifficultyLabel as helperDifficultyLabel,
  getHeatLabel as helperHeatLabel,
  getWeatherLabel as helperWeatherLabel
} from './types';
import { zhTranslations } from './locales/zh';
import { enTranslations } from './locales/en';
import { jaTranslations } from './locales/ja';
import { frTranslations } from './locales/fr';
import { esTranslations } from './locales/es';

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  'zh-CN': zhTranslations,
  'en-US': enTranslations,
  'ja-JP': jaTranslations,
  'fr-FR': frTranslations,
  'es-ES': esTranslations,
};

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  currentOption: LanguageOption;
  languages: LanguageOption[];
  getCategoryLabel: (category: string) => string;
  getSubcategoryLabel: (subcategory: string) => string;
  getDifficultyLabel: (diff: number | string) => string;
  getHeatLabel: (heat: string) => string;
  getWeatherLabel: (weather: string) => string;
  formatMinutes: (minutes: number) => string;
  formatServings: (servings: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'culinary_journal_language';

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'zh-CN';
  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
  if (saved && TRANSLATIONS[saved]) return saved;

  // Auto detect user browser language
  const navLang = navigator.language.toLowerCase();
  if (navLang.startsWith('zh')) return 'zh-CN';
  if (navLang.startsWith('en')) return 'en-US';
  if (navLang.startsWith('ja')) return 'ja-JP';
  if (navLang.startsWith('fr')) return 'fr-FR';
  if (navLang.startsWith('es')) return 'es-ES';

  return 'zh-CN';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  const setLanguage = (newLang: SupportedLanguage) => {
    if (!TRANSLATIONS[newLang]) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
      window.dispatchEvent(new CustomEvent('app-language-changed', { detail: newLang }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = TRANSLATIONS[language];
    if (dict && dict[key]) return dict[key];

    // Fallback chain: English -> Chinese -> fallback -> key
    if (language !== 'en-US' && TRANSLATIONS['en-US']?.[key]) {
      return TRANSLATIONS['en-US'][key];
    }
    if (TRANSLATIONS['zh-CN']?.[key]) {
      return TRANSLATIONS['zh-CN'][key];
    }
    return fallback !== undefined ? fallback : key;
  };

  const getCategoryLabel = (category: string) => helperCategoryLabel(category, language);
  const getSubcategoryLabel = (subcategory: string) => helperSubcategoryLabel(subcategory, language);
  const getDifficultyLabel = (diff: number | string) => helperDifficultyLabel(diff, language);
  const getHeatLabel = (heat: string) => helperHeatLabel(heat, language);
  const getWeatherLabel = (weather: string) => helperWeatherLabel(weather, language);

  const formatMinutes = (minutes: number) => {
    return `${minutes} ${t('common.minutes', 'mins')}`;
  };

  const formatServings = (servings: number) => {
    return `${servings} ${t('common.servings', 'servings')}`;
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      currentOption,
      languages: SUPPORTED_LANGUAGES,
      getCategoryLabel,
      getSubcategoryLabel,
      getDifficultyLabel,
      getHeatLabel,
      getWeatherLabel,
      formatMinutes,
      formatServings,
    }),
    [language, currentOption]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      language: 'zh-CN',
      setLanguage: () => {},
      t: (key: TranslationKey, fallback?: string) => zhTranslations[key] || fallback || key,
      currentOption: SUPPORTED_LANGUAGES[0],
      languages: SUPPORTED_LANGUAGES,
      getCategoryLabel: (cat: string) => helperCategoryLabel(cat, 'zh-CN'),
      getSubcategoryLabel: (sub: string) => helperSubcategoryLabel(sub, 'zh-CN'),
      getDifficultyLabel: (diff: number | string) => helperDifficultyLabel(diff, 'zh-CN'),
      getHeatLabel: (heat: string) => helperHeatLabel(heat, 'zh-CN'),
      getWeatherLabel: (weather: string) => helperWeatherLabel(weather, 'zh-CN'),
      formatMinutes: (minutes: number) => `${minutes} 分钟`,
      formatServings: (servings: number) => `${servings} 人份`,
    };
  }
  return ctx;
};
