import { UserProfile, LoginMethod } from '../types/auth';
import { AVATAR_SVG_MAP } from './avatarGraphics';
import { OFFICIAL_EDITORIAL_USER, OFFICIAL_ACCOUNT_UID } from '../data/officialSquareSeed';
import { formatLocalDate } from './dateUtils';

export const CURRENT_USER_KEY = 'food_journal_auth_user_v1';
export const OPERATOR_TOKEN_SESSION_KEY = 'culinary_operator_token_v1';
export const OFFICIAL_SESSION_USER_KEY = 'culinary_operator_user_v1';
const REGISTERED_USERS_KEY = 'food_journal_registered_users_v1';
const PASSWORD_PEPPER = 'culinary_journal_local_salt_v2_2026';
const PBKDF2_ITERATIONS = 100_000;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : `0${hex}`;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Legacy synchronous hash (kept strictly for verifying/auto-upgrading previously saved local accounts)
 */
function computeLegacySaltedHash(password: string, accountSalt: string): string {
  const normalizedSalt = accountSalt.toLowerCase().trim();
  const payload = `${PASSWORD_PEPPER}:${normalizedSalt}:${password}`;
  let h1 = 0xdeadbeef ^ payload.length;
  let h2 = 0x41c6ce57 ^ payload.length;
  for (let round = 0; round < 1024; round++) {
    for (let i = 0; i < payload.length; i++) {
      const ch = payload.charCodeAt(i) ^ (round & 0xff);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `sh2$${normalizedSalt.slice(0, 8)}$${hex1}${hex2}`;
}

/**
 * Cryptographic KDF using Web Crypto PBKDF2-HMAC-SHA256 (100,000 iterations + random 16-byte salt)
 */
async function hashPasswordPBKDF2(password: string, existingSaltHex?: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Fallback only in environments lacking SubtleCrypto
    const fallbackSalt = existingSaltHex || Math.random().toString(36).slice(2, 18);
    return computeLegacySaltedHash(password, fallbackSalt);
  }

  const saltBytes = existingSaltHex
    ? hexToBytes(existingSaltHex)
    : crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  const derivedHex = bytesToHex(new Uint8Array(derivedBits));
  const saltHex = bytesToHex(saltBytes);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${saltHex}$${derivedHex}`;
}

async function verifyPasswordAgainstStoredHash(
  password: string,
  storedHash: string,
  accountKey: string
): Promise<{ matched: boolean; needsUpgrade: boolean }> {
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length === 4) {
      const saltHex = parts[2];
      const recomputed = await hashPasswordPBKDF2(password, saltHex);
      return { matched: recomputed === storedHash, needsUpgrade: false };
    }
    return { matched: false, needsUpgrade: false };
  }

  if (storedHash.startsWith('sh2$')) {
    const expected = computeLegacySaltedHash(password, accountKey);
    return { matched: storedHash === expected, needsUpgrade: storedHash === expected };
  }

  try {
    const legacyMatch =
      storedHash === btoa(encodeURIComponent(password)) || storedHash === btoa(password);
    return { matched: legacyMatch, needsUpgrade: legacyMatch };
  } catch {
    return { matched: false, needsUpgrade: false };
  }
}

// Seed demo users for the public culinary square
export const DEMO_COMMUNITY_USERS: UserProfile[] = [
  {
    uid: 'user-lin',
    displayName: '阿林私房菜',
    avatarUrl: AVATAR_SVG_MAP.chef_boy_cap,
    loginMethod: 'google',
    bio: '专注江浙传统慢炖浓油赤酱，用镜头记录烟火气。',
    createdAt: '2026-10-10',
  },
  {
    uid: 'user-momo',
    displayName: 'Momo烘焙日记',
    avatarUrl: AVATAR_SVG_MAP.chef_girl_apron,
    loginMethod: 'wechat',
    bio: '日式洋果子与治愈系甜品爱好者，每周出炉两次。',
    createdAt: '2026-10-12',
  },
  {
    uid: 'user-chef-chen',
    displayName: '陈主厨的深夜轻餐',
    avatarUrl: AVATAR_SVG_MAP.chef_mustache_gourmet,
    loginMethod: 'phone',
    bio: '15分钟快手西餐与意式面点，一个人也要好好吃饭。',
    createdAt: '2026-10-15',
  },
];

function hasStructurallyValidOperatorToken(token: string | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return nonce.length >= 16 && sig.length >= 32;
}

export function isOfficialUser(user?: UserProfile | null): boolean {
  return user?.uid === OFFICIAL_ACCOUNT_UID;
}

export function getCurrentUser(): UserProfile | null {
  try {
    // Official operator identity is stored strictly in sessionStorage, paired with a non-expired operator token
    if (typeof sessionStorage !== 'undefined') {
      const token = sessionStorage.getItem(OPERATOR_TOKEN_SESSION_KEY);
      const officialRaw = sessionStorage.getItem(OFFICIAL_SESSION_USER_KEY);
      if (officialRaw) {
        if (hasStructurallyValidOperatorToken(token)) {
          const parsedOfficial = JSON.parse(officialRaw) as UserProfile;
          if (parsedOfficial?.uid === OFFICIAL_ACCOUNT_UID) {
            return parsedOfficial;
          }
        }
        sessionStorage.removeItem(OFFICIAL_SESSION_USER_KEY);
        sessionStorage.removeItem(OPERATOR_TOKEN_SESSION_KEY);
      }
    }

    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    // Never allow Official Editorial identity to be spoofed or restored from localStorage
    if (parsed?.uid === OFFICIAL_ACCOUNT_UID) {
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to get current user', err);
    return null;
  }
}

export function saveCurrentUser(user: UserProfile | null): void {
  try {
    if (user?.uid === OFFICIAL_ACCOUNT_UID) {
      localStorage.removeItem(CURRENT_USER_KEY);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(OFFICIAL_SESSION_USER_KEY, JSON.stringify(user));
      }
    } else if (user) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(OFFICIAL_SESSION_USER_KEY);
        sessionStorage.removeItem(OPERATOR_TOKEN_SESSION_KEY);
      }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(OFFICIAL_SESSION_USER_KEY);
        sessionStorage.removeItem(OPERATOR_TOKEN_SESSION_KEY);
      }
    }
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: user }));
  } catch (err) {
    console.error('Failed to save current user', err);
  }
}

/**
 * Verify Official Operator Passcode strictly via backend (/api/admin/login) — zero hardcoded secrets on client
 */
export async function loginAsOfficialEditorial(passcode: string): Promise<UserProfile> {
  const clean = passcode.trim();
  if (!clean) {
    throw new Error('请输入服务端配置的官方运营口令 / Please enter the server-configured operator passcode');
  }

  let res: Response;
  try {
    res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: clean }),
    });
  } catch {
    throw new Error('无法连接后端鉴权服务，请确认服务端正在运行 / Unable to reach operator auth endpoint');
  }

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    token?: string;
    error?: string;
  };

  if (!res.ok || !data.success || !data.token) {
    throw new Error(data.error || '官方运营口令验证未通过 / Operator authentication failed');
  }

  try {
    sessionStorage.setItem(OPERATOR_TOKEN_SESSION_KEY, data.token);
  } catch {
    // ignore sessionStorage error
  }
  saveCurrentUser(OFFICIAL_EDITORIAL_USER);
  return OFFICIAL_EDITORIAL_USER;
}

/**
 * Validate active operator session token against backend
 */
export async function verifyOfficialOperatorSession(): Promise<{
  authenticated: boolean;
  configured: boolean;
}> {
  const token =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(OPERATOR_TOKEN_SESSION_KEY) || ''
      : '';
  try {
    const res = await fetch('/api/admin/session', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return { authenticated: false, configured: false };
    const data = (await res.json()) as { authenticated?: boolean; configured?: boolean };
    return {
      authenticated: Boolean(data.authenticated),
      configured: Boolean(data.configured),
    };
  } catch {
    return { authenticated: false, configured: false };
  }
}

/**
 * Re-verify Official Operator token with backend before privileged official actions;
 * automatically clears spoofed or expired sessionStorage credentials if invalid.
 */
export async function verifyOfficialOperatorOrLogout(): Promise<boolean> {
  const { authenticated } = await verifyOfficialOperatorSession();
  if (!authenticated) {
    logoutUser();
    return false;
  }
  return true;
}

// Get locally registered accounts (never seeds privileged official credentials in client storage)
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
      createdAt: '2026-10-01',
    },
    passwordHash: computeLegacySaltedHash('Cook2026!', defaultDemoKey),
  };

  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    const parsed: Record<string, { user: UserProfile; passwordHash: string }> = raw
      ? JSON.parse(raw)
      : {};
    // Scrub any legacy pre-seeded official backdoor account from local storage
    if ('official@culinaryjournal.app' in parsed) {
      delete parsed['official@culinaryjournal.app'];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(parsed));
    }
    if (!parsed[defaultDemoKey]) {
      parsed[defaultDemoKey] = defaultDemoEntry;
    }
    return parsed;
  } catch {
    return {
      [defaultDemoKey]: defaultDemoEntry,
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
    AVATAR_SVG_MAP.chef_mustache_gourmet,
  ].filter(Boolean);
  if (avatarPool.length === 0) return '';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return avatarPool[hash % avatarPool.length];
}

/**
 * Register with Username & Password (uses PBKDF2-HMAC-SHA256 100k iterations)
 */
export async function registerWithPassword(
  username: string,
  password: string,
  email?: string
): Promise<UserProfile> {
  const users = getRegisteredUsers();
  const key = username.toLowerCase().trim();

  if (key === 'official@culinaryjournal.app') {
    throw new Error('该邮箱为系统保留标识，请使用其他用户名注册');
  }

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
    createdAt: formatLocalDate(),
  };

  const passwordHash = await hashPasswordPBKDF2(password);
  users[key] = {
    user: newUser,
    passwordHash,
  };
  saveRegisteredUsers(users);
  saveCurrentUser(newUser);
  return newUser;
}

/**
 * Login with Username or Email and Password (verifies PBKDF2 and transparently upgrades legacy hashes)
 */
export async function loginWithPassword(
  identifier: string,
  password: string
): Promise<UserProfile> {
  const users = getRegisteredUsers();
  const key = identifier.toLowerCase().trim();

  const foundEntry = Object.entries(users).find(
    ([dictKey, item]) =>
      dictKey === key ||
      item.user.username?.toLowerCase() === key ||
      item.user.email?.toLowerCase() === key
  );

  if (!foundEntry) {
    throw new Error('未找到该账号，请先点击下方「免费注册新账号」 / Account not found, please sign up first');
  }

  const [entryKey, found] = foundEntry;
  const { matched, needsUpgrade } = await verifyPasswordAgainstStoredHash(
    password,
    found.passwordHash,
    entryKey
  );

  if (!matched) {
    throw new Error('密码不正确，请重新输入 / Incorrect password');
  }

  if (needsUpgrade) {
    users[entryKey] = {
      ...found,
      passwordHash: await hashPasswordPBKDF2(password),
    };
    saveRegisteredUsers(users);
  }

  saveCurrentUser(found.user);
  return found.user;
}

/**
 * Login with Phone & SMS Code (Local demo mode strictly checks verification code 1234)
 */
export function loginWithPhone(phone: string, code: string): UserProfile {
  const cleanPhone = phone.trim();
  if (!/^1\d{10}$/.test(cleanPhone) && cleanPhone.length < 6) {
    throw new Error('请输入有效的手机号码');
  }
  if (code.trim() !== '1234') {
    throw new Error('本机演示验证码不正确（请输入固定演示码 1234）');
  }

  const uid = 'phone_' + cleanPhone;
  const user: UserProfile = {
    uid,
    displayName: `手机厨友_${cleanPhone.slice(-4)}`,
    phone: cleanPhone,
    loginMethod: 'phone',
    avatarUrl: pickLocalAvatarForSeed(cleanPhone),
    bio: '用家常小菜，治愈一天疲惫。',
    createdAt: formatLocalDate(),
  };

  saveCurrentUser(user);
  return user;
}

/**
 * Local Demo Profile Switch Helpers
 */
export function loginWithGoogle(accountName = '本机快捷档案 (Google)'): UserProfile {
  const uid = 'google_' + Date.now().toString(36);
  const user: UserProfile = {
    uid,
    displayName: accountName,
    loginMethod: 'google',
    avatarUrl: AVATAR_SVG_MAP.chef_boy_cap,
    bio: '本机快捷手帐档案，随时可导出备份。',
    createdAt: formatLocalDate(),
  };
  saveCurrentUser(user);
  return user;
}

export function loginWithWeChat(): UserProfile {
  const uid = 'wx_' + Date.now().toString(36);
  const user: UserProfile = {
    uid,
    displayName: '本机微信档案_' + Math.floor(1000 + Math.random() * 9000),
    loginMethod: 'wechat',
    avatarUrl: AVATAR_SVG_MAP.chef_girl_apron,
    bio: '本机离线手帐档案，热爱尝试各地风味。',
    createdAt: formatLocalDate(),
  };
  saveCurrentUser(user);
  return user;
}

export function loginWithAlipay(): UserProfile {
  const uid = 'alipay_' + Date.now().toString(36);
  const user: UserProfile = {
    uid,
    displayName: '本机支付宝档案_' + Math.floor(1000 + Math.random() * 9000),
    loginMethod: 'alipay',
    avatarUrl: AVATAR_SVG_MAP.chef_mustache_gourmet,
    bio: '生活明朗，万物可爱，一日三餐认真对待。',
    createdAt: formatLocalDate(),
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
    bio: '本机离线手帐体验中，随时可注册本机账号视图。',
    createdAt: formatLocalDate(),
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
  try {
    sessionStorage.removeItem(OPERATOR_TOKEN_SESSION_KEY);
    sessionStorage.removeItem(OFFICIAL_SESSION_USER_KEY);
  } catch {
    // ignore
  }
  saveCurrentUser(null);
}

/**
 * Logout
 */
export function logoutUser(): void {
  try {
    sessionStorage.removeItem(OPERATOR_TOKEN_SESSION_KEY);
    sessionStorage.removeItem(OFFICIAL_SESSION_USER_KEY);
  } catch {
    // ignore
  }
  saveCurrentUser(null);
}
