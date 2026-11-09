import { Recipe } from '../types/recipe';

// Comprehensive Chinese Culinary Synonym & Association Thesaurus
const CULINARY_SYNONYMS: Record<string, string[]> = {
  // Meats
  '肉': ['五花肉', '猪肉', '带皮五花', '红烧肉', '排骨', '里脊', '腩肉', '肉排', '五花三层', '小炒肉', '叉烧'],
  '猪肉': ['五花肉', '肉', '排骨', '肉沫', '肉丝', '里脊', '带皮五花', '红烧肉'],
  '五花肉': ['猪肉', '五花', '带皮五花', '红烧肉', '三层肉', '咸肉'],
  '牛肉': ['牛排', '牛腩', '肥牛', '安格斯', '牛肉粒', '牛腱', '牛肉羹', '黑椒牛肉'],
  '牛排': ['牛肉', '安格斯', '牛里脊', '肉排', '西餐肉排'],
  '鸡肉': ['鸡胸', '鸡腿', '鸡翅', '整鸡', '老母鸡', '照烧鸡', '鸡肉块', '鸡汤'],
  '鸡': ['鸡肉', '鸡翅', '鸡腿', '鸡胸', '黄焖鸡', '鸡汤'],

  // Seafood
  '虾': ['黑虎虾', '鲜虾', '白灼虾', '虾仁', '基围虾', '大虾', '对虾', '海鲜', '罗氏虾'],
  '海鲜': ['虾', '黑虎虾', '鲜虾', '鲈鱼', '三文鱼', '青口', '花甲', '扇贝', '海鲜面'],
  '鱼': ['鲈鱼', '三文鱼', '鳗鱼', '生鱼片', '清蒸鱼', '烤鱼', '鱼肉', '水煮鱼'],
  '三文鱼': ['鱼', '三文鱼刺身', '香煎三文鱼', '海鲜'],

  // Eggs & Dairy
  '蛋': ['鸡蛋', '土鸡蛋', '水蒸蛋', '温泉蛋', '溏心蛋', '欧姆蛋', '班尼迪克蛋', '双皮奶', '戚风蛋糕', '蛋挞'],
  '鸡蛋': ['蛋', '水蒸蛋', '荷包蛋', '炒蛋', '蛋清', '蛋黄'],
  '奶': ['牛奶', '鲜奶', '生椰', '椰浆', '淡奶油', '芝士', '马苏里拉', '奶酪', '双皮奶', '奶油'],
  '芝士': ['奶酪', '马苏里拉', '起司', '干酪', '帕玛森', '焗烤'],

  // Carbs & Staples
  '面': ['意面', '拉面', '面条', '乌冬', '炒面', '拌面', '通心粉', '宽面', '荞麦面', '水饺', '面点'],
  '意面': ['意大利面', '面', '宽面', '长面', '通心粉', '千层面', '黑虎虾意面'],
  '米': ['大米', '糙米', '糯米', '藜麦', '米饭', '炒饭', '石锅拌饭', '烩饭', '煲仔饭'],
  '饭': ['米饭', '炒饭', '拌饭', '盖浇饭', '煲仔饭', '烩饭', '丼饭'],

  // Desserts & Sweets
  '甜点': ['蛋糕', '戚风', '大福', '杨枝甘露', '芋圆', '烧仙草', '冰淇淋', '雪葩', '泡芙', '糖水', '酥饼', '桃酥', '双皮奶'],
  '甜品': ['甜点', '杨枝甘露', '芋圆', '仙草', '糖水', '大福', '冰品', '双皮奶', '冰淇淋', '班戟'],
  '蛋糕': ['戚风', '芝士蛋糕', '甜点', '烘焙', '提拉米苏', '抹面蛋糕'],
  '戚风': ['蛋糕', '烘焙', '戚风蛋糕', '云朵戚风', '甜点'],
  '抹茶': ['宇治', '若竹', '大福', '和果子', '抹茶蛋糕', '绿茶', '抹茶粉'],
  '芋圆': ['台式甜品', '九份', '烧仙草', '红豆', '糖水'],
  '仙草': ['烧仙草', '芋圆', '台式甜品', '黑凉粉'],
  '冰品': ['冰淇淋', '雪葩', '刨冰', '绵绵冰', '冻饮', '冰沙'],
  '冰淇淋': ['冰品', '雪糕', 'gelato', '冰酪', '低脂冰淇淋', '雪葩'],
  '酥饼': ['中式糕点', '桃酥', '核桃酥', '酥皮', '年糕'],

  // Seasonings & Flavors
  '辣': ['辣椒', '小米辣', '干辣椒', '豆瓣酱', '泡椒', '麻辣', '红油', '香辣', '韩式辣酱', '黑胡椒'],
  '麻辣': ['花椒', '麻椒', '辣椒', '红油', '水煮', '辣子'],
  '甜': ['白糖', '黄冰糖', '冰糖', '蜂蜜', '炼乳', '赤藓糖醇'],
  '咸': ['生抽', '酱油', '老抽', '食盐', '海盐'],
  '酒': ['花雕酒', '绍兴黄酒', '料酒', '白兰地', '朗姆酒', '清酒', '红酒'],
  '汤': ['老火汤', '老母鸡汤', '浓汤', '炖汤', '排骨汤', '生滚汤', '瓦罐汤', '羹汤', '罗宋汤', '冬阴功'],
  '蔬菜': ['时蔬', '青菜', '西兰花', '生菜', '羽衣甘蓝', '菠菜', '番茄', '西红柿'],
  '番茄': ['西红柿', '番茄酱', '小番茄', '圣女果'],
  '豆腐': ['嫩豆腐', '老豆腐', '内酯豆腐', '冻豆腐', '豆腐块', '油豆腐']
};

