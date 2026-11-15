/**
 * 全量手帐数据备份、跨设备账号归属重映射还原、与账号彻底清除服务
 *
 * 涵盖的数据域：
 * 1. 私房食谱主库 (food_journal_master_recipes_v2)
 * 2. 烹饪日历打卡记录 (food_journal_cooking_records_v1_<uid>)
 * 3. 自定义分类与二级名录 (food_journal_custom_taxonomy_v1_<uid>)
 * 4. 生鲜采购偏好与补货提醒 (food_journal_shopping_preference_v1_<uid>, food_journal_restock_alerts_v1_<uid>)
 * 5. 食味广场收藏夹 (food_journal_square_bookmarks_v1_<uid>)
 * 6. 厨神大赛个人参赛作品 (culinary_contest_submissions_v2)
 * 7. 主厨成长任务与每日签到 (culinary_claimed_tasks_v1, culinary_daily_checkin_v1)
 * 8. 解锁头像与装扮边框 (chef_unlocked_avatar_ids, chef_equipped_avatar_frame)
 * 9. 备菜勾选台状态 (food_journal_pantry_v1)
 * 10. IndexedDB 离线高清视频与大图二进制包 (culinary_media_db_v1, 可选嵌入)
 */

import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { CookingRecord } from '../types/cookingLog';
import { ContestSubmission } from '../types/contest';
import {
  MASTER_RECIPES_KEY,
  getAllMasterRecipes,
  getUserRecipes,
  saveAllMasterRecipes,
  getBookmarkedSquareRecipeIds,
  purgeAllUserOwnedData,
} from './multiUserStorage';
import { getCookingRecords } from './cookingLogStorage';
import { CustomTaxonomyData, getCustomTaxonomyData } from './taxonomyStorage';
import {
  UserShoppingPreference,
  RestockAlertReservation,
  getShoppingPreference,
  getRestockAlerts,
} from './shoppingStorage';
import { getContestSubmissions } from './contestStorage';
import { getClaimedTaskIds } from './membershipService';
import { getUnlockedAvatarIds, getEquippedFrameId } from './avatarStore';
import { getPantryCheckedIds } from './storage';
import {
  SerializedMediaEntry,
  collectRecipeMediaUris,
  exportMediaBlobsForUris,
  restoreMediaBlobsFromMap,
  deleteMultipleMediaFromIDB,
} from './mediaStorage';
import { OFFICIAL_ACCOUNT_UID } from '../data/officialSquareSeed';
import { formatLocalDate } from './dateUtils';

export const CURRENT_BACKUP_VERSION = '1.2.0';
const MAX_SUPPORTED_MAJOR = 2;
const SUPPORTED_VERSIONS = new Set(['1', '1.0', '1.1.0', '1.2', '1.2.0', '2', '2.0']);

export interface FullCulinaryBackupBundle {
  version: '1.2.0' | string;
  storageKey: typeof MASTER_RECIPES_KEY;
  app: 'culinary-journal';
  exportedAt: string;
  scope: 'full-user-state' | 'current-user';
  accountUid: string;
  accountDisplayName: string;
  includesMediaBlobs: boolean;
  totalRecipes: number;
  recipes: Recipe[];
  cookingRecords: CookingRecord[];
  customTaxonomy: CustomTaxonomyData;
  shoppingPreference: UserShoppingPreference;
  restockAlerts: RestockAlertReservation[];
  squareBookmarks: string[];
  contestSubmissions: ContestSubmission[];
  membership: {
    claimedTaskIds: string[];
    lastDailyCheckin: string | null;
  };
  avatars: {
    unlockedAvatarIds: string[];
    equippedFrameId: string;
  };
  pantryChecked: Record<string, boolean>;
  mediaBlobs?: Record<string, SerializedMediaEntry>;
}

export interface RestoreBackupResult {
  detectedVersion: string;
  addedRecipes: number;
  updatedRecipes: number;
  skippedRecipes: number;
  restoredLogs: number;
  restoredMediaCount: number;
  remappedOwnerCount: number;
  persisted: boolean;
}

