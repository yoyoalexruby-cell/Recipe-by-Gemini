import { Ingredient } from '../types/recipe';

interface FoodItem {
  keywords: string[];
  kcalPer100g: number;
  defaultPieceGrams?: number; // 单个/单只重量(g)
  defaultUnit?: string;
}

// 常见食材热量数据库 (每100克标准可食部分热量 kcal)
const FOOD_DATABASE: FoodItem[] = [
  // 肉禽蛋类
  { keywords: ['五花肉', '三层肉', '肥猪肉'], kcalPer100g: 395, defaultPieceGrams: 50 },
  { keywords: ['里脊', '瘦肉', '猪瘦肉', '瘦猪肉', '梅花肉'], kcalPer100g: 143, defaultPieceGrams: 50 },
  { keywords: ['排骨', '肋排', '猪小排', '大排'], kcalPer100g: 278, defaultPieceGrams: 80 },
  { keywords: ['猪蹄', '猪手'], kcalPer100g: 260, defaultPieceGrams: 200 },
  { keywords: ['培根', '烟肉'], kcalPer100g: 541, defaultPieceGrams: 20 },
  { keywords: ['香肠', '腊肠', '热狗肠', '红肠'], kcalPer100g: 508, defaultPieceGrams: 45 },
  { keywords: ['鸡胸', '鸡大胸', '鸡小胸', '鸡柳'], kcalPer100g: 133, defaultPieceGrams: 150 },
  { keywords: ['鸡腿', '琵琶腿', '手枪腿'], kcalPer100g: 181, defaultPieceGrams: 120 },
  { keywords: ['鸡翅', '鸡中翅', '鸡翅中', '鸡全翅', '鸡翅尖'], kcalPer100g: 194, defaultPieceGrams: 40 },
  { keywords: ['整鸡', '童子鸡', '三黄鸡', '老母鸡'], kcalPer100g: 167, defaultPieceGrams: 800 },
  { keywords: ['鸭肉', '鸭腿', '烤鸭'], kcalPer100g: 240, defaultPieceGrams: 150 },
  { keywords: ['牛肉', '牛腩', '牛排', '肥牛', '牛柳', '牛肉卷'], kcalPer100g: 250, defaultPieceGrams: 150 },
  { keywords: ['牛腱', '牛腱子', '牛里脊', '瘦牛肉'], kcalPer100g: 125, defaultPieceGrams: 150 },
  { keywords: ['羊肉', '羊排', '羊腿', '羊肉卷'], kcalPer100g: 203, defaultPieceGrams: 150 },
  { keywords: ['鸡蛋', '全蛋', '蛋清', '蛋黄'], kcalPer100g: 147, defaultPieceGrams: 50 },
  { keywords: ['鸭蛋', '咸鸭蛋', '皮蛋', '松花蛋'], kcalPer100g: 180, defaultPieceGrams: 65 },
  { keywords: ['鹌鹑蛋'], kcalPer100g: 160, defaultPieceGrams: 10 },

  // 水产海鲜
  { keywords: ['虾仁', '基围虾', '大虾', '青虾', '明虾', '鲜虾', '皮皮虾', '龙虾'], kcalPer100g: 93, defaultPieceGrams: 15 },
  { keywords: ['三文鱼', '鲑鱼'], kcalPer100g: 208, defaultPieceGrams: 120 },
  { keywords: ['鳕鱼', '银鳕鱼', '龙利鱼', '巴沙鱼'], kcalPer100g: 88, defaultPieceGrams: 150 },
  { keywords: ['草鱼', '鲈鱼', '鲫鱼', '黑鱼', '清江鱼', '黄花鱼', '带鱼', '鱼肉', '生鱼片'], kcalPer100g: 110, defaultPieceGrams: 300 },
  { keywords: ['鱿鱼', '墨鱼', '八爪鱼', '章鱼'], kcalPer100g: 75, defaultPieceGrams: 100 },
  { keywords: ['扇贝', '生蚝', '花甲', '蛤蜊', '文蛤', '鲍鱼', '贻贝', '蛏子'], kcalPer100g: 65, defaultPieceGrams: 20 },
  { keywords: ['螃蟹', '大闸蟹', '梭子蟹', '蟹肉', '蟹柳'], kcalPer100g: 95, defaultPieceGrams: 150 },

  // 豆制品与奶制品
  { keywords: ['嫩豆腐', '内酯豆腐', '水豆腐', '南豆腐'], kcalPer100g: 55, defaultPieceGrams: 350 },
  { keywords: ['老豆腐', '北豆腐', '板豆腐', '卤水豆腐'], kcalPer100g: 98, defaultPieceGrams: 250 },
  { keywords: ['豆皮', '油皮', '千张', '百叶', '腐竹', '豆干', '香干'], kcalPer100g: 450, defaultPieceGrams: 50 },
  { keywords: ['牛奶', '纯牛奶', '鲜牛奶'], kcalPer100g: 54, defaultPieceGrams: 250 },
  { keywords: ['淡奶油', '稀奶油', '奶油', '打发奶油'], kcalPer100g: 345, defaultPieceGrams: 100 },
  { keywords: ['芝士', '奶酪', '马苏里拉', '起司', '干酪'], kcalPer100g: 350, defaultPieceGrams: 20 },
  { keywords: ['黄油', '牛油'], kcalPer100g: 717, defaultPieceGrams: 10 },
  { keywords: ['酸奶', '原味酸奶'], kcalPer100g: 72, defaultPieceGrams: 150 },

  // 主食与粮食淀粉
  { keywords: ['米饭', '熟米饭', '白饭'], kcalPer100g: 116, defaultPieceGrams: 150 },
  { keywords: ['大米', '生米', '香米', '糯米', '黑米', '糙米'], kcalPer100g: 346, defaultPieceGrams: 100 },
  { keywords: ['面条', '生面', '挂面', '切面'], kcalPer100g: 280, defaultPieceGrams: 100 },
  { keywords: ['熟面条', '煮面'], kcalPer100g: 138, defaultPieceGrams: 180 },
  { keywords: ['面粉', '低筋面粉', '高筋面粉', '中筋面粉', '低粉', '高粉'], kcalPer100g: 364, defaultPieceGrams: 100 },
  { keywords: ['生粉', '淀粉', '玉米淀粉', '太白粉', '地瓜粉', '木薯粉'], kcalPer100g: 345, defaultPieceGrams: 10 },
  { keywords: ['意面', '意大利面', '通心粉'], kcalPer100g: 350, defaultPieceGrams: 80 },
  { keywords: ['燕麦', '燕麦片'], kcalPer100g: 389, defaultPieceGrams: 35 },
  { keywords: ['土豆', '马铃薯', '洋芋'], kcalPer100g: 77, defaultPieceGrams: 150 },
  { keywords: ['红薯', '地瓜', '番薯', '紫薯'], kcalPer100g: 86, defaultPieceGrams: 150 },
  { keywords: ['玉米', '甜玉米', '玉米粒'], kcalPer100g: 112, defaultPieceGrams: 160 },
  { keywords: ['南瓜', '贝贝南瓜'], kcalPer100g: 26, defaultPieceGrams: 200 },
  { keywords: ['粉丝', '粉条', '红薯粉', '宽粉', '米线'], kcalPer100g: 338, defaultPieceGrams: 50 },
  { keywords: ['吐司', '面包', '法棍', '欧包'], kcalPer100g: 265, defaultPieceGrams: 40 },

  // 蔬菜菌菇类
  { keywords: ['西兰花', '青花菜'], kcalPer100g: 34, defaultPieceGrams: 200 },
  { keywords: ['西红柿', '番茄', '圣女果', '小番茄'], kcalPer100g: 18, defaultPieceGrams: 150 },
  { keywords: ['黄瓜', '青瓜'], kcalPer100g: 15, defaultPieceGrams: 150 },
  { keywords: ['生菜', '罗马生菜', '结球生菜'], kcalPer100g: 15, defaultPieceGrams: 100 },
  { keywords: ['菠菜', '油菜', '小油菜', '青菜', '上海青', '菜心'], kcalPer100g: 23, defaultPieceGrams: 100 },
  { keywords: ['大白菜', '白菜', '娃娃菜', '卷心菜', '包菜', '圆白菜'], kcalPer100g: 17, defaultPieceGrams: 200 },
  { keywords: ['胡萝卜', '红萝卜'], kcalPer100g: 41, defaultPieceGrams: 120 },
  { keywords: ['洋葱', '紫洋葱', '白洋葱'], kcalPer100g: 40, defaultPieceGrams: 120 },
  { keywords: ['青椒', '红椒', '彩椒', '甜椒', '辣椒', '尖椒'], kcalPer100g: 25, defaultPieceGrams: 50 },
  { keywords: ['茄子', '长茄子', '圆茄子'], kcalPer100g: 25, defaultPieceGrams: 200 },
  { keywords: ['豆角', '四季豆', '扁豆', '荷兰豆', '豇豆'], kcalPer100g: 32, defaultPieceGrams: 100 },
  { keywords: ['香菇', '口蘑', '白蘑菇', '平菇', '杏鲍菇', '金针菇', '蟹味菇', '木耳', '黑木耳', '银耳'], kcalPer100g: 28, defaultPieceGrams: 20 },
  { keywords: ['莲藕', '藕'], kcalPer100g: 73, defaultPieceGrams: 150 },
  { keywords: ['山药', '淮山'], kcalPer100g: 57, defaultPieceGrams: 150 },
  { keywords: ['芹菜', '西芹'], kcalPer100g: 16, defaultPieceGrams: 100 },
  { keywords: ['芦笋'], kcalPer100g: 22, defaultPieceGrams: 50 },
  { keywords: ['冬瓜'], kcalPer100g: 12, defaultPieceGrams: 200 },
  { keywords: ['苦瓜'], kcalPer100g: 19, defaultPieceGrams: 150 },

  // 油脂调味类
  { keywords: ['食用油', '花生油', '菜籽油', '玉米油', '色拉油', '植物油', '橄榄油', '大豆油', '葵花籽油'], kcalPer100g: 884, defaultPieceGrams: 10 },
  { keywords: ['猪油', '牛油'], kcalPer100g: 897, defaultPieceGrams: 10 },
  { keywords: ['香油', '芝麻油'], kcalPer100g: 898, defaultPieceGrams: 5 },
  { keywords: ['白糖', '白砂糖', '绵白糖', '冰糖', '红糖', '黑糖', '黄糖'], kcalPer100g: 400, defaultPieceGrams: 10 },
  { keywords: ['蜂蜜'], kcalPer100g: 304, defaultPieceGrams: 15 },
  { keywords: ['生抽', '酱油', '味极鲜', '蒸鱼豉油'], kcalPer100g: 60, defaultPieceGrams: 10 },
  { keywords: ['老抽', '红烧酱油'], kcalPer100g: 100, defaultPieceGrams: 10 },
  { keywords: ['蚝油'], kcalPer100g: 115, defaultPieceGrams: 15 },
  { keywords: ['料酒', '黄酒', '米酒', '白酒', '花雕酒'], kcalPer100g: 80, defaultPieceGrams: 10 },
  { keywords: ['香醋', '陈醋', '米醋', '白醋', '香醋汁'], kcalPer100g: 30, defaultPieceGrams: 10 },
  { keywords: ['豆瓣酱', '郫县豆瓣', '黄豆酱', '甜面酱'], kcalPer100g: 180, defaultPieceGrams: 20 },
  { keywords: ['番茄酱', '番茄沙司'], kcalPer100g: 100, defaultPieceGrams: 15 },
  { keywords: ['沙拉酱', '蛋黄酱', '千岛酱'], kcalPer100g: 680, defaultPieceGrams: 15 },
  { keywords: ['芝麻酱', '花生酱'], kcalPer100g: 600, defaultPieceGrams: 20 },
  { keywords: ['盐', '食用盐', '海盐'], kcalPer100g: 0, defaultPieceGrams: 3 },
  { keywords: ['葱', '大葱', '小葱', '香葱', '姜', '生姜', '蒜', '大蒜', '蒜瓣', '蒜末'], kcalPer100g: 40, defaultPieceGrams: 5 },
  { keywords: ['花椒', '八角', '大料', '桂皮', '香叶', '胡椒粉', '黑胡椒', '白胡椒', '五香粉', '孜然粉'], kcalPer100g: 250, defaultPieceGrams: 2 },

  // 水果坚果
  { keywords: ['苹果'], kcalPer100g: 52, defaultPieceGrams: 180 },
  { keywords: ['香蕉'], kcalPer100g: 89, defaultPieceGrams: 120 },
  { keywords: ['柠檬'], kcalPer100g: 35, defaultPieceGrams: 80 },
  { keywords: ['橙子', '柑橘'], kcalPer100g: 47, defaultPieceGrams: 150 },
  { keywords: ['芒果'], kcalPer100g: 35, defaultPieceGrams: 150 },
  { keywords: ['花生', '熟花生', '腰果', '核桃', '巴旦木', '杏仁', '坚果'], kcalPer100g: 580, defaultPieceGrams: 15 },
  { keywords: ['熟芝麻', '白芝麻', '黑芝麻'], kcalPer100g: 570, defaultPieceGrams: 10 }
];

