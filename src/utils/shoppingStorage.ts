import { Ingredient } from '../types/recipe';
import { UserProfile } from '../types/auth';

export type ShoppingCategory = 'meat' | 'veggie' | 'seasoning' | 'staple' | 'supplies';

export interface ShoppingCategoryInfo {
  id: ShoppingCategory;
  name: string;
  icon: string;
  description: string;
}

export const SHOPPING_CATEGORIES: Record<ShoppingCategory, ShoppingCategoryInfo> = {
  veggie: {
    id: 'veggie',
    name: '新鲜果蔬',
    icon: '🥬',
    description: '绿叶蔬菜、葱姜蒜椒、根茎瓜茄与鲜菌菇'
  },
  meat: {
    id: 'meat',
    name: '肉禽水产',
    icon: '🥩',
    description: '鲜肉禽蛋、海鲜鱼贝与特色冷鲜'
  },
  seasoning: {
    id: 'seasoning',
    name: '调味酱料',
    icon: '🧂',
    description: '生抽老抽、辛香调味粉、料酒香醋与特制酱汁'
  },
  staple: {
    id: 'staple',
    name: '粮油干货',
    icon: '🌾',
    description: '优质大米、面粉杂粮、食用植物油与南北干货'
  },
  supplies: {
    id: 'supplies',
    name: '厨用耗材',
    icon: '🍳',
    description: '吸油纸、烘焙纸、保鲜膜与厨房日常消耗品'
  }
};

export interface UserShoppingPreference {
  platform: 'box' | 'jd' | 'dingdong' | 'sams' | 'meituan' | 'tmall' | 'market';
  platformName: string;
  preferredTimeWindow: string; // e.g. '17:00 - 18:30 (傍晚下班达)'
  qualityPreference: string[]; // e.g. ['优先有机认证/绿色蔬菜', '谷饲纯鲜/无抗生肉']
  notifyOnRestock: boolean;
  notificationChannel: 'in-app' | 'browser' | 'calendar';
}

export const DEFAULT_SHOPPING_PREFERENCE: UserShoppingPreference = {
  platform: 'box',
  platformName: '盒马鲜生 (最快30分钟达)',
  preferredTimeWindow: '17:00 - 18:30 (傍晚下班前送达)',
  qualityPreference: ['优先有机认证/绿色蔬菜', '纯鲜无抗肉品'],
  notifyOnRestock: true,
  notificationChannel: 'calendar'
};

export interface RestockAlertReservation {
  id: string;
  recipeId: string;
  recipeTitle: string;
  ingredientName: string;
  amount: string;
  targetDate: string; // YYYY-MM-DD
  preference: UserShoppingPreference;
  status: 'pending' | 'notified' | 'fulfilled';
  createdAt: string;
}

const PREF_STORAGE_KEY = 'food_journal_shopping_preference_v1';
const ALERTS_STORAGE_KEY = 'food_journal_restock_alerts_v1';

// Load User Purchase Preference
export function getShoppingPreference(user?: UserProfile | null): UserShoppingPreference {
  try {
    const key = `${PREF_STORAGE_KEY}_${user ? user.uid : 'guest'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_SHOPPING_PREFERENCE;
    return { ...DEFAULT_SHOPPING_PREFERENCE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load shopping preference', e);
    return DEFAULT_SHOPPING_PREFERENCE;
  }
}

// Save User Purchase Preference
export function saveShoppingPreference(
  pref: UserShoppingPreference,
  user?: UserProfile | null
): void {
  try {
    const key = `${PREF_STORAGE_KEY}_${user ? user.uid : 'guest'}`;
    localStorage.setItem(key, JSON.stringify(pref));
    window.dispatchEvent(new CustomEvent('shopping-preference-updated', { detail: pref }));
  } catch (e) {
    console.error('Failed to save shopping preference', e);
  }
}

// Load Restock Alert Reservations
export function getRestockAlerts(user?: UserProfile | null): RestockAlertReservation[] {
  try {
    const key = `${ALERTS_STORAGE_KEY}_${user ? user.uid : 'guest'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load restock alerts', e);
    return [];
  }
}

// Add a Restock Alert Reservation
export function addRestockAlert(
  reservation: Omit<RestockAlertReservation, 'id' | 'createdAt' | 'status'>,
  user?: UserProfile | null
): RestockAlertReservation {
  const current = getRestockAlerts(user);
  const newAlert: RestockAlertReservation = {
    ...reservation,
    id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const updated = [newAlert, ...current];
  const key = `${ALERTS_STORAGE_KEY}_${user ? user.uid : 'guest'}`;
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('restock-alerts-updated', { detail: updated }));
  return newAlert;
}

// Remove or fulfill Restock Alert
export function removeRestockAlert(id: string, user?: UserProfile | null): void {
  const current = getRestockAlerts(user);
  const updated = current.filter(a => a.id !== id);
  const key = `${ALERTS_STORAGE_KEY}_${user ? user.uid : 'guest'}`;
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('restock-alerts-updated', { detail: updated }));
}