/**
 * Expand a user search term with synonyms
 */
export function expandSearchTerms(term: string): string[] {
  const clean = term.toLowerCase().trim();
  if (!clean) return [];

  const termsSet = new Set<string>([clean]);

  // Check synonym mappings
  Object.entries(CULINARY_SYNONYMS).forEach(([key, synonyms]) => {
    if (clean.includes(key) || key.includes(clean)) {
      termsSet.add(key);
      synonyms.forEach(s => termsSet.add(s));
    }
    // Also check if clean matches any synonym item
    if (synonyms.some(s => s.toLowerCase().includes(clean) || clean.includes(s.toLowerCase()))) {
      termsSet.add(key);
      synonyms.forEach(s => termsSet.add(s));
    }
  });

  return Array.from(termsSet);
}

/**
 * Calculate fuzzy match score between target text and expanded query terms
 */
export function calculateFuzzyScore(
  recipe: Recipe,
  query: string
): { isMatch: boolean; score: number; matchedField: string; matchHighlight: string } {
  const q = query.toLowerCase().trim();
  if (!q) {
    return { isMatch: true, score: 0, matchedField: '', matchHighlight: '' };
  }

  // Exact direct matches have highest score
  const titleLower = recipe.title.toLowerCase();
  const subtitleLower = (recipe.subtitle || '').toLowerCase();
  const categoryLower = recipe.category.toLowerCase();
  const subCatLower = (recipe.subCategory || '').toLowerCase();
  const cuisineLower = (recipe.cuisine || '').toLowerCase();
  const ingredientsJoined = recipe.ingredients.map(i => `${i.name} ${i.note || ''}`).join(' ').toLowerCase();

  if (titleLower.includes(q)) {
    return { isMatch: true, score: 100, matchedField: '菜名', matchHighlight: recipe.title };
  }
  if (ingredientsJoined.includes(q)) {
    const matchedIng = recipe.ingredients.find(i => i.name.toLowerCase().includes(q));
    return { isMatch: true, score: 85, matchedField: '食材', matchHighlight: matchedIng?.name || q };
  }
  if (subCatLower.includes(q) || categoryLower.includes(q)) {
    return { isMatch: true, score: 75, matchedField: '细分分类', matchHighlight: recipe.subCategory || recipe.category };
  }
  if (cuisineLower.includes(q) || subtitleLower.includes(q)) {
    return { isMatch: true, score: 65, matchedField: '风味/特点', matchHighlight: recipe.cuisine || recipe.subtitle };
  }

  // Expanded synonym match
  const expanded = expandSearchTerms(q);
  for (const expTerm of expanded) {
    const expLower = expTerm.toLowerCase();
    if (titleLower.includes(expLower)) {
      return { isMatch: true, score: 60, matchedField: `相似词「${expTerm}」`, matchHighlight: recipe.title };
    }
    if (ingredientsJoined.includes(expLower)) {
      const matchedIng = recipe.ingredients.find(i => i.name.toLowerCase().includes(expLower));
      return { isMatch: true, score: 55, matchedField: `相似食材「${expTerm}」`, matchHighlight: matchedIng?.name || expTerm };
    }
    if (subCatLower.includes(expLower) || categoryLower.includes(expLower)) {
      return { isMatch: true, score: 50, matchedField: `相似分类「${expTerm}」`, matchHighlight: recipe.subCategory || recipe.category };
    }
  }

  // Character intersection fuzzy check for short typo tolerance (e.g. 2 chars match out of 3)
  if (q.length >= 2) {
    let charMatchCount = 0;
    for (const char of q) {
      if (titleLower.includes(char) || ingredientsJoined.includes(char)) {
        charMatchCount++;
      }
    }
    if (charMatchCount >= Math.ceil(q.length * 0.75)) {
      return { isMatch: true, score: 30, matchedField: '相似联想', matchHighlight: recipe.title };
    }
  }

  return { isMatch: false, score: 0, matchedField: '', matchHighlight: '' };
}

/**
 * Filter and sort recipes by fuzzy relevance score
 */
export function fuzzyFilterRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query.trim()) return recipes;

  const scored: Array<{ recipe: Recipe; score: number }> = [];

  for (const r of recipes) {
    const result = calculateFuzzyScore(r, query);
    if (result.isMatch) {
      scored.push({ recipe: r, score: result.score });
    }
  }

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.recipe);
}

/**
 * Get quick search keyword associations and candidate suggestions for the dropdown
 */
export function getSearchSuggestions(query: string, recipes: Recipe[]): {
  synonyms: string[];
  matchedDishes: Array<{ id: string; title: string; category: string; subCategory?: string }>;
} {
  const clean = query.trim();
  if (!clean) {
    return { synonyms: [], matchedDishes: [] };
  }

  const synonyms = expandSearchTerms(clean).filter(s => s !== clean).slice(0, 6);
  const matchedRecipes = fuzzyFilterRecipes(recipes, clean).slice(0, 4);

  return {
    synonyms,
    matchedDishes: matchedRecipes.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      subCategory: r.subCategory
    }))
  };
}
