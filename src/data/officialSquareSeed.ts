import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { AVATAR_SVG_MAP } from '../utils/avatarGraphics';

import dishSteamedSeabass from '../assets/images/dish_steamed_seabass_1794556098030.jpg';
import dishSukiyakiHotpot from '../assets/images/dish_sukiyaki_hotpot_1794556098930.jpg';
import dishCoconutChickenSoup from '../assets/images/dish_coconut_chicken_soup_1794556100057.jpg';
import dishSalmonPokeBowl from '../assets/images/dish_salmon_poke_bowl_1794556101382.jpg';
import dishSearedRibeyeSteak from '../assets/images/dish_seared_ribeye_steak_1794556103251.jpg';
import dishBasqueCheesecake from '../assets/images/dish_basque_cheesecake_1794556103549.jpg';

export const OFFICIAL_ACCOUNT_UID = 'official-culinary-editorial';

export const OFFICIAL_EDITORIAL_USER: UserProfile = {
  uid: OFFICIAL_ACCOUNT_UID,
  displayName: '食味手记官方主厨',
  username: 'official@culinaryjournal.app',
  email: 'yoyoalexruby@gmail.com',
  loginMethod: 'password',
  avatarUrl: AVATAR_SVG_MAP.chef_mustache_gourmet,
  bio: '食味手记官方料理研究室 · 严选零失败四季家常菜单、精准火候公式与健康轻食指南。',
  createdAt: '2026-01-01'
};

export interface OfficialCuratedMenu {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  sceneTag: string;
  sceneTagEn: string;
  coverImage: string;
  curatorName: string;
  recipeIds: string[];
  /** Months (1-12) where this menu is seasonally prioritized; empty/undefined = evergreen all-year */
  targetMonths?: number[];
  seasonLabel?: string;
  seasonLabelEn?: string;
  pinned?: boolean;
  updatedAt: string;
}

const CUSTOM_MENUS_STORAGE_KEY = 'food_journal_official_menus_v1';

export const DEFAULT_OFFICIAL_MENUS: OfficialCuratedMenu[] = [
  {
    id: 'menu-autumn-winter-warmers',
    title: '立冬小雪暖胃图鉴 · 老火靓汤与咕嘟暖锅',
    titleEn: 'Winter Warmers: Claypot Broths & Hotpots',
    subtitle: '降温天最熨帖的椰青土鸡汤与关西寿喜烧慢炖，把寒意统统挡在厨房门外。',
    subtitleEn: 'Nourishing claypot broths and simmering hotpots for chilly evenings.',
    sceneTag: '立冬暖锅',
    sceneTagEn: 'Winter Broths',
    seasonLabel: '11–12月 · 初冬进补季',
    seasonLabelEn: 'Nov–Dec · Early Winter',
    targetMonths: [11, 12],
    coverImage: dishCoconutChickenSoup,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-coconut-chicken-soup',
      'official-wagyu-sukiyaki',
      'official-kimchi-tofu-stew',
      'official-truffle-mushroom-soup',
      'recipe-braised-pork'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-late-autumn-bistro',
    title: '深秋微醺家庭小酒馆 · 黑松露浓汤与厚切牛排',
    titleEn: 'Cozy Home Bistro: Truffle Soup & Ribeye',
    subtitle: '不出门排队也能复刻烛光西餐桌，美拉德焦脆牛排配天鹅绒蘑菇浓汤。',
    subtitleEn: 'Restaurant-grade seared ribeye, truffle mushroom soup, and Basque cheesecake.',
    sceneTag: '微醺西餐',
    sceneTagEn: 'Home Bistro',
    seasonLabel: '10–12月 · 秋冬仪式感',
    seasonLabelEn: 'Oct–Dec · Cozy Bistro',
    targetMonths: [10, 11, 12],
    coverImage: dishSearedRibeyeSteak,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-ribeye-steak',
      'official-truffle-mushroom-soup',
      'recipe-shrimp-pasta',
      'official-basque-cheesecake'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-new-year-reunion-feast',
    title: '岁末团圆家宴谱 · 年年有鱼与镇场硬菜单',
    titleEn: 'Festive Reunion & Dinner Party Showstoppers',
    subtitle: '从酒楼级葱油清蒸海鲈鱼到本帮红烧肉，亲友聚餐端上桌零翻车的镇场搭配。',
    subtitleEn: 'Showstopping centerpiece dishes for New Year gatherings and family feasts.',
    sceneTag: '团圆家宴',
    sceneTagEn: 'Festive Feast',
    seasonLabel: '1–2月 · 岁末新春团圆季',
    seasonLabelEn: 'Jan–Feb · Reunion Season',
    targetMonths: [1, 2, 12],
    coverImage: dishSteamedSeabass,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-steamed-seabass',
      'recipe-braised-pork',
      'official-ribeye-steak',
      'official-wagyu-sukiyaki',
      'official-coconut-chicken-soup'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-spring-fresh-bento',
    title: '春日鲜食便当录 · 清润低负担踏青菜单',
    titleEn: 'Spring Fresh Bento & Light Steamed Dishes',
    subtitle: '春暖花开唤醒味蕾，高颜值照烧鸡腿便当与清爽时蔬能量碗装进春光里。',
    subtitleEn: 'Vibrant bento boxes and light, refreshing spring dishes.',
    sceneTag: '春日便当',
    sceneTagEn: 'Spring Bento',
    seasonLabel: '3–4月 · 春分踏青季',
    seasonLabelEn: 'Mar–Apr · Spring Picnic',
    targetMonths: [3, 4],
    coverImage: dishSalmonPokeBowl,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-teriyaki-chicken-don',
      'official-salmon-poke-bowl',
      'official-steamed-seabass',
      'recipe-strawberry-daifuku',
      'recipe-matcha-chiffon'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-clean-high-protein',
    title: '初夏 500 大卡自律周 · 高蛋白低脂轻食单',
    titleEn: '500-kcal High-Protein Clean Bowls',
    subtitle: '吃饱不挨饿的科学控卡搭配，5%淡盐水爆汁鸡胸与深海三文鱼满载优质蛋白。',
    subtitleEn: 'Balanced macro bowls and juicy lean proteins under 550 kcal.',
    sceneTag: '控卡轻食',
    sceneTagEn: 'Clean Eating',
    seasonLabel: '5–6月 · 入夏轻体季',
    seasonLabelEn: 'May–Jun · Summer Fit',
    targetMonths: [4, 5, 6],
    coverImage: dishSalmonPokeBowl,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-salmon-poke-bowl',
      'official-mediterranean-chicken-salad',
      'official-steamed-seabass',
      'official-tomato-beef-soup'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-midsummer-sweet-ice',
    title: '盛夏消暑糖水铺 · 冰镇甘露与酸爽开胃菜',
    titleEn: 'Midsummer Chilled Tongsui & Zesty Appetizers',
    subtitle: '三伏天没胃口？先喝酸甜番茄滑牛肉汤，再来一碗冰凉杨枝甘露与手工芋圆。',
    subtitleEn: 'Chilled mango pomelo sago, taro balls, and zesty summer comfort dishes.',
    sceneTag: '盛夏消暑',
    sceneTagEn: 'Summer Coolers',
    seasonLabel: '7–8月 · 盛夏冰品季',
    seasonLabelEn: 'Jul–Aug · Midsummer',
    targetMonths: [6, 7, 8],
    coverImage: dishBasqueCheesecake,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'recipe-mango-pomelo-sago',
      'recipe-taro-balls-jelly',
      'recipe-matcha-gelato',
      'official-tomato-beef-soup',
      'recipe-shrimp-pasta'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-golden-autumn-nourish',
    title: '金秋白露润燥单 · 清甜椰子鸡与温润汤水',
    titleEn: 'Golden Autumn Nourishing Broths & Home Dishes',
    subtitle: '入秋换季易口干，纯鲜椰青水慢煲散养土鸡与竹荪，清甜滋润零油腻。',
    subtitleEn: 'Soothing coconut chicken broth and comforting autumn home cooking.',
    sceneTag: '秋日润燥',
    sceneTagEn: 'Autumn Nourish',
    seasonLabel: '9–10月 · 金秋润燥季',
    seasonLabelEn: 'Sep–Oct · Autumn Harvest',
    targetMonths: [9, 10],
    coverImage: dishCoconutChickenSoup,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-coconut-chicken-soup',
      'official-tomato-beef-soup',
      'official-steamed-seabass',
      'official-mediterranean-chicken-salad'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-15min-weeknight',
    title: '下班 15 分钟 · 快手治愈打工人晚餐单',
    titleEn: '15-Min Weeknight Comfort Meals',
    subtitle: '告别外卖重油盐，一锅一灶 15 分钟端出热气腾腾的下饭好菜。',
    subtitleEn: 'Skip takeout—wholesome, flavorful dinners ready in 15 minutes.',
    sceneTag: '工作日快手',
    sceneTagEn: 'Quick Dinner',
    seasonLabel: '全年轮换 · 工作日特辑',
    seasonLabelEn: 'All-Year · Weeknights',
    coverImage: dishSteamedSeabass,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-steamed-seabass',
      'official-teriyaki-chicken-don',
      'official-hunan-stirfry-pork',
      'official-tomato-beef-soup',
      'recipe-shrimp-pasta'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-weekend-home-bakery',
    title: '周末家庭烘焙屋 · 零失败下午茶甜品单',
    titleEn: 'Weekend Home Bakery & Sweet Tongsui',
    subtitle: '从流心巴斯克到宇治抹茶戚风，新手第一次进厨房也能收获满屋甜香。',
    subtitleEn: 'Foolproof Basque cheesecake, matcha chiffon, and artisan Asian desserts.',
    sceneTag: '治愈烘焙',
    sceneTagEn: 'Home Bakery',
    seasonLabel: '全年轮换 · 周末下午茶',
    seasonLabelEn: 'All-Year · Weekend Bake',
    coverImage: dishBasqueCheesecake,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-basque-cheesecake',
      'recipe-matcha-chiffon',
      'recipe-mango-pomelo-sago',
      'recipe-taro-balls-jelly',
      'recipe-strawberry-daifuku'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-wok-hei-rice-killer',
    title: '人间烟火米饭杀手 · 猛火小炒与浓油赤酱单',
    titleEn: 'Wok-Hei Stir-Fries & Rich Braised Classics',
    subtitle: '虎皮青椒小炒黑猪肉配外婆本帮红烧肉，做这几道菜电饭煲记得多煮一杯米！',
    subtitleEn: 'Savory Hunan stir-fry, braised pork belly, and teriyaki donburi.',
    sceneTag: '下饭神菜',
    sceneTagEn: 'Rice Killers',
    seasonLabel: '全年轮换 · 烟火下饭菜',
    seasonLabelEn: 'All-Year · Comfort Classics',
    coverImage: dishSukiyakiHotpot,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-hunan-stirfry-pork',
      'recipe-braised-pork',
      'official-teriyaki-chicken-don',
      'official-crispy-potstickers'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-midnight-izakaya',
    title: '深夜食堂暖心夜宵 · 冰花锅贴与热辣豆腐锅',
    titleEn: 'Midnight Diner: Crispy Potstickers & Kimchi Stew',
    subtitle: '加班夜晚的一口滚烫慰藉，咔嚓脆底爆汁生煎锅贴配首尔海鲜泡菜锅。',
    subtitleEn: 'Lacy crispy potstickers, bubbling kimchi tofu stew, and wagyu sukiyaki.',
    sceneTag: '深夜食堂',
    sceneTagEn: 'Late-Night Eats',
    seasonLabel: '全年轮换 · 治愈夜宵档',
    seasonLabelEn: 'All-Year · Midnight Diner',
    coverImage: dishSukiyakiHotpot,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-crispy-potstickers',
      'official-kimchi-tofu-stew',
      'official-wagyu-sukiyaki',
      'recipe-shrimp-pasta'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  },
  {
    id: 'menu-dinner-party-feast',
    title: '私房主厨待客之道 · 中西合璧高颜值硬菜单',
    titleEn: 'Signature Dinner Party Showstoppers',
    subtitle: '中式清蒸海鲈鱼与西式迷迭香厚切肋眼同台，在家轻松惊艳来做客的朋友。',
    subtitleEn: 'Restaurant-grade centerpiece dishes for hosting family and friends.',
    sceneTag: '待客硬菜',
    sceneTagEn: 'Hosting Menu',
    seasonLabel: '全年轮换 · 朋友聚餐季',
    seasonLabelEn: 'All-Year · Hosting',
    coverImage: dishSearedRibeyeSteak,
    curatorName: '食味手记官方主厨',
    recipeIds: [
      'official-ribeye-steak',
      'recipe-braised-pork',
      'official-wagyu-sukiyaki',
      'official-crispy-potstickers',
      'official-steamed-seabass'
    ],
    pinned: false,
    updatedAt: '2026-11-12'
  }
];

