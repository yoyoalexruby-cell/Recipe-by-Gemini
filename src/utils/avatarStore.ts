/**
 * Avatar & Skin Persistence & Points Redemption Store
 * Manages unlocked avatars, equipped frames, and extensible points redemption.
 */

const UNLOCKED_AVATARS_STORAGE_KEY = 'chef_unlocked_avatar_ids';
const EQUIPPED_FRAME_STORAGE_KEY = 'chef_equipped_avatar_frame';

// Default unlocked avatar IDs (all free common ones)
const DEFAULT_UNLOCKED_AVATARS = [
  'chef_boy_cap',
  'chef_girl_apron',
  'chef_mustache_gourmet',
  'chef_ramen_master',
  'chef_bistro_gentle',
  'chef_dimsum_auntie',
  'creature_cat_pan',
  'creature_shiba_baker',
  'creature_bear_stew',
  'creature_rabbit_tea',
  'creature_penguin_ice',
  'chibi_dumpling_joy',
  'chibi_matcha_mochi',
  'chibi_egg_toast_sunny',
  'chibi_croissant_butter',
  'chibi_onigiri_seaweed',
  'doll_base_boy_linen',
  'doll_base_girl_linen'
];

/**
 * Returns list of unlocked avatar IDs
 */
export function getUnlockedAvatarIds(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_AVATARS_STORAGE_KEY);
    if (!raw) return DEFAULT_UNLOCKED_AVATARS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Ensure default free ones are always present
      const combined = new Set([...DEFAULT_UNLOCKED_AVATARS, ...parsed]);
      return Array.from(combined);
    }
  } catch (e) {
    console.error('Failed to read unlocked avatars', e);
  }
  return DEFAULT_UNLOCKED_AVATARS;
}

/**
 * Checks if an avatar ID is unlocked
 */
export function isAvatarUnlocked(avatarId: string): boolean {
  const unlocked = getUnlockedAvatarIds();
  return unlocked.includes(avatarId);
}

/**
 * Unlocks an avatar using points / level progression
 */
export function unlockAvatar(avatarId: string): boolean {
  try {
    const unlocked = getUnlockedAvatarIds();
    if (!unlocked.includes(avatarId)) {
      const nextList = [...unlocked, avatarId];
      localStorage.setItem(UNLOCKED_AVATARS_STORAGE_KEY, JSON.stringify(nextList));
      window.dispatchEvent(new CustomEvent('avatars-updated', { detail: { unlocked: nextList } }));
      return true;
    }
    return true;
  } catch (e) {
    console.error('Failed to unlock avatar', e);
    return false;
  }
}

/**
 * Returns equipped avatar frame ID
 */
export function getEquippedFrameId(): string {
  try {
    return localStorage.getItem(EQUIPPED_FRAME_STORAGE_KEY) || 'frame_none';
  } catch (e) {
    return 'frame_none';
  }
}

/**
 * Sets equipped avatar frame ID
 */
export function setEquippedFrameId(frameId: string): void {
  try {
    localStorage.setItem(EQUIPPED_FRAME_STORAGE_KEY, frameId);
    window.dispatchEvent(new CustomEvent('avatar-frame-updated', { detail: { frameId } }));
  } catch (e) {
    console.error('Failed to set equipped frame', e);
  }
}
