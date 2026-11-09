export type RecipeCategory = 
  | '家常中餐' 
  | '日韩和风' 
  | '西式轻餐' 
  | '烘焙甜点' 
  | '暖胃汤羹' 
  | '健康轻食'
  | (string & {});

export type IngredientCategory = 'main' | 'seasoning' | 'garnish';

export interface Ingredient {
  id: string;
  name: string;
  amount: number | string;
  unit: string;
  category: IngredientCategory;
  note?: string;
  checked?: boolean; // For pantry checklist
}

export interface CookingStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  durationMinutes?: number;
  heat?: '大火' | '中火' | '小火' | '微火' | '关火焖' | '烤箱预热/烘烤';
  tip?: string;
  photoUrl?: string;
  videoUrl?: string; // 步骤关键实拍小视频
}

export interface CookingReview {
  tastingNotes: string; // 口感与风味心得
  pitfallsAndLessons: string; // 避坑经验与复盘
  pairingSuggestions: string; // 搭配推荐 (饮品/主食)
  ratings: {
    taste: number; // 味道 1-5
    difficulty: number; // 难度 1-5
    reproducibility: number; // 翻牌率 1-5
    presentation: number; // 颜值 1-5
  };
  stickers: string[]; // 贴纸印章
  dinerFeedback?: string; // 亲友评价
  cookDate: string; // 烹饪手帐日期
}

export interface RecipeComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  ownerId?: string;       // User UID (for privacy isolation)
  authorName?: string;    // Author display name
  authorAvatar?: string;  // Author avatar
  isPublic?: boolean;     // Whether shared publicly on the Culinary Square
  likesCount?: number;    // Kudos/likes
  likedBy?: string[];     // Array of user UIDs who liked
  comments?: RecipeComment[]; // Comments & diner reviews
  originalSource?: {      // If forked/cloned from another cook
    recipeId: string;
    authorName: string;
  };
  title: string;
  subtitle: string;
  coverImage?: string;
  coverVideo?: string; // 菜谱封面或高光视频
  videoUrl?: string; // 完整烹饪过程视频
  category: RecipeCategory;
  subCategory?: string; // 细分类别（如：西式烘焙、中式糕点、港式甜品、台式甜品、日式和果子、清凉冰品等）
  cuisine: string;
  tags?: string[]; // 菜系与风味风格标签列表 (如：私房中式、麻辣鲜香、下饭、免烤箱)
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  baseServings: number;
  estimatedCalories?: number; // 整道菜预估总热量 (kcal)
  difficulty: number; // 1-5
  utensils: string[];
  ingredients: Ingredient[];
  steps: CookingStep[];
  review: CookingReview;
  galleryPhotos?: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  weatherStamp?: string;
}

export const PRESET_STICKERS = [
  '🍚 米饭杀手',
  '✨ 满分硬菜',
  '🌿 治愈系美味',
  '👶 阖家皆欢',
  '⏱️ 15分钟快手',
  '☕ 下午茶时光',
  '🎯 零失败配方',
  '💡 私房秘籍',
  '🍷 绝佳佐餐',
  '💪 低卡饱腹',
  '🥣 暖胃熨帖',
  '🔥 锅气十足'
];

export const PRESET_WEATHER = [
  '☀️ 晴暖好食',
  '🌧️ 雨天暖锅',
  '🍂 微风闲日',
  '🌙 深夜食堂',
  '❄️ 冬日慢炖',
  '🌸 春日尝鲜'
];
