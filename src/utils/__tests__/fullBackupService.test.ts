import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserProfile } from '../../types/auth';
import { Recipe } from '../../types/recipe';
import {
  CURRENT_BACKUP_VERSION,
  createFullBackupBundle,
  restoreFullBackupBundle,
  purgeAllUserDataCompletely,
} from '../fullBackupService';
import { MASTER_RECIPES_KEY, saveUserRecipeWithStatus } from '../multiUserStorage';
import { getGitHubConfig, saveGitHubConfig } from '../githubSync';
import { getClaimedTaskIds, claimTaskReward } from '../membershipService';
import { getPantryCheckedIds, savePantryCheckedIds } from '../storage';
import { getBlockedUserIds, blockUser, reportUGCContent, REPORTED_ITEMS_KEY } from '../ugcModeration';

const makeUser = (uid: string, displayName: string): UserProfile => ({
  uid,
  displayName,
  loginMethod: 'password',
  avatarUrl: '',
  createdAt: '2026-10-01',
});

const makeRecipe = (id: string, ownerId: string, title = '私房红烧肉'): Recipe => ({
  id,
  ownerId,
  authorName: 'TestChef',
  title,
  subtitle: '家常下饭美味',
  category: '家常中餐',
  cuisine: '本帮菜',
  prepTimeMinutes: 15,
  cookTimeMinutes: 45,
  baseServings: 2,
  difficulty: 3,
  utensils: ['炒锅'],
  ingredients: [
    { id: 'ing-1', name: '五花肉', amount: 500, unit: 'g', category: 'main' },
  ],
  steps: [
    { id: 'st-1', stepNumber: 1, title: '焯水', description: '冷水下锅焯水', durationMinutes: 5 },
  ],
  review: {
    tastingNotes: '肥而不腻',
    pitfallsAndLessons: '炒糖色注意小火',
    pairingSuggestions: '白米饭',
    ratings: { taste: 5, difficulty: 3, reproducibility: 5, presentation: 4 },
    stickers: [],
    cookDate: '2026-10-01',
  },
  tags: ['家常'],
  isFavorite: false,
  isPublic: false,
  createdAt: '2026-10-01',
  updatedAt: '2026-10-01',
});

