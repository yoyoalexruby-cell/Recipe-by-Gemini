import { Recipe } from '../types/recipe';
import { INITIAL_RECIPES } from '../data/initialRecipes';

const STORAGE_KEY = 'food_journal_recipes_v1';
const PANTRY_CHECKED_KEY = 'food_journal_pantry_v1';

export function getStoredRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECIPES));
      return INITIAL_RECIPES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_RECIPES;
  } catch (err) {
    console.error('Failed to read recipes from localStorage', err);
    return INITIAL_RECIPES;
  }
}

export function saveStoredRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (err) {
    console.error('Failed to save recipes to localStorage', err);
  }
}

export function getPantryCheckedIds(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PANTRY_CHECKED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePantryCheckedIds(checked: Record<string, boolean>): void {
  try {
    localStorage.setItem(PANTRY_CHECKED_KEY, JSON.stringify(checked));
  } catch (err) {
    console.error('Failed to save pantry state', err);
  }
}

/**
 * Compresses an image file (e.g. from camera or phone) to lightweight base64
 * Max dimension 1200px, 0.82 quality, ensuring it stays compact in local storage
 */
export async function compressImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Downloads a backup of all recipes
 */
export function exportRecipesBackup(recipes: Recipe[]) {
  const jsonStr = JSON.stringify(recipes, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `食味手记_食谱备份_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
