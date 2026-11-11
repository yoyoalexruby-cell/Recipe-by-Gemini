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

export type TranslationKey = string;

// Master Category Multilingual Maps
export const CATEGORY_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  '家常中餐': {
    'zh-CN': '家常中餐',
    'en-US': 'Home-style Chinese',
    'ja-JP': '中華・家庭料理',
    'fr-FR': 'Cuisine Chinoise',
    'es-ES': 'Comida Casera China',
  },
  '烘焙甜点': {
    'zh-CN': '烘焙甜点',
    'en-US': 'Baking & Desserts',
    'ja-JP': 'ベーカリー・お菓子',
    'fr-FR': 'Pâtisserie & Desserts',
    'es-ES': 'Repostería y Postres',
  },
  '西式轻餐': {
    'zh-CN': '西式轻餐',
    'en-US': 'Western Bistro & Pasta',
    'ja-JP': '洋食・パスタ',
    'fr-FR': 'Bistro & Cuisine Occidentale',
    'es-ES': 'Cocina Occidental',
  },
  '日韩和风': {
    'zh-CN': '日韩和风',
    'en-US': 'Japanese & Korean',
    'ja-JP': '和食・韓国料理',
    'fr-FR': 'Japonais & Coréen',
    'es-ES': 'Japonés y Coreano',
  },
  '暖胃汤羹': {
    'zh-CN': '暖胃汤羹',
    'en-US': 'Soups & Stews',
    'ja-JP': '温活スープ・煮込み',
    'fr-FR': 'Soupes & Ragoûts',
    'es-ES': 'Sopas y Guisos',
  },
  '健康轻食': {
    'zh-CN': '健康轻食',
    'en-US': 'Healthy & Light',
    'ja-JP': 'ヘルシー・軽食',
    'fr-FR': 'Plats Sains & Légers',
    'es-ES': 'Comida Saludable',
  },
};

