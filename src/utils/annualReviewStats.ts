import { Recipe } from '../types/recipe';
import { CookingRecord } from '../types/cookingLog';
import { SupportedLanguage } from '../i18n/types';

export interface CategoryStatItem {
  category: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface MonthlyHeatItem {
  month: number; // 1-12
  monthLabel: string;
  recipeCount: number;
  cookCount: number;
  totalTimeMinutes: number;
}

export interface IngredientStatItem {
  name: string;
  count: number;
  percentage: number; // percentage of total dishes containing this ingredient
  roleBadge: string;
}

export interface AnnualCookingStats {
  year: string;
  totalRecipes: number;
  totalCookingSessions: number;
  totalCookMinutes: number;
  totalCookHours: number;
  uniqueCookingDays: number;
  averageRating: number;
  topCategory: {
    category: string;
    label: string;
    count: number;
    icon: string;
  } | null;
  categoryDistribution: CategoryStatItem[];
  monthlyHeat: MonthlyHeatItem[];
  peakMonth: {
    month: number;
    monthLabel: string;
    totalActivity: number;
  } | null;
  topIngredients: IngredientStatItem[];
  topDishes: {
    id: string;
    title: string;
    category: string;
    rating: number;
    coverImage?: string;
  }[];
  culinaryPersona: {
    title: string;
    titleEn: string;
    desc: string;
    descEn: string;
    icon: string;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  '家常中餐': '#C85A32', // Terracotta
  '烘焙甜点': '#D4A373', // Caramel
  '西式轻餐': '#7A9A65', // Matcha / Olive
  '日韩和风': '#9E6B7A', // Plum / Berry
  '暖胃汤羹': '#6D8A96', // Misty Blue
  '健康轻食': '#8FA87B', // Sage Green
};

const CATEGORY_ICONS: Record<string, string> = {
  '家常中餐': '🥢',
  '烘焙甜点': '🧁',
  '西式轻餐': '🍝',
  '日韩和风': '🍱',
  '暖胃汤羹': '🥣',
  '健康轻食': '🥗',
};

const FALLBACK_COLORS = ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F', '#B4846C', '#457B9D'];

/**
 * Extract available years from recipes and cooking logs
 */
export function getAvailableCookingYears(recipes: Recipe[], cookingRecords: CookingRecord[] = []): string[] {
  const yearsSet = new Set<string>();
  const currentYear = new Date().getFullYear().toString();
  yearsSet.add(currentYear);

  recipes.forEach((r) => {
    const d = r.review?.cookDate || r.createdAt;
    if (d && typeof d === 'string') {
      const y = d.slice(0, 4);
      if (/^\d{4}$/.test(y)) yearsSet.add(y);
    }
  });

  cookingRecords.forEach((c) => {
    if (c.cookDate) {
      const y = c.cookDate.slice(0, 4);
      if (/^\d{4}$/.test(y)) yearsSet.add(y);
    }
  });

  return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
}

/**
 * Normalize ingredient names to avoid fragmentation
 */
function cleanIngredientName(raw: string): string {
  if (!raw) return '';
  let name = raw.trim();
  // Strip parenthetical specifications e.g. "鸡蛋 (常温)", "生抽 (轻盐)"
  name = name.replace(/[（(].*?[）)]/g, '').trim();
  // Strip quantity prefixes or units if mistakenly placed in name
  name = name.replace(/\d+.*$/, '').trim();

  // Common synonym groups
  if (/^(大蒜|蒜瓣|蒜末|蒜头|蒜泥)$/.test(name)) return '大蒜';
  if (/^(小葱|香葱|大葱|青葱|葱花|葱段)$/.test(name)) return '葱';
  if (/^(生姜|老姜|姜末|姜片|仔姜)$/.test(name)) return '生姜';
  if (/^(鸡蛋|土鸡蛋|蛋清|蛋黄|全蛋液)$/.test(name)) return '鸡蛋';
  if (/^(黄油|无盐黄油|发酵黄油)$/.test(name)) return '黄油';
  if (/^(淡奶油|鲜奶油|稀奶油)$/.test(name)) return '淡奶油';
  if (/^(生抽|老抽|酱油|味极鲜|蒸鱼豉油)$/.test(name)) return '酱油/生抽';
  if (/^(白砂糖|细砂糖|绵白糖|冰糖)$/.test(name)) return '糖';
  if (/^(食用油|花生油|玉米油|植物油|菜籽油)$/.test(name)) return '食用油';
  if (/^(食盐|细盐|海盐)$/.test(name)) return '盐';

  return name || raw.trim();
}

/**
 * Generate full annual statistics
 */
export function calculateAnnualCookingStats(
  recipes: Recipe[],
  cookingRecords: CookingRecord[],
  targetYear: string,
  language: SupportedLanguage = 'zh-CN',
  getCategoryLabelHelper?: (c: string) => string
): AnnualCookingStats {
  const isAllYears = targetYear === 'all';

  // 1. Filter recipes & cooking records
  const filteredRecipes = recipes.filter((r) => {
    if (isAllYears) return true;
    const date = r.review?.cookDate || r.createdAt;
    return date && date.startsWith(targetYear);
  });

  const filteredRecords = cookingRecords.filter((c) => {
    if (isAllYears) return true;
    return c.cookDate && c.cookDate.startsWith(targetYear);
  });

  // Calculate unique cooking days
  const cookingDaysSet = new Set<string>();
  filteredRecords.forEach((c) => {
    if (c.cookDate) cookingDaysSet.add(c.cookDate);
  });
  filteredRecipes.forEach((r) => {
    if (r.review?.cookDate) cookingDaysSet.add(r.review.cookDate);
  });

  // Calculate total cooking time
  let totalMinutes = 0;
  filteredRecords.forEach((c) => {
    const m = (c.prepTimeMinutes || 0) + (c.cookTimeMinutes || 0);
    totalMinutes += m > 0 ? m : 25; // default fallback 25 min
  });
  if (filteredRecords.length === 0) {
    filteredRecipes.forEach((r) => {
      totalMinutes += (r.prepTimeMinutes || 10) + (r.cookTimeMinutes || 15);
    });
  }

  // Calculate Average Rating
  const ratings: number[] = [];
  filteredRecords.forEach((c) => {
    if (c.rating && c.rating > 0) ratings.push(c.rating);
  });
  filteredRecipes.forEach((r) => {
    if (r.review?.ratings?.taste && r.review.ratings.taste > 0) {
      ratings.push(r.review.ratings.taste);
    }
  });
  const averageRating = ratings.length > 0 
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 
    : 4.8;

  // 2. Category Distribution
  const catCountMap = new Map<string, number>();
  // Give priority to actual cooking logs, supplemented by recipe entries
  const allCategorySources = filteredRecords.length > 0 
    ? filteredRecords.map((r) => r.category)
    : filteredRecipes.map((r) => r.category);

  allCategorySources.forEach((cat) => {
    if (cat) {
      catCountMap.set(cat, (catCountMap.get(cat) || 0) + 1);
    }
  });

  const totalCatCount = Math.max(1, allCategorySources.length);
  const categoryDistribution: CategoryStatItem[] = Array.from(catCountMap.entries())
    .map(([cat, count], idx) => {
      const percentage = Math.round((count / totalCatCount) * 100);
      const color = CATEGORY_COLORS[cat] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
      const icon = CATEGORY_ICONS[cat] || '🍽️';
      const label = getCategoryLabelHelper ? getCategoryLabelHelper(cat) : cat;
      return {
        category: cat,
        label,
        count,
        percentage,
        color,
        icon
      };
    })
    .sort((a, b) => b.count - a.count);

  const topCategory = categoryDistribution.length > 0 ? {
    category: categoryDistribution[0].category,
    label: categoryDistribution[0].label,
    count: categoryDistribution[0].count,
    icon: categoryDistribution[0].icon
  } : null;

  // 3. 12 Months Heat Chart
  const monthLabelsZh = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const monthLabelsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabels = language === 'zh-CN' ? monthLabelsZh : monthLabelsEn;

  const monthlyHeat: MonthlyHeatItem[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthLabel: monthLabels[i],
    recipeCount: 0,
    cookCount: 0,
    totalTimeMinutes: 0
  }));

