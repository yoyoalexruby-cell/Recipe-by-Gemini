import { UserLevelInfo, UserTask, LEVEL_DEFINITIONS } from '../types/membership';
import { UserProfile } from '../types/auth';
import { getCookingRecords } from './cookingLogStorage';
import { getContestSubmissions } from './contestStorage';
import { formatLocalDate } from './dateUtils';

const CLAIMED_TASKS_KEY = 'culinary_claimed_tasks_v1';
const DAILY_CHECKIN_KEY = 'culinary_daily_checkin_v1';

export function getClaimedTaskIds(): string[] {
  try {
    const raw = localStorage.getItem(CLAIMED_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function claimTaskReward(taskId: string): boolean {
  try {
    const claimed = getClaimedTaskIds();
    if (claimed.includes(taskId)) return false;
    const updated = [...claimed, taskId];
    localStorage.setItem(CLAIMED_TASKS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('membership-updated'));
    return true;
  } catch {
    return false;
  }
}

export function checkIsDailyCheckedIn(): boolean {
  try {
    const today = formatLocalDate();
    const last = localStorage.getItem(DAILY_CHECKIN_KEY);
    return last === today;
  } catch {
    return false;
  }
}

export function performDailyCheckin(): { success: boolean; expGained: number } {
  if (checkIsDailyCheckedIn()) {
    return { success: false, expGained: 0 };
  }
  const today = formatLocalDate();
  try {
    localStorage.setItem(DAILY_CHECKIN_KEY, today);
    claimTaskReward(`daily_checkin_${today}`);
    window.dispatchEvent(new CustomEvent('membership-updated'));
    return { success: true, expGained: 20 };
  } catch {
    return { success: false, expGained: 0 };
  }
}

export function getUserLevelInfo(
  user: UserProfile | null,
  userRecipeCount: number,
  publicRecipeCount: number,
  totalLikesReceived: number
): { levelInfo: UserLevelInfo; tasks: UserTask[] } {
  const claimed = getClaimedTaskIds();
  const cookingLogs = getCookingRecords(user);
  const contestSubmissions = getContestSubmissions();
  const userContestCount = contestSubmissions.filter((s) => s.authorId === user?.uid).length;
  const userVoteCount = contestSubmissions.filter((s) => s.ratedBy?.includes(user?.uid || '')).length;

  // Compute Base EXP from actual activities
  let totalExp = 0;
  totalExp += userRecipeCount * 20;            // 20 EXP per recipe created
  totalExp += publicRecipeCount * 30;          // +30 additional EXP for public recipes (total 50)
  totalExp += cookingLogs.length * 25;         // 25 EXP per cooking log entry
  totalExp += totalLikesReceived * 5;          // 5 EXP per like received
  totalExp += userContestCount * 80;           // 80 EXP per contest submission
  totalExp += userVoteCount * 20;              // 20 EXP per contest vote

  // Add bonus for claimed one-time tasks
  if (claimed.includes('task_publish_1')) totalExp += 50;
  if (claimed.includes('task_contest_1')) totalExp += 100;
  if (claimed.includes('task_rate_1')) totalExp += 30;
  if (claimed.includes('task_cook_3')) totalExp += 60;
  if (claimed.includes('task_daily_checkin')) totalExp += 20;

  // Find corresponding level
  let currentDef = LEVEL_DEFINITIONS[0];
  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (totalExp >= LEVEL_DEFINITIONS[i].minExp) {
      currentDef = LEVEL_DEFINITIONS[i];
      break;
    }
  }

  const nextDef = LEVEL_DEFINITIONS.find((d) => d.level === currentDef.level + 1);
  const nextLevelExp = nextDef ? nextDef.minExp : currentDef.maxExp;
  const expRange = nextDef ? (nextDef.minExp - currentDef.minExp) : 100;
  const expInLevel = totalExp - currentDef.minExp;
  const progressPercent = nextDef
    ? Math.min(100, Math.max(0, Math.round((expInLevel / expRange) * 100)))
    : 100;

  // Build Tasks List with dynamic progress
  const tasks: UserTask[] = [
    {
      id: 'task_daily_checkin',
      title: '每日大厨签到',
      titleEn: 'Daily Chef Check-in',
      description: '每天登录为灶台添一把火，领取今日活跃积分',
      descriptionEn: 'Daily check-in reward for active cooking',
      expReward: 20,
      category: 'daily',
      currentProgress: checkIsDailyCheckedIn() ? 1 : 0,
      targetProgress: 1,
      isCompleted: checkIsDailyCheckedIn(),
      isClaimed: claimed.includes('task_daily_checkin'),
      icon: '🔥'
    },
    {
      id: 'task_publish_1',
      title: '发布私房菜谱手帐',
      titleEn: 'Publish Recipe Scrapbook',
      description: '记录食材配比与火候心得，公开至食味广场',
      descriptionEn: 'Publish a recipe scrapbook to the community',
      expReward: 50,
      category: 'publish',
      currentProgress: publicRecipeCount,
      targetProgress: 1,
      isCompleted: publicRecipeCount >= 1,
      isClaimed: claimed.includes('task_publish_1'),
      icon: '📖'
    },
    {
      id: 'task_contest_1',
      title: '参加当季厨神大赛',
      titleEn: 'Join Master Chef Contest',
      description: '在当季指定挑战菜品下提交参赛作品与实拍图',
      descriptionEn: 'Submit your entry to the current contest theme',
      expReward: 100,
      category: 'contest',
      currentProgress: userContestCount,
      targetProgress: 1,
      isCompleted: userContestCount >= 1,
      isClaimed: claimed.includes('task_contest_1'),
      icon: '🏆'
    },
    {
      id: 'task_rate_1',
      title: '为厨友打分品鉴',
      titleEn: 'Rate Community & Contest Dishes',
      description: '作为大众评审，为至少 2 个参赛或广场食谱打分',
      descriptionEn: 'Rate at least 2 community entries',
      expReward: 30,
      category: 'review',
      currentProgress: userVoteCount,
      targetProgress: 2,
      isCompleted: userVoteCount >= 2,
      isClaimed: claimed.includes('task_rate_1'),
      icon: '⭐'
    },
    {
      id: 'task_cook_3',
      title: '打卡下厨累计 3 次',
      titleEn: 'Log 3 Cooking Records',
      description: '将美味出锅记录到烹饪日历中，养成下厨好习惯',
      descriptionEn: 'Record at least 3 cooking dates in calendar',
      expReward: 60,
      category: 'cook',
      currentProgress: cookingLogs.length,
      targetProgress: 3,
      isCompleted: cookingLogs.length >= 3,
      isClaimed: claimed.includes('task_cook_3'),
      icon: '📅'
    }
  ];

  const levelInfo: UserLevelInfo = {
    level: currentDef.level,
    title: currentDef.title,
    titleEn: currentDef.titleEn,
    badge: currentDef.badge,
    currentExp: totalExp,
    minExp: currentDef.minExp,
    maxExp: currentDef.maxExp,
    nextLevelExp,
    progressPercent,
    perks: currentDef.perks,
    isProMember: currentDef.level >= 3
  };

  return { levelInfo, tasks };
}
