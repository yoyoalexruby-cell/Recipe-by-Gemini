import { CookingRecord } from '../types/cookingLog';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { formatLocalDate } from './dateUtils';

const STORAGE_PREFIX = 'food_journal_cooking_records_v1_';

function getStorageKey(user: UserProfile | null): string {
  return `${STORAGE_PREFIX}${user ? user.uid : 'guest'}`;
}

/**
 * Seed initial records based on existing user recipes with cookDates
 */
function createInitialRecordsFromRecipes(recipes: Recipe[]): CookingRecord[] {
  const records: CookingRecord[] = [];
  
  recipes.forEach((recipe, idx) => {
    const rawDate = recipe.review?.cookDate || recipe.createdAt;
    const date = rawDate ? formatLocalDate(rawDate) : '';
    if (date) {
      records.push({
        id: `rec-seed-${recipe.id}-${idx}`,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        category: recipe.category,
        subCategory: recipe.subCategory,
        cookDate: date,
        coverImage: recipe.coverImage,
        notes: recipe.review?.tastingNotes || recipe.subtitle,
        rating: recipe.review?.ratings?.taste || 5,
        dinerFeedback: recipe.review?.dinerFeedback,
        servings: recipe.baseServings,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        weatherStamp: recipe.weatherStamp,
        createdAt: new Date().toISOString()
      });
    }
  });

  return records;
}

/**
 * Get all cooking records for current user
 */
export function getCookingRecords(user: UserProfile | null, recipes: Recipe[] = []): CookingRecord[] {
  try {
    const key = getStorageKey(user);
    const raw = localStorage.getItem(key);
    
    if (!raw) {
      // Seed from initial recipes if available
      const seeded = createInitialRecordsFromRecipes(recipes);
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }

    const parsed: CookingRecord[] = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Also ensure any newly added recipes with cookDate that aren't logged yet are synced
      const existingRecipeIdsAndDates = new Set(parsed.map(r => `${r.recipeId}_${r.cookDate}`));
      let changed = false;
      const merged = [...parsed];

      for (const recipe of recipes) {
        const rawDate = recipe.review?.cookDate || recipe.createdAt;
        const date = rawDate ? formatLocalDate(rawDate) : '';
        if (date && !existingRecipeIdsAndDates.has(`${recipe.id}_${date}`)) {
          merged.push({
            id: `rec-sync-${recipe.id}-${Date.now()}`,
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            category: recipe.category,
            subCategory: recipe.subCategory,
            cookDate: date,
            coverImage: recipe.coverImage,
            notes: recipe.review?.tastingNotes || recipe.subtitle,
            rating: recipe.review?.ratings?.taste || 5,
            dinerFeedback: recipe.review?.dinerFeedback,
            servings: recipe.baseServings,
            prepTimeMinutes: recipe.prepTimeMinutes,
            cookTimeMinutes: recipe.cookTimeMinutes,
            weatherStamp: recipe.weatherStamp,
            createdAt: new Date().toISOString()
          });
          changed = true;
        }
      }

      if (changed) {
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
      }

      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to load cooking records', e);
    return [];
  }
}

/**
 * Add or update a cooking record
 */
export function saveCookingRecord(
  record: CookingRecord, 
  user: UserProfile | null
): CookingRecord[] {
  const key = getStorageKey(user);
  const current = getCookingRecords(user);
  const normalizedRecord: CookingRecord = {
    ...record,
    cookDate: formatLocalDate(record.cookDate || new Date())
  };
  
  const existingIndex = current.findIndex(r => r.id === normalizedRecord.id);
  let updated: CookingRecord[];

  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = normalizedRecord;
  } else {
    updated = [normalizedRecord, ...current];
  }

  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('cooking-records-updated', { detail: updated }));
  return updated;
}

/**
 * Delete a cooking record
 */
export function deleteCookingRecord(
  recordId: string, 
  user: UserProfile | null
): CookingRecord[] {
  const key = getStorageKey(user);
  const current = getCookingRecords(user);
  const filtered = current.filter(r => r.id !== recordId);
  localStorage.setItem(key, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('cooking-records-updated', { detail: filtered }));
  return filtered;
}

/**
 * Quick mark a recipe cooked on a specific date
 */
export function markRecipeCookedOnDate(
  recipe: Recipe,
  dateStr: string, // 'YYYY-MM-DD'
  notes?: string,
  rating?: number,
  user: UserProfile | null = null,
  dinerFeedback?: string
): CookingRecord {
  const normalizedDate = formatLocalDate(dateStr || new Date());
  const newRecord: CookingRecord = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    recipeId: recipe.id,
    recipeTitle: recipe.title,
    category: recipe.category,
    subCategory: recipe.subCategory,
    cookDate: normalizedDate,
    coverImage: recipe.coverImage,
    notes: notes || recipe.review?.tastingNotes || `记录在 ${normalizedDate} 烹饪了这道美味`,
    rating: rating || recipe.review?.ratings?.taste || 5,
    dinerFeedback: dinerFeedback || recipe.review?.dinerFeedback,
    servings: recipe.baseServings,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    weatherStamp: recipe.weatherStamp,
    createdAt: new Date().toISOString()
  };

  saveCookingRecord(newRecord, user);
  return newRecord;
}

/**
 * Helper to group cooking records by date (YYYY-MM-DD)
 */
export function getCookingRecordsGroupedByDate(records: CookingRecord[]): Record<string, CookingRecord[]> {
  const map: Record<string, CookingRecord[]> = {};
  for (const r of records) {
    if (!map[r.cookDate]) {
      map[r.cookDate] = [];
    }
    map[r.cookDate].push(r);
  }
  return map;
}
