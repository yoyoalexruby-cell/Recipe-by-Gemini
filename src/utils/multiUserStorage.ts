import { Recipe, RecipeComment } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { INITIAL_RECIPES } from '../data/initialRecipes';
import { DEMO_COMMUNITY_USERS } from './authService';

const MASTER_RECIPES_KEY = 'food_journal_master_recipes_v2';

// Seed initial recipes with author profiles and public status
function createInitialSeededRecipes(): Recipe[] {
  return INITIAL_RECIPES.map((recipe, index) => {
    const demoUser = DEMO_COMMUNITY_USERS[index % DEMO_COMMUNITY_USERS.length];
    return {
      ...recipe,
      ownerId: demoUser.uid,
      authorName: demoUser.displayName,
      authorAvatar: demoUser.avatarUrl,
      isPublic: true,
      likesCount: 20 + (index * 7) % 35,
      likedBy: ['demo_user_1'],
      comments: [
        {
          id: `c_${index}`,
          authorName: '手帐食客',
          authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
          content: '步骤详尽，火候标注太清晰了！跟着手帐做一次成功！',
          createdAt: '2026-10-28'
        }
      ]
    };
  });
}

// Fallback subcategory deduction if an existing local record is missing it
function inferSubcategory(recipe: Recipe): string {
  if (recipe.subCategory) return recipe.subCategory;
  const title = (recipe.title + (recipe.cuisine || '')).toLowerCase();
  if (recipe.category === '烘焙甜点') {
    if (title.includes('港式') || title.includes('甘露') || title.includes('双皮奶')) return '港式甜品';
    if (title.includes('台式') || title.includes('芋圆') || title.includes('仙草')) return '台式甜品';
    if (title.includes('大福') || title.includes('和果子') || title.includes('铜锣烧') || title.includes('水信玄')) return '日式和果子';
    if (title.includes('冰淇淋') || title.includes('雪葩') || title.includes('刨冰') || title.includes('冰品')) return '清凉冰品';
    if (title.includes('桃酥') || title.includes('酥饼') || title.includes('青团') || title.includes('年糕')) return '中式糕点';
    return '西式烘焙';
  }
  if (recipe.category === '家常中餐') {
    if (title.includes('红烧') || title.includes('炖') || title.includes('焖')) return '慢炖红烧';
    if (title.includes('蒸') || title.includes('白灼')) return '清蒸白灼';
    if (title.includes('凉拌') || title.includes('冷碟')) return '凉拌冷碟';
    if (title.includes('煎') || title.includes('炸') || title.includes('贴')) return '香煎酥炸';
    if (title.includes('面') || title.includes('饭') || title.includes('饺')) return '面点主食';
    return '经典小炒';
  }
  if (recipe.category === '西式轻餐') {
    if (title.includes('意面') || title.includes('披萨')) return '意面披萨';
    if (title.includes('牛排') || title.includes('肉排') || title.includes('排')) return '牛排肉排';
    if (title.includes('沙拉')) return '轻食沙拉';
    if (title.includes('早午餐') || title.includes('蛋') || title.includes('三明治')) return '早午餐Brunch';
    return '焗烤烩饭';
  }
  if (recipe.category === '日韩和风') {
    if (title.includes('拉面') || title.includes('乌冬')) return '日式拉面面点';
    if (title.includes('寿司') || title.includes('刺身')) return '寿司刺身小食';
    if (title.includes('锅') || title.includes('部队')) return '韩式锅物料理';
    if (title.includes('烤肉') || title.includes('拌饭')) return '韩式拌饭烤肉';
    return '日式烧物丼饭';
  }
  if (recipe.category === '暖胃汤羹') {
    if (title.includes('浓汤')) return '西式浓汤';
    if (title.includes('滚') || title.includes('番茄蛋')) return '快手生滚汤';
    if (title.includes('盅') || title.includes('滋补')) return '滋补养生盅';
    if (title.includes('羹')) return '咸鲜羹汤';
    return '老火慢煲靓汤';
  }
  return '低卡减脂餐';
}

