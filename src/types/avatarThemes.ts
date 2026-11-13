import { AVATAR_SVG_MAP } from '../utils/avatarGraphics';

export interface AvatarOption {
  id: string;
  name: string;
  nameEn: string;
  category: 'cartoon_chef' | 'culinary_creature' | 'chibi_foodie' | 'base_doll';
  avatarUrl: string;
  pointsCost: number; // 0 for free default, > 0 for future points redemption
  requiredLevel?: number; // Level lock
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;
  tags?: string[];
}

export interface AvatarFrameOption {
  id: string;
  name: string;
  nameEn: string;
  frameClass: string;
  pointsCost: number;
  previewBorderColor: string;
  icon: string;
  requiredLevel?: number;
}

/**
 * 20 Distinct Hand-Drawn / Aesthetic Cartoon Chef & Culinary Character Avatars
 * Illustrated vector SVGs with warm hand-drawn aesthetic, zero network dependencies,
 * and extensible redemption hooks for points and level progression.
 */
export const CARTOON_CHEF_AVATARS: AvatarOption[] = [
  // ================= 1. 热血主厨与学徒 (Head Chefs & Apprentices) =================
  {
    id: 'chef_boy_cap',
    name: '高帽料理少年',
    nameEn: 'Toque Apprentice',
    category: 'cartoon_chef',
    avatarUrl: AVATAR_SVG_MAP.chef_boy_cap,
    pointsCost: 0,
    rarity: 'common',
    description: '手持木铲、眼神明亮的初星见习厨师',
    tags: ['见习', '白帽', '热血']
  },
  {
    id: 'chef_girl_apron',
    name: '碎花围裙甜点娘',
    nameEn: 'Pastry Maiden',
    category: 'cartoon_chef',
    avatarUrl: AVATAR_SVG_MAP.chef_girl_apron,
    pointsCost: 0,
    rarity: 'common',
    description: '擅长制作舒芙蕾与草莓果酱的温暖系烘焙师',
    tags: ['烘焙', '草莓', '治愈']
  },
  {
    id: 'chef_mustache_gourmet',
    name: '八字胡私房老饕',
    nameEn: 'Mustache Gourmet',
    category: 'cartoon_chef',
    avatarUrl: AVATAR_SVG_MAP.chef_mustache_gourmet,
    pointsCost: 0,
    rarity: 'common',
    description: '尝遍大江南北三十年、深谙镬气真味的老掌勺',
    tags: ['传家', '老饕', '本帮']
  },
  {
    id: 'chef_ramen_master',
    name: '头巾拉面匠人',
    nameEn: 'Ramen Artisan',
    category: 'cartoon_chef',
    avatarUrl: AVATAR_SVG_MAP.chef_ramen_master,
    pointsCost: 0,
    rarity: 'common',
    description: '系着深蓝布头巾、慢火熬制豚骨高汤的拉面匠',
    tags: ['和风', '头巾', '高汤']
  },
  {
    id: 'chef_bistro_gentle',
    name: '小酒馆风味主厨',
    nameEn: 'Bistro Head Chef',
    category: 'cartoon_chef',
    avatarUrl: AVATAR_SVG_MAP.chef_bistro_gentle,
    pointsCost: 0,
    rarity: 'common',
    description: '懂得罗勒与橄榄油乳化艺术的法意轻餐主理人',
    tags: ['Bistro', '西餐', '贝雷帽']
  },
  {
    id: 'chef_dimsum_auntie',
    name: '笑面点心巧娘',
    nameEn: 'Dim Sum Artisan',
    category: 'cartoon_chef',
    avatarUrl: AVATAR_SVG_MAP.chef_dimsum_auntie,
    pointsCost: 0,
    rarity: 'common',
    description: '手捏十八道麦穗褶蒸饺的江南面点高手',
    tags: ['面点', '巧手', '蒸笼']
  },

  // ================= 2. 料理萌宠与小当家 (Culinary Animal Chefs) =================
  {
    id: 'creature_cat_pan',
    name: '平底锅猫小厨',
    nameEn: 'Sous Chef Kitty',
    category: 'culinary_creature',
    avatarUrl: AVATAR_SVG_MAP.creature_cat_pan,
    pointsCost: 0,
    rarity: 'common',
    description: '头顶厨师帽、用肉垫颠锅煎蛋的灵巧橘猫主厨',
    tags: ['萌宠', '橘猫', '煎蛋']
  },
  {
    id: 'creature_shiba_baker',
    name: '法棍柴犬烘焙师',
    nameEn: 'Baguette Shiba',
    category: 'culinary_creature',
    avatarUrl: AVATAR_SVG_MAP.creature_shiba_baker,
    pointsCost: 0,
    rarity: 'common',
    description: '系着红色方巾、守护刚出炉法棍的元气柴犬',
    tags: ['萌宠', '柴犬', '烘焙']
  },
  {
    id: 'creature_bear_stew',
    name: '慢炖砂锅小熊',
    nameEn: 'Stew Bear',
    category: 'culinary_creature',
    avatarUrl: AVATAR_SVG_MAP.creature_bear_stew,
    pointsCost: 0,
    rarity: 'common',
    description: '抱着蜂蜜罐与陶砂锅、文火煨透五花肉的温吞小熊',
    tags: ['慢火', '小熊', '砂锅']
  },
  {
    id: 'creature_rabbit_tea',
    name: '沏茶白兔点心师',
    nameEn: 'Teahouse Bunny',
    category: 'culinary_creature',
    avatarUrl: AVATAR_SVG_MAP.creature_rabbit_tea,
    pointsCost: 0,
    rarity: 'common',
    description: '穿戴青花围兜、调配茉莉龙井茶糕的玉兔',
    tags: ['清甜', '白兔', '茶歇']
  },
  {
    id: 'creature_penguin_ice',
    name: '刨冰企鹅冷盘手',
    nameEn: 'Popsicle Penguin',
    category: 'culinary_creature',
    avatarUrl: AVATAR_SVG_MAP.creature_penguin_ice,
    pointsCost: 0,
    rarity: 'common',
    description: '懂得保持食材极致清冽的冷餐水果冰品专家',
    tags: ['冰品', '企鹅', '清爽']
  },

  // ================= 3. Q版萌趣面点与食客 (Chibi Foodie Spirits) =================
  {
    id: 'chibi_dumpling_joy',
    name: '福气元气蒸饺',
    nameEn: 'Chibi Dumpling',
    category: 'chibi_foodie',
    avatarUrl: AVATAR_SVG_MAP.chibi_dumpling_joy,
    pointsCost: 0,
    rarity: 'common',
    description: '白白胖胖、头顶红油辣子小雀斑的饺子小精灵',
    tags: ['面点', '元气', '芝麻']
  },
  {
    id: 'chibi_matcha_mochi',
    name: '抹茶小福团',
    nameEn: 'Matcha Mochi',
    category: 'chibi_foodie',
    avatarUrl: AVATAR_SVG_MAP.chibi_matcha_mochi,
    pointsCost: 0,
    rarity: 'common',
    description: '软糯Q弹、裹着宇治抹茶粉与草莓的软萌和果子',
    tags: ['甜点', '抹茶', '软糯']
  },
  {
    id: 'chibi_egg_toast_sunny',
    name: '太阳蛋热吐司',
    nameEn: 'Sunny Egg Toast',
    category: 'chibi_foodie',
    avatarUrl: AVATAR_SVG_MAP.chibi_egg_toast_sunny,
    pointsCost: 0,
    rarity: 'common',
    description: '焦香黄油吐司片上顶着一颗流心溏心蛋',
    tags: ['早餐', '溏心蛋', '活力']
  },
  {
    id: 'chibi_croissant_butter',
    name: '千层牛角可颂精',
    nameEn: 'Golden Croissant',
    category: 'chibi_foodie',
    avatarUrl: AVATAR_SVG_MAP.chibi_croissant_butter,
    pointsCost: 0,
    rarity: 'common',
    description: '酥皮如蝉翼、散发着法式发酵黄油香气的小可颂',
    tags: ['法式', '可颂', '黄油']
  },
  {
    id: 'chibi_onigiri_seaweed',
    name: '海苔柴鱼饭团君',
    nameEn: 'Seaweed Onigiri',
    category: 'chibi_foodie',
    avatarUrl: AVATAR_SVG_MAP.chibi_onigiri_seaweed,
    pointsCost: 0,
    rarity: 'common',
    description: '三角饭团系着厚海苔腰带、头顶酸甜梅子干',
    tags: ['便当', '饭团', '梅子']
  },

  // ================= 4. 换装人偶素体与高阶荣誉大厨 (Base Dolls & Master Avatars) =================
  {
    id: 'doll_base_boy_linen',
    name: '人偶素体 · 见习厨郎',
    nameEn: 'Base Doll (Cook Boy)',
    category: 'base_doll',
    avatarUrl: AVATAR_SVG_MAP.doll_base_boy_linen,
    pointsCost: 0,
    rarity: 'common',
    description: '清爽短发、亚麻围裙素体，预留换装服饰接口',
    tags: ['素体', '换装', '原胚']
  },
  {
    id: 'doll_base_girl_linen',
    name: '人偶素体 · 治愈厨娘',
    nameEn: 'Base Doll (Pastry Girl)',
    category: 'base_doll',
    avatarUrl: AVATAR_SVG_MAP.doll_base_girl_linen,
    pointsCost: 0,
    rarity: 'common',
    description: '温柔双马尾、手作编织素体，预留换装服饰接口',
    tags: ['素体', '换装', '原胚']
  },
  {
    id: 'doll_sommelier_wine',
    name: '金牌侍酒品味师',
    nameEn: 'Elite Sommelier',
    category: 'cartoon_chef',
    avatarUrl: AVATAR_SVG_MAP.doll_sommelier_wine,
    pointsCost: 80,
    requiredLevel: 3,
    rarity: 'rare',
    description: '胸佩葡萄银徽、对餐酒佐配如数家珍的风味大师',
    tags: ['佐餐', '侍酒', 'LV3专属']
  },
  {
    id: 'doll_legendary_gold_toque',
    name: '殿堂金冠神厨',
    nameEn: 'Grandmaster Golden Toque',
    category: 'cartoon_chef',
    avatarUrl: AVATAR_SVG_MAP.doll_legendary_gold_toque,
    pointsCost: 200,
    requiredLevel: 5,
    rarity: 'legendary',
    description: '头顶金刺绣高帽、终身享受殿堂美食勋章荣誉的顶级厨神',
    tags: ['殿堂', '金冠', 'LV5专属']
  }
];

