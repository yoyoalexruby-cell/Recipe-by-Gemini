import { CategoryInfo, SubCategoryInfo, CATEGORY_TAXONOMY, ALL_CATEGORIES_LIST } from '../types/categories';
import { UserProfile } from '../types/auth';

const STORAGE_PREFIX = 'food_journal_custom_taxonomy_v1_';

export interface CustomTaxonomyData {
  customCategories: CategoryInfo[];
  customSubcategories: Array<{
    parentCategoryId: string;
    sub: SubCategoryInfo;
  }>;
}

function getStorageKey(user: UserProfile | null): string {
  return `${STORAGE_PREFIX}${user ? user.uid : 'guest'}`;
}

export function getCustomTaxonomyData(user: UserProfile | null = null): CustomTaxonomyData {
  try {
    const raw = localStorage.getItem(getStorageKey(user));
    if (!raw) {
      return { customCategories: [], customSubcategories: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      customCategories: Array.isArray(parsed.customCategories) ? parsed.customCategories : [],
      customSubcategories: Array.isArray(parsed.customSubcategories) ? parsed.customSubcategories : []
    };
  } catch (e) {
    console.error('Failed to load custom taxonomy', e);
    return { customCategories: [], customSubcategories: [] };
  }
}

/**
 * Returns merged taxonomy combining default built-in categories and user-added custom ones
 */
export function getMergedTaxonomy(user: UserProfile | null = null): Record<string, CategoryInfo> {
  const customData = getCustomTaxonomyData(user);
  
  // Clone built-in defaults
  const merged: Record<string, CategoryInfo> = {};
  
  Object.entries(CATEGORY_TAXONOMY).forEach(([key, val]) => {
    merged[key] = {
      ...val,
      subcategories: [...val.subcategories]
    };
  });

  // 1. Add user-added subcategories to existing or new categories
  customData.customSubcategories.forEach(({ parentCategoryId, sub }) => {
    if (merged[parentCategoryId]) {
      const exists = merged[parentCategoryId].subcategories.some(s => s.id === sub.id);
      if (!exists) {
        merged[parentCategoryId].subcategories.push(sub);
      }
    }
  });

  // 2. Add user-added primary categories
  customData.customCategories.forEach(cat => {
    if (!merged[cat.id]) {
      merged[cat.id] = {
        ...cat,
        subcategories: [...cat.subcategories]
      };
    }
  });

  return merged;
}

/**
 * Returns the full list of category keys (defaults + custom)
 */
export function getAllMergedCategoriesList(user: UserProfile | null = null): string[] {
  const merged = getMergedTaxonomy(user);
  return Object.keys(merged);
}

/**
 * Add a new custom primary category
 */
export function addCustomCategory(
  name: string,
  icon: string,
  description: string,
  user: UserProfile | null = null
): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;

  const current = getCustomTaxonomyData(user);
  const merged = getMergedTaxonomy(user);

  if (merged[trimmed]) {
    alert(`菜谱名录「${trimmed}」已存在！`);
    return false;
  }

  const newCategory: CategoryInfo = {
    id: trimmed,
    label: trimmed,
    shortLabel: trimmed.slice(0, 4),
    icon: icon.trim() || '🍳',
    description: description.trim() || '自定义私房风味与烹饪名录',
    subcategories: [
      {
        id: `${trimmed}精选`,
        label: `${trimmed}精选`,
        desc: '私房甄选拿手做法',
        icon: icon.trim() || '✨'
      }
    ]
  };

  current.customCategories.push(newCategory);
  localStorage.setItem(getStorageKey(user), JSON.stringify(current));
  window.dispatchEvent(new CustomEvent('taxonomy-updated'));
  return true;
}

/**
 * Add a new custom subcategory under an existing category
 */
export function addCustomSubcategory(
  parentCategoryId: string,
  subName: string,
  desc: string,
  icon: string,
  user: UserProfile | null = null
): boolean {
  const trimmedSub = subName.trim();
  if (!trimmedSub) return false;

  const current = getCustomTaxonomyData(user);
  const merged = getMergedTaxonomy(user);

  if (!merged[parentCategoryId]) {
    alert(`父级分类「${parentCategoryId}」不存在！`);
    return false;
  }

  const existingSubs = merged[parentCategoryId].subcategories;
  if (existingSubs.some(s => s.id === trimmedSub)) {
    alert(`细分名录「${trimmedSub}」在「${parentCategoryId}」中已存在！`);
    return false;
  }

  const newSub: SubCategoryInfo = {
    id: trimmedSub,
    label: trimmedSub,
    desc: desc.trim() || '自定义细分特色',
    icon: icon.trim() || '🥢'
  };

  current.customSubcategories.push({
    parentCategoryId,
    sub: newSub
  });

  localStorage.setItem(getStorageKey(user), JSON.stringify(current));
  window.dispatchEvent(new CustomEvent('taxonomy-updated'));
  return true;
}

/**
 * Delete a custom primary category
 */
export function deleteCustomCategory(
  categoryId: string,
  user: UserProfile | null = null
): void {
  const current = getCustomTaxonomyData(user);
  current.customCategories = current.customCategories.filter(c => c.id !== categoryId);
  current.customSubcategories = current.customSubcategories.filter(s => s.parentCategoryId !== categoryId);
  localStorage.setItem(getStorageKey(user), JSON.stringify(current));
  window.dispatchEvent(new CustomEvent('taxonomy-updated'));
}

/**
 * Delete a custom subcategory
 */
export function deleteCustomSubcategory(
  parentCategoryId: string,
  subId: string,
  user: UserProfile | null = null
): void {
  const current = getCustomTaxonomyData(user);
  current.customSubcategories = current.customSubcategories.filter(
    s => !(s.parentCategoryId === parentCategoryId && s.sub.id === subId)
  );
  localStorage.setItem(getStorageKey(user), JSON.stringify(current));
  window.dispatchEvent(new CustomEvent('taxonomy-updated'));
}