export function getAllMasterRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(MASTER_RECIPES_KEY);
    if (!raw) {
      const seeded = createInitialSeededRecipes();
      localStorage.setItem(MASTER_RECIPES_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all recipes have valid subCategory and ensure new seeded dessert recipes are present
      let changed = false;
      const existingIds = new Set(parsed.map((r: Recipe) => r.id));
      const seededList = createInitialSeededRecipes();
      
      const updated = parsed.map((r: Recipe) => {
        if (!r.subCategory) {
          changed = true;
          return { ...r, subCategory: inferSubcategory(r) };
        }
        return r;
      });

      // Merge newly seeded recipes if missing
      for (const seeded of seededList) {
        if (!existingIds.has(seeded.id)) {
          updated.push(seeded);
          changed = true;
        }
      }

      if (changed) {
        localStorage.setItem(MASTER_RECIPES_KEY, JSON.stringify(updated));
      }
      return updated;
    }
    const seeded = createInitialSeededRecipes();
    localStorage.setItem(MASTER_RECIPES_KEY, JSON.stringify(seeded));
    return seeded;
  } catch (err) {
    console.error('Failed to read master recipes', err);
    return createInitialSeededRecipes();
  }
}

export function saveAllMasterRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(MASTER_RECIPES_KEY, JSON.stringify(recipes));
    // Trigger custom event so other components update synchronously
    window.dispatchEvent(new CustomEvent('recipes-updated', { detail: recipes }));
  } catch (err) {
    console.error('Failed to save master recipes', err);
  }
}

/**
 * Returns recipes belonging to a specific user (or guest recipes)
 */
export function getUserRecipes(currentUser: UserProfile | null): Recipe[] {
  const all = getAllMasterRecipes();
  if (!currentUser) {
    // If not logged in, return recipes marked as guest or initial recipes
    return all.filter((r) => !r.ownerId || r.ownerId === 'guest');
  }
  return all.filter((r) => r.ownerId === currentUser.uid);
}

/**
 * Returns all publicly shared recipes for the Culinary Square
 */
export function getPublicSquareRecipes(): Recipe[] {
  const all = getAllMasterRecipes();
  return all.filter((r) => r.isPublic === true);
}

/**
 * Fetch a single recipe by id
 */
export function getRecipeById(id: string): Recipe | undefined {
  const all = getAllMasterRecipes();
  return all.find((r) => r.id === id);
}

/**
 * Save / Update a recipe for a user
 */
export function saveUserRecipe(recipe: Recipe, currentUser: UserProfile | null): Recipe {
  const all = getAllMasterRecipes();
  const ownerId = currentUser ? currentUser.uid : 'guest';
  const authorName = currentUser ? currentUser.displayName : '匿名大厨';
  const authorAvatar = currentUser ? currentUser.avatarUrl : undefined;

  const enrichedRecipe: Recipe = {
    ...recipe,
    ownerId: recipe.ownerId || ownerId,
    authorName: recipe.authorName || authorName,
    authorAvatar: recipe.authorAvatar || authorAvatar,
    isPublic: recipe.isPublic ?? false,
    likesCount: recipe.likesCount ?? 0,
    likedBy: recipe.likedBy || [],
    comments: recipe.comments || [],
    updatedAt: new Date().toISOString().slice(0, 10)
  };

  const index = all.findIndex((r) => r.id === recipe.id);
  let updatedList: Recipe[];
  if (index >= 0) {
    updatedList = [...all];
    updatedList[index] = enrichedRecipe;
  } else {
    updatedList = [enrichedRecipe, ...all];
  }

  saveAllMasterRecipes(updatedList);
  return enrichedRecipe;
}

/**
 * Delete a recipe
 */