export function validateSingleRecipeSchema(item: unknown): item is Recipe {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;

  if (typeof r.id !== 'string' || r.id.trim().length === 0) return false;
  if (typeof r.title !== 'string' || r.title.trim().length === 0) return false;
  if (!Array.isArray(r.ingredients) || !Array.isArray(r.steps)) return false;

  const ingredientsValid = r.ingredients.every(
    (ing) =>
      Boolean(ing) &&
      typeof ing === 'object' &&
      typeof (ing as Record<string, unknown>).name === 'string'
  );
  const stepsValid = r.steps.every(
    (st) =>
      Boolean(st) &&
      typeof st === 'object' &&
      (typeof (st as Record<string, unknown>).title === 'string' ||
        typeof (st as Record<string, unknown>).description === 'string')
  );

  return ingredientsValid && stepsValid;
}

/**
 * 构建当前用户的全量手帐状态快照（可选内嵌 IndexedDB 视频媒体包）
 */
export async function createFullBackupBundle(
  currentUser: UserProfile | null,
  options?: { includeMediaBlobs?: boolean }
): Promise<FullCulinaryBackupBundle> {
  const includeMediaBlobs = options?.includeMediaBlobs ?? true;
  const uid = currentUser?.uid || 'guest';
  const displayName = currentUser?.displayName || '本机主厨';
  const recipes = getUserRecipes(currentUser);
  const cookingRecords = getCookingRecords(currentUser, recipes);
  const customTaxonomy = getCustomTaxonomyData(currentUser);
  const shoppingPreference = getShoppingPreference(currentUser);
  const restockAlerts = getRestockAlerts(currentUser);
  const squareBookmarks = getBookmarkedSquareRecipeIds(currentUser);
  const contestSubmissions = getContestSubmissions().filter((s) => s.authorId === uid);
  const claimedTaskIds = getClaimedTaskIds();
  let lastDailyCheckin: string | null = null;
  try {
    lastDailyCheckin = localStorage.getItem('culinary_daily_checkin_v1');
  } catch {
    // ignore
  }

  let mediaBlobs: Record<string, SerializedMediaEntry> | undefined;
  if (includeMediaBlobs) {
    const uris = collectRecipeMediaUris([
      ...recipes,
      ...contestSubmissions.map((c) => c.recipeData).filter(Boolean),
    ]);
    if (uris.length > 0) {
      mediaBlobs = await exportMediaBlobsForUris(uris);
    }
  }

  return {
    version: CURRENT_BACKUP_VERSION,
    storageKey: MASTER_RECIPES_KEY,
    app: 'culinary-journal',
    exportedAt: new Date().toISOString(),
    scope: 'full-user-state',
    accountUid: uid,
    accountDisplayName: displayName,
    includesMediaBlobs: includeMediaBlobs,
    totalRecipes: recipes.length,
    recipes,
    cookingRecords,
    customTaxonomy,
    shoppingPreference,
    restockAlerts,
    squareBookmarks,
    contestSubmissions,
    membership: {
      claimedTaskIds,
      lastDailyCheckin,
    },
    avatars: {
      unlockedAvatarIds: getUnlockedAvatarIds(),
      equippedFrameId: getEquippedFrameId(),
    },
    pantryChecked: getPantryCheckedIds(),
    ...(mediaBlobs && Object.keys(mediaBlobs).length > 0 ? { mediaBlobs } : {}),
  };
}

/**
 * 一键生成并下载全量手帐备份文件
 */
