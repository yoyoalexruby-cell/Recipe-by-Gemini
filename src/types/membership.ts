export interface UserTask {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  expReward: number;
  category: 'publish' | 'contest' | 'review' | 'cook' | 'daily';
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

export interface UserLevelInfo {
  level: number;
  title: string;
  titleEn: string;
  badge: string;
  currentExp: number;
  minExp: number;
  maxExp: number;
  nextLevelExp: number;
  progressPercent: number;
  perks: { icon: string; text: string; textEn: string }[];
  isProMember: boolean;
}

export const LEVEL_DEFINITIONS = [
  {
    level: 1,
    title: 'LV1 灶台新秀',
    titleEn: 'LV1 Apprentice Cook',
    badge: '🌱',
    minExp: 0,
    maxExp: 150,
    perks: [
      { icon: '📖', text: '基础私房手帐记录与备料', textEn: 'Personal Recipe Scrapbook & Pantry' },
      { icon: '⏱️', text: '厨房悬浮计时器', textEn: 'Floating Kitchen Timer' }
    ]
  },
  {
    level: 2,
    title: 'LV2 家常熟手',
    titleEn: 'LV2 Home Chef',
    badge: '🍳',
    minExp: 150,
    maxExp: 400,
    perks: [
      { icon: '🛒', text: '食材一键选购与多电商跳转', textEn: '1-Click Ingredient Restock' },
      { icon: '📜', text: '复古手帐导出与高清图生成', textEn: 'Vintage Paper Export & Image Download' }
    ]
  },
  {
    level: 3,
    title: 'LV3 风味主厨',
    titleEn: 'LV3 Flavor Sous Chef',
    badge: '🔪',
    minExp: 400,
    maxExp: 800,
    perks: [
      { icon: '🏆', text: '解锁厨神大赛打擂与打分评审特权', textEn: 'Master Chef Contest Contender & Judge' },
      { icon: '🎙️', text: '全功能免动手 Web Speech 语音引导', textEn: 'Hands-free Voice Narration Engine' }
    ]
  },
  {
    level: 4,
    title: 'LV4 匠心名家',
    titleEn: 'LV4 Executive Master',
    badge: '⭐',
    minExp: 800,
    maxExp: 1500,
    perks: [
      { icon: '🏅', text: '食味广场官方名家推荐位', textEn: 'Community Featured Master Chef' },
      { icon: '🎨', text: '专属手帐火漆印章与定制分类名录', textEn: 'Custom Scrapbook Wax Seals' }
    ]
  },
  {
    level: 5,
    title: 'LV5 殿堂厨神',
    titleEn: 'LV5 Culinary Legend',
    badge: '👑',
    minExp: 1500,
    maxExp: 99999,
    perks: [
      { icon: '👑', text: '尊享殿堂金皇冠终身标识', textEn: 'Golden Crown Legend Badge' },
      { icon: '🌟', text: '全部私房菜谱永久云端双向同步', textEn: 'Priority Dual Cloud Sync' }
    ]
  }
];
