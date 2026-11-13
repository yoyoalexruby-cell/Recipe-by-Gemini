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
import { STATIC_UI_MAP, STATIC_REVERSE_MAP } from './staticMap';

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  'zh-CN': zhTranslations,
  'en-US': enTranslations,
  'ja-JP': jaTranslations,
  'fr-FR': frTranslations,
  'es-ES': esTranslations,
};

// Pre-computed reverse value lookup maps for dynamic text & fallback resolution
const REVERSE_ZH_KEY_MAP = new Map<string, string>();
for (const [key, val] of Object.entries(zhTranslations)) {
  if (val && typeof val === 'string') {
    REVERSE_ZH_KEY_MAP.set(val.trim(), key);
  }
}

const REVERSE_EN_KEY_MAP = new Map<string, string>();
for (const [key, val] of Object.entries(enTranslations)) {
  if (val && typeof val === 'string') {
    REVERSE_EN_KEY_MAP.set(val.trim().toLowerCase(), key);
  }
}

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  translateText: (text: string) => string;
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
    if (!key) return '';
    const trimmedKey = typeof key === 'string' ? key.trim() : String(key);

    // 1. Direct dictionary match for active language
    const dict = TRANSLATIONS[language];
    if (dict && dict[trimmedKey]) {
      return dict[trimmedKey];
    }

    // 2. Comprehensive Static UI Label Map match (for UI buttons, navigation, modals, and actions)
    const staticDirect = STATIC_UI_MAP[trimmedKey];
    if (staticDirect) {
      const trans = staticDirect[language] || staticDirect['en-US'];
      if (trans) return trans;
    }
    const staticReverse = STATIC_REVERSE_MAP.get(trimmedKey.toLowerCase());
    if (staticReverse) {
      const trans = staticReverse[language] || staticReverse['en-US'];
      if (trans) return trans;
    }

    // 3. Check if key is a Category or Subcategory
    const catLabel = helperCategoryLabel(trimmedKey, language);
    if (catLabel !== trimmedKey) {
      return catLabel;
    }
    const subcatLabel = helperSubcategoryLabel(trimmedKey, language);
    if (subcatLabel !== trimmedKey) {
      return subcatLabel;
    }

    // 4. Check if key is a Difficulty, Heat, or Weather expression
    const heatLabel = helperHeatLabel(trimmedKey, language);
    if (heatLabel !== trimmedKey) {
      return heatLabel;
    }
    const weatherLabel = helperWeatherLabel(trimmedKey, language);
    if (weatherLabel !== trimmedKey) {
      return weatherLabel;
    }

    // 4. Reverse value lookup: key is a Chinese phrase matching a known zhTranslations value
    const foundZhKey = REVERSE_ZH_KEY_MAP.get(trimmedKey);
    if (foundZhKey) {
      if (dict && dict[foundZhKey]) {
        return dict[foundZhKey];
      }
      if (language !== 'en-US' && TRANSLATIONS['en-US']?.[foundZhKey]) {
        return TRANSLATIONS['en-US'][foundZhKey];
      }
    }

    // 5. Reverse value lookup: key is an English phrase matching a known enTranslations value
    const foundEnKey = REVERSE_EN_KEY_MAP.get(trimmedKey.toLowerCase());
    if (foundEnKey) {
      if (dict && dict[foundEnKey]) {
        return dict[foundEnKey];
      }
      if (language === 'zh-CN' && TRANSLATIONS['zh-CN']?.[foundEnKey]) {
        return TRANSLATIONS['zh-CN'][foundEnKey];
      }
    }

    // 6. Direct translation key fallback: English dictionary for any non-Chinese/non-English locale
    if (language !== 'en-US' && language !== 'zh-CN' && TRANSLATIONS['en-US']?.[trimmedKey]) {
      return TRANSLATIONS['en-US'][trimmedKey];
    }

    // 7. If language is zh-CN and key is in zhTranslations
    if (language === 'zh-CN' && TRANSLATIONS['zh-CN']?.[trimmedKey]) {
      return TRANSLATIONS['zh-CN'][trimmedKey];
    }

    // 8. Fallback argument handling
    if (fallback !== undefined) {
      const trimmedFallback = fallback.trim();
      // If language is English (or non-Chinese), check if the fallback itself was written in Chinese
      if (language !== 'zh-CN') {
        const fbStatic = STATIC_UI_MAP[trimmedFallback] || STATIC_REVERSE_MAP.get(trimmedFallback.toLowerCase());
        if (fbStatic) {
          const trans = fbStatic[language] || fbStatic['en-US'];
          if (trans) return trans;
        }

        const fbZhKey = REVERSE_ZH_KEY_MAP.get(trimmedFallback);
        if (fbZhKey && dict && dict[fbZhKey]) {
          return dict[fbZhKey];
        }
        if (fbZhKey && TRANSLATIONS['en-US']?.[fbZhKey]) {
          return TRANSLATIONS['en-US'][fbZhKey];
        }
        const fbCat = helperCategoryLabel(trimmedFallback, language);
        if (fbCat !== trimmedFallback) return fbCat;
        const fbSub = helperSubcategoryLabel(trimmedFallback, language);
        if (fbSub !== trimmedFallback) return fbSub;
        const fbHeat = helperHeatLabel(trimmedFallback, language);
        if (fbHeat !== trimmedFallback) return fbHeat;
        const fbWeather = helperWeatherLabel(trimmedFallback, language);
        if (fbWeather !== trimmedFallback) return fbWeather;
      }
      return fallback;
    }

    // 9. If all else fails in English mode, check if en-US has the key
    if (language === 'en-US' && TRANSLATIONS['en-US']?.[trimmedKey]) {
      return TRANSLATIONS['en-US'][trimmedKey];
    }

    return key;
  };

  const translateText = (text: string) => t(text);

  const getCategoryLabel = (category: string) => {
    if (!category) return '';
    const fromHelper = helperCategoryLabel(category, language);
    if (fromHelper && fromHelper !== category) return fromHelper;
    const staticMatch = STATIC_UI_MAP[category] || STATIC_REVERSE_MAP.get(category.toLowerCase());
    if (staticMatch) {
      return staticMatch[language] || staticMatch['en-US'] || category;
    }
    return fromHelper || category;
  };

  const getSubcategoryLabel = (subcategory: string) => {
    if (!subcategory) return '';
    const fromHelper = helperSubcategoryLabel(subcategory, language);
    if (fromHelper && fromHelper !== subcategory) return fromHelper;
    const staticMatch = STATIC_UI_MAP[subcategory] || STATIC_REVERSE_MAP.get(subcategory.toLowerCase());
    if (staticMatch) {
      return staticMatch[language] || staticMatch['en-US'] || subcategory;
    }
    return fromHelper || subcategory;
  };
  const getDifficultyLabel = (diff: number | string) => helperDifficultyLabel(diff, language);
  const getHeatLabel = (heat: string) => helperHeatLabel(heat, language);
  const getWeatherLabel = (weather: string) => helperWeatherLabel(weather, language);

  const formatMinutes = (minutes: number) => {
    return `${minutes} ${t('common.minutes', language === 'zh-CN' ? '分钟' : 'mins')}`;
  };

  const formatServings = (servings: number) => {
    return `${servings} ${t('common.servings', language === 'zh-CN' ? '人份' : 'servings')}`;
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      translateText,
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
      translateText: (text: string) => text,
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