export async function downloadFullBackupJson(
  currentUser: UserProfile | null,
  options?: { includeMediaBlobs?: boolean }
): Promise<{ recipeCount: number; mediaCount: number; cookingLogCount: number }> {
  const bundle = await createFullBackupBundle(currentUser, options);
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `食味手记_全量备份_v${CURRENT_BACKUP_VERSION}_${formatLocalDate()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return {
    recipeCount: bundle.recipes.length,
    mediaCount: bundle.mediaBlobs ? Object.keys(bundle.mediaBlobs).length : 0,
    cookingLogCount: bundle.cookingRecords.length,
  };
}

/**
 * 校验并还原全量备份 JSON（默认将跨设备备份中的旧账号 ownerId 重映射至当前激活账号，确保恢复后立即可见）
 */
export async function restoreFullBackupBundle(
  rawJson: unknown,
  currentUser: UserProfile | null,
  options?: { remapToCurrentAccount?: boolean }
): Promise<RestoreBackupResult> {
  const remapToCurrentAccount = options?.remapToCurrentAccount ?? true;
  const targetUid = currentUser ? currentUser.uid : 'guest';
  const targetAuthorName = currentUser ? currentUser.displayName : '本机主厨';
  const today = formatLocalDate();

  let detectedVersion = '1.0 (legacy-array)';
  let sourceAccountUid = '';
  let sourceDisplayName = '';
  let listCandidate: unknown[] | null = null;
  let envelope: Record<string, unknown> | null = null;

  if (Array.isArray(rawJson)) {
    listCandidate = rawJson;
  } else if (rawJson && typeof rawJson === 'object') {
    envelope = rawJson as Record<string, unknown>;
    const rawVersion =
      envelope.version !== undefined
        ? String(envelope.version)
        : envelope.schemaVersion !== undefined
        ? String(envelope.schemaVersion)
        : '';

    if (!rawVersion) {
      throw new Error('备份文件缺少 version 版本号字段，无法通过 Schema 校验。');
    }

    const majorNum = parseInt(rawVersion.split('.')[0] || '0', 10);
    if (
      Number.isNaN(majorNum) ||
      majorNum > MAX_SUPPORTED_MAJOR ||
      (!SUPPORTED_VERSIONS.has(rawVersion) && majorNum < 1)
    ) {
      throw new Error(
        `不支持的备份版本号 (version: ${rawVersion})，当前支持版本范围为 1.0 – ${CURRENT_BACKUP_VERSION}。`
      );
    }

    detectedVersion = rawVersion;
    sourceAccountUid = typeof envelope.accountUid === 'string' ? envelope.accountUid : '';
    sourceDisplayName =
      typeof envelope.accountDisplayName === 'string' ? envelope.accountDisplayName : '';

    if (Array.isArray(envelope.recipes)) {
      listCandidate = envelope.recipes;
    } else if (Array.isArray(envelope.masterRecipes)) {
      listCandidate = envelope.masterRecipes;
    }
  } else {
    throw new Error('备份文件格式错误：根节点必须是包含 version 与 recipes 字段的 JSON 对象或食谱数组。');
  }

  if (!listCandidate) {
    throw new Error('备份文件缺少有效的 recipes 食谱列表数组。');
  }

  const validRecipes: Recipe[] = [];
  let skippedRecipes = 0;
  for (const entry of listCandidate) {
    if (validateSingleRecipeSchema(entry)) {
      validRecipes.push(entry);
    } else {
      skippedRecipes++;
    }
  }

  // 1. 先恢复离线视频与大图媒体包到 IndexedDB，确保后续组件挂载时 idb:// 立即可读
  let restoredMediaCount = 0;
  if (envelope && envelope.mediaBlobs && typeof envelope.mediaBlobs === 'object') {
    restoredMediaCount = await restoreMediaBlobsFromMap(
      envelope.mediaBlobs as Record<string, SerializedMediaEntry>
    );
  }

  // 2. 合并菜谱并处理跨设备/跨账号 ownerId 归属重映射
  const currentMaster = getAllMasterRecipes();
  const masterMap = new Map<string, Recipe>(currentMaster.map((r) => [r.id, r]));
  let addedRecipes = 0;
  let updatedRecipes = 0;
  let remappedOwnerCount = 0;

  for (const item of validRecipes) {
    let nextOwnerId = item.ownerId || targetUid;
    let nextAuthorName = item.authorName || targetAuthorName;

    const isOfficialSeed = item.ownerId === OFFICIAL_ACCOUNT_UID;
    const isFromSourceAccount =
      !item.ownerId ||
      item.ownerId === 'guest' ||
      (sourceAccountUid && item.ownerId === sourceAccountUid);

    if (!isOfficialSeed && (remapToCurrentAccount || isFromSourceAccount)) {
      if (nextOwnerId !== targetUid) {
        remappedOwnerCount++;
      }
      nextOwnerId = targetUid;
      if (
        !item.authorName ||
        item.authorName === '本机主厨' ||
        item.authorName === '匿名大厨' ||
        (sourceDisplayName && item.authorName === sourceDisplayName)
      ) {
        nextAuthorName = targetAuthorName;
      }
    }

    const normalized: Recipe = {
      ...item,
      category: item.category || '家常中餐',
      ownerId: nextOwnerId,
      authorName: nextAuthorName,
      createdAt: item.createdAt || today,
      updatedAt: item.updatedAt || today,
    };

    if (masterMap.has(normalized.id)) {
      masterMap.set(normalized.id, normalized);
      updatedRecipes++;
    } else {
      masterMap.set(normalized.id, normalized);
      addedRecipes++;
    }
  }

  const persisted = saveAllMasterRecipes(Array.from(masterMap.values()));

  // 3. 恢复附属个人数据域（烹饪日历、自定义名录、采购清单、广场收藏、大赛作品、成长任务与头像）
  let restoredLogs = 0;
  if (envelope && persisted) {
    try {
      // 3a. 烹饪打卡记录
      if (Array.isArray(envelope.cookingRecords) && envelope.cookingRecords.length > 0) {
        const logKey = `food_journal_cooking_records_v1_${targetUid}`;
        const existingLogs = getCookingRecords(currentUser);
        const logMap = new Map<string, CookingRecord>(existingLogs.map((l) => [l.id, l]));
        for (const rawLog of envelope.cookingRecords as CookingRecord[]) {
          if (rawLog && typeof rawLog.id === 'string' && typeof rawLog.cookDate === 'string') {
            logMap.set(rawLog.id, {
              ...rawLog,
              cookDate: formatLocalDate(rawLog.cookDate),
            });
            restoredLogs++;
          }
        }
        const mergedLogs = Array.from(logMap.values());
        localStorage.setItem(logKey, JSON.stringify(mergedLogs));
        window.dispatchEvent(new CustomEvent('cooking-records-updated', { detail: mergedLogs }));
      }

      // 3b. 自定义分类与细分名录
      if (envelope.customTaxonomy && typeof envelope.customTaxonomy === 'object') {
        const tax = envelope.customTaxonomy as CustomTaxonomyData;
        const taxKey = `food_journal_custom_taxonomy_v1_${targetUid}`;
        const existingTax = getCustomTaxonomyData(currentUser);
        const catMap = new Map(existingTax.customCategories.map((c) => [c.id, c]));
        if (Array.isArray(tax.customCategories)) {
          for (const c of tax.customCategories) {
            if (c && typeof c.id === 'string') catMap.set(c.id, c);
          }
        }
        const subKeySet = new Set(
          existingTax.customSubcategories.map((s) => `${s.parentCategoryId}::${s.sub?.id}`)
        );
        const mergedSubs = [...existingTax.customSubcategories];
        if (Array.isArray(tax.customSubcategories)) {
          for (const s of tax.customSubcategories) {
            const k = `${s?.parentCategoryId}::${s?.sub?.id}`;
            if (s?.parentCategoryId && s?.sub?.id && !subKeySet.has(k)) {
              subKeySet.add(k);
              mergedSubs.push(s);
            }
          }
        }
        localStorage.setItem(
          taxKey,
          JSON.stringify({
            customCategories: Array.from(catMap.values()),
            customSubcategories: mergedSubs,
          })
        );
        window.dispatchEvent(new CustomEvent('taxonomy-updated'));
      }

      // 3c. 采购偏好与缺货预约提醒
      if (envelope.shoppingPreference && typeof envelope.shoppingPreference === 'object') {
        localStorage.setItem(
          `food_journal_shopping_preference_v1_${targetUid}`,
          JSON.stringify(envelope.shoppingPreference)
        );
      }
      if (Array.isArray(envelope.restockAlerts)) {
        const alertKey = `food_journal_restock_alerts_v1_${targetUid}`;
        const existingAlerts = getRestockAlerts(currentUser);
        const alertMap = new Map(existingAlerts.map((a) => [a.id, a]));
        for (const al of envelope.restockAlerts as RestockAlertReservation[]) {
          if (al && typeof al.id === 'string') alertMap.set(al.id, al);
        }
        localStorage.setItem(alertKey, JSON.stringify(Array.from(alertMap.values())));
      }

      // 3d. 广场收藏夹
      if (Array.isArray(envelope.squareBookmarks)) {
        const bmKey = `food_journal_square_bookmarks_v1_${targetUid}`;
        const existingBm = getBookmarkedSquareRecipeIds(currentUser);
        const mergedBm = Array.from(
          new Set([
            ...existingBm,
            ...(envelope.squareBookmarks as unknown[]).filter(
              (x): x is string => typeof x === 'string'
            ),
          ])
        );
        localStorage.setItem(bmKey, JSON.stringify(mergedBm));
        window.dispatchEvent(new CustomEvent('square-bookmarks-updated', { detail: mergedBm }));
      }

      // 3e. 厨神大赛参赛作品
      if (Array.isArray(envelope.contestSubmissions) && envelope.contestSubmissions.length > 0) {
        const currentSubs = getContestSubmissions();
        const subMap = new Map(currentSubs.map((s) => [s.id, s]));
        for (const sub of envelope.contestSubmissions as ContestSubmission[]) {
          if (sub && typeof sub.id === 'string') {
            subMap.set(sub.id, {
              ...sub,
              authorId: remapToCurrentAccount ? targetUid : sub.authorId,
              authorName: remapToCurrentAccount ? targetAuthorName : sub.authorName,
            });
          }
        }
        const nextSubs = Array.from(subMap.values());
        localStorage.setItem('culinary_contest_submissions_v2', JSON.stringify(nextSubs));
        window.dispatchEvent(new CustomEvent('contest-updated', { detail: nextSubs }));
      }

      // 3f. 成长任务与每日签到
      if (envelope.membership && typeof envelope.membership === 'object') {
        const mem = envelope.membership as {
          claimedTaskIds?: unknown[];
          lastDailyCheckin?: unknown;
        };
        if (Array.isArray(mem.claimedTaskIds)) {
          const mergedTasks = Array.from(
            new Set([
              ...getClaimedTaskIds(),
              ...mem.claimedTaskIds.filter((t): t is string => typeof t === 'string'),
            ])
          );
          localStorage.setItem('culinary_claimed_tasks_v1', JSON.stringify(mergedTasks));
        }
        if (typeof mem.lastDailyCheckin === 'string' && mem.lastDailyCheckin) {
          localStorage.setItem('culinary_daily_checkin_v1', mem.lastDailyCheckin);
        }
        window.dispatchEvent(new CustomEvent('membership-updated'));
      }

      // 3g. 解锁头像与装扮框
      if (envelope.avatars && typeof envelope.avatars === 'object') {
        const av = envelope.avatars as {
          unlockedAvatarIds?: unknown[];
          equippedFrameId?: unknown;
        };
        if (Array.isArray(av.unlockedAvatarIds)) {
          const mergedAv = Array.from(
            new Set([
              ...getUnlockedAvatarIds(),
              ...av.unlockedAvatarIds.filter((a): a is string => typeof a === 'string'),
            ])
          );
          localStorage.setItem('chef_unlocked_avatar_ids', JSON.stringify(mergedAv));
        }
        if (typeof av.equippedFrameId === 'string' && av.equippedFrameId) {
          localStorage.setItem('chef_equipped_avatar_frame', av.equippedFrameId);
        }
      }

      // 3h. 备菜勾选状态
      if (envelope.pantryChecked && typeof envelope.pantryChecked === 'object') {
        const mergedPantry = {
          ...getPantryCheckedIds(),
          ...(envelope.pantryChecked as Record<string, boolean>),
        };
        localStorage.setItem('food_journal_pantry_v1', JSON.stringify(mergedPantry));
      }
    } catch (auxErr) {
      console.warn('恢复附属手帐数据域时遇到容量或解析限制:', auxErr);
    }
  }

  return {
    detectedVersion,
    addedRecipes,
    updatedRecipes,
    skippedRecipes,
    restoredLogs,
    restoredMediaCount,
    remappedOwnerCount,
    persisted,
  };
}

/**
 * 彻底清除指定账号名下的全部本地与 IndexedDB 数据（符合 Apple App Store Guideline 5.1.1(v) 账号删除标准）
 */
export async function purgeAllUserDataCompletely(uid: string): Promise<void> {
  const targetUid = uid || 'guest';

  try {
    // 1. 先找出该用户所属食谱与大赛作品引用的全部 idb:// 离线视频/大图，不误删其他账号仍在引用的资源
    const allRecipes = getAllMasterRecipes();
    const userRecipes = allRecipes.filter((r) => r.ownerId === targetUid);
    const remainingRecipes = allRecipes.filter((r) => r.ownerId !== targetUid);

    const allContest = getContestSubmissions();
    const userContestRecipes = allContest
      .filter((s) => s.authorId === targetUid && s.recipeData)
      .map((s) => s.recipeData);
    const remainingContestRecipes = allContest
      .filter((s) => s.authorId !== targetUid && s.recipeData)
      .map((s) => s.recipeData);

    const candidateUris = collectRecipeMediaUris([...userRecipes, ...userContestRecipes]);
    if (candidateUris.length > 0) {
      const stillUsedUris = new Set(
        collectRecipeMediaUris([...remainingRecipes, ...remainingContestRecipes])
      );
      const urisToDelete = candidateUris.filter((u) => !stillUsedUris.has(u));
      if (urisToDelete.length > 0) {
        await deleteMultipleMediaFromIDB(urisToDelete);
      }
    }
  } catch (err) {
    console.warn('清理用户关联 IndexedDB 媒体时异常:', err);
  }

  // 2. 清理主菜谱库与广场收藏夹
  purgeAllUserOwnedData(targetUid);

  // 3. 清理按 <uid> 隔离的全部衍生存储键
  const scopedKeysToRemove = [
    `food_journal_cooking_records_v1_${targetUid}`,
    `food_journal_custom_taxonomy_v1_${targetUid}`,
    `food_journal_shopping_preference_v1_${targetUid}`,
    `food_journal_restock_alerts_v1_${targetUid}`,
    `food_journal_square_bookmarks_v1_${targetUid}`,
    `culinary_recipes_${targetUid}`,
  ];
  for (const key of scopedKeysToRemove) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  // 4. 清理厨神大赛中该用户的参赛作品与打分投票记录
  try {
    const rawContest = localStorage.getItem('culinary_contest_submissions_v2');
    if (rawContest) {
      const parsed: ContestSubmission[] = JSON.parse(rawContest);
      if (Array.isArray(parsed)) {
        const cleanedContest = parsed
          .filter((s) => s.authorId !== targetUid)
          .map((s) =>
            s.ratedBy?.includes(targetUid)
              ? {
                  ...s,
                  ratedBy: s.ratedBy.filter((id) => id !== targetUid),
                  voteCount: Math.max(0, (s.voteCount || 1) - 1),
                }
              : s
          );
        localStorage.setItem('culinary_contest_submissions_v2', JSON.stringify(cleanedContest));
        window.dispatchEvent(new CustomEvent('contest-updated', { detail: cleanedContest }));
      }
    }
  } catch {
    // ignore
  }

  // 5. 清理社区举报与拉黑关联记录、本机活跃任务/签到/头像装扮/GitHub Token
  const sessionBoundKeys = [
    'culinary_claimed_tasks_v1',
    'culinary_daily_checkin_v1',
    'chef_unlocked_avatar_ids',
    'chef_equipped_avatar_frame',
    'food_journal_pantry_v1',
    'food_journal_github_config_v1',
  ];
  for (const key of sessionBoundKeys) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  try {
    const rawReports = localStorage.getItem('culinary_reported_items_v1');
    if (rawReports) {
      const parsed = JSON.parse(rawReports);
      if (Array.isArray(parsed)) {
        localStorage.setItem(
          'culinary_reported_items_v1',
          JSON.stringify(parsed.filter((r: { authorId?: string }) => r?.authorId !== targetUid))
        );
      }
    }
  } catch {
    // ignore
  }
}