describe('fullBackupService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips personal data domains and defaults includeMediaBlobs to false', async () => {
    const userA = makeUser('usr_a', 'Alice');
    saveUserRecipeWithStatus(makeRecipe('rec_a1', userA.uid, '蒜蓉油麦菜'), userA);
    claimTaskReward('task_publish_1', userA);
    savePantryCheckedIds({ ing_1: true }, userA);
    localStorage.setItem(
      `food_journal_cooking_records_v1_${userA.uid}`,
      JSON.stringify([
        {
          id: 'log_1',
          recipeId: 'rec_a1',
          recipeTitle: '蒜蓉油麦菜',
          cookDate: '2026-10-01',
          createdAt: '2026-10-01T12:00:00Z',
        },
      ])
    );

    const bundle = await createFullBackupBundle(userA);
    expect(bundle.version).toBe(CURRENT_BACKUP_VERSION);
    expect(bundle.includesMediaBlobs).toBe(false);
    expect(bundle.recipes.some((r) => r.id === 'rec_a1')).toBe(true);
    expect(bundle.cookingRecords.some((l) => l.id === 'log_1')).toBe(true);
    expect(bundle.membership.claimedTaskIds).toContain('task_publish_1');
    expect(bundle.pantryChecked.ing_1).toBe(true);

    // Wipe storage and restore on a new device/account (cross-device ownerId remap)
    localStorage.clear();
    const userNewDevice = makeUser('usr_new_device', 'Alice New');
    const result = await restoreFullBackupBundle(bundle, userNewDevice);

    expect(result.persisted).toBe(true);
    expect(result.domainStatus.failedDomains).toEqual([]);
    expect(result.remappedOwnerCount).toBeGreaterThanOrEqual(1);

    const masterRaw = JSON.parse(localStorage.getItem(MASTER_RECIPES_KEY) || '[]') as Recipe[];
    const restoredRecipe = masterRaw.find((r) => r.id === 'rec_a1');
    expect(restoredRecipe?.ownerId).toBe('usr_new_device');
    expect(getClaimedTaskIds(userNewDevice)).toContain('task_publish_1');
    expect(getPantryCheckedIds(userNewDevice).ing_1).toBe(true);
  });

  it('supports legacy v1 recipe arrays and rejects invalid schema versions', async () => {
    const user = makeUser('usr_legacy', 'LegacyUser');
    const legacyArray = [makeRecipe('rec_v1', 'old_device_uid', 'V1番茄炒蛋')];

    const res = await restoreFullBackupBundle(legacyArray, user);
    expect(res.persisted).toBe(true);
    expect(res.detectedVersion).toContain('1.0');
    expect(res.addedRecipes).toBe(1);

    await expect(
      restoreFullBackupBundle({ recipes: [] }, user)
    ).rejects.toThrow();

    await expect(
      restoreFullBackupBundle({ version: '99.0.0', recipes: [] }, user)
    ).rejects.toThrow();
  });

  it('reports failedDomains accurately when auxiliary storage quota is exceeded', async () => {
    const user = makeUser('usr_quota', 'QuotaChef');
    const bundle = await createFullBackupBundle(user);
    bundle.pantryChecked = { key1: true };

    const originalSetItem = Storage.prototype.setItem;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string
    ) {
      if (key.startsWith('food_journal_pantry_v1_')) {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      return originalSetItem.call(this, key, value);
    });

    const result = await restoreFullBackupBundle(bundle, user);
    expect(result.persisted).toBe(true);
    expect(result.domainStatus.pantryChecked).toBe(false);
    expect(result.domainStatus.failedDomains).toContain('备菜清单勾选状态');

    setItemSpy.mockRestore();
  });

  it('isolates per-UID settings and purges only the target user data on account deletion', async () => {
    const userA = makeUser('usr_purge_a', 'User A');
    const userB = makeUser('usr_keep_b', 'User B');

    saveUserRecipeWithStatus(makeRecipe('rec_purge_a', userA.uid, 'A的菜'), userA);
    saveUserRecipeWithStatus(makeRecipe('rec_keep_b', userB.uid, 'B的菜'), userB);

    saveGitHubConfig(
      { owner: 'alice', repo: 'a-repo', branch: 'main', token: 'pat_a', autoSync: true },
      userA
    );
    saveGitHubConfig(
      { owner: 'bob', repo: 'b-repo', branch: 'main', token: 'pat_b', autoSync: true },
      userB
    );

    blockUser('bad_author_1', 'Spammer', userA);
    blockUser('bad_author_2', 'Troll', userB);

    reportUGCContent({
      targetId: 'rec_x',
      targetType: 'recipe',
      targetTitle: 'Title',
      authorId: 'other_author',
      authorName: 'Other',
      reason: 'Spam',
      reporterId: userA.uid,
    });
    reportUGCContent({
      targetId: 'rec_y',
      targetType: 'recipe',
      targetTitle: 'Title2',
      authorId: 'other_author2',
      authorName: 'Other2',
      reason: 'Spam',
      reporterId: userB.uid,
    });

    localStorage.setItem(
      'culinary_support_tickets_v1',
      JSON.stringify([
        { id: 't1', uid: userA.uid, email: 'a@test.com', content: 'Help A' },
        { id: 't2', uid: userB.uid, email: 'b@test.com', content: 'Help B' },
      ])
    );

    await purgeAllUserDataCompletely(userA.uid);

    // User A's config & recipes & reports & tickets are gone
    expect(getGitHubConfig(userA).token).toBe('');
    expect(getBlockedUserIds(userA)).toEqual([]);
    const masterAfter = JSON.parse(localStorage.getItem(MASTER_RECIPES_KEY) || '[]') as Recipe[];
    expect(masterAfter.some((r) => r.id === 'rec_purge_a')).toBe(false);
    expect(masterAfter.some((r) => r.id === 'rec_keep_b')).toBe(true);

    // User B's GitHub PAT, blocked list, report, and support ticket remain untouched
    expect(getGitHubConfig(userB).token).toBe('pat_b');
    expect(getBlockedUserIds(userB)).toEqual(['bad_author_2']);
    const remainingReports = JSON.parse(localStorage.getItem(REPORTED_ITEMS_KEY) || '[]') as Array<{ reporterId?: string }>;
    expect(remainingReports).toHaveLength(1);
    expect(remainingReports[0].reporterId).toBe(userB.uid);

    const remainingTickets = JSON.parse(localStorage.getItem('culinary_support_tickets_v1') || '[]') as Array<{ uid?: string }>;
    expect(remainingTickets).toHaveLength(1);
    expect(remainingTickets[0].uid).toBe(userB.uid);
  });
});
