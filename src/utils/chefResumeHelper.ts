import { UserProfile } from '../types/auth';
import { Recipe } from '../types/recipe';
import { UserLevelInfo } from '../types/membership';
import { getCookingRecords } from './cookingLogStorage';
import { getContestSubmissions } from './contestStorage';
import { ChefMedal, getChefAchievements } from './achievementService';
import { formatLocalDate } from './dateUtils';

export type { ChefMedal };

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

  // Unified Medals Calculation
  const achievements = getChefAchievements(user, recipes, levelInfo, totalLikesReceived);
  const medals: ChefMedal[] = achievements.medals;

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
    generatedDate: formatLocalDate()
  };
}