  filteredRecipes.forEach((r) => {
    const d = r.review?.cookDate || r.createdAt;
    if (d) {
      const parts = d.split('-');
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10);
        if (m >= 1 && m <= 12) {
          monthlyHeat[m - 1].recipeCount += 1;
        }
      }
    }
  });

  filteredRecords.forEach((c) => {
    if (c.cookDate) {
      const parts = c.cookDate.split('-');
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10);
        if (m >= 1 && m <= 12) {
          monthlyHeat[m - 1].cookCount += 1;
          monthlyHeat[m - 1].totalTimeMinutes += (c.prepTimeMinutes || 10) + (c.cookTimeMinutes || 15);
        }
      }
    }
  });

  // Determine Peak Month
  let peakMonth: { month: number; monthLabel: string; totalActivity: number } | null = null;
  let maxActivity = -1;
  monthlyHeat.forEach((item) => {
    const act = item.cookCount + item.recipeCount;
    if (act > maxActivity) {
      maxActivity = act;
      peakMonth = {
        month: item.month,
        monthLabel: item.monthLabel,
        totalActivity: act
      };
    }
  });

  // 4. Ingredient Ranking
  const ingCountMap = new Map<string, number>();
  const totalRecipePool = filteredRecipes.length > 0 ? filteredRecipes : recipes;
  totalRecipePool.forEach((r) => {
    const seenInRecipe = new Set<string>();
    r.ingredients.forEach((ing) => {
      const clean = cleanIngredientName(ing.name);
      if (clean && clean.length <= 8 && !seenInRecipe.has(clean)) {
        seenInRecipe.add(clean);
        ingCountMap.set(clean, (ingCountMap.get(clean) || 0) + 1);
      }
    });
  });

  const totalDishesForIng = Math.max(1, totalRecipePool.length);
  const roleBadgesZh = ['👑 厨房灵魂基石', '🔥 提味当家主打', '✨ 治愈风味搭档', '🍳 翻牌黄金常客', '🌿 清爽点睛之笔', '🥣 调味常胜将军'];
  const roleBadgesEn = ['👑 Kitchen Cornerstone', '🔥 Signature Flavor', '✨ Comforting Partner', '🍳 Frequent Favorite', '🌿 Finishing Touch', '🥣 Versatile Champion'];
  const roleBadges = language === 'zh-CN' ? roleBadgesZh : roleBadgesEn;

  const topIngredients: IngredientStatItem[] = Array.from(ingCountMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalDishesForIng) * 100),
      roleBadge: ''
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item, idx) => ({
      ...item,
      roleBadge: roleBadges[idx] || roleBadges[roleBadges.length - 1]
    }));

  // 5. Top Dishes
  const topDishes = [...filteredRecipes]
    .sort((a, b) => (b.review?.ratings?.taste || 4) - (a.review?.ratings?.taste || 4))
    .slice(0, 3)
    .map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      rating: r.review?.ratings?.taste || 5,
      coverImage: r.coverImage
    }));

  // 6. Culinary Persona
  const primaryCat = topCategory?.category || '家常中餐';
  let persona = {
    title: '百味生活家',
    titleEn: 'Master of Everyday Flavors',
    desc: '锅气腾腾的人间烟火，每一道菜都是用心雕琢的生活诗篇。',
    descEn: 'From sizzling woks to slow-cooked warmth, every recipe turns daily meals into poetry.',
    icon: '🍳'
  };

  if (primaryCat === '烘焙甜点') {
    persona = {
      title: '甜蜜造梦师',
      titleEn: 'Artisan Baking Magician',
      desc: '擅长将面粉、黄油与温热空气编织成酥脆松软的幸福滋味。',
      descEn: 'Weaving butter, flour, and fragrant oven warmth into sweet artisan dreams.',
      icon: '🧁'
    };
  } else if (primaryCat === '西式轻餐') {
    persona = {
      title: '风味美学主理人',
      titleEn: 'Bistro & Pasta Virtuoso',
      desc: '擅长调配香草、橄榄油与慢火浓酱，把餐厅级雅致搬上自家餐桌。',
      descEn: 'Harmonizing herbs, olive oil, and artisan sauces to bring bistro elegance home.',
      icon: '🍝'
    };
  } else if (primaryCat === '暖胃汤羹') {
    persona = {
      title: '暖心煨汤师',
      titleEn: 'Soulful Stews & Broth Master',
      desc: '懂得让时间在砂锅慢火里凝练甘甜，一碗热汤胜过世间万语千言。',
      descEn: 'Master of gentle simmer and time, nurturing family and soul with rich comforting bowls.',
      icon: '🥣'
    };
  } else if (primaryCat === '健康轻食') {
    persona = {
      title: '元气活力食养家',
      titleEn: 'Mindful Vitality Chef',
      desc: '精研天然食材的原色本味，让美味与轻盈在舌尖达成绝妙平衡。',
      descEn: 'Champion of wholesome nutrients and vibrant ingredients, balancing taste and vitality.',
      icon: '🥑'
    };
  } else if (primaryCat === '日韩和风') {
    persona = {
      title: '精工和风料理人',
      titleEn: 'Zen Bento & Washoku Artisan',
      desc: '讲究食材旬鲜与刀工火候，于方寸餐盒与深碗中见素雅匠心。',
      descEn: 'Dedicated to seasonal freshness and delicate craft, celebrating aesthetic simplicity.',
      icon: '🍱'
    };
  }

  return {
    year: targetYear,
    totalRecipes: filteredRecipes.length,
    totalCookingSessions: Math.max(filteredRecords.length, filteredRecipes.length),
    totalCookMinutes: totalMinutes,
    totalCookHours: Math.round((totalMinutes / 60) * 10) / 10,
    uniqueCookingDays: Math.max(cookingDaysSet.size, filteredRecipes.length > 0 ? 1 : 0),
    averageRating,
    topCategory,
    categoryDistribution,
    monthlyHeat,
    peakMonth,
    topIngredients,
    topDishes,
    culinaryPersona: persona
  };
}