const LEGACY_MENUS_STORAGE_KEY = 'food_journal_official_menus_v1';
const CUSTOM_MENUS_STORAGE_KEY_V2 = 'food_journal_official_menus_v2';

export function getOfficialCuratedMenus(): OfficialCuratedMenu[] {
  try {
    const raw = localStorage.getItem(CUSTOM_MENUS_STORAGE_KEY_V2);
    if (!raw) {
      // Preserve any user-created custom menus from v1 if present
      let customFromV1: OfficialCuratedMenu[] = [];
      try {
        const legacyRaw = localStorage.getItem(LEGACY_MENUS_STORAGE_KEY);
        if (legacyRaw) {
          const legacyParsed: OfficialCuratedMenu[] = JSON.parse(legacyRaw);
          if (Array.isArray(legacyParsed)) {
            customFromV1 = legacyParsed.filter((m) => m.id.startsWith('menu-custom-'));
          }
        }
      } catch {
        // ignore legacy parse error
      }
      const initial = [...customFromV1, ...DEFAULT_OFFICIAL_MENUS];
      localStorage.setItem(CUSTOM_MENUS_STORAGE_KEY_V2, JSON.stringify(initial));
      return initial;
    }

    const parsed: OfficialCuratedMenu[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_OFFICIAL_MENUS;
    }

    const defaultMap = new Map(DEFAULT_OFFICIAL_MENUS.map((d) => [d.id, d]));
    let changed = false;
    const hydrated = parsed.map((m) => {
      const def = defaultMap.get(m.id);
      if (def && (!m.seasonLabel || m.targetMonths === undefined)) {
        changed = true;
        return {
          ...m,
          targetMonths: def.targetMonths,
          seasonLabel: def.seasonLabel,
          seasonLabelEn: def.seasonLabelEn
        };
      }
      return m;
    });

    const existingIds = new Set(hydrated.map((m) => m.id));
    for (const def of DEFAULT_OFFICIAL_MENUS) {
      if (!existingIds.has(def.id)) {
        hydrated.push(def);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(CUSTOM_MENUS_STORAGE_KEY_V2, JSON.stringify(hydrated));
    }
    return hydrated;
  } catch {
    return DEFAULT_OFFICIAL_MENUS;
  }
}

export function saveOfficialCuratedMenus(menus: OfficialCuratedMenu[]): void {
  try {
    localStorage.setItem(CUSTOM_MENUS_STORAGE_KEY_V2, JSON.stringify(menus));
    window.dispatchEvent(new CustomEvent('official-menus-updated', { detail: menus }));
  } catch (err) {
    console.error('Failed to save official menus', err);
  }
}

export const OFFICIAL_SEED_RECIPES: Recipe[] = [
  // 1. 家常中餐 · 清蒸白灼
  {
    id: 'official-steamed-seabass',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 168,
    likedBy: ['demo_user_1', 'user-lin'],
    title: '广式酒楼级葱油清蒸海鲈鱼',
    subtitle: '记住「沸水入锅蒸8分钟+倒掉蒸鱼腥水」黄金铁律，鱼肉鲜嫩如蒜瓣。',
    coverImage: dishSteamedSeabass,
    category: '家常中餐',
    subCategory: '清蒸白灼',
    cuisine: '粤式经典',
    tags: ['官方严选', '高蛋白', '零失败蒸菜'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    baseServings: 3,
    estimatedCalories: 580,
    difficulty: 2,
    utensils: ['大口径蒸锅', '长椭圆形深鱼盘', '热油小奶锅'],
    weatherStamp: '☀️ 晴暖好食',
    createdAt: '2026-11-01',
    updatedAt: '2026-11-10',
    ingredients: [
      { id: 'sb1', name: '鲜活海鲈鱼（约650g，去鳞去鳃清净黑膜）', amount: 1, unit: '条', category: 'main', note: '鱼背两侧厚肉处划花刀更易熟透' },
      { id: 'sb2', name: '小香葱（切细丝泡清水卷曲）', amount: 4, unit: '根', category: 'garnish', note: '葱白垫底、葱绿切丝铺面' },
      { id: 'sb3', name: '嫩生姜丝与红甜椒细丝', amount: 25, unit: '克', category: 'garnish' },
      { id: 'sb4', name: '广式蒸鱼豉油', amount: 35, unit: '毫升', category: 'seasoning', note: '沿盘边淋入，勿直接浇在白鱼肉上' },
      { id: 'sb5', name: '花生油 / 玉米油', amount: 25, unit: '毫升', category: 'seasoning', note: '烧至微微冒青烟激香葱丝' },
      { id: 'sb6', name: '广东米酒 / 料酒', amount: 15, unit: '毫升', category: 'seasoning' }
    ],
    steps: [
      {
        id: 'sbs1',
        stepNumber: 1,
        title: '去净贴骨血与葱姜架空垫底',
        description: '海鲈鱼腹内黑膜和脊骨处的贴骨瘀血用牙刷或流水彻底洗净（这是零腥味核心）。鱼身抹少许米酒，盘底横放两段大葱将鱼身架空，便于蒸汽360度循环受热。',
        durationMinutes: 5,
        heat: '微火',
        tip: '蒸之前绝对不要抹盐！提前抹盐会让鱼肉脱水发紧发柴。'
      },
      {
        id: 'sbs2',
        stepNumber: 2,
        title: '沸水入锅大火精准蒸8分钟',
        description: '蒸锅水必须彻底大滚冒足蒸汽后再放入鱼盘，加盖保持最大火精准计时8分钟，时间一到关火再虚蒸焖2分钟出锅。',
        durationMinutes: 8,
        heat: '大火',
        hasTimerPush: true,
        timerLabel: '大火蒸鲈鱼',
        tip: '650g左右的鱼8分钟刚断生最滑嫩，多蒸3分钟肉质就会变老。'
      },
      {
        id: 'sbs3',
        stepNumber: 3,
        title: '倾倒腥汤、泼滚油激葱香',
        description: '端出鱼盘，拣去垫底旧葱姜，将盘中蒸出的腥味汤水彻底倒掉！在鱼身铺满泡卷的葱姜红椒细丝，烧热25ml花生油“滋啦”一声泼在葱丝上，最后沿盘边淋入温热的蒸鱼豉油即可。',
        durationMinutes: 2,
        heat: '大火',
        tip: '蒸出来的原汤集合了全部鱼腥，倒掉后再淋豉油味道立刻升级为粤菜馆水准！'
      }
    ],
    review: {
      tastingNotes: '鱼肉洁白滑嫩，用筷子轻轻一拨就呈蒜瓣状脱落。热油激出的鲜葱香与咸鲜微甜的豉油完美衬托海鲈鱼的清甜。',
      pitfallsAndLessons: '切葱丝后泡在凉白开里2分钟会自动打卷，摆盘颜值翻倍。',
      pairingSuggestions: '丝苗白米饭、蒜蓉炒菜心。',
      ratings: { taste: 5, difficulty: 2, reproducibility: 5, presentation: 5 },
      stickers: ['✨ 满分硬菜', '💪 低卡饱腹', '🎯 零失败配方'],
      dinerFeedback: '“按官方公式倒掉蒸鱼水再泼油，真的完全没有半点土腥味！”',
      cookDate: '2026-11-08'
    },
    comments: [
      {
        id: 'oc_1',
        authorName: '阿林私房菜',
        authorAvatar: AVATAR_SVG_MAP.chef_boy_cap,
        content: '架空鱼身和倒掉蒸鱼汤这两步写得太到位了，新手看一遍就能学会！',
        createdAt: '2026-11-09'
      }
    ]
  },

  // 2. 家常中餐 · 经典小炒
  {
    id: 'official-hunan-stirfry-pork',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 142,
    likedBy: ['demo_user_1'],
    title: '锅气农家樟树港辣椒小炒黑猪肉',
    subtitle: '先干煸虎皮青椒再合炒五花薄片，香辣浓郁的下饭天花板。',
    coverImage: '',
    category: '家常中餐',
    subCategory: '经典小炒',
    cuisine: '湘味家常',
    tags: ['官方严选', '米饭杀手', '15分钟快手'],
    prepTimeMinutes: 8,
    cookTimeMinutes: 7,
    baseServings: 2,
    estimatedCalories: 890,
    difficulty: 2,
    utensils: ['熟铁炒锅', '锅铲'],
    weatherStamp: '🔥 锅气十足',
    createdAt: '2026-11-02',
    updatedAt: '2026-11-10',
    ingredients: [
      { id: 'hp1', name: '黑猪前腿瘦肉（切薄片腌制）', amount: 180, unit: '克', category: 'main', note: '加少许生抽与油抓匀锁水' },
      { id: 'hp2', name: '带皮五花肉薄片', amount: 100, unit: '克', category: 'main', note: '煸出猪油香气更魂牵梦绕' },
      { id: 'hp3', name: '樟树港青辣椒 / 螺丝椒（滚刀块）', amount: 220, unit: '克', category: 'main' },
      { id: 'hp4', name: '拍松独头蒜与浏阳豆豉', amount: 20, unit: '克', category: 'seasoning' },
      { id: 'hp5', name: '酿造生抽与蚝油', amount: 20, unit: '毫升', category: 'seasoning' }
    ],
    steps: [
      {
        id: 'hps1',
        stepNumber: 1,
        title: '无油干锅擂煸虎皮青椒',
        description: '铁锅烧热不放油，直接倒入青椒块与少许盐，中火用锅铲反复按压干煸2分钟，至辣椒表皮起焦斑微软、激发出浓郁椒香，盛出备用。',
        durationMinutes: 2,
        heat: '中火',
        tip: '无油干煸能让青椒去掉生涩水汽，后续吸满肉汁更入味。'
      },
      {
        id: 'hps2',
        stepNumber: 2,
        title: '煸香五花油脂与快滑瘦肉',
        description: '热锅少油下五花肉片煸至透明微卷出猪油，投入拍蒜与黑豆豉爆香，转最大火下腌好的前腿瘦肉快速滑炒1分钟至变色。',
        durationMinutes: 3,
        heat: '大火',
        tip: '肥瘦分开下锅，五花肉焦香而瘦肉依然保持极致嫩滑！'
      },
      {
        id: 'hps3',
        stepNumber: 3,
        title: '回锅猛火合炒淋锅边醋酱',
        description: '倒入煸好的虎皮辣椒，沿高温锅边淋入生抽与蚝油激出焦香锅气，大火快速翻匀20秒即可出锅装盘。',
        durationMinutes: 2,
        heat: '大火',
        tip: '生抽沿滚烫锅边淋入能瞬间汽化提香，切忌久炒出水。'
      }
    ],
    review: {
      tastingNotes: '辣椒比肉还要抢手！吸饱了黑猪油与豆豉酱香，柔软微辣回甜，每次做这道菜电饭煲都要多煮一杯米。',
      pitfallsAndLessons: '豆豉和生抽自带咸度，煸辣椒时已放底盐，出锅无需再补盐。',
      pairingSuggestions: '热腾腾五常大米饭、冰镇酸梅汤。',
      ratings: { taste: 5, difficulty: 2, reproducibility: 5, presentation: 4 },
      stickers: ['🍚 米饭杀手', '⏱️ 15分钟快手', '🔥 锅气十足'],
      dinerFeedback: '“肥瘦分炒这个细节绝了，瘦肉一点都不柴！”',
      cookDate: '2026-11-09'
    }
  },

  // 3. 家常中餐 · 香煎酥炸
  {
    id: 'official-crispy-potstickers',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 119,
    likedBy: [],
    title: '冰花脆底爆汁鲜肉生煎锅贴',
    subtitle: '一勺黄金面粉水煎出琥珀蕾丝冰花，咬开满口葱香鲜甜肉汤。',
    coverImage: '',
    category: '家常中餐',
    subCategory: '香煎酥炸',
    cuisine: '江南点心',
    tags: ['官方严选', '早餐主食', '酥脆爆汁'],
    prepTimeMinutes: 20,
    cookTimeMinutes: 12,
    baseServings: 3,
    estimatedCalories: 920,
    difficulty: 3,
    utensils: ['26cm平底不粘煎锅', '透明玻璃锅盖'],
    weatherStamp: '☀️ 晴暖好食',
    createdAt: '2026-11-03',
    updatedAt: '2026-11-10',
    ingredients: [
      { id: 'cp1', name: '三分肥七分瘦梅花猪肉馅', amount: 300, unit: '克', category: 'main' },
      { id: 'cp2', name: '手工水饺皮', amount: 24, unit: '张', category: 'main' },
      { id: 'cp3', name: '葱姜花椒水（分三次打入肉馅）', amount: 90, unit: '毫升', category: 'seasoning', note: '咬开爆汁的核心秘诀' },
      { id: 'cp4', name: '黄金冰花水（10g低粉+5g淀粉+110g水+5g油）', amount: 130, unit: '毫升', category: 'seasoning' },
      { id: 'cp5', name: '熟黑芝麻与细香葱花', amount: 1, unit: '小碟', category: 'garnish' }
    ],
    steps: [
      {
        id: 'cps1',
        stepNumber: 1,
        title: '顺时针搅打吸满葱姜水肉馅',
        description: '猪肉馅加生抽、蚝油、白胡椒粉与一撮糖，分三次倒入90ml葱姜水，顺着同一方向用力搅打上劲，最后拌入葱花与香油锁住水分；包入饺子皮只捏合中间，两端留小口。',
        durationMinutes: 15,
        heat: '微火',
        tip: '锅贴两端不封死能让多余水汽散出，外皮更紧实不破肚。'
      },
      {
        id: 'cps2',
        stepNumber: 2,
        title: '煎出焦黄底壳再淋冰花面粉水',
        description: '平底锅刷油整齐码入锅贴，中火先煎2分钟至底部微黄定型。搅匀冰花面粉水沿锅边淋入（没过锅贴1/3高度），立即盖盖中火焖煎8分钟。',
        durationMinutes: 8,
        heat: '中火',
        hasTimerPush: true,
        timerLabel: '焖煎锅贴冰花',
        tip: '冰花水里加5g食用油，煎出的蕾丝脆裙会无比酥松不粘牙。'
      },
      {
        id: 'cps3',
        stepNumber: 3,
        title: '收干水分撒黑芝麻倒扣出锅',
        description: '听见锅内水声消失转为清脆滋滋油声时开盖，撒黑芝麻与葱花，转小火转动锅身让边缘受热均匀成琥珀金黄，倒扣装盘展现完整冰花！',
        durationMinutes: 2,
        heat: '小火',
        tip: '找一个比锅口略小的圆盘扣在锅贴上，快速翻转平底锅即可完整脱模。'
      }
    ],
    review: {
      tastingNotes: '金黄蕾丝冰花咔嚓脆响，内馅鲜嫩多汁，蘸一点镇江香醋配姜丝简直绝配！',
      pitfallsAndLessons: '调冰花水面水比例保持在 1:10 最容易形成漂亮网状冰花。',
      pairingSuggestions: '现磨无糖热豆浆、小米南瓜粥、镇江香醋。',
      ratings: { taste: 5, difficulty: 3, reproducibility: 5, presentation: 5 },
      stickers: ['✨ 满分硬菜', '👶 阖家皆欢', '💡 私房秘籍'],
      dinerFeedback: '“周末早上煎一盘端上桌，全家抢着掰边上的脆冰花吃！”',
      cookDate: '2026-11-08'
    }
  },

  // 4. 日韩和风 · 寿喜烧
  {
    id: 'official-wagyu-sukiyaki',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 195,
    likedBy: ['demo_user_1', 'user-momo'],
    title: '关西风味焦糖和牛寿喜烧暖锅',
    subtitle: '牛脂涂锅先煎大葱与雪花肥牛，裹满朝一可生食蛋液入口即化。',
    coverImage: dishSukiyakiHotpot,
    category: '日韩和风',
    subCategory: '日式烧物丼饭',
    cuisine: '日式关西锅物',
    tags: ['官方严选', '冬日暖锅', '聚餐仪式感'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    baseServings: 2,
    estimatedCalories: 1180,
    difficulty: 2,
    utensils: ['浅口铸铁寿喜锅', '卡式炉', '竹制料理长筷'],
    weatherStamp: '❄️ 冬日慢炖',
    createdAt: '2026-11-04',
    updatedAt: '2026-11-11',
    ingredients: [
      { id: 'sk1', name: 'M7雪花和牛上脑薄切 / 谷饲肥牛大片', amount: 300, unit: '克', category: 'main' },
      { id: 'sk2', name: '板豆腐（表面微煎切块）与魔芋结', amount: 250, unit: '克', category: 'main' },
      { id: 'sk3', name: '鲜香菇（刻十字花刀）、金针菇与茼蒿菜', amount: 260, unit: '克', category: 'main' },
      { id: 'sk4', name: '京葱斜切厚段与洋葱丝', amount: 120, unit: '克', category: 'main' },
      { id: 'sk5', name: '关西寿喜烧黄金汁（日式酱油60ml+味淋60ml+清酒40ml+黄糖20g）', amount: 180, unit: '毫升', category: 'seasoning' },
      { id: 'sk6', name: '可生食无菌鸡蛋', amount: 2, unit: '枚', category: 'garnish', note: '打散做灵魂蘸料' }
    ],
    steps: [
      {
        id: 'sks1',
        stepNumber: 1,
        title: '牛油润锅煎香京葱与首片和牛',
        description: '铸铁浅锅烧热，用牛油块擦满锅底，先将大葱段煎出微焦虎皮香。铺入两大片雪花和牛，撒少许黄糖，淋入两勺寿喜烧酱汁“滋啦”收紧，先趁热裹生食蛋液享用第一口！',
        durationMinutes: 4,
        heat: '中火',
        tip: '关西流派灵魂就是“先煎肉吃头啖鲜，再下蔬菜咕嘟炖煮”。'
      },
      {
        id: 'sks2',
        stepNumber: 2,
        title: '码齐菌菇豆腐与灵魂汤汁煨煮',
        description: '在锅中分区域整齐码入煎豆腐、十字花香菇、魔芋丝、娃娃菜与剩余和牛，倒入调好的寿喜烧黄金汁与120ml昆布清汤（蔬菜本身还会释放清甜汁水）。',
        durationMinutes: 8,
        heat: '中火',
        hasTimerPush: true,
        timerLabel: '寿喜烧煨煮入味',
        tip: '娃娃菜和金针菇受热会出大量水，清汤切勿加多以免冲淡酱香。'
      },
      {
        id: 'sks3',
        stepNumber: 3,
        title: '烫入春菊茼蒿与乌冬收尾',
        description: '开锅后放入翠绿茼蒿烫30秒即可开动。吃完肉菜后，剩下的浓郁甜咸汤底煮一份赞岐乌冬面吸满精华。',
        durationMinutes: 3,
        heat: '小火',
        tip: '魔芋丝不要紧挨着牛肉摆放，魔芋中的钙质如果直接贴着生牛肉久煮会让肉质微硬。'
      }
    ],
    review: {
      tastingNotes: '滚烫软嫩的和牛蘸满冰凉顺滑的生蛋液，甜咸交织完全不腻，冬夜围着卡式炉吃幸福感爆棚！',
      pitfallsAndLessons: '自己用日式丸大豆酱油+味淋+清酒按 3:3:2 调汁，比现成瓶装寿喜烧汁醇厚清爽太多。',
      pairingSuggestions: '冰镇柚子梅酒、赞岐手打乌冬面。',
      ratings: { taste: 5, difficulty: 2, reproducibility: 5, presentation: 5 },
      stickers: ['❄️ 冬日慢炖', '✨ 满分硬菜', '🌿 治愈系美味'],
      dinerFeedback: '“家里瞬间变成日剧深夜食堂，摆盘拍照太出片了！”',
      cookDate: '2026-11-10'
    }
  },

  // 5. 日韩和风 · 照烧鸡腿饭
  {
    id: 'official-teriyaki-chicken-don',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 154,
    likedBy: ['demo_user_1'],
    title: '琥珀蜜汁脆皮照烧鸡腿丼',
    subtitle: '不放一滴油煎出咔嚓黄金脆鸡皮，3:2:2:1 万能照烧汁配方必背！',
    coverImage: '',
    category: '日韩和风',
    subCategory: '日式烧物丼饭',
    cuisine: '日式家常丼饭',
    tags: ['官方严选', '带饭便当', '15分钟快手'],
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
    baseServings: 2,
    estimatedCalories: 740,
    difficulty: 1,
    utensils: ['不粘平底锅', '厨房剪刀'],
    weatherStamp: '☀️ 晴暖好食',
    createdAt: '2026-11-04',
    updatedAt: '2026-11-10',
    ingredients: [
      { id: 'tk1', name: '琵琶大鸡腿（去骨断筋扎小孔）', amount: 2, unit: '只', category: 'main', note: '用厨房纸吸干水汽防溅油' },
      { id: 'tk2', name: '万能照烧汁（3勺生抽+2勺料酒+2勺味淋+1勺蜂蜜）', amount: 80, unit: '毫升', category: 'seasoning' },
      { id: 'tk3', name: '焯水西兰花与溏心荷包蛋', amount: 2, unit: '份', category: 'garnish' },
      { id: 'tk4', name: '熟白芝麻与海苔碎', amount: 1, unit: '小撮', category: 'garnish' }
    ],
    steps: [
      {
        id: 'tks1',
        stepNumber: 1,
        title: '鸡皮朝下无油慢煎逼脂',
        description: '去骨鸡腿肉面撒少许海盐黑胡椒。平底锅不放油，直接将鸡皮朝下冷锅放入，中小火用铲子轻轻按压慢煎5分钟，直至鸡皮金黄酥脆逼出鸡油，翻面再煎2分钟。',
        durationMinutes: 7,
        heat: '中火',
        tip: '用厨房纸吸走锅中多余鸡油再倒照烧汁，酱汁才不会油水分离，挂芡更透亮！'
      },
      {
        id: 'tks2',
        stepNumber: 2,
        title: '倒入万能照烧汁大火收浓挂亮芡',
        description: '倒入调好的万能照烧汁，大火煮出绵密琥珀大泡，不断用汤勺将浓汁浇淋在鸡腿表面，收浓后盛出静置2分钟切宽条，铺在热米饭上撒白芝麻海苔。',
        durationMinutes: 3,
        heat: '大火',
        tip: '稍微静置2分钟再切条，鸡腿肉汁会回锁，切的时候鸡皮也不会脱落。'
      }
    ],
    review: {
      tastingNotes: '甜咸焦香的琥珀酱汁渗透进米饭粒里，鸡腿肉嫩到咬下去飙汁，做次日午餐便当微波炉叮一下依然巨香！',
      pitfallsAndLessons: '鸡腿肉厚处一定要用剪刀剪断白色筋膜，受热才不会缩成一团。',
      pairingSuggestions: '味噌豆腐海带汤、冰麦茶。',
      ratings: { taste: 5, difficulty: 1, reproducibility: 5, presentation: 5 },
      stickers: ['⏱️ 15分钟快手', '🍚 米饭杀手', '🎯 零失败配方'],
      dinerFeedback: '“厨房小白人生第一道硬菜，室友还以为是点的日料外卖！”',
      cookDate: '2026-11-09'
    }
  },

  // 6. 日韩和风 · 韩式锅物
  {
    id: 'official-kimchi-tofu-stew',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 131,
    likedBy: [],
    title: '首尔街头海鲜泡菜嫩豆腐锅',
    subtitle: '芝麻香油先炒发酵老泡菜与五花肉，滑嫩内酯豆腐吸满热辣鲜汤。',
    coverImage: '',
    category: '日韩和风',
    subCategory: '韩式锅物料理',
    cuisine: '韩式家常料理',
    tags: ['官方严选', '深夜食堂', '酸辣开胃'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    baseServings: 2,
    estimatedCalories: 640,
    difficulty: 1,
    utensils: ['韩式石锅 / 小砂锅'],
    weatherStamp: '🌙 深夜食堂',
    createdAt: '2026-11-05',
    updatedAt: '2026-11-11',
    ingredients: [
      { id: 'kt1', name: '内酯嫩豆腐 / 韩式纯豆腐', amount: 1, unit: '盒', category: 'main', note: '用大勺直接挖块入锅更吸汁' },
      { id: 'kt2', name: '自然发酵辣白菜（连带泡菜汁50ml）', amount: 160, unit: '克', category: 'main' },
      { id: 'kt3', name: '鲜虾仁、花蛤与薄五花肉片', amount: 180, unit: '克', category: 'main' },
      { id: 'kt4', name: '韩式辣椒粉1勺+韩式辣酱1勺+蒜末+香油', amount: 35, unit: '克', category: 'seasoning' },
      { id: 'kt5', name: '生鸡蛋与青红椒圈、大葱圈', amount: 1, unit: '份', category: 'garnish' }
    ],
    steps: [
      {
        id: 'kts1',
        stepNumber: 1,
        title: '香油煸炒五花肉与老泡菜熬红油',
        description: '石锅倒入一勺白芝麻香油，下五花肉片、蒜末与剪碎的老泡菜中火翻炒3分钟，加入韩式辣椒粉与辣酱炒出红亮浓香底油。',
        durationMinutes: 4,
        heat: '中火',
        tip: '泡菜一定要先用香油炒透，汤头才会浓郁醇厚不寡淡。'
      },
      {
        id: 'kts2',
        stepNumber: 2,
        title: '冲入淘米水挖入嫩豆腐同煮',
        description: '倒入450ml温热淘米水（或昆布水）与泡菜汁烧沸，用汤勺大块舀入嫩豆腐，下虾仁与吐净沙的花蛤咕嘟煮6分钟。',
        durationMinutes: 6,
        heat: '中火',
        hasTimerPush: true,
        timerLabel: '泡菜豆腐锅沸煮',
        tip: '用第二遍淘米水煮韩式汤锅，天然米浆能让汤汁自带微微浓稠感。'
      },
      {
        id: 'kts3',
        stepNumber: 3,
        title: '关火磕入窝蛋余温焖成流心',
        description: '出锅前在沸腾中心磕入一枚鸡蛋，撒大葱圈与青红椒圈，立刻关火靠石锅蓄热将蛋白焖凝、蛋黄保持半熟流心。',
        durationMinutes: 2,
        heat: '关火焖',
        tip: '戳破流心蛋黄拌着嫩豆腐和米饭一起吃，鲜辣度柔和十倍！'
      }
    ],
    review: {
      tastingNotes: '花蛤和鲜虾赋予了汤底极致的海洋鲜甜，酸辣滚烫的嫩豆腐一抿即化，深夜加班回家12分钟就能吃上热汤锅。',
      pitfallsAndLessons: '选发酵超过两周偏酸的老泡菜煮汤味道最地道，新泡菜偏甜不够酸爽。',
      pairingSuggestions: '紫米杂粮饭、烤海苔片。',
      ratings: { taste: 5, difficulty: 1, reproducibility: 5, presentation: 4 },
      stickers: ['🥣 暖胃熨帖', '⏱️ 15分钟快手', '🍚 米饭杀手'],
      dinerFeedback: '“用淘米水做汤底真的比白水醇厚很多，连汤都喝得一滴不剩！”',
      cookDate: '2026-11-10'
    }
  },

  // 7. 暖胃汤羹 · 椰子竹荪鸡汤
  {
    id: 'official-coconut-chicken-soup',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 184,
    likedBy: ['demo_user_1', 'user-chef-chen'],
    title: '广式纯椰青竹荪慢煲散养土鸡汤',
    subtitle: '不加一滴生水，两颗泰国鲜椰青原汁入砂锅，清润甘甜零油腻。',
    coverImage: dishCoconutChickenSoup,
    category: '暖胃汤羹',
    subCategory: '老火慢煲靓汤',
    cuisine: '广式清补汤水',
    tags: ['官方严选', '秋冬润燥', '清甜低脂'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    baseServings: 4,
    estimatedCalories: 690,
    difficulty: 2,
    utensils: ['粗陶砂锅', '滤网撇油勺'],
    weatherStamp: '🍂 微风闲日',
    createdAt: '2026-11-05',
    updatedAt: '2026-11-11',
    ingredients: [
      { id: 'cc1', name: '文昌鸡 / 散养鲜嫩三黄鸡（斩块去肥油）', amount: 600, unit: '克', category: 'main' },
      { id: 'cc2', name: '新鲜泰国椰青（取纯椰子水约750ml+挖嫩椰肉条）', amount: 2, unit: '个', category: 'main' },
      { id: 'cc3', name: '贵州干竹荪（淡盐水泡发剪去菌盖头）', amount: 20, unit: '克', category: 'main', note: '吸饱椰香鸡汤脆嫩爽口' },
      { id: 'cc4', name: '珍珠马蹄（去皮）与老姜片', amount: 8, unit: '颗', category: 'main' },
      { id: 'cc5', name: '宁夏红枸杞与海盐', amount: 10, unit: '克', category: 'garnish', note: '关火前3分钟再放盐与枸杞' }
    ],
    steps: [
      {
        id: 'ccs1',
        stepNumber: 1,
        title: '鲜鸡微焯净水与撕除黄油块',
        description: '斩好的土鸡块撕去皮下多余黄色油脂块，冷水下锅加两片姜焯水1分钟撇净浮沫，捞出温水洗净沥干。干竹荪用淡盐水泡10分钟，剪掉封闭的一端与网状伞裙异味源。',
        durationMinutes: 10,
        heat: '大火',
        tip: '竹荪尾端封闭的小圈一定要剪掉，汤味才会纯粹清香无怪味。'
      },
      {
        id: 'ccs2',
        stepNumber: 2,
        title: '纯鲜椰青水入砂锅微沸慢炖',
        description: '砂锅倒入750ml纯椰青水（若不够可补200ml矿泉水），放入鸡块、嫩椰肉条、马蹄与两片姜。大火烧沸后转小火微沸慢煲25分钟。',
        durationMinutes: 25,
        heat: '小火',
        hasTimerPush: true,
        timerLabel: '砂锅慢煲椰子鸡',
        tip: '嫩鸡切忌煲超过40分钟，25~30分钟鸡肉最滑嫩且椰水不会发酸。'
      },
      {
        id: 'ccs3',
        stepNumber: 3,
        title: '下竹荪枸杞轻盐提鲜出锅',
        description: '放入泡发挤干水分的竹荪段续煮5分钟，关火前撒入洗净的枸杞与一小撮海盐（椰青自带甘甜，盐只需平时的1/3量）。可配沙姜青桔酱油碟蘸食鸡肉！',
        durationMinutes: 5,
        heat: '小火',
        tip: '少许海盐能产生“百味盐为先”的对比效应，把椰汁清甜彻底激发出来。'
      }
    ],
    review: {
      tastingNotes: '掀开砂锅盖满屋子天然清椰奶香！汤色金黄澄澈，竹荪吸饱了清甜鸡汤咬下去脆嫩爆汁，秋冬嗓子干喝两碗整个人都润了。',
      pitfallsAndLessons: '蘸料用拍碎的沙姜+小米辣+挤入两颗小青桔汁+生抽，海南正宗灵魂吃法！',
      pairingSuggestions: '沙姜青桔蘸碟、腊味煲仔饭。',
      ratings: { taste: 5, difficulty: 2, reproducibility: 5, presentation: 5 },
      stickers: ['🥣 暖胃熨帖', '🌿 治愈系美味', '👶 阖家皆欢'],
      dinerFeedback: '“比外面排队两小时的椰子鸡火锅还要鲜甜干净！”',
      cookDate: '2026-11-11'
    }
  },

  // 8. 暖胃汤羹 · 法式黑松露蘑菇汤
  {
    id: 'official-truffle-mushroom-soup',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 126,
    likedBy: [],
    title: '法式Bistro黑松露奶油口蘑浓汤',
    subtitle: '白蘑菇炒至焦糖化释放10倍鲜味，无需面粉炒面糊也能浓稠如天鹅绒。',
    coverImage: '',
    category: '暖胃汤羹',
    subCategory: '西式浓汤',
    cuisine: '法式西餐汤品',
    tags: ['官方严选', '西式浓汤', '约会仪式感'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 18,
    baseServings: 2,
    estimatedCalories: 540,
    difficulty: 2,
    utensils: ['厚底奶锅', '手持料理棒 / 破壁机'],
    weatherStamp: '🌧️ 雨天暖锅',
    createdAt: '2026-11-06',
    updatedAt: '2026-11-11',
    ingredients: [
      { id: 'tm1', name: '新鲜白口蘑与褐菇（切片，留2颗切薄片装饰）', amount: 350, unit: '克', category: 'main' },
      { id: 'tm2', name: '白洋葱碎与粉糯土豆小薄片（天然增稠免面粉）', amount: 120, unit: '克', category: 'main', note: '半颗小土豆切薄片代替炒面粉，口感更轻盈无粉感' },
      { id: 'tm3', name: '无盐黄油20g + 动物淡奶油80ml + 全脂牛奶200ml', amount: 300, unit: '毫升', category: 'seasoning' },
      { id: 'tm4', name: '意式黑松露酱与现磨黑胡椒、百里香', amount: 15, unit: '克', category: 'garnish' }
    ],
    steps: [
      {
        id: 'tms1',
        stepNumber: 1,
        title: '黄油慢炒洋葱与口蘑至深金黄焦糖化',
        description: '厚底锅融化黄油，炒软白洋葱碎后下口蘑片与百里香。中大火耐心翻炒8分钟，蘑菇会先出水再收干并煎出深金黄焦边，鲜味物质浓缩十倍！',
        durationMinutes: 8,
        heat: '中火',
        tip: '蘑菇没炒上色就加水是浓汤寡淡的最大原因，务必炒出焦香！'
      },
      {
        id: 'tms2',
        stepNumber: 2,
        title: '加入薄土豆片与鲜奶微煮搅打细腻',
        description: '下薄土豆片、牛奶与150ml清水小火煮8分钟至土豆软烂。拣去百里香梗，用料理棒搅打40秒成丝绒浓汤（不必打得过于粉碎，保留微细菌菇颗粒感更高级）。',
        durationMinutes: 8,
        heat: '小火',
        tip: '利用土豆天然淀粉增稠，比传统黄油炒面粉热量减半且毫无糊嗓感。'
      },
      {
        id: 'tms3',
        stepNumber: 3,
        title: '淋入淡奶油与黑松露酱点缀出餐',
        description: '倒回锅中加80ml淡奶油、海盐黑胡椒小火温热1分钟（切勿大沸）。装盘表面摆煎香蘑菇薄片，挖一勺黑松露酱淋几滴橄榄油即可配烤法棍上桌。',
        durationMinutes: 2,
        heat: '微火',
        tip: '黑松露酱香气极易高温挥发，出锅装盘后再点缀香气最迷人。'
      }
    ],
    review: {
      tastingNotes: '烤蒜香法棍蘸进绵密滚烫的黑松露浓汤里，脆壳与浓醇奶香在口中交融，完全媲美西餐厅68元一碗的出品！',
      pitfallsAndLessons: '褐菇（牛排菇）搭配白口蘑按 1:2 混用，菌菇森林香气会更有纵深感。',
      pairingSuggestions: '蒜香黄油烤欧包脆片、凯撒沙拉。',
      ratings: { taste: 5, difficulty: 2, reproducibility: 5, presentation: 5 },
      stickers: ['🥣 暖胃熨帖', '🍷 绝佳佐餐', '✨ 满分硬菜'],
      dinerFeedback: '“用半颗土豆代替面粉增稠太聪明了，喝完一大盘完全不腻！”',
      cookDate: '2026-11-10'
    }
  },

  // 9. 暖胃汤羹 · 番茄滑牛肉生滚汤
  {
    id: 'official-tomato-beef-soup',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 149,
    likedBy: [],
    title: '顺德古法番茄滑牛肉生滚浓汤',
    subtitle: '沙瓤番茄炒出红亮茄汁底，吊龙牛肉滚水烫30秒滑嫩惊艳。',
    coverImage: '',
    category: '暖胃汤羹',
    subCategory: '快手生滚汤',
    cuisine: '广式生滚汤',
    tags: ['官方严选', '15分钟快手', '酸甜开胃'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    baseServings: 2,
    estimatedCalories: 460,
    difficulty: 1,
    utensils: ['深汤锅'],
    weatherStamp: '☀️ 晴暖好食',
    createdAt: '2026-11-06',
    updatedAt: '2026-11-11',
    ingredients: [
      { id: 'tb1', name: '新鲜牛里脊 / 吊龙（逆纹切薄片）', amount: 200, unit: '克', category: 'main', note: '加姜汁水、生抽、红薯淀粉与花生油抓腌锁水' },
      { id: 'tb2', name: '自然熟沙瓤大番茄（十字划刀烫去皮切块）', amount: 3, unit: '个', category: 'main' },
      { id: 'tb3', name: '金针菇与嫩豆腐小丁', amount: 150, unit: '克', category: 'main' },
      { id: 'tb4', name: '葱白粒、纯番茄膏1小勺、白胡椒粉', amount: 15, unit: '克', category: 'seasoning' }
    ],
    steps: [
      {
        id: 'tbs_1',
        stepNumber: 1,
        title: '逆纹切牛片与花生油封浆锁嫩',
        description: '牛肉逆着肌肉纹理切薄片，抓入两勺葱姜水、半勺生抽和一平勺红薯淀粉至起黏，最后淋一勺花生油封住表面静置8分钟。',
        durationMinutes: 5,
        heat: '微火',
        tip: '腌牛肉绝对不要放盐和料酒！盐会让牛肉脱水变老，姜汁水去腥最清甜。'
      },
      {
        id: 'tbs_2',
        stepNumber: 2,
        title: '压炒去皮沙瓤番茄熬浓红汤',
        description: '少油爆香葱白，倒入2/3去皮番茄块与一小勺纯番茄膏，加一撮盐中火边炒边用铲背按压出红沙浓汁，冲入600ml开水，下金针菇与剩余番茄块煮3分钟。',
        durationMinutes: 5,
        heat: '大火',
        tip: '加一撮底盐能让番茄细胞壁迅速破裂出沙。'
      },
      {
        id: 'tbs_3',
        stepNumber: 3,
        title: '微沸散下牛肉片30秒关火生滚',
        description: '调至小火保持汤面微沸，将牛肉片逐片散入锅中，静待15秒定型不脱浆后再轻轻推散，牛肉刚变粉白（约30秒）立即关火，撒白胡椒粉与香菜葱花出锅！',
        durationMinutes: 2,
        heat: '小火',
        tip: '生滚汤切忌大火翻滚冲散淀粉保护衣，30秒余温浸熟嫩如豆腐！'
      }
    ],
    review: {
      tastingNotes: '酸甜浓郁的纯天然番茄红汤开胃极了，牛肉片滑溜细嫩，浇两勺在米饭上瞬间变身神仙番茄牛肉汤饭！',
      pitfallsAndLessons: '番茄一定要用开水烫掉外皮，喝汤时才不会吃到卷曲的果皮渣。',
      pairingSuggestions: '胚芽米饭、杂粮馒头。',
      ratings: { taste: 5, difficulty: 1, reproducibility: 5, presentation: 4 },
      stickers: ['⏱️ 15分钟快手', '🥣 暖胃熨帖', '👶 阖家皆欢'],
      dinerFeedback: '“没胃口的日子煮这一锅，酸酸甜甜全家老小都抢着喝汤！”',
      cookDate: '2026-11-11'
    }
  },

  // 10. 健康轻食 · 夏威夷三文鱼能量碗
  {
    id: 'official-salmon-poke-bowl',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 173,
    likedBy: ['demo_user_1'],
    title: '夏威夷牛油果香煎三文鱼能量碗',
    subtitle: '外焦里嫩的骰子三文鱼配软糯牛油果与三色藜麦，520大卡高蛋白彩虹碗。',
    coverImage: dishSalmonPokeBowl,
    category: '健康轻食',
    subCategory: '高蛋白增肌碗',
    cuisine: '夏威夷轻食 Poké',
    tags: ['官方严选', '减脂增肌', '520大卡'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 6,
    baseServings: 1,
    estimatedCalories: 520,
    difficulty: 1,
    utensils: ['不粘煎锅', '宽口粗陶碗'],
    weatherStamp: '☀️ 晴暖好食',
    createdAt: '2026-11-07',
    updatedAt: '2026-11-12',
    ingredients: [
      { id: 'pk1', name: '挪威冰鲜三文鱼中段（去皮切2.5cm厚方块）', amount: 140, unit: '克', category: 'main' },
      { id: 'pk2', name: '熟透哈斯牛油果（半颗切片）与熟毛豆仁', amount: 110, unit: '克', category: 'main' },
      { id: 'pk3', name: '熟三色藜麦糙米饭', amount: 130, unit: '克', category: 'main' },
      { id: 'pk4', name: '紫甘蓝细丝、水果黄瓜片与樱桃萝卜片', amount: 90, unit: '克', category: 'garnish' },
      { id: 'pk5', name: '日式柑橘酱油油醋汁（减盐酱油15ml+青柠汁10ml+芝麻油5ml+芥末少许）', amount: 30, unit: '毫升', category: 'seasoning' }
    ],
    steps: [
      {
        id: 'pks1',
        stepNumber: 1,
        title: '高火快煎三文鱼金黄脆壳锁住溏心',
        description: '三文鱼方块吸干水分，撒少许海盐黑胡椒与熟白芝麻。不粘锅喷薄油大火烧热，下三文鱼块每面仅煎35秒，外层金黄焦脆、内芯保持橙粉柔润多汁。',
        durationMinutes: 3,
        heat: '大火',
        tip: '三文鱼富含Omega-3，千万不要全熟煎透，外焦内润口感最佳不发柴！'
      },
      {
        id: 'pks2',
        stepNumber: 2,
        title: '彩虹分区摆盘与柑橘芥末汁拌合',
        description: '碗底铺温热三色藜麦糙米饭，按色系依次码放绿毛豆、紫甘蓝丝、粉白樱桃萝卜与扇形牛油果，中心摆上焦香三文鱼块，淋入清爽柑橘酱油汁撒海苔芝麻即可。',
        durationMinutes: 3,
        heat: '微火',
        tip: '切开的牛油果表面滴两滴青柠汁可防止氧化变黑。'
      }
    ],
    review: {
      tastingNotes: '完全颠覆减脂餐“吃草”的刻板印象！微呛清新的柑橘酱油衬托出三文鱼脂香和牛油果的奶油质感，吃完饱腹感持续整个下午。',
      pitfallsAndLessons: '三色藜麦提前周末煮好按130g一餐分装冷冻，工作日微波炉热90秒就能装碗。',
      pairingSuggestions: '无糖冷萃茉莉花茶、冰美式。',
      ratings: { taste: 5, difficulty: 1, reproducibility: 5, presentation: 5 },
      stickers: ['💪 低卡饱腹', '⏱️ 15分钟快手', '🌿 治愈系美味'],
      dinerFeedback: '“健身教练看完配料表直夸碳水、优质蛋白和好脂肪比例堪称教科书！”',
      cookDate: '2026-11-11'
    }
  },

  // 11. 健康轻食 · 低温盐水嫩烤鸡胸温沙拉
  {
    id: 'official-mediterranean-chicken-salad',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 138,
    likedBy: [],
    title: '5%淡盐水爆汁迷迭香鸡胸温烤时蔬碗',
    subtitle: '揭秘星级西厨 Brining 盐水浸泡黑科技，鸡胸肉嫩如鸡腿不再干柴！',
    coverImage: '',
    category: '健康轻食',
    subCategory: '低卡减脂餐',
    cuisine: '地中海轻食',
    tags: ['官方严选', '高蛋白减脂', '温沙拉'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    baseServings: 2,
    estimatedCalories: 430,
    difficulty: 2,
    utensils: ['烤箱 / 空气炸锅', '平底煎锅'],
    weatherStamp: '🍂 微风闲日',
    createdAt: '2026-11-07',
    updatedAt: '2026-11-12',
    ingredients: [
      { id: 'mc1', name: '整块新鲜鸡胸肉', amount: 260, unit: '克', category: 'main', note: '用200ml清水+8g盐浸泡20分钟（爆汁核心）' },
      { id: 'mc2', name: '贝贝南瓜薄块、芦笋段、小番茄与口蘑', amount: 280, unit: '克', category: 'main' },
      { id: 'mc3', name: '新鲜迷迭香、蒜瓣、甜椒粉与初榨橄榄油', amount: 20, unit: '克', category: 'seasoning' },
      { id: 'mc4', name: '意大利黑醋油醋汁与羽衣甘蓝嫩叶', amount: 40, unit: '克', category: 'garnish' }
    ],
    steps: [
      {
        id: 'mcs1',
        stepNumber: 1,
        title: '5%淡盐水渗透锁水（告别柴鸡胸关键）',
        description: '200ml清水中融化8g食盐与两片柠檬，放入整块鸡胸肉冷藏浸泡20分钟。取出彻底擦干水分，抹橄榄油、黑胡椒、甜椒粉与迷迭香碎。',
        durationMinutes: 10,
        heat: '微火',
        tip: '盐水改变肌肉蛋白结构，受热收缩时能多锁住30%水分！'
      },
      {
        id: 'mcs2',
        stepNumber: 2,
        title: '时蔬与鸡胸同盘高温快烤锁汁',
        description: '贝贝南瓜、芦笋与口蘑拌少许橄榄油海盐铺入烤盘（或空气炸锅），放上整块鸡胸肉，200℃烘烤14分钟。出炉后鸡胸务必静置醒肉5分钟再斜切厚片，铺在温蔬菜与甘蓝叶上淋黑醋汁。',
        durationMinutes: 14,
        heat: '烤箱预热/烘烤',
        hasTimerPush: true,
        timerLabel: '200℃嫩烤鸡胸时蔬',
        tip: '刚出炉切开汁水会白白流光，静置5分钟切开每一片都晶莹爆汁！'
      }
    ],
    review: {
      tastingNotes: '切开鸡胸肉切面泛着丰盈肉汁，搭配烤到焦甜粉糯的贝贝南瓜，肠胃怕凉的人秋冬吃这份温沙拉太舒服了。',
      pitfallsAndLessons: '盐水浸泡后鸡胸自带底味，表面只需撒黑胡椒和香料，不要再撒盐。',
      pairingSuggestions: '温热柠檬水、全麦酸种面包片。',
      ratings: { taste: 5, difficulty: 2, reproducibility: 5, presentation: 5 },
      stickers: ['💪 低卡饱腹', '💡 私房秘籍', '🎯 零失败配方'],
      dinerFeedback: '“用了盐水法再也没吃过干巴巴的鸡胸肉，连做一周减脂餐都没腻！”',
      cookDate: '2026-11-11'
    }
  },

  // 12. 西式轻餐 · 厚切肋眼牛排
  {
    id: 'official-ribeye-steak',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 208,
    likedBy: ['demo_user_1', 'user-lin', 'user-chef-chen'],
    title: '迷迭香黄油淋煎安格斯厚切肋眼牛排',
    subtitle: '美拉德焦脆外壳包裹粉嫩五分熟肉芯，在家掌握西餐厅黄油淋油法。',
    coverImage: dishSearedRibeyeSteak,
    category: '西式轻餐',
    subCategory: '牛排肉排',
    cuisine: '经典美式扒房',
    tags: ['官方严选', '家宴硬菜', '纪念日大餐'],
    prepTimeMinutes: 25,
    cookTimeMinutes: 8,
    baseServings: 2,
    estimatedCalories: 960,
    difficulty: 3,
    utensils: ['厚底铸铁条纹/平底煎锅', '长柄汤勺', '木质切肉板'],
    weatherStamp: '🌙 深夜食堂',
    createdAt: '2026-11-08',
    updatedAt: '2026-11-12',
    ingredients: [
      { id: 'rs1', name: '谷饲安格斯厚切肋眼牛排（厚约3cm，提前室温回温30分钟）', amount: 350, unit: '克', category: 'main' },
      { id: 'rs2', name: '高烟点牛油果油 / 葡萄籽油', amount: 15, unit: '毫升', category: 'seasoning' },
      { id: 'rs3', name: '无盐发酵黄油', amount: 35, unit: '克', category: 'seasoning', note: '后期降温淋油增香' },
      { id: 'rs4', name: '带皮拍松大蒜3瓣 + 新鲜迷迭香2枝', amount: 25, unit: '克', category: 'seasoning' },
      { id: 'rs5', name: '马尔顿片状海盐与现磨粗粒黑胡椒', amount: 5, unit: '克', category: 'garnish' }
    ],
    steps: [
      {
        id: 'rss1',
        stepNumber: 1,
        title: '彻底回温与吸干血水（焦脆硬壳前提）',
        description: '冷藏牛排务必提前30分钟取出回至室温（避免外焦里冰）。下锅前一刻用厨房纸反复吸干表面水汽，双面均匀抹油并撒足海盐。',
        durationMinutes: 5,
        heat: '微火',
        tip: '先不在生肉上撒黑胡椒粉，高温煎制容易把胡椒颗粒烧糊发苦。'
      },
      {
        id: 'rss2',
        stepNumber: 2,
        title: '铸铁锅冒烟封边锁美拉德焦壳',
        description: '铸铁锅大火空烧至微微冒烟，放入牛排先立起煎侧面油脂边40秒，随后平放每面各猛火煎90秒，形成浓郁深褐色焦脆外壳。',
        durationMinutes: 4,
        heat: '大火',
        tip: '刚下锅前60秒不要频繁翻动，让蛋白质与高温铁锅充分发生美拉德焦香反应。'
      },
      {
        id: 'rss3',
        stepNumber: 3,
        title: '关小火投黄油香草浇淋（Basting）与醒肉',
        description: '转小火，投入黄油块、拍蒜与迷迭香。倾斜锅身，用汤勺不断舀起融化起泡的焦香蒜味黄油淋在牛排表面持续1分钟。盛出置于温盘上静置醒肉（Rest）6分钟后逆纹厚切，撒马尔顿海盐片与现磨黑胡椒！',
        durationMinutes: 6,
        heat: '小火',
        hasTimerPush: true,
        timerLabel: '牛排静置醒肉锁汁',
        tip: '醒肉6分钟至关重要！肌纤维舒张吸回肉汁，切开呈完美玫瑰粉红且案板不流血水。'
      }
    ],
    review: {
      tastingNotes: '外层焦脆带着浓郁坚果黄油与迷迭香气息，内里柔嫩爆汁，捏两片脆海盐配一口烤大蒜，纪念日根本不用去高级扒房排队！',
      pitfallsAndLessons: '如果厚度只有1.5cm的薄切牛排，每面煎45秒即可，切勿照搬厚切时间。',
      pairingSuggestions: '赤霞珠干红葡萄酒（Cabernet Sauvignon）、黄油芦笋、土豆泥。',
      ratings: { taste: 5, difficulty: 3, reproducibility: 5, presentation: 5 },
      stickers: ['🍷 绝佳佐餐', '✨ 满分硬菜', '🔥 锅气十足'],
      dinerFeedback: '“五分熟切面太漂亮了，醒肉后真的一滴汁水都没浪费！”',
      cookDate: '2026-11-12'
    }
  },

  // 13. 烘焙甜点 · 流心巴斯克芝士蛋糕
  {
    id: 'official-basque-cheesecake',
    ownerId: OFFICIAL_ACCOUNT_UID,
    authorName: OFFICIAL_EDITORIAL_USER.displayName,
    authorAvatar: OFFICIAL_EDITORIAL_USER.avatarUrl,
    isPublic: true,
    likesCount: 226,
    likedBy: ['demo_user_1', 'user-momo'],
    title: '圣塞巴斯蒂安流心巴斯克芝士蛋糕',
    subtitle: '免打发搅一搅22分钟出炉！微苦焦糖外皮包裹布丁般丝滑流心。',
    coverImage: dishBasqueCheesecake,
    category: '烘焙甜点',
    subCategory: '西式烘焙',
    cuisine: '西班牙经典烘焙',
    tags: ['官方严选', '新手零失败', '下午茶爆款'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 23,
    baseServings: 6,
    estimatedCalories: 1680,
    difficulty: 1,
    utensils: ['6寸活底圆模', '整张揉皱烘焙油纸', '手动打蛋器', '细筛网'],
    weatherStamp: '☕ 下午茶时光',
    createdAt: '2026-11-08',
    updatedAt: '2026-11-12',
    ingredients: [
      { id: 'bc1', name: '奶油奶酪 Cream Cheese（彻底室温软化如牙膏状）', amount: 250, unit: '克', category: 'main' },
      { id: 'bc2', name: '动物性淡奶油（常温）', amount: 145, unit: '克', category: 'main' },
      { id: 'bc3', name: '常温全蛋2个 + 1个纯蛋黄', amount: 118, unit: '克', category: 'main', note: '多加一颗蛋黄让流心更加浓郁金黄' },
      { id: 'bc4', name: '细砂糖', amount: 55, unit: '克', category: 'seasoning', note: '微甜不腻黄金甜度' },
      { id: 'bc5', name: '玉米淀粉8g + 香草精数滴 / 柠檬汁3ml', amount: 11, unit: '克', category: 'seasoning' }
    ],
    steps: [
      {
        id: 'bcs1',
        stepNumber: 1,
        title: '顺滑搅匀奶酪糊（全程切勿打入空气）',
        description: '室温软化的奶油奶酪加细砂糖用刮刀按压顺滑。分三次加入打散的蛋液轻轻搅匀，筛入玉米淀粉拌匀，最后倒入淡奶油与香草精轻柔搅拌，过筛一遍得到丝绸般细腻芝士糊。',
        durationMinutes: 10,
        heat: '微火',
        tip: '全程轻轻画圈拌匀即可，不要快速抽打充气，否则烘烤会过度鼓包开裂。'
      },
      {
        id: 'bcs2',
        stepNumber: 2,
        title: '油纸揉皱铺模与220℃高温猛火上色',
        description: '烘焙油纸揉成一团再展开铺入6寸模具（自然褶皱就是巴斯克经典裙边），倒入芝士糊静置消泡。送入预热至220℃的烤箱中层，精准烘烤22~23分钟！',
        durationMinutes: 23,
        heat: '烤箱预热/烘烤',
        hasTimerPush: true,
        timerLabel: '220℃高温烤流心巴斯克',
        tip: '出炉时表面深琥珀焦褐，晃动模具中心依然像果冻一样明显颤抖——这正是冷藏后产生流心的标志！'
      },
      {
        id: 'bcs3',
        stepNumber: 3,
        title: '连模室温放凉后冷藏6小时切件',
        description: '出炉连同模具在网架彻底晾凉至室温，随后密封送入冰箱冷藏至少6小时（隔夜风味更佳）。切前将餐刀泡热水擦干，一刀切下即可收获完美半熟流心！',
        durationMinutes: 5,
        heat: '关火焖',
        tip: '想要软流心状态，从冰箱取出室温回温20分钟再切开，内芯如熔岩般缓缓流淌。'
      }
    ],
    review: {
      tastingNotes: '烘焙新手闭眼入的封神甜品！表层焦糖微苦中和了芝士的浓郁，内芯像冰淇淋慕斯一样在舌尖化开，配热美式幸福感拉满。',
      pitfallsAndLessons: '奶油奶酪和鸡蛋一定要提前回温到22℃左右，冰鸡蛋直接倒进去容易水油分离起颗粒。',
      pairingSuggestions: '手冲深烘美式咖啡、伯爵红茶。',
      ratings: { taste: 5, difficulty: 1, reproducibility: 5, presentation: 5 },
      stickers: ['☕ 下午茶时光', '🎯 零失败配方', '✨ 满分硬菜'],
      dinerFeedback: '“人生第一次做蛋糕就烤出完美流心，朋友圈被追着要配方！”',
      cookDate: '2026-11-12'
    },
    comments: [
      {
        id: 'oc_basque_1',
        authorName: 'Momo烘焙日记',
        authorAvatar: AVATAR_SVG_MAP.chef_girl_apron,
        content: '220度22分钟这个时间和多加一颗蛋黄的比例太稳了，外焦里嫩每次都不翻车！',
        createdAt: '2026-11-12'
      }
    ]
  }
];
