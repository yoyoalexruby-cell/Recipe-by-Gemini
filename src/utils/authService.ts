import { UserProfile, LoginMethod } from '../types/auth';

const CURRENT_USER_KEY = 'food_journal_auth_user_v1';
const REGISTERED_USERS_KEY = 'food_journal_registered_users_v1';

// Seed demo users for the public culinary square
export const DEMO_COMMUNITY_USERS: UserProfile[] = [
  {
    uid: 'user-lin',
    displayName: '阿林私房菜',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    loginMethod: 'google',
    bio: '专注江浙传统慢炖浓油赤酱，用镜头记录烟火气。',
    createdAt: '2026-10-10'
  },
  {
    uid: 'user-momo',
    displayName: 'Momo烘焙日记',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    loginMethod: 'wechat',
    bio: '日式洋果子与治愈系甜品爱好者，每周出炉两次。',
    createdAt: '2026-10-12'
  },
  {
    uid: 'user-chef-chen',
    displayName: '陈主厨的深夜轻餐',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
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

// Get all locally registered accounts
function getRegisteredUsers(): Record<string, { user: UserProfile; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRegisteredUsers(users: Record<string, { user: UserProfile; passwordHash: string }>): void {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save registered users', err);
  }
}

/**
 * Register with Username & Password
 */
export function registerWithPassword(username: string, password: string, email?: string): UserProfile {
  const users = getRegisteredUsers();
  const key = username.toLowerCase().trim();
  
  if (users[key]) {
    throw new Error('该用户名已被注册，请尝试直接登录或更换用户名');
  }

  const uid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const newUser: UserProfile = {
    uid,
    displayName: username.trim(),
    username: username.trim(),
    email: email?.trim(),
    loginMethod: 'password',
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
    bio: '手帐新人，正在用锅碗瓢盆记录生活。',
    createdAt: new Date().toISOString().slice(0, 10)
  };

  users[key] = {
    user: newUser,
    passwordHash: btoa(password) // basic mock obfuscation
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
  let found = Object.values(users).find(
    (item) => item.user.username?.toLowerCase() === key || item.user.email?.toLowerCase() === key
  );

  if (!found) {
    // If not found in mock registered database, create seamless profile for convenience
    return registerWithPassword(identifier, password);
  }

  if (found.passwordHash !== btoa(password)) {
    throw new Error('密码不正确，请重新输入');
  }

  saveCurrentUser(found.user);
  return found.user;
}

/**
 * Login with Phone & SMS Code
 */
export function loginWithPhone(phone: string, code: string): UserProfile {
  if (code !== '1234' && code.length !== 4 && code.length !== 6) {
    throw new Error('验证码不正确，请输入收到的短信验证码 (演示可填 1234)');
  }

  const masked = phone.slice(0, 3) + '****' + phone.slice(-4);
  const uid = 'phone_' + phone.trim();
  const user: UserProfile = {
    uid,
    displayName: `手机用户_${phone.slice(-4)}`,
    phone: phone.trim(),
    loginMethod: 'phone',
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(phone)}`,
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
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
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
    displayName: '未命名大厨 (游客)',
    loginMethod: 'guest',
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`,
    bio: '游客体验中，随时可绑定账号同步到云端。',
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
  return updated;
}

/**
 * Logout
 */
export function logoutUser(): void {
  saveCurrentUser(null);
}
