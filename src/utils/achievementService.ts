import { UserProfile } from '../types/auth';
import { Recipe } from '../types/recipe';
import { UserLevelInfo } from '../types/membership';
import { getCookingRecords } from './cookingLogStorage';
import { getContestSubmissions } from './contestStorage';
import { checkIsDailyCheckedIn } from './membershipService';

export interface ChefMedal {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  condition: string;
  conditionEn: string;
  category: 'recipe' | 'checkin' | 'contest' | 'social' | 'master';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    target: number;
    unit: string;
    percentage: number;
  };
  expReward: number;
  actionRoute?: 'new_recipe' | 'calendar' | 'contest' | 'square';
}

export interface AchievementSummary {
  medals: ChefMedal[];
  unlockedCount: number;
  totalCount: number;
  unlockedMedals: ChefMedal[];
  lockedMedals: ChefMedal[];
  completionPercentage: number;
}

/**
 * Calculates all chef medals, completion statuses, progress counters and condition requirements
 */
export function getChefAchievements(
  user: UserProfile,
  recipes: Recipe[],
  levelInfo: UserLevelInfo,
  totalLikesReceived: number
): AchievementSummary {
  const cookingLogs = getCookingRecords(user, recipes);
  const contestSubmissions = getContestSubmissions();
  const userContestSubmissions = contestSubmissions.filter((s) => s.authorId === user.uid);
  const userContestVotes = contestSubmissions.filter((s) => s.ratedBy?.includes(user.uid)).length;
  const publicRecipes = recipes.filter((r) => r.isPublic);

  // Unique cooking days from calendar and recipe records
  const uniqueDates = new Set<string>();
  cookingLogs.forEach((log) => uniqueDates.add(log.cookDate));
  recipes.forEach((r) => {
    if (r.review?.cookDate) uniqueDates.add(r.review.cookDate);
    else if (r.createdAt) uniqueDates.add(r.createdAt.slice(0, 10));
  });

  // Calculate checkin streak
  const isTodayChecked = checkIsDailyCheckedIn();
  // Cooking days or checkins combined
  const cookDaysCount = uniqueDates.size;
  const effectiveCheckinStreak = isTodayChecked ? Math.max(1, cookDaysCount) : cookDaysCount;

  // Contest champion check:
  // User has a submission with score >= 9.0 or voteCount >= 5 or badge
  const isContestChamp = userContestSubmissions.some(
    (s) => s.totalScore >= 9.0 || s.voteCount >= 5 || s.badges?.some((b) => b.includes('冠军') || b.includes('金牌'))
  );

  // High quality recipes with cover images
  const recipesWithPhotos = recipes.filter((r) => Boolean(r.coverImage)).length;

  const medals: ChefMedal[] = [
    // 1. 灶台启蒙 (Kitchen Pioneer)
    {
      id: 'medal_apprentice',
      name: '灶台启蒙',
      nameEn: 'Kitchen Pioneer',
      icon: '🌱',
      description: '记录第一道私房菜谱手帐，迈出厨神之路第一步',
      descriptionEn: 'Recorded 1st recipe scrapbook',
      condition: '成功创建并归档保存第 1 篇属于自己的美食手帐',
      conditionEn: 'Create and save your first recipe scrapbook',
      category: 'recipe',
      rarity: 'common',
      isUnlocked: recipes.length >= 1,
      unlockedAt: recipes.length >= 1 ? (recipes[0]?.createdAt?.slice(0, 10) || '已达成') : undefined,
      progress: {
        current: Math.min(recipes.length, 1),
        target: 1,
        unit: '篇手帐',
        percentage: recipes.length >= 1 ? 100 : Math.round((recipes.length / 1) * 100)
      },
      expReward: 30,
      actionRoute: 'new_recipe'
    },

    // 2. 百味匠人 (Master of Flavors)
    {
      id: 'medal_five_star',
      name: '百味匠人',
      nameEn: 'Master of Flavors',
      icon: '✨',
      description: '累计记录 5 篇以上私房菜谱，品尝生活百般滋味',
      descriptionEn: 'Logged 5+ recipe scrapbooks',
      condition: '私房美食手帐记录库数量累计达到 5 篇',
      conditionEn: 'Accumulate 5 or more recipe scrapbooks',
      category: 'recipe',
      rarity: 'rare',
      isUnlocked: recipes.length >= 5,
      progress: {
        current: Math.min(recipes.length, 5),
        target: 5,
        unit: '篇手帐',
        percentage: Math.min(100, Math.round((recipes.length / 5) * 100))
      },
      expReward: 80,
      actionRoute: 'new_recipe'
    },

    // 3. 菜谱百大 (Recipe Centurion)
    {
      id: 'medal_centurion',
      name: '菜谱百大',
      nameEn: 'Recipe Centurion',
      icon: '📜',
      description: '累计撰写私房菜谱达到百大殿堂，名扬八方食客',
      descriptionEn: 'Created 10+ milestone recipe scrapbooks towards the 100 Club',
      condition: '私房手帐累计达到 10 篇里程碑（进阶冲刺 100 篇百大厨神名录）',
      conditionEn: 'Reach 10 recipe scrapbooks (Milestone towards 100 recipes)',
      category: 'recipe',
      rarity: 'epic',
      isUnlocked: recipes.length >= 10,
      progress: {
        current: Math.min(recipes.length, 10),
        target: 10,
        unit: '篇手帐',
        percentage: Math.min(100, Math.round((recipes.length / 10) * 100))
      },
      expReward: 150,
      actionRoute: 'new_recipe'
    },

    // 4. 连续打卡 (Streak Champion)
    {
      id: 'medal_streak_checkin',
      name: '连续打卡',
      nameEn: 'Streak Champion',
      icon: '🔥',
      description: '坚持每日烹饪打卡或签到，保持厨房常沸的烟火气',
      descriptionEn: 'Maintained 3-day active cooking or check-in streak',
      condition: '连续 3 天完成每日下厨日历打卡或大厨签到',
      conditionEn: 'Complete daily cooking or check-in for 3 consecutive days',
      category: 'checkin',
      rarity: 'rare',
      isUnlocked: effectiveCheckinStreak >= 3,
      progress: {
        current: Math.min(effectiveCheckinStreak, 3),
        target: 3,
        unit: '天连续打卡',
        percentage: Math.min(100, Math.round((effectiveCheckinStreak / 3) * 100))
      },
      expReward: 60,
      actionRoute: 'calendar'
    },

    // 5. 人间烟火 (Warm Hearth)
    {
      id: 'medal_fire',
      name: '人间烟火',
      nameEn: 'Warm Hearth',
      icon: '🍳',
      description: '累计烹饪日历打卡 3 次以上，认真对待一日三餐',
      descriptionEn: 'Logged cooking in calendar 3+ times',
      condition: '在烹饪日历中记录至少 3 次不同日期的下厨实况',
      conditionEn: 'Log cooking records on 3 distinct calendar dates',
      category: 'checkin',
      rarity: 'common',
      isUnlocked: cookDaysCount >= 3,
      progress: {
        current: Math.min(cookDaysCount, 3),
        target: 3,
        unit: '天下厨记录',
        percentage: Math.min(100, Math.round((cookDaysCount / 3) * 100))
      },
      expReward: 40,
      actionRoute: 'calendar'
    },

    // 6. 厨神大赛冠军 (Contest Champion)
    {
      id: 'medal_contest_champ',
      name: '厨神大赛冠军',
      nameEn: 'Contest Champion',
      icon: '🥇',
      description: '在全国或社区厨神大赛中斩获 9.0+ 极高评审分或夺得金牌',
      descriptionEn: 'Earned 9.0+ rating or gold placement in Chef Contest',
      condition: '在当季厨神大赛挑战中提交作品，斩获 9.0+ 综合高分或位列榜首',
      conditionEn: 'Achieve 9.0+ total score or top rank in Master Chef Contest',
      category: 'contest',
      rarity: 'legendary',
      isUnlocked: isContestChamp,
      progress: {
        current: isContestChamp ? 1 : userContestSubmissions.length > 0 ? 0.8 : 0,
        target: 1,
        unit: '次冠军殊荣',
        percentage: isContestChamp ? 100 : userContestSubmissions.length > 0 ? 80 : 0
      },
      expReward: 200,
      actionRoute: 'contest'
    },

    // 7. 擂台勇者 (Contest Challenger)
    {
      id: 'medal_contest',
      name: '擂台勇者',
      nameEn: 'Contest Challenger',
      icon: '🏆',
      description: '参与当季指定挑战菜品打擂，亮出你的拿手绝活',
      descriptionEn: 'Entered Master Chef Contest challenge',
      condition: '在当季厨神大赛任一主题下成功提交 1 篇打擂参赛手帐',
      conditionEn: 'Submit at least 1 entry to any active contest theme',
      category: 'contest',
      rarity: 'rare',
      isUnlocked: userContestSubmissions.length >= 1,
      progress: {
        current: Math.min(userContestSubmissions.length, 1),
        target: 1,
        unit: '次参赛提交',
        percentage: userContestSubmissions.length >= 1 ? 100 : 0
      },
      expReward: 100,
      actionRoute: 'contest'
    },

    // 8. 舌尖评审 (Sensory Judge)
    {
      id: 'medal_judge',
      name: '舌尖评审',
      nameEn: 'Sensory Judge',
      icon: '⭐',
      description: '作为大众评审为厨友大赛打擂作品打分品鉴',
      descriptionEn: 'Rated community contest dishes',
      condition: '在大赛擂台或食味广场中为至少 2 篇厨友作品打出维度评分',
      conditionEn: 'Submit ratings for at least 2 community dishes',
      category: 'contest',
      rarity: 'common',
      isUnlocked: userContestVotes >= 2,
      progress: {
        current: Math.min(userContestVotes, 2),
        target: 2,
        unit: '次评审打分',
        percentage: Math.min(100, Math.round((userContestVotes / 2) * 100))
      },
      expReward: 50,
      actionRoute: 'contest'
    },

    // 9. 慷慨分享 (Open Table)
    {
      id: 'medal_share',
      name: '慷慨分享',
      nameEn: 'Open Table',
      icon: '📖',
      description: '公开发布私房菜谱至食味广场，与天下食客共赏',
      descriptionEn: 'Shared recipe scrapbooks publicly',
      condition: '公开发布至少 1 篇菜谱手帐至食味广场',
      conditionEn: 'Publish 1 or more recipes to the Public Culinary Square',
      category: 'social',
      rarity: 'common',
      isUnlocked: publicRecipes.length >= 1,
      progress: {
        current: Math.min(publicRecipes.length, 1),
        target: 1,
        unit: '篇公开发布',
        percentage: publicRecipes.length >= 1 ? 100 : 0
      },
      expReward: 50,
      actionRoute: 'square'
    },

    // 10. 食客追捧 (Beloved Cook)
    {
      id: 'medal_popular',
      name: '食客追捧',
      nameEn: 'Beloved Cook',
      icon: '💖',
      description: '累计收获厨友 10 个以上暖心赞，用美味温暖人心',
      descriptionEn: 'Earned 10+ community likes',
      condition: '公开手帐累计收获社区厨友 10 个暖心点赞',
      conditionEn: 'Accumulate 10 or more likes on your public recipes',
      category: 'social',
      rarity: 'epic',
      isUnlocked: totalLikesReceived >= 10,
      progress: {
        current: Math.min(totalLikesReceived, 10),
        target: 10,
        unit: '个暖心赞',
        percentage: Math.min(100, Math.round((totalLikesReceived / 10) * 100))
      },
      expReward: 120,
      actionRoute: 'square'
    },

    // 11. 光影食客 (Food Stylist)
    {
      id: 'medal_shutterbug',
      name: '光影食客',
      nameEn: 'Food Stylist',
      icon: '📸',
      description: '为美食手帐配上高清诱人封面实拍，视觉与味蕾的双重享受',
      descriptionEn: 'Captured photos for 3+ recipe scrapbooks',
      condition: '累计为 3 篇手帐上传并编排高清成品实拍封面图',
      conditionEn: 'Add high-res cover photos to at least 3 recipe scrapbooks',
      category: 'recipe',
      rarity: 'rare',
      isUnlocked: recipesWithPhotos >= 3,
      progress: {
        current: Math.min(recipesWithPhotos, 3),
        target: 3,
        unit: '篇实拍手帐',
        percentage: Math.min(100, Math.round((recipesWithPhotos / 3) * 100))
      },
      expReward: 70,
      actionRoute: 'new_recipe'
    },

    // 12. 殿堂食神 (Culinary Legend)
    {
      id: 'medal_grandmaster',
      name: '殿堂食神',
      nameEn: 'Culinary Legend',
      icon: '👑',
      description: '达到最高等级 LV5 殿堂厨神，荣登美食殿堂至高宝座',
      descriptionEn: 'Reached Grandmaster Level 5',
      condition: '会员等级达到 LV5 殿堂厨神（等级经验积分达到 600 EXP）',
      conditionEn: 'Reach Master Chef Level 5 (600+ Level EXP)',
      category: 'master',
      rarity: 'legendary',
      isUnlocked: levelInfo.level >= 5,
      progress: {
        current: Math.min(levelInfo.level, 5),
        target: 5,
        unit: '级大厨等级',
        percentage: Math.min(100, Math.round((levelInfo.level / 5) * 100))
      },
      expReward: 300
    }
  ];

  const unlockedMedals = medals.filter((m) => m.isUnlocked);
  const lockedMedals = medals.filter((m) => !m.isUnlocked);

  return {
    medals,
    unlockedCount: unlockedMedals.length,
    totalCount: medals.length,
    unlockedMedals,
    lockedMedals,
    completionPercentage: Math.round((unlockedMedals.length / medals.length) * 100)
  };
}