/**
 * Avatar Frames / Skins for Future Points Redemption & Level Perks
 */
export const AVATAR_FRAMES: AvatarFrameOption[] = [
  {
    id: 'frame_none',
    name: '自然手帐无边框',
    nameEn: 'Default Minimal',
    frameClass: 'border-2 border-[#EADBCE]',
    pointsCost: 0,
    previewBorderColor: '#EADBCE',
    icon: '⭕'
  },
  {
    id: 'frame_gold_laurel',
    name: '金桂主厨月桂金框',
    nameEn: 'Golden Laurel',
    frameClass: 'border-3 border-amber-400 ring-2 ring-amber-300/60 shadow-md',
    pointsCost: 50,
    previewBorderColor: '#F59E0B',
    icon: '👑',
    requiredLevel: 2
  },
  {
    id: 'frame_wax_seal',
    name: '复古火漆印章框',
    nameEn: 'Vintage Wax Seal',
    frameClass: 'border-3 border-[#C85A32] ring-2 ring-[#C85A32]/30 shadow-md',
    pointsCost: 80,
    previewBorderColor: '#C85A32',
    icon: '🏷️',
    requiredLevel: 3
  },
  {
    id: 'frame_matcha_leaf',
    name: '草木森系藤蔓框',
    nameEn: 'Matcha Vine',
    frameClass: 'border-3 border-[#5F7A4D] ring-2 ring-[#5F7A4D]/30 shadow-md',
    pointsCost: 60,
    previewBorderColor: '#5F7A4D',
    icon: '🌿',
    requiredLevel: 2
  }
];
