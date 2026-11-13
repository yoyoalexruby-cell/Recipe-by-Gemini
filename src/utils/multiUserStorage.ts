import { Recipe, RecipeComment } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { INITIAL_RECIPES } from '../data/initialRecipes';
import { OFFICIAL_SEED_RECIPES } from '../data/officialSquareSeed';
import { DEMO_COMMUNITY_USERS } from './authService';
import { getTakenDownItemIds } from './ugcModeration';
import { AVATAR_SVG_MAP } from './avatarGraphics';
import { formatLocalDate } from './dateUtils';

export const MASTER_RECIPES_KEY = 'food_journal_master_recipes_v2';
const DELETED_SEED_IDS_KEY = 'food_journal_deleted_seed_ids_v1';

function getDeletedSeedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_SEED_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveDeletedSeedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DELETED_SEED_IDS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

// Seed initial recipes with Official Editorial Chef dishes + community dishes across all 6 categories
function createInitialSeededRecipes(): Recipe[] {
  const communitySeeded: Recipe[] = INITIAL_RECIPES.map((recipe, index) => {
    const demoUser = DEMO_COMMUNITY_USERS[index % DEMO_COMMUNITY_USERS.length];
    return {
      ...recipe,
      ownerId: demoUser.uid,
      authorName: demoUser.displayName,
      authorAvatar: demoUser.avatarUrl,
      isPublic: true,
      likesCount: 20 + ((index * 7) % 35),
      likedBy: ['demo_user_1'],
      comments: [
        {
          id: `c_${index}`,
          authorName: '手帐食客',
          authorAvatar: AVATAR_SVG_MAP.chef_girl_apron,
          content: '步骤详尽，火候标注太清晰了！跟着手帐做一次成功！',
          createdAt: '2026-10-28',
        },
      ],
    };
  });
  // Also seed initial personal starter recipes for guest experience (marked guest so guest journal isn't blank on first launch)
  const guestStarter: Recipe[] = INITIAL_RECIPES.slice(0, 3).map((recipe) => ({
    ...recipe,
    id: `starter_${recipe.id}`,
    ownerId: 'guest',
    authorName: '本机主厨',
    isPublic: false,
  }));
  return [...OFFICIAL_SEED_RECIPES, ...communitySeeded, ...guestStarter];
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
    const deletedSeedIds = getDeletedSeedIds();

    if (raw === null) {
      const seeded = createInitialSeededRecipes().filter((s) => !deletedSeedIds.has(s.id));
      localStorage.setItem(MASTER_RECIPES_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      let changed = false;
      const existingIds = new Set(parsed.map((r: Recipe) => r.id));
      const seededList = createInitialSeededRecipes();
      const seededMap = new Map(seededList.map((s) => [s.id, s]));

      const updated = parsed.map((r: Recipe) => {
        let next = r;
        if (!next.subCategory) {
          changed = true;
          next = { ...next, subCategory: inferSubcategory(next) };
        }
        const seedMatch = seededMap.get(next.id);
        if (seedMatch && !next.coverImage && seedMatch.coverImage) {
          changed = true;
          next = { ...next, coverImage: seedMatch.coverImage };
        }
        return next;
      });

      // Only add newly introduced seed recipes that have NEVER been deleted by the user
      const newlyAdded: Recipe[] = [];
      for (const seeded of seededList) {
        if (!existingIds.has(seeded.id) && !deletedSeedIds.has(seeded.id)) {
          newlyAdded.push(seeded);
          changed = true;
        }
      }
      const mergedList = newlyAdded.length > 0 ? [...newlyAdded, ...updated] : updated;

      if (changed) {
        try {
          localStorage.setItem(MASTER_RECIPES_KEY, JSON.stringify(mergedList));
        } catch {
          // ignore write error during passive read
        }
      }
      return mergedList;
    }

    const seeded = createInitialSeededRecipes().filter((s) => !deletedSeedIds.has(s.id));
    localStorage.setItem(MASTER_RECIPES_KEY, JSON.stringify(seeded));
    return seeded;
  } catch (err) {
    console.error('Failed to read master recipes', err);
    return createInitialSeededRecipes();
  }
}