export const SUBCATEGORY_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  '西式烘焙': { 'zh-CN': '西式烘焙', 'en-US': 'Western Pastry', 'ja-JP': '洋菓子', 'fr-FR': 'Pâtisserie', 'es-ES': 'Pastelería' },
  '中式糕点': { 'zh-CN': '中式糕点', 'en-US': 'Chinese Dim Sum', 'ja-JP': '中華点心', 'fr-FR': 'Pâtisserie Chinoise', 'es-ES': 'Repostería China' },
  '港式甜品': { 'zh-CN': '港式甜品', 'en-US': 'HK Desserts', 'ja-JP': '香港風スイーツ', 'fr-FR': 'Desserts de Hong Kong', 'es-ES': 'Postres de HK' },
  '台式甜品': { 'zh-CN': '台式甜品', 'en-US': 'Taiwanese Sweets', 'ja-JP': '台湾風スイーツ', 'fr-FR': 'Douceurs Taïwanaises', 'es-ES': 'Dulces Taiwaneses' },
  '日式和果子': { 'zh-CN': '日式和果子', 'en-US': 'Wagashi & Mochi', 'ja-JP': '和菓子・大福', 'fr-FR': 'Wagashi Japonais', 'es-ES': 'Wagashi Japonés' },
  '清凉冰品': { 'zh-CN': '清凉冰品', 'en-US': 'Ice & Gelato', 'ja-JP': 'アイス・氷菓', 'fr-FR': 'Glaces & Sorbets', 'es-ES': 'Helados' },

  '经典小炒': { 'zh-CN': '经典小炒', 'en-US': 'Wok Stir-Fry', 'ja-JP': '炒め物', 'fr-FR': 'Sautés au Wok', 'es-ES': 'Salteados al Wok' },
  '慢炖红烧': { 'zh-CN': '慢炖红烧', 'en-US': 'Braised & Stews', 'ja-JP': '煮込み・角煮', 'fr-FR': 'Mijotés', 'es-ES': 'Guisos' },
  '清蒸白灼': { 'zh-CN': '清蒸白灼', 'en-US': 'Steamed & Poached', 'ja-JP': '蒸し物', 'fr-FR': 'Vapeur', 'es-ES': 'Al Vapor' },
  '凉拌冷碟': { 'zh-CN': '凉拌冷碟', 'en-US': 'Cold Appetizers', 'ja-JP': '前菜・和え物', 'fr-FR': 'Entrées Froides', 'es-ES': 'Entrantes Fríos' },
  '香煎酥炸': { 'zh-CN': '香煎酥炸', 'en-US': 'Crispy Pan-Fried', 'ja-JP': '揚げ物・焼き物', 'fr-FR': 'Poêlés & Croustillants', 'es-ES': 'Fritos y Crujientes' },
  '面点主食': { 'zh-CN': '面点主食', 'en-US': 'Noodles & Dumplings', 'ja-JP': '麺・主食', 'fr-FR': 'Nouilles & Raviolis', 'es-ES': 'Fideos y Empanadas' },

  '意面披萨': { 'zh-CN': '意面披萨', 'en-US': 'Pasta & Pizza', 'ja-JP': 'パスタ・ピザ', 'fr-FR': 'Pâtes & Pizza', 'es-ES': 'Pasta y Pizza' },
  '轻食沙拉': { 'zh-CN': '轻食沙拉', 'en-US': 'Bistro Salads', 'ja-JP': 'サラダ', 'fr-FR': 'Salades Bistro', 'es-ES': 'Ensaladas Bistro' },
  '牛排肉排': { 'zh-CN': '牛排肉排', 'en-US': 'Steaks & Chops', 'ja-JP': 'ステーキ', 'fr-FR': 'Steaks & Viandes', 'es-ES': 'Filetes' },
  '早午餐Brunch': { 'zh-CN': '早午餐Brunch', 'en-US': 'Brunch & Toast', 'ja-JP': 'ブランチ', 'fr-FR': 'Brunch', 'es-ES': 'Brunch' },
  '焗烤烩饭': { 'zh-CN': '焗烤烩饭', 'en-US': 'Risotto & Gratin', 'ja-JP': 'リゾット・グラタン', 'fr-FR': 'Risotto & Gratin', 'es-ES': 'Risotto y Gratinados' },

  '日式烧物丼饭': { 'zh-CN': '日式烧物丼饭', 'en-US': 'Donburi & Teriyaki', 'ja-JP': '丼もの・照り焼き', 'fr-FR': 'Donburi & Teriyaki', 'es-ES': 'Donburi y Teriyaki' },
  '日式拉面面点': { 'zh-CN': '日式拉面面点', 'en-US': 'Ramen & Udon', 'ja-JP': 'ラーメン・うどん', 'fr-FR': 'Ramen & Udon', 'es-ES': 'Ramen y Udon' },
  '寿司刺身小食': { 'zh-CN': '寿司刺身小食', 'en-US': 'Sushi & Yakitori', 'ja-JP': '寿司・おつまみ', 'fr-FR': 'Sushi & Yakitori', 'es-ES': 'Sushi y Yakitori' },
  '韩式锅物料理': { 'zh-CN': '韩式锅物料理', 'en-US': 'Korean Hotpot', 'ja-JP': '韓国チゲ・鍋', 'fr-FR': 'Ragoûts Coréens', 'es-ES': 'Cazuelas Coreanas' },
  '韩式拌饭烤肉': { 'zh-CN': '韩式拌饭烤肉', 'en-US': 'Bibimbap & BBQ', 'ja-JP': 'ビビンバ・焼肉', 'fr-FR': 'Bibimbap & BBQ', 'es-ES': 'Bibimbap y Barbacoa' },

  '老火慢煲靓汤': { 'zh-CN': '老火慢煲靓汤', 'en-US': 'Cantonese Broth', 'ja-JP': '薬膳スープ', 'fr-FR': 'Bouillons Longue Cuisson', 'es-ES': 'Caldos Lentos' },
  '快手生滚汤': { 'zh-CN': '快手生滚汤', 'en-US': 'Quick Clear Soups', 'ja-JP': '手軽スープ', 'fr-FR': 'Soupes Express', 'es-ES': 'Sopas Rápidas' },
  '西式浓汤': { 'zh-CN': '西式浓汤', 'en-US': 'Cream & Velouté', 'ja-JP': 'ポタージュ・濃縮スープ', 'fr-FR': 'Veloutés & Crèmes', 'es-ES': 'Cremas y Purés' },
  '滋补养生盅': { 'zh-CN': '滋补养生盅', 'en-US': 'Herbal Stews', 'ja-JP': '養生スープ', 'fr-FR': 'Ragoûts Bien-être', 'es-ES': 'Guisos Saludables' },
  '咸鲜羹汤': { 'zh-CN': '咸鲜羹汤', 'en-US': 'Savory Chowders', 'ja-JP': 'とろみスープ', 'fr-FR': 'Chowders & Soupes', 'es-ES': 'Sopas Espesas' },

  '低卡减脂餐': { 'zh-CN': '低卡减脂餐', 'en-US': 'Low Calorie Meals', 'ja-JP': '低カロリー食', 'fr-FR': 'Plats Faibles en Calories', 'es-ES': 'Bajo en Calorías' },
  '高蛋白增肌碗': { 'zh-CN': '高蛋白增肌碗', 'en-US': 'Protein Poké Bowls', 'ja-JP': '高たんぱくボウル', 'fr-FR': 'Bowls Protéinés', 'es-ES': 'Bowls Proteicos' },
  '全谷粗粮主食': { 'zh-CN': '全谷粗粮主食', 'en-US': 'Whole Grains & Oats', 'ja-JP': '全粒穀物', 'fr-FR': 'Céréales Complètes', 'es-ES': 'Granos Enteros' },
  '轻体果昔饮品': { 'zh-CN': '轻体果昔饮品', 'en-US': 'Green Smoothies', 'ja-JP': 'スムージー', 'fr-FR': 'Smoothies Sains', 'es-ES': 'Batidos Saludables' },
  '清爽轻素食': { 'zh-CN': '清爽轻素食', 'en-US': 'Plant-based Vegan', 'ja-JP': 'ヴィーガン料理', 'fr-FR': 'Plats Végétaliens', 'es-ES': 'Platos Veganos' },
};

