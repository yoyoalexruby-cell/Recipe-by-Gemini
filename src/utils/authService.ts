import { UserProfile, LoginMethod } from '../types/auth';
import { AVATAR_SVG_MAP } from './avatarGraphics';
import { OFFICIAL_EDITORIAL_USER } from '../data/officialSquareSeed';

const CURRENT_USER_KEY = 'food_journal_auth_user_v1';
const REGISTERED_USERS_KEY = 'food_journal_registered_users_v1';

// Seed demo users for the public culinary square
export const DEMO_COMMUNITY_USERS: UserProfile[] = [
  {
    uid: 'user-lin',
    displayName: '阿林私房菜',
    avatarUrl: AVATAR_SVG_MAP.chef_boy_cap,
    loginMethod: 'google',
    bio: '专注江浙传统慢炖浓油赤酱，用镜头记录烟火气。',
    createdAt: '2026-10-10'
  },
  {
    uid: 'user-momo',
    displayName: 'Momo烘焙日记',
    avatarUrl: AVATAR_SVG_MAP.chef_girl_apron,
    loginMethod: 'wechat',
    bio: '日式洋果子与治愈系甜品爱好者，每周出炉两次。',
    createdAt: '2026-10-12'
  },
  {
    uid: 'user-chef-chen',
    displayName: '陈主厨的深夜轻餐',
    avatarUrl: AVATAR_SVG_MAP.chef_mustache_gourmet,
    loginMethod: 'phone',
    bio: '15分钟快手西餐与意式面点，一个人也要好好吃饭。',
    createdAt: '2026-10-15'
  }
];

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get current user', err);
    return null;
  }
}

export function saveCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    // Dispatch storage event for listeners
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: user }));
  } catch (err) {
    console.error('Failed to save current user', err);
  }
}

/**
 * Switch into the Official Editorial Chef Account (Operator Console)
 */
export function loginAsOfficialEditorial(passcode: string): UserProfile {
  const clean = passcode.trim();
  if (clean !== 'Official2026!' && clean !== '8888') {
    throw new Error('官方运营口令不正确（默认口令：Official2026! 或 8888） / Invalid operator passcode');
  }
  saveCurrentUser(OFFICIAL_EDITORIAL_USER);
  return OFFICIAL_EDITORIAL_USER;
}

// Get all locally registered accounts (pre-seeded with official App Review demo account & Official Editorial Chef)
function getRegisteredUsers(): Record<string, { user: UserProfile; passwordHash: string }> {
  const defaultDemoKey = 'demo_cook@culinaryjournal.app';
  const defaultDemoEntry = {
    user: {
      uid: 'usr_apple_reviewer_demo',
      displayName: 'Chef Reviewer',
      username: 'demo_cook@culinaryjournal.app',
      email: 'demo_cook@culinaryjournal.app',
      loginMethod: 'password' as LoginMethod,
      avatarUrl: AVATAR_SVG_MAP.chef_boy_cap,
      bio: 'Home cooking enthusiast exploring cozy culinary recipes.',
      createdAt: '2026-10-01'
    },
    passwordHash: btoa('Cook2026!')
  };

  const officialKey = 'official@culinaryjournal.app';
  const officialEntry = {
    user: OFFICIAL_EDITORIAL_USER,
    passwordHash: btoa('Official2026!')
  };

  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed[defaultDemoKey]) {
      parsed[defaultDemoKey] = defaultDemoEntry;
    }
    if (!parsed[officialKey]) {
      parsed[officialKey] = officialEntry;
    }
    return parsed;
  } catch {
    return {
      [defaultDemoKey]: defaultDemoEntry,
      [officialKey]: officialEntry
    };
  }
}

function saveRegisteredUsers(users: Record<string, { user: UserProfile; passwordHash: string }>): void {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save registered users', err);
  }
}

function pickLocalAvatarForSeed(seed: string): string {
  const avatarPool = [
    AVATAR_SVG_MAP.chef_boy_cap,
    AVATAR_SVG_MAP.chef_girl_apron,
    AVATAR_SVG_MAP.chef_mustache_gourmet
  ].filter(Boolean);
  if (avatarPool.length === 0) return '';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return avatarPool[hash % avatarPool.length];
}

/**
 * Register with Username & Password
 */
export function registerWithPassword(username: string, password: string, email?: string): UserProfile {
  const users = getRegisteredUsers();
  const key = username.toLowerCase().trim();
  
  if (users[key]) {
    throw new Error('该账号已被注册，请直接登录或更换用户名 / Account already exists');
  }

  const uid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cleanName = username.includes('@') ? username.split('@')[0] : username.trim();
  const newUser: UserProfile = {
    uid,
    displayName: cleanName || '美食手帐家',
    username: username.trim(),
    email: email?.trim() || (username.includes('@') ? username.trim() : undefined),
    loginMethod: 'password',
    avatarUrl: pickLocalAvatarForSeed(username),
    bio: '手帐新人，正在用锅碗瓢盆记录生活。',
    createdAt: new Date().toISOString().slice(0, 10)
  };

  users[key] = {
    user: newUser,
    passwordHash: btoa(encodeURIComponent(password))
  };
  saveRegisteredUsers(users);
  saveCurrentUser(newUser);
  return newUser;
}

/**
 * Login with Username or Email and Password
 */
