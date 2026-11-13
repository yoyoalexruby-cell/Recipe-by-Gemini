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

import { AVATAR_SVG_MAP } from '../utils/avatarGraphics';

export const PRESET_AVATARS = [
  AVATAR_SVG_MAP.chef_boy_cap,
  AVATAR_SVG_MAP.chef_girl_apron,
  AVATAR_SVG_MAP.creature_cat_pan,
  AVATAR_SVG_MAP.creature_shiba_baker,
  AVATAR_SVG_MAP.chibi_dumpling_joy,
  AVATAR_SVG_MAP.doll_base_boy_linen
];