export function saveAllMasterRecipes(recipes: Recipe[]): boolean {
  try {
    localStorage.setItem(MASTER_RECIPES_KEY, JSON.stringify(recipes));
    // Trigger custom event so other components in same tab update synchronously
    window.dispatchEvent(new CustomEvent('recipes-updated', { detail: recipes }));
    return true;
  } catch (err: any) {
    console.error('Failed to save master recipes', err);
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;
    if (isQuota) {
      window.dispatchEvent(
        new CustomEvent('storage-quota-exceeded', {
          detail: {
            message: '本地浏览器文本存储空间 (localStorage) 已满，建议导出 JSON 备份或移除超大图文。视频已自动改用大容量 IndexedDB 存储。',
          },
        })
      );
    }
    return false;
  }
}

/**
 * Returns recipes belonging to a specific user (or guest recipes)
 */
export function getUserRecipes(currentUser: UserProfile | null): Recipe[] {
  const all = getAllMasterRecipes();
  if (!currentUser) {
    return all.filter((r) => !r.ownerId || r.ownerId === 'guest');
  }
  return all.filter((r) => r.ownerId === currentUser.uid);
}

/**
 * Returns all publicly shared recipes for the Culinary Square (excluding moderated/taken-down items)
 */
export function getPublicSquareRecipes(): Recipe[] {
  const all = getAllMasterRecipes();
  const takedownIds = new Set(getTakenDownItemIds());
  return all.filter((r) => r.isPublic === true && !takedownIds.has(r.id));
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
    updatedAt: formatLocalDate(),
  };

  // If user explicitly re-saves a seed ID, unmark it from deletedSeedIds
  const deletedSeedIds = getDeletedSeedIds();
  if (deletedSeedIds.has(enrichedRecipe.id)) {
    deletedSeedIds.delete(enrichedRecipe.id);
    saveDeletedSeedIds(deletedSeedIds);
  }

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
 * Delete a recipe (records seed IDs in deletedSeedIds so initial presets never resurrect)
 */
export function deleteUserRecipe(id: string, currentUser: UserProfile | null): void {
  const all = getAllMasterRecipes();
  const seededIds = new Set(createInitialSeededRecipes().map((s) => s.id));
  let didDelete = false;

  const filtered = all.filter((r) => {
    if (r.id !== id) return true;
    if (currentUser && r.ownerId && r.ownerId !== 'guest' && r.ownerId !== currentUser.uid) {
      return true; // Cannot delete another account's recipe
    }
    didDelete = true;
    return false;
  });

  if (didDelete && seededIds.has(id)) {
    const deletedSeedIds = getDeletedSeedIds();
    deletedSeedIds.add(id);
    saveDeletedSeedIds(deletedSeedIds);
  }

  saveAllMasterRecipes(filtered);
}

/**
 * Validate whether an untrusted JSON object conforms to minimal Recipe schema
 */
function isValidRecipeObject(obj: unknown): obj is Recipe {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    Array.isArray(candidate.ingredients) &&
    Array.isArray(candidate.steps)
  );
}

/**
 * Schema-validated import & merge by recipe ID into master storage (fixes BackupView legacy key bug)
 */
export function importRecipesToMasterStorage(
  payload: unknown,
  currentUser: UserProfile | null
): { importedCount: number; updatedCount: number; skippedCount: number; persisted: boolean } {
  let rawArray: unknown[] = [];
  if (Array.isArray(payload)) {
    rawArray = payload;
  } else if (payload && typeof payload === 'object') {
    const recObj = payload as Record<string, unknown>;
    if (Array.isArray(recObj.recipes)) {
      rawArray = recObj.recipes;
    } else if (Array.isArray(recObj.masterRecipes)) {
      rawArray = recObj.masterRecipes;
    }
  } else {
    throw new Error('备份文件结构无效：需为食谱数组或包含 recipes 字段的备份对象');
  }

  const all = getAllMasterRecipes();
  const byId = new Map<string, Recipe>(all.map((r) => [r.id, r]));
  const deletedSeedIds = getDeletedSeedIds();
  const targetOwnerId = currentUser ? currentUser.uid : 'guest';
  const targetAuthorName = currentUser ? currentUser.displayName : '本机主厨';

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of rawArray) {
    if (!isValidRecipeObject(item)) {
      skippedCount++;
      continue;
    }

    const normalized: Recipe = {
      ...item,
      subCategory: item.subCategory || inferSubcategory(item),
      ownerId: item.ownerId || targetOwnerId,
      authorName: item.authorName || targetAuthorName,
      createdAt: item.createdAt || formatLocalDate(),
      updatedAt: item.updatedAt || formatLocalDate(),
    };

    // Ensure if importing into logged-in account from an old single-user backup (no ownerId or guest), active user sees it
    if (currentUser && (!item.ownerId || item.ownerId === 'guest')) {
      normalized.ownerId = currentUser.uid;
      normalized.authorName = item.authorName || currentUser.displayName;
    }

    if (deletedSeedIds.has(normalized.id)) {
      deletedSeedIds.delete(normalized.id);
    }

    if (byId.has(normalized.id)) {
      byId.set(normalized.id, normalized);
      updatedCount++;
    } else {
      byId.set(normalized.id, normalized);
      importedCount++;
    }
  }

  saveDeletedSeedIds(deletedSeedIds);
  const merged = Array.from(byId.values());
  const persisted = saveAllMasterRecipes(merged);
  return { importedCount, updatedCount, skippedCount, persisted };
}

