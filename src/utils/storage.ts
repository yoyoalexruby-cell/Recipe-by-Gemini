import { Recipe } from '../types/recipe';
import { INITIAL_RECIPES } from '../data/initialRecipes';
import { formatLocalDate } from './dateUtils';

import { UserProfile } from '../types/auth';
import { getCurrentUser } from './authService';

const STORAGE_KEY = 'food_journal_master_recipes_v2';
export const MAX_RAW_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB raw upload safety cap

export function getPantryCheckedKey(user?: UserProfile | null): string {
  const uid = (user !== undefined ? user?.uid : getCurrentUser()?.uid) || 'guest';
  return `food_journal_pantry_v1_${uid}`;
}

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
    window.dispatchEvent(new CustomEvent('recipes-updated', { detail: recipes }));
  } catch (err) {
    console.error('Failed to save recipes to localStorage', err);
  }
}

export function getPantryCheckedIds(user?: UserProfile | null): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(getPantryCheckedKey(user));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePantryCheckedIds(checked: Record<string, boolean>, user?: UserProfile | null): void {
  try {
    localStorage.setItem(getPantryCheckedKey(user), JSON.stringify(checked));
  } catch (err) {
    console.error('Failed to save pantry state', err);
  }
}

/**
 * Compresses an image file (e.g. from camera or phone) to lightweight base64
 * Enforces 15MB raw upload limit and MIME validation before canvas decoding
 */
export async function compressImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  if (file.size > MAX_RAW_IMAGE_BYTES) {
    throw new Error('图片原图超过 15MB 上限，请先裁剪或选择更清晰轻量的照片');
  }
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('请选择有效的图片文件格式（JPG / PNG / WebP）');
  }

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
      img.onerror = () => reject(new Error('图片解码失败（HEIC 等特殊格式请先转为 JPG/PNG）'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('读取图片文件失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * Downloads a versioned 1.2.0 backup of recipes
 */
export function exportRecipesBackup(recipes: Recipe[]) {
  const payload = {
    version: '1.2.0',
    storageKey: STORAGE_KEY,
    exportedAt: new Date().toISOString(),
    totalRecipes: recipes.length,
    recipes,
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `食味手记_食谱备份_v1.2.0_${formatLocalDate()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

