export type SupportedLanguage = 'zh-CN' | 'en-US' | 'ja-JP' | 'fr-FR' | 'es-ES';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string; // for Web Speech API TTS & Recognition
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', speechCode: 'en-US' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
];

export type TranslationKey =
  // Navigation & Branding
  | 'nav.brand'
  | 'nav.journal'
  | 'nav.calendar'
  | 'nav.square'
  | 'nav.workbench'
  | 'nav.reflections'
  | 'nav.backup'
  | 'nav.newRecipe'
  | 'nav.login'
  | 'nav.profile'
  | 'nav.installApp'
  | 'nav.githubBackup'
  
  // Actions
  | 'action.edit'
  | 'action.delete'
  | 'action.share'
  | 'action.print'
  | 'action.cookNow'
  | 'action.oneClickBuy'
  | 'action.save'
  | 'action.cancel'
  | 'action.reset'
  | 'action.copy'
  | 'action.copied'
  | 'action.search'
  | 'action.filter'
  | 'action.viewDetail'
  | 'action.close'

  // Categories & Filters
  | 'category.all'
  | 'category.favorites'
  | 'category.chinese'
  | 'category.baking'
  | 'category.soup'
  | 'category.light'
  | 'category.drinks'
  | 'category.western'
  | 'category.manage'

  // Recipe Details & Parameters
  | 'recipe.prepTime'
  | 'recipe.cookTime'
  | 'recipe.servings'
  | 'recipe.calories'
  | 'recipe.difficulty'
  | 'recipe.utensils'
  | 'recipe.ingredients'
  | 'recipe.mainIngredients'
  | 'recipe.seasonings'
  | 'recipe.garnish'
  | 'recipe.steps'
  | 'recipe.tip'
  | 'recipe.reflections'
  | 'recipe.gallery'
  | 'recipe.healthyRating'
  | 'recipe.perServing'
  | 'recipe.totalCalories'

  // Cooking Execution & Voice
  | 'voice.title'
  | 'voice.subtitle'
  | 'voice.handsFree'
  | 'voice.listening'
  | 'voice.speakStep'
  | 'voice.nextStep'
  | 'voice.prevStep'
  | 'voice.repeatStep'
  | 'voice.pause'
  | 'voice.resume'
  | 'voice.stop'
  | 'voice.startTimer'
  | 'voice.finishAll'
  | 'voice.speed'
  | 'voice.autoAdvance'

  // Printable Scrapbook & PDF
  | 'print.title'
  | 'print.subtitle'
  | 'print.vintageBorder'
  | 'print.kraftBorder'
  | 'print.botanicalBorder'
  | 'print.minimalBorder'
  | 'print.standardDensity'
  | 'print.compactDensity'
  | 'print.downloadPng'
  | 'print.savePdf'
  | 'print.tips';