export const DIFFICULTY_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  '1': { 'zh-CN': '新手易做', 'en-US': 'Easy Beginner', 'ja-JP': '初級・簡単', 'fr-FR': 'Facile Débutant', 'es-ES': 'Fácil Principiante' },
  '2': { 'zh-CN': '入门家常', 'en-US': 'Simple', 'ja-JP': '初中級', 'fr-FR': 'Simple', 'es-ES': 'Sencillo' },
  '3': { 'zh-CN': '进阶火候', 'en-US': 'Intermediate', 'ja-JP': '中級', 'fr-FR': 'Intermédiaire', 'es-ES': 'Intermedio' },
  '4': { 'zh-CN': '主厨功夫', 'en-US': 'Advanced', 'ja-JP': '上級', 'fr-FR': 'Avancé', 'es-ES': 'Avanzado' },
  '5': { 'zh-CN': '匠心私宴', 'en-US': 'Master Feast', 'ja-JP': 'プロ級', 'fr-FR': 'Chef Étoilé', 'es-ES': 'Maestro Gourmet' },
};

export const HEAT_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  '大火': { 'zh-CN': '大火', 'en-US': 'High Heat', 'ja-JP': '強火', 'fr-FR': 'Feu vif', 'es-ES': 'Fuego alto' },
  '中火': { 'zh-CN': '中火', 'en-US': 'Medium Heat', 'ja-JP': '中火', 'fr-FR': 'Feu moyen', 'es-ES': 'Fuego medio' },
  '小火': { 'zh-CN': '小火', 'en-US': 'Low Heat', 'ja-JP': '弱火', 'fr-FR': 'Feu doux', 'es-ES': 'Fuego lento' },
  '微火': { 'zh-CN': '微火', 'en-US': 'Simmer', 'ja-JP': 'とろ火', 'fr-FR': 'Mijoter', 'es-ES': 'Fuego muy lento' },
  '文火': { 'zh-CN': '文火', 'en-US': 'Gentle Simmer', 'ja-JP': '極弱火', 'fr-FR': 'Feu très doux', 'es-ES': 'A fuego lento' },
};

export function getCategoryLabel(category: string, lang: SupportedLanguage): string {
  if (lang === 'zh-CN') return category;
  return CATEGORY_TRANSLATIONS[category]?.[lang] || CATEGORY_TRANSLATIONS[category]?.['en-US'] || category;
}

export function getSubcategoryLabel(subCategory: string, lang: SupportedLanguage): string {
  if (lang === 'zh-CN') return subCategory;
  return SUBCATEGORY_TRANSLATIONS[subCategory]?.[lang] || SUBCATEGORY_TRANSLATIONS[subCategory]?.['en-US'] || subCategory;
}

export function getDifficultyLabel(diff: number | string, lang: SupportedLanguage): string {
  const key = String(diff || '3');
  return DIFFICULTY_TRANSLATIONS[key]?.[lang] || DIFFICULTY_TRANSLATIONS[key]?.['en-US'] || `Level ${key}`;
}

export function getHeatLabel(heat: string, lang: SupportedLanguage): string {
  if (lang === 'zh-CN') return heat;
  return HEAT_TRANSLATIONS[heat]?.[lang] || HEAT_TRANSLATIONS[heat]?.['en-US'] || heat;
}

export function getWeatherLabel(weather: string, lang: SupportedLanguage): string {
  if (!weather || lang === 'zh-CN') return weather;
  const weatherMap: Record<string, string> = {
    '晴空万里': 'Sunny & Clear',
    '微风暖阳': 'Warm Breeze',
    '小雨沥沥': 'Gentle Rain',
    '阴天微凉': 'Cool & Cloudy',
    '雪花纷飞': 'Snowy Winter',
    '秋高气爽': 'Crisp Autumn',
    '初春明媚': 'Bright Spring',
    '夏夜蝉鸣': 'Summer Night',
  };
  return weatherMap[weather] || weather;
}
