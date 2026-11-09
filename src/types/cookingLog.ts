import { RecipeCategory } from './recipe';

export interface CookingRecord {
  id: string;
  recipeId: string;
  recipeTitle: string;
  category: RecipeCategory;
  subCategory?: string;
  cookDate: string; // 'YYYY-MM-DD'
  coverImage?: string;
  notes?: string; // 烹饪心得 / 风味复盘 / 记忆点
  rating?: number; // 发挥星级 1-5
  dinerFeedback?: string; // 食客评价
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  weatherStamp?: string;
  photoUrl?: string; // 当天实拍
  createdAt: string;
}

export interface DayCulinarySummary {
  date: string; // 'YYYY-MM-DD'
  records: CookingRecord[];
  totalDishes: number;
}
