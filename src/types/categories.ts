import { RecipeCategory } from './recipe';

export interface SubCategoryInfo {
  id: string;
  label: string;
  desc: string;
  icon?: string;
}

export interface CategoryInfo {
  id: RecipeCategory;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  subcategories: SubCategoryInfo[];
}

export const CATEGORY_TAXONOMY: Record<RecipeCategory, CategoryInfo> = {
  '烘焙甜点': {
    id: '烘焙甜点',
    label: '烘焙甜点',
    shortLabel: '甜点',
    icon: '🧁',
    description: '香甜治愈的烤箱烘焙、中外名点与四季甘露冰品',
    subcategories: [
      { id: '西式烘焙', label: '西式烘焙', desc: '法式西点/戚风蛋糕/派挞/欧包吐司/泡芙', icon: '🥐' },
      { id: '中式糕点', label: '中式糕点', desc: '苏式酥饼/青团/马蹄糕/年糕/发糕', icon: '🥮' },
      { id: '港式甜品', label: '港式甜品', desc: '杨枝甘露/双皮奶/芒果班戟/滋补糖水', icon: '🥭' },
      { id: '台式甜品', label: '台式甜品', desc: '手工芋圆/烧仙草/凤梨酥/古早豆花', icon: '🧋' },
      { id: '日式和果子', label: '日式和果子', desc: '抹茶大福/铜锣烧/洋果子/水信玄饼', icon: '🍵' },
      { id: '清凉冰品', label: '清凉冰品', desc: '手作冰淇淋/绵绵刨冰/意式雪葩/清爽冻饮', icon: '🍧' }
    ]
  },
  '家常中餐': {
    id: '家常中餐',
    label: '家常中餐',
    shortLabel: '中餐',
    icon: '🥢',
    description: '镬气十足的中式传统菜肴与家常小炒慢炖',
    subcategories: [
      { id: '经典小炒', label: '经典小炒', desc: '时蔬快炒/农家小炒肉/干锅热炒', icon: '🍳' },
      { id: '慢炖红烧', label: '慢炖红烧', desc: '红烧肉/黄焖/砂锅煨炖/老卤浸味', icon: '🍲' },
      { id: '清蒸白灼', label: '清蒸白灼', desc: '清蒸鲈鱼/白灼鲜虾/滑嫩水蒸蛋', icon: '🐟' },
      { id: '凉拌冷碟', label: '凉拌冷碟', desc: '爽口凉菜/捞汁海鲜/红油钵钵/拌面', icon: '🥗' },
      { id: '香煎酥炸', label: '香煎酥炸', desc: '金黄锅贴/干炸酥肉/香煎藕盒', icon: '🥟' },
      { id: '面点主食', label: '面点主食', desc: '手工水饺/发面生煎/阳春炒饭', icon: '🍜' }
    ]
  },
  '西式轻餐': {
    id: '西式轻餐',
    label: '西式轻餐',
    shortLabel: '西餐',
    icon: '🍝',
    description: '风味考究的西式小馆、意面肉扒与Bistro轻食',
    subcategories: [
      { id: '意面披萨', label: '意面披萨', desc: '经典宽面/薄底披萨/焗烤通心粉', icon: '🍕' },
      { id: '轻食沙拉', label: '轻食沙拉', desc: '暖温沙拉/经典油醋汁/羽衣甘蓝碗', icon: '🥗' },
      { id: '牛排肉排', label: '牛排肉排', desc: '安格斯牛排/香草法排/慢烤鸡胸', icon: '🥩' },
      { id: '早午餐Brunch', label: '早午餐Brunch', desc: '班尼迪克蛋/欧姆蛋/三明治可颂', icon: '🥪' },
      { id: '焗烤烩饭', label: '焗烤烩饭', desc: '海鲜烩饭/黑松露菌菇/芝士焗饭', icon: '🥘' }
    ]
  },
  '日韩和风': {
    id: '日韩和风',
    label: '日韩和风',
    shortLabel: '日韩',
    icon: '🍱',
    description: '讲究食材本味的日料居酒屋与韩式暖锅拌饭',
    subcategories: [
      { id: '日式烧物丼饭', label: '日式烧物丼饭', desc: '寿喜烧/照烧鸡排/鳗鱼饭/亲子丼', icon: '🍛' },
      { id: '日式拉面面点', label: '日式拉面面点', desc: '豚骨拉面/日式炒乌冬/荞麦冷面', icon: '🍜' },
      { id: '寿司刺身小食', label: '寿司刺身小食', desc: '手握寿司/玉子烧/唐扬炸鸡块', icon: '🍣' },
      { id: '韩式锅物料理', label: '韩式锅物料理', desc: '部队火锅/泡菜豆腐汤/大酱海鲜锅', icon: '🍲' },
      { id: '韩式拌饭烤肉', label: '韩式拌饭烤肉', desc: '石锅拌饭/韩式辣炒年糕/风味烤五花', icon: '🥓' }
    ]
  },
  '暖胃汤羹': {
    id: '暖胃汤羹',
    label: '暖胃汤羹',
    shortLabel: '汤羹',
    icon: '🥣',
    description: '温润熨帖的瓦罐老火靓汤、浓汤羹饮与滋补炖盅',
    subcategories: [
      { id: '老火慢煲靓汤', label: '老火慢煲靓汤', desc: '广式老火汤/排骨玉米/砂锅鸡汤', icon: '🍲' },
      { id: '快手生滚汤', label: '快手生滚汤', desc: '番茄浓蛋汤/紫菜鲜虾/生滚牛肉汤', icon: '🥣' },
      { id: '西式浓汤', label: '西式浓汤', desc: '奶油蘑菇浓汤/法式罗宋汤/南瓜汤', icon: '🍵' },
      { id: '滋补养生盅', label: '滋补养生盅', desc: '银耳雪梨/花胶炖盅/当归黄芪盅', icon: '🍯' },
      { id: '咸鲜羹汤', label: '咸鲜羹汤', desc: '西湖牛肉羹/酸辣海鲜豆腐羹', icon: '🍲' }
    ]
  },
  '健康轻食': {
    id: '健康轻食',
    label: '健康轻食',
    shortLabel: '轻食',
    icon: '🥑',
    description: '减脂控卡、高蛋白全营养与身心清爽的能量餐',
    subcategories: [
      { id: '低卡减脂餐', label: '低卡减脂餐', desc: '控卡便当/无油蒸煮/低脂肉源', icon: '🥗' },
      { id: '高蛋白增肌碗', label: '高蛋白增肌碗', desc: '夏威夷Poké碗/牛油果三文鱼碗', icon: '🥑' },
      { id: '全谷粗粮主食', label: '全谷粗粮主食', desc: '藜麦糙米饭/全麦贝果/隔夜燕麦', icon: '🥯' },
      { id: '轻体果昔饮品', label: '轻体果昔饮品', desc: '生椰羽衣甘蓝/抗氧化巴西莓碗', icon: '🥤' },
      { id: '清爽轻素食', label: '清爽轻素食', desc: '彩椒豆腐/植物性高纤维料理', icon: '🥦' }
    ]
  }
};

export const ALL_CATEGORIES_LIST: RecipeCategory[] = [
  '家常中餐',
  '烘焙甜点',
  '西式轻餐',
  '日韩和风',
  '暖胃汤羹',
  '健康轻食'
];

export function getSubcategoriesForCategory(category: RecipeCategory): SubCategoryInfo[] {
  return CATEGORY_TAXONOMY[category]?.subcategories || [];
}

/**
 * Returns all available subcategories across all categories
 */
export function getAllSubcategories(): SubCategoryInfo[] {
  const result: SubCategoryInfo[] = [];
  ALL_CATEGORIES_LIST.forEach((cat) => {
    result.push(...CATEGORY_TAXONOMY[cat].subcategories);
  });
  return result;
}
