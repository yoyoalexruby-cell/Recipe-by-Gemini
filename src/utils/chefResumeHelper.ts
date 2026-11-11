import { UserProfile } from '../types/auth';
import { Recipe } from '../types/recipe';
import { UserLevelInfo } from '../types/membership';
import { getCookingRecords } from './cookingLogStorage';
import { getContestSubmissions } from './contestStorage';

export interface ChefMedal {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ChefResumeData {
  user: UserProfile;
  levelInfo: UserLevelInfo;
  stats: {
    totalRecipes: number;
    publicRecipes: number;
    totalLikes: number;
    totalCookDays: number;
    contestSubmissions: number;
    favoriteCategory: string;
  };
  medals: ChefMedal[];
  masterpieces: Recipe[]; // Up to 3 featured recipes
  culinaryMotto: string;
  generatedDate: string;
}

/**
 * Computes the full Chef Resume Data including stats, unlocked medals, and best representative works
 */
export function buildChefResumeData(
  user: UserProfile,
  recipes: Recipe[],
  levelInfo: UserLevelInfo,
  totalLikesReceived: number
): ChefResumeData {
  const cookingLogs = getCookingRecords(user);
  const contestSubmissions = getContestSubmissions();
  const userContestSubmissions = contestSubmissions.filter((s) => s.authorId === user.uid);
  const userContestVotes = contestSubmissions.filter((s) => s.ratedBy?.includes(user.uid)).length;

  const publicRecipes = recipes.filter((r) => r.isPublic);

  // Calculate favorite category
  const categoryCounts: Record<string, number> = {};
  recipes.forEach((r) => {
    const cat = r.category || '家常菜';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  let topCategory = '私房家常';
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCategory = cat;
    }
  });

  // Unique cooking days from logs and recipes
  const dates = new Set<string>();
  cookingLogs.forEach((log) => dates.add(log.cookDate));
  recipes.forEach((r) => {
    if (r.review?.cookDate) dates.add(r.review.cookDate);
    else if (r.createdAt) dates.add(r.createdAt.slice(0, 10));
  });

  // Medals Calculation
  const medals: ChefMedal[] = [
    {
      id: 'medal_apprentice',
      name: '灶台启蒙',
      nameEn: 'Kitchen Pioneer',
      icon: '🌱',
      description: '记录第一道私房菜谱手帐',
      descriptionEn: 'Recorded 1st recipe scrapbook',
      isUnlocked: recipes.length >= 1,
      rarity: 'common'
    },
    {
      id: 'medal_five_star',
      name: '百味匠人',
      nameEn: 'Master of Flavors',
      icon: '✨',
      description: '累计记录 5 篇以上私房菜谱',
      descriptionEn: 'Logged 5+ recipe scrapbooks',
      isUnlocked: recipes.length >= 5,
      rarity: 'rare'
    },
    {
      id: 'medal_fire',
      name: '人间烟火',
      nameEn: 'Warm Hearth',
      icon: '🔥',
      description: '累计烹饪打卡 3 次以上',
      descriptionEn: 'Logged cooking in calendar 3+ times',
      isUnlocked: dates.size >= 3,
      rarity: 'common'
    },
    {
      id: 'medal_contest',
      name: '擂台勇者',
      nameEn: 'Contest Challenger',
      icon: '🏆',
      description: '参与厨神大赛并提交打擂手帐',
      descriptionEn: 'Entered Master Chef Contest',
      isUnlocked: userContestSubmissions.length >= 1,
      rarity: 'rare'
    },
    {
      id: 'medal_judge',
      name: '舌尖评审',
      nameEn: 'Sensory Judge',
      icon: '⭐',
      description: '作为大众评审为厨友打分品鉴',
      descriptionEn: 'Rated community contest dishes',
      isUnlocked: userContestVotes >= 1,
      rarity: 'common'
    },
    {
      id: 'medal_share',
      name: '慷慨分享',
      nameEn: 'Open Table',
      icon: '📖',
      description: '公开发布 1 篇以上菜谱至食味广场',
      descriptionEn: 'Shared 1+ recipe publicly',
      isUnlocked: publicRecipes.length >= 1,
      rarity: 'common'
    },
    {
      id: 'medal_popular',
      name: '食客追捧',
      nameEn: 'Beloved Cook',
      icon: '💖',
      description: '累计收获 10 个以上厨友暖心点赞',
      descriptionEn: 'Earned 10+ community likes',
      isUnlocked: totalLikesReceived >= 10,
      rarity: 'epic'
    },
    {
      id: 'medal_grandmaster',
      name: '殿堂食神',
      nameEn: 'Culinary Legend',
      icon: '👑',
      description: '达到最高等级 LV5 殿堂厨神',
      descriptionEn: 'Reached Grandmaster Level 5',
      isUnlocked: levelInfo.level >= 5,
      rarity: 'legendary'
    }
  ];

  // Pick up to 3 best representative recipes (Masterpieces)
  // Priority: 1) Has cover image, 2) Public / Contest, 3) High rating / likes, 4) Most steps/notes
  const sorted = [...recipes].sort((a, b) => {
    const aImg = a.coverImage ? 1 : 0;
    const bImg = b.coverImage ? 1 : 0;
    if (aImg !== bImg) return bImg - aImg;

    const aLikes = a.likesCount || 0;
    const bLikes = b.likesCount || 0;
    if (aLikes !== bLikes) return bLikes - aLikes;

    const aRating = a.review?.ratings?.taste || 0;
    const bRating = b.review?.ratings?.taste || 0;
    return bRating - aRating;
  });

  const masterpieces = sorted.slice(0, 3);

  // Motto
  const culinaryMotto = user.bio && user.bio.trim()
    ? `“${user.bio.trim()}”`
    : '“一餐一饭，皆是生活的情书；人间烟火，最抚凡人心。”';

  return {
    user,
    levelInfo,
    stats: {
      totalRecipes: recipes.length,
      publicRecipes: publicRecipes.length,
      totalLikes: totalLikesReceived,
      totalCookDays: dates.size,
      contestSubmissions: userContestSubmissions.length,
      favoriteCategory: topCategory
    },
    medals,
    masterpieces,
    culinaryMotto,
    generatedDate: new Date().toISOString().slice(0, 10)
  };
}