export interface IngredientCalorieDetail {
  id: string;
  name: string;
  amount: number | string;
  unit: string;
  calculatedGrams: number;
  calories: number; // kcal
  confidence: 'high' | 'approximate' | 'fallback';
  note?: string;
}

export interface RecipeCalorieEstimate {
  totalCalories: number; // 整道菜总热量 kcal
  perServingCalories: number; // 单人份热量 kcal
  servings: number;
  healthLevel: {
    category: 'low' | 'balanced' | 'rich';
    label: string;
    badgeColor: string;
    description: string;
  };
  details: IngredientCalorieDetail[];
}

/**
 * 转换食材数量及单位为标准克数 (g)
 */
function parseAmountToGrams(amountVal: number | string, unitRaw: string, foodMatch?: FoodItem): number {
  let num = 0;
  if (typeof amountVal === 'number') {
    num = amountVal;
  } else {
    // 提取数字，如 "1.5" 或 "1/2"
    const parsed = parseFloat(amountVal.trim());
    num = isNaN(parsed) ? 1 : parsed;
  }

  const unit = (unitRaw || '').trim().toLowerCase();

  // 1. 直接公制单位
  if (unit === '克' || unit === 'g' || unit === 'gram' || unit === 'grams') {
    return num;
  }
  if (unit === '千克' || unit === 'kg' || unit === '公斤') {
    return num * 1000;
  }
  if (unit === '斤') {
    return num * 500;
  }
  if (unit === '两') {
    return num * 50;
  }
  if (unit === '毫升' || unit === 'ml') {
    return num; // 液体近似 1g/ml
  }
  if (unit === '升' || unit === 'l') {
    return num * 1000;
  }

  // 2. 厨房用勺
  if (unit === '勺' || unit === '汤匙' || unit === '大勺' || unit === 'tbsp') {
    return num * 15;
  }
  if (unit === '茶匙' || unit === '小勺' || unit === 'tsp') {
    return num * 5;
  }
  if (unit === '适量' || unit === '少许' || unit === '几滴') {
    return 3;
  }

  // 3. 计数单位：个/只/根/瓣/片/碗/块
  if (foodMatch?.defaultPieceGrams) {
    if (unit === '个' || unit === '只' || unit === '根' || unit === '枚' || unit === '头' || unit === '瓣' || unit === '块' || unit === '片' || unit === '条') {
      return num * foodMatch.defaultPieceGrams;
    }
  }

  if (unit === '碗') {
    return num * 180;
  }
  if (unit === '片' || unit === '块') {
    return num * 30;
  }
  if (unit === '瓣') {
    return num * 5;
  }
  if (unit === '根') {
    return num * 100;
  }
  if (unit === '个' || unit === '只' || unit === '枚') {
    return num * (foodMatch?.defaultPieceGrams || 100);
  }

  // 默认fallback为 50g
  return num > 0 ? num * 50 : 50;
}