/**
 * Intelligent categorization of any Chinese ingredient name into supermarket aisles
 */
export function classifyIngredientToAisle(
  name: string,
  categoryHint?: 'main' | 'seasoning' | 'garnish'
): ShoppingCategory {
  const lower = name.toLowerCase().trim();

  // 1. Supplies & Cookware
  if (/吸油纸|保鲜膜|铝箔|锡纸|油纸|手套|签子|烤盘垫|牙签|滤纸|厨房纸/.test(lower)) {
    return 'supplies';
  }

  // 2. Meat, Seafood, Poultry & Eggs
  if (/肉|牛|羊|猪|鸡|鸭|鹅|虾|蟹|鱼|贝|蛤|蛎|螺|鱿|墨鱼|鳗|排骨|五花|里脊|肉馅|肉糜|鸡翅|鸡爪|蛋|松花蛋|培根|火腿|腊肉|香肠|肥牛|牛腩|羊排|生蚝/.test(lower)) {
    return 'meat';
  }

  // 3. Vegetables, Greens, Mushrooms & Fresh Herbs
  if (/葱|蒜|姜|椒|生菜|菠菜|油菜|白菜|芥蓝|西兰花|花菜|胡萝卜|萝卜|土豆|西红柿|番茄|洋葱|藕|笋|黄瓜|苦瓜|丝瓜|冬瓜|南瓜|豆角|青豆|荷兰豆|菇|木耳|银耳|豆腐|豆皮|豆干|玉米|茄子|香菜|芹菜|韭菜|薄荷|罗勒|迷迭香|柠檬/.test(lower)) {
    return 'veggie';
  }

  // 4. Seasonings, Sauces, Spices
  if (/油|抽|酱|醋|盐|糖|粉|料酒|花椒|八角|桂皮|香叶|孜然|咖喱|淀粉|生粉|鸡精|味精|高汤|胡椒|番茄酱|芝麻酱|花生酱|辣椒酱|豆瓣酱|黄豆酱|甜面酱|蜂蜜|炼乳|香草|酵母|小苏打|泡打粉|可可粉|抹茶粉/.test(lower)) {
    if (/米|面粉|挂面|大米|糯米|意面|通心粉/.test(lower)) {
      return 'staple';
    }
    return 'seasoning';
  }

  // 5. Staple Grains, Dry goods
  if (/米|面|粉|粮|杂粮|麦片|燕麦|糯米|腐竹|粉丝|粉条|干香菇|紫菜|虾皮|花生|芝麻|核桃|腰果|红豆|绿豆|黄豆/.test(lower)) {
    return 'staple';
  }

  // Fallback by original ingredient category
  if (categoryHint === 'seasoning') return 'seasoning';
  if (categoryHint === 'garnish') return 'veggie';
  return 'veggie';
}

/**
 * Generate platform direct shopping link based on user preference
 */
export function getPlatformSearchUrl(
  ingredientName: string,
  platform: UserShoppingPreference['platform'] = 'box'
): string {
  const cleanName = ingredientName.replace(/\(.*?\)|（.*?）/g, '').trim();

  switch (platform) {
    case 'box':
      return `https://search.jd.com/Search?keyword=${encodeURIComponent(cleanName + ' 盒马')}&enc=utf-8`;
    case 'jd':
      return `https://search.jd.com/Search?keyword=${encodeURIComponent(cleanName + ' 生鲜')}&enc=utf-8`;
    case 'tmall':
      return `https://s.taobao.com/search?q=${encodeURIComponent(cleanName + ' 天猫超市')}`;
    case 'dingdong':
      return `https://s.taobao.com/search?q=${encodeURIComponent(cleanName + ' 叮咚买菜生鲜')}`;
    case 'sams':
      return `https://search.jd.com/Search?keyword=${encodeURIComponent(cleanName + ' 山姆会员商店')}&enc=utf-8`;
    case 'meituan':
      return `https://s.taobao.com/search?q=${encodeURIComponent(cleanName + ' 小象超市生鲜')}`;
    case 'market':
    default:
      return `https://s.taobao.com/search?q=${encodeURIComponent(cleanName + ' 优质生鲜')}`;
  }
}