/**
 * Restore initial classic recipes into master storage & active user's journal
 */
export function resetToInitialPresets(currentUser: UserProfile | null): Recipe[] {
  try {
    localStorage.removeItem(DELETED_SEED_IDS_KEY);
  } catch {
    // ignore
  }

  const existing = getAllMasterRecipes();
  const seeded = createInitialSeededRecipes();
  const byId = new Map<string, Recipe>(existing.map((r) => [r.id, r]));

  for (const seed of seeded) {
    byId.set(seed.id, seed);
  }

  // Also ensure the current logged-in user gets the 3 classic starter recipes in their own journal if missing
  if (currentUser) {
    const today = formatLocalDate();
    for (const base of INITIAL_RECIPES.slice(0, 3)) {
      const userStarterId = `preset_${currentUser.uid}_${base.id}`;
      byId.set(userStarterId, {
        ...base,
        id: userStarterId,
        ownerId: currentUser.uid,
        authorName: currentUser.displayName,
        authorAvatar: currentUser.avatarUrl,
        isPublic: false,
        createdAt: today,
        updatedAt: today,
      });
    }
  }

  const finalMaster = Array.from(byId.values());
  saveAllMasterRecipes(finalMaster);
  return getUserRecipes(currentUser);
}

/**
 * Fork / Clone a recipe into the current user's journal
 */
export function cloneRecipeToMyJournal(sourceRecipe: Recipe, currentUser: UserProfile): Recipe {
  const all = getAllMasterRecipes();
  const today = formatLocalDate();

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
      authorName: sourceRecipe.authorName || '原作者',
    },
    createdAt: today,
    updatedAt: today,
  };

  saveAllMasterRecipes([cloned, ...all]);
  return cloned;
}

/**
 * Batch clone an entire Official Curated Menu into the current user's journal (skipping already-cloned source recipes)
 */
export function cloneMenuToMyJournal(menuRecipes: Recipe[], currentUser: UserProfile): number {
  if (menuRecipes.length === 0) return 0;
  const all = getAllMasterRecipes();
  const alreadyClonedSourceIds = new Set(
    all
      .filter((r) => r.ownerId === currentUser.uid && r.originalSource?.recipeId)
      .map((r) => r.originalSource!.recipeId)
  );

  const today = formatLocalDate();
  const newClones: Recipe[] = [];

  for (const sourceRecipe of menuRecipes) {
    if (sourceRecipe.ownerId === currentUser.uid || alreadyClonedSourceIds.has(sourceRecipe.id)) {
      continue;
    }
    const clonedId = 'recipe-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    newClones.push({
      ...sourceRecipe,
      id: clonedId,
      ownerId: currentUser.uid,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatarUrl,
      isPublic: false,
      likesCount: 0,
      likedBy: [],
      comments: [],
      originalSource: {
        recipeId: sourceRecipe.id,
        authorName: sourceRecipe.authorName || '食味手记官方主厨',
      },
      createdAt: today,
      updatedAt: today,
    });
  }

  if (newClones.length > 0) {
    saveAllMasterRecipes([...newClones, ...all]);
  }
  return newClones.length;
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
    likedBy: newLikedBy,
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
    createdAt: formatLocalDate(),
  };

  const updatedComments = [...(recipe.comments || []), newComment];
  const updatedRecipe: Recipe = {
    ...recipe,
    comments: updatedComments,
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
        authorAvatar: user.avatarUrl,
      };
    }
    return r;
  });

  if (migratedCount > 0) {
    saveAllMasterRecipes(updated);
  }
  return migratedCount;
}