/**
 * 在食物数据库中查找匹配项
 */
function findFoodMatch(name: string): FoodItem | undefined {
  const cleanName = name.trim().toLowerCase();
  
  // 1. 精确与包含匹配
  let match = FOOD_DATABASE.find(item => 
    item.keywords.some(kw => cleanName.includes(kw.toLowerCase()))
  );
  if (match) return match;

  // 2. 逆向检查（关键字包含食材名的一部分）
  match = FOOD_DATABASE.find(item => 
    item.keywords.some(kw => kw.toLowerCase().includes(cleanName) && cleanName.length >= 2)
  );

  return match;
}

/**
 * 计算整道菜与单份预估热量
 */
export function estimateRecipeCalories(ingredients: Ingredient[], servings: number = 2): RecipeCalorieEstimate {
  const details: IngredientCalorieDetail[] = [];
  let totalKcal = 0;

  ingredients.forEach((ing) => {
    if (!ing.name || !ing.name.trim()) return;

    const foodMatch = findFoodMatch(ing.name);
    const grams = parseAmountToGrams(ing.amount, ing.unit, foodMatch);

    let kcal = 0;
    let confidence: 'high' | 'approximate' | 'fallback' = 'fallback';

    if (foodMatch) {
      kcal = Math.round((foodMatch.kcalPer100g * grams) / 100);
      confidence = (ing.unit === '克' || ing.unit === 'g' || ing.unit === '两' || ing.unit === '斤') ? 'high' : 'approximate';
    } else {
      // 缺省预估（平均食材热量约 120 kcal / 100g）
      kcal = Math.round((120 * grams) / 100);
      confidence = 'fallback';
    }

    totalKcal += kcal;

    details.push({
      id: ing.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      calculatedGrams: Math.round(grams),
      calories: kcal,
      confidence,
      note: ing.note
    });
  });

  const validServings = Math.max(1, servings || 2);
  const perServing = Math.round(totalKcal / validServings);

  // 健康与热量等级判定
  let healthCategory: 'low' | 'balanced' | 'rich' = 'balanced';
  let label = '🟡 营养均衡';
  let badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  let description = '热量适中，膳食纤维与饱腹感良好，适合日常健康餐食。';

  if (perServing < 420) {
    healthCategory = 'low';
    label = '🟢 低卡轻食';
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    description = '单份低于420大卡，清爽控卡无负担，减脂与保持身材首选。';
  } else if (perServing > 720) {
    healthCategory = 'rich';
    label = '🔴 能量充沛';
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
    description = '风味浓郁丰盛，提供高能量补给，适合运动健身后或假日聚餐享用。';
  }

  return {
    totalCalories: totalKcal,
    perServingCalories: perServing,
    servings: validServings,
    healthLevel: {
      category: healthCategory,
      label,
      badgeColor,
      description
    },
    details
  };
}
