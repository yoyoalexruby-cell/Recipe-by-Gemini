export type LoginMethod = 
  | 'phone' 
  | 'email' 
  | 'password' 
  | 'wechat' 
  | 'alipay' 
  | 'google' 
  | 'guest';

export interface UserProfile {
  uid: string;
  displayName: string;
  avatarUrl: string;
  loginMethod: LoginMethod;
  email?: string;
  phone?: string;
  username?: string;
  bio?: string;
  createdAt: string;
}

export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80'
];