const SQUARE_BOOKMARKS_KEY_PREFIX = 'food_journal_square_bookmarks_v1_';

function getBookmarkKey(currentUser: UserProfile | null): string {
  const uid = currentUser?.uid || 'guest';
  return `${SQUARE_BOOKMARKS_KEY_PREFIX}${uid}`;
}

/**
 * Get all recipe IDs bookmarked/favorited from the Food Square
 */
export function getBookmarkedSquareRecipeIds(currentUser: UserProfile | null): string[] {
  try {
    const raw = localStorage.getItem(getBookmarkKey(currentUser));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Check if a specific recipe is bookmarked from the Food Square
 */
export function isSquareRecipeBookmarked(recipeId: string, currentUser: UserProfile | null): boolean {
  const ids = getBookmarkedSquareRecipeIds(currentUser);
  return ids.includes(recipeId);
}

/**
 * Toggle bookmarking a recipe from the Food Square
 */
export function toggleBookmarkSquareRecipe(recipeId: string, currentUser: UserProfile | null): boolean {
  const ids = getBookmarkedSquareRecipeIds(currentUser);
  let updated: string[];
  const wasBookmarked = ids.includes(recipeId);
  if (wasBookmarked) {
    updated = ids.filter((id) => id !== recipeId);
  } else {
    updated = [recipeId, ...ids];
  }

  try {
    localStorage.setItem(getBookmarkKey(currentUser), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('square-bookmarks-updated', { detail: updated }));
  } catch (err) {
    console.error('Failed to save bookmark state', err);
  }

  return !wasBookmarked;
}

/**
 * Returns all public recipes currently bookmarked by the user
 */
export function getBookmarkedSquareRecipes(currentUser: UserProfile | null): Recipe[] {
  const bookmarkedIds = getBookmarkedSquareRecipeIds(currentUser);
  if (bookmarkedIds.length === 0) return [];
  const all = getAllMasterRecipes();
  return all.filter((r) => bookmarkedIds.includes(r.id));
}

/**
 * Returns all recipes collected from others in Food Square
 */
export function getSquareFavoritesAndClones(currentUser: UserProfile | null): Recipe[] {
  const all = getAllMasterRecipes();
  const bookmarkedIds = new Set(getBookmarkedSquareRecipeIds(currentUser));
  const uid = currentUser?.uid || 'guest';

  const resultMap = new Map<string, Recipe>();

  all.forEach((recipe) => {
    const isUserClone = Boolean(recipe.ownerId === uid && recipe.originalSource?.recipeId);
    const isBookmarked = bookmarkedIds.has(recipe.id);
    const isLikedFromOther = Boolean(
      currentUser && recipe.likedBy?.includes(currentUser.uid) && recipe.ownerId !== currentUser.uid
    );

    if (isUserClone || isBookmarked || isLikedFromOther) {
      resultMap.set(recipe.id, recipe);
    }
  });

  return Array.from(resultMap.values());
}

/**
 * Permanently purge all user-created recipes, bookmarks, and likes when an account is deleted
 */
export function purgeAllUserOwnedData(uid: string): void {
  if (!uid) return;
  try {
    const all = getAllMasterRecipes();
    const cleaned = all
      .filter((r) => r.ownerId !== uid)
      .map((r) => {
        if (r.likedBy?.includes(uid)) {
          const nextLikedBy = r.likedBy.filter((id) => id !== uid);
          return {
            ...r,
            likedBy: nextLikedBy,
            likesCount: Math.max(0, (r.likesCount || 1) - 1),
          };
        }
        return r;
      });
    saveAllMasterRecipes(cleaned);
    localStorage.removeItem(`${SQUARE_BOOKMARKS_KEY_PREFIX}${uid}`);
  } catch (err) {
    console.error('Failed to purge user owned data', err);
  }
}