export function deleteUserRecipe(id: string, currentUser: UserProfile | null): void {
  const all = getAllMasterRecipes();
  const filtered = all.filter((r) => {
    if (r.id !== id) return true;
    // Check permission: only owner can delete
    if (currentUser && r.ownerId && r.ownerId !== currentUser.uid) {
      return true; // Cannot delete other's recipe
    }
    return false;
  });
  saveAllMasterRecipes(filtered);
}

/**
 * Fork / Clone a recipe into the current user's journal
 */
export function cloneRecipeToMyJournal(sourceRecipe: Recipe, currentUser: UserProfile): Recipe {
  const all = getAllMasterRecipes();

  const clonedId = 'recipe-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cloned: Recipe = {
    ...sourceRecipe,
    id: clonedId,
    ownerId: currentUser.uid,
    authorName: currentUser.displayName,
    authorAvatar: currentUser.avatarUrl,
    isPublic: false, // Starts as private by default in their own book
    likesCount: 0,
    likedBy: [],
    comments: [],
    originalSource: {
      recipeId: sourceRecipe.id,
      authorName: sourceRecipe.authorName || '原作者'
    },
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10)
  };

  saveAllMasterRecipes([cloned, ...all]);
  return cloned;
}

/**
 * Toggle like / kudos on a recipe
 */
export function toggleLikeRecipe(recipeId: string, currentUser: UserProfile | null): { likesCount: number; isLiked: boolean } {
  const all = getAllMasterRecipes();
  const recipe = all.find((r) => r.id === recipeId);
  if (!recipe) return { likesCount: 0, isLiked: false };

  const uid = currentUser ? currentUser.uid : 'anon';
  const likedBy = recipe.likedBy || [];
  const alreadyLiked = likedBy.includes(uid);

  let newLikedBy: string[];
  let newLikesCount: number;

  if (alreadyLiked) {
    newLikedBy = likedBy.filter((u) => u !== uid);
    newLikesCount = Math.max(0, (recipe.likesCount || 1) - 1);
  } else {
    newLikedBy = [...likedBy, uid];
    newLikesCount = (recipe.likesCount || 0) + 1;
  }

  const updatedRecipe: Recipe = {
    ...recipe,
    likesCount: newLikesCount,
    likedBy: newLikedBy
  };

  const updatedAll = all.map((r) => (r.id === recipeId ? updatedRecipe : r));
  saveAllMasterRecipes(updatedAll);

  return { likesCount: newLikesCount, isLiked: !alreadyLiked };
}

/**
 * Add a comment or review to a recipe
 */
export function addCommentToRecipe(recipeId: string, authorName: string, authorAvatar: string | undefined, content: string): RecipeComment {
  const all = getAllMasterRecipes();
  const recipe = all.find((r) => r.id === recipeId);
  if (!recipe) throw new Error('Recipe not found');

  const newComment: RecipeComment = {
    id: 'cm_' + Date.now(),
    authorName,
    authorAvatar,
    content: content.trim(),
    createdAt: new Date().toISOString().slice(0, 10)
  };

  const updatedComments = [...(recipe.comments || []), newComment];
  const updatedRecipe: Recipe = {
    ...recipe,
    comments: updatedComments
  };

  const updatedAll = all.map((r) => (r.id === recipeId ? updatedRecipe : r));
  saveAllMasterRecipes(updatedAll);

  return newComment;
}

/**
 * Migrate guest/unowned recipes to a logged-in user
 */
export function migrateGuestRecipesToUser(user: UserProfile): number {
  const all = getAllMasterRecipes();
  let migratedCount = 0;

  const updated = all.map((r) => {
    if (!r.ownerId || r.ownerId === 'guest') {
      migratedCount++;
      return {
        ...r,
        ownerId: user.uid,
        authorName: user.displayName,
        authorAvatar: user.avatarUrl
      };
    }
    return r;
  });

  if (migratedCount > 0) {
    saveAllMasterRecipes(updated);
  }
  return migratedCount;
}