export function loginWithPassword(identifier: string, password: string): UserProfile {
  const users = getRegisteredUsers();
  const key = identifier.toLowerCase().trim();

  // Search by username or email
  const found = Object.values(users).find(
    (item) => item.user.username?.toLowerCase() === key || item.user.email?.toLowerCase() === key
  );

  if (!found) {
    throw new Error('未找到该账号，请先点击下方「免费注册新账号」 / Account not found, please sign up first');
  }

  const matchesEncoded = found.passwordHash === btoa(encodeURIComponent(password));
  const matchesLegacy = (() => {
    try {
      return found.passwordHash === btoa(password);
    } catch {
      return false;
    }
  })();

  if (!matchesEncoded && !matchesLegacy) {
    throw new Error('密码不正确，请重新输入 / Incorrect password');
  }

  saveCurrentUser(found.user);
  return found.user;
}

/**
 * Login with Phone & SMS Code
 */
export function loginWithPhone(phone: string, code: string): UserProfile {
  if (code !== '1234' && code.length !== 4 && code.length !== 6) {
    throw new Error('验证码不正确');
  }

  const uid = 'phone_' + phone.trim();
  const user: UserProfile = {
    uid,
    displayName: `手机用户_${phone.slice(-4)}`,
    phone: phone.trim(),
    loginMethod: 'phone',
    avatarUrl: pickLocalAvatarForSeed(phone),
    bio: '用家常小菜，治愈一天疲惫。',
    createdAt: new Date().toISOString().slice(0, 10)
  };

  saveCurrentUser(user);
  return user;
}

/**
 * Login with Google OAuth
 */
export function loginWithGoogle(accountName = 'Google 用户'): UserProfile {
  const uid = 'google_' + Date.now().toString(36);
  const user: UserProfile = {
    uid,
    displayName: accountName,
    loginMethod: 'google',
    avatarUrl: AVATAR_SVG_MAP.chef_boy_cap,
    bio: '美食即是生活，用手帐定格每一道出锅时刻。',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  saveCurrentUser(user);
  return user;
}

/**
 * Login with WeChat QR Code
 */
export function loginWithWeChat(): UserProfile {
  const uid = 'wx_' + Date.now().toString(36);
  const user: UserProfile = {
    uid,
    displayName: '微信厨友_' + Math.floor(1000 + Math.random() * 9000),
    loginMethod: 'wechat',
    avatarUrl: AVATAR_SVG_MAP.chef_girl_apron,
    bio: '微信手帐分享者，热爱尝试各地风味。',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  saveCurrentUser(user);
  return user;
}

/**
 * Login with Alipay
 */
export function loginWithAlipay(): UserProfile {
  const uid = 'alipay_' + Date.now().toString(36);
  const user: UserProfile = {
    uid,
    displayName: '支付宝会员_' + Math.floor(1000 + Math.random() * 9000),
    loginMethod: 'alipay',
    avatarUrl: AVATAR_SVG_MAP.chef_mustache_gourmet,
    bio: '生活明朗，万物可爱，一日三餐认真对待。',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  saveCurrentUser(user);
  return user;
}

/**
 * Anonymous Guest Mode
 */
export function loginAsGuest(): UserProfile {
  const uid = 'guest_' + Math.random().toString(36).slice(2, 8);
  const user: UserProfile = {
    uid,
    displayName: '本机主厨 (免注册体验)',
    loginMethod: 'guest',
    avatarUrl: AVATAR_SVG_MAP.chef_boy_cap,
    bio: '本机离线手帐体验中，随时可注册账号独立保存。',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  saveCurrentUser(user);
  return user;
}

/**
 * Update Current Profile
 */
export function updateCurrentUserProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getCurrentUser();
  if (!current) throw new Error('未登录');
  const updated = { ...current, ...updates };
  saveCurrentUser(updated);

  // Sync changes back to registered users dictionary if applicable
  const users = getRegisteredUsers();
  let modified = false;
  for (const k of Object.keys(users)) {
    if (users[k].user.uid === current.uid) {
      users[k] = { ...users[k], user: updated };
      modified = true;
    }
  }
  if (modified) {
    saveRegisteredUsers(users);
  }
  return updated;
}

/**
 * Permanently delete user account & credentials (Apple Guideline 5.1.1(v) compliant)
 */
export function deleteCurrentUserAccount(targetUser?: UserProfile | null): void {
  const active = targetUser || getCurrentUser();
  if (active) {
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (raw) {
        const parsed: Record<string, { user: UserProfile; passwordHash: string }> = JSON.parse(raw);
        const nextUsers: Record<string, { user: UserProfile; passwordHash: string }> = {};
        for (const [k, val] of Object.entries(parsed)) {
          const sameUid = val.user.uid === active.uid;
          const sameUsername = active.username && k === active.username.toLowerCase().trim();
          const sameEmail = active.email && val.user.email?.toLowerCase() === active.email.toLowerCase();
          if (!sameUid && !sameUsername && !sameEmail) {
            nextUsers[k] = val;
          }
        }
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextUsers));
      }
      localStorage.removeItem(`culinary_recipes_${active.uid}`);
    } catch (err) {
      console.error('Failed to remove registered account record', err);
    }
  }
  saveCurrentUser(null);
}

/**
 * Logout
 */
export function logoutUser(): void {
  saveCurrentUser(null);
}
