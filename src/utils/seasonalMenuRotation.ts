import { OfficialCuratedMenu } from '../data/officialSquareSeed';

const AUTO_ROTATION_ENABLED_KEY = 'food_journal_auto_menu_rotation_v1';

export interface SolarTermInfo {
  zh: string;
  en: string;
  seasonZh: string;
  seasonEn: string;
}

export interface WeeklyRotationSnapshot {
  isoYear: number;
  isoWeek: number;
  mondayDateStr: string;
  sundayDateStr: string;
  month: number;
  solarTerm: SolarTermInfo;
  spotlightMenu: OfficialCuratedMenu;
  orderedMenus: OfficialCuratedMenu[];
  nextMondayDateStr: string;
}

// Approximate start dates (month, day) of the 24 Solar Terms across a calendar year
const SOLAR_TERMS_TABLE: Array<{
  month: number;
  day: number;
  zh: string;
  en: string;
  seasonZh: string;
  seasonEn: string;
}> = [
  { month: 1, day: 5, zh: '小寒', en: 'Minor Cold', seasonZh: '隆冬暖补', seasonEn: 'Midwinter' },
  { month: 1, day: 20, zh: '大寒', en: 'Major Cold', seasonZh: '岁末团圆', seasonEn: 'Year-End' },
  { month: 2, day: 4, zh: '立春', en: 'Start of Spring', seasonZh: '迎春尝鲜', seasonEn: 'Early Spring' },
  { month: 2, day: 19, zh: '雨水', en: 'Rain Water', seasonZh: '初春温润', seasonEn: 'Early Spring' },
  { month: 3, day: 5, zh: '惊蛰', en: 'Awakening of Insects', seasonZh: '仲春清鲜', seasonEn: 'Spring' },
  { month: 3, day: 20, zh: '春分', en: 'Spring Equinox', seasonZh: '春分踏青', seasonEn: 'Spring' },
  { month: 4, day: 4, zh: '清明', en: 'Pure Brightness', seasonZh: '暮春轻食', seasonEn: 'Late Spring' },
  { month: 4, day: 20, zh: '谷雨', en: 'Grain Rain', seasonZh: '暮春鲜味', seasonEn: 'Late Spring' },
  { month: 5, day: 5, zh: '立夏', en: 'Start of Summer', seasonZh: '初夏控卡', seasonEn: 'Early Summer' },
  { month: 5, day: 21, zh: '小满', en: 'Grain Buds', seasonZh: '初夏清爽', seasonEn: 'Early Summer' },
  { month: 6, day: 5, zh: '芒种', en: 'Grain in Ear', seasonZh: '仲夏开胃', seasonEn: 'Summer' },
  { month: 6, day: 21, zh: '夏至', en: 'Summer Solstice', seasonZh: '夏至清凉', seasonEn: 'Midsummer' },
  { month: 7, day: 7, zh: '小暑', en: 'Minor Heat', seasonZh: '盛夏消暑', seasonEn: 'Midsummer' },
  { month: 7, day: 22, zh: '大暑', en: 'Major Heat', seasonZh: '三伏冰品', seasonEn: 'High Summer' },
  { month: 8, day: 7, zh: '立秋', en: 'Start of Autumn', seasonZh: '初秋贴膘', seasonEn: 'Early Autumn' },
  { month: 8, day: 23, zh: '处暑', en: 'End of Heat', seasonZh: '出伏清润', seasonEn: 'Early Autumn' },
  { month: 9, day: 7, zh: '白露', en: 'White Dew', seasonZh: '仲秋润燥', seasonEn: 'Autumn' },
  { month: 9, day: 23, zh: '秋分', en: 'Autumn Equinox', seasonZh: '金秋家宴', seasonEn: 'Mid-Autumn' },
  { month: 10, day: 8, zh: '寒露', en: 'Cold Dew', seasonZh: '深秋温补', seasonEn: 'Late Autumn' },
  { month: 10, day: 23, zh: '霜降', en: 'Frost Descent', seasonZh: '霜降暖汤', seasonEn: 'Late Autumn' },
  { month: 11, day: 7, zh: '立冬', en: 'Start of Winter', seasonZh: '立冬暖锅', seasonEn: 'Early Winter' },
  { month: 11, day: 22, zh: '小雪', en: 'Minor Snow', seasonZh: '小雪慢炖', seasonEn: 'Early Winter' },
  { month: 12, day: 7, zh: '大雪', en: 'Major Snow', seasonZh: '大雪围炉', seasonEn: 'Winter' },
  { month: 12, day: 21, zh: '冬至', en: 'Winter Solstice', seasonZh: '冬至团圆', seasonEn: 'Winter Solstice' }
];

export function getSolarTermForDate(date: Date): SolarTermInfo {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const currentScore = m * 100 + d;

  let matched = SOLAR_TERMS_TABLE[SOLAR_TERMS_TABLE.length - 1]; // default 冬至 for Jan 1–4
  for (const term of SOLAR_TERMS_TABLE) {
    if (currentScore >= term.month * 100 + term.day) {
      matched = term;
    }
  }
  return {
    zh: matched.zh,
    en: matched.en,
    seasonZh: matched.seasonZh,
    seasonEn: matched.seasonEn
  };
}

export function getISOWeekAndBounds(targetDate: Date): {
  isoYear: number;
  isoWeek: number;
  monday: Date;
  sunday: Date;
  nextMonday: Date;
} {
  const d = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));
  const dayNum = d.getUTCDay() || 7; // Monday = 1 .. Sunday = 7

  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - (dayNum - 1));

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const nextMonday = new Date(monday);
  nextMonday.setUTCDate(monday.getUTCDate() + 7);

  // Thursday of current ISO week determines ISO year & week number
  const thursday = new Date(d);
  thursday.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return {
    isoYear: thursday.getUTCFullYear(),
    isoWeek,
    monday,
    sunday,
    nextMonday
  };
}

function formatUTCDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function isAutoMenuRotationEnabled(): boolean {
  try {
    const raw = localStorage.getItem(AUTO_ROTATION_ENABLED_KEY);
    if (raw === null) return true; // Enabled by default
    return raw === 'true';
  } catch {
    return true;
  }
}

export function setAutoMenuRotationEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_ROTATION_ENABLED_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('official-menus-updated'));
  } catch (err) {
    console.error('Failed to save auto rotation toggle', err);
  }
}

/**
 * Deterministically computes this week's #1 Spotlight Menu and ordered shelf
 * based on calendar month, 24 solar terms, and ISO week number.
 * Zero server cost, 100% automatic every Monday at 00:00.
 */
export function computeWeeklyMenuRotation(
  menus: OfficialCuratedMenu[],
  referenceDate: Date = new Date(),
  respectManualPins = true
): WeeklyRotationSnapshot | null {
  if (!menus || menus.length === 0) return null;

  const { isoYear, isoWeek, monday, sunday, nextMonday } = getISOWeekAndBounds(referenceDate);
  // Use Thursday of the week to determine the dominant month of that week
  const midWeek = new Date(monday);
  midWeek.setUTCDate(monday.getUTCDate() + 3);
  const activeMonth = midWeek.getUTCMonth() + 1;
  const solarTerm = getSolarTermForDate(
    new Date(midWeek.getUTCFullYear(), midWeek.getUTCMonth(), midWeek.getUTCDate())
  );

  // Candidate pool for weekly auto-spotlight:
  // Prioritize menus matching activeMonth + evergreen lifestyle menus so every consecutive week rotates cleanly
  const inSeasonMenus = menus.filter(
    (m) => Array.isArray(m.targetMonths) && m.targetMonths.includes(activeMonth)
  );
  const evergreenMenus = menus.filter(
    (m) => !m.targetMonths || m.targetMonths.length === 0
  );

  // Build a balanced rotation cycle for the current month:
  // Alternate between in-season menus and evergreen menus so consecutive weeks never repeat
  const cyclePool: OfficialCuratedMenu[] = [];
  const maxLen = Math.max(inSeasonMenus.length, evergreenMenus.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < inSeasonMenus.length) cyclePool.push(inSeasonMenus[i]);
    if (i < evergreenMenus.length) cyclePool.push(evergreenMenus[i]);
  }
  const effectivePool = cyclePool.length > 0 ? cyclePool : menus;

  const seedIndex = (isoYear * 53 + isoWeek) % effectivePool.length;
  const autoSpotlight = effectivePool[seedIndex];

  const autoEnabled = isAutoMenuRotationEnabled();
  const manuallyPinned = respectManualPins ? menus.filter((m) => m.pinned) : [];

  let orderedMenus: OfficialCuratedMenu[];
  let spotlightMenu: OfficialCuratedMenu;

  if (!autoEnabled) {
    orderedMenus = [...menus].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
    spotlightMenu = orderedMenus[0];
  } else {
    // Score remaining menus:
    // 1. Operator custom manually-pinned menus (if any) or the weekly autoSpotlight
    // 2. Other in-season menus for current month
    // 3. Evergreen all-year menus rotated by week offset
    // 4. Out-of-season menus at the end (still accessible by scrolling right)
    spotlightMenu = manuallyPinned.length > 0 ? manuallyPinned[0] : autoSpotlight;

    const rest = menus.filter((m) => m.id !== spotlightMenu.id);
    const restPinned = rest.filter((m) => m.pinned);
    const restAutoSpotlight =
      spotlightMenu.id !== autoSpotlight.id ? [autoSpotlight] : [];
    const usedIds = new Set<string>([
      spotlightMenu.id,
      ...restPinned.map((m) => m.id),
      ...restAutoSpotlight.map((m) => m.id)
    ]);

    const restInSeason = inSeasonMenus.filter((m) => !usedIds.has(m.id));
    restInSeason.forEach((m) => usedIds.add(m.id));

    const restEvergreen = evergreenMenus.filter((m) => !usedIds.has(m.id));
    // Rotate evergreen order slightly by week so shelf feels fresh
    const shift = restEvergreen.length > 0 ? isoWeek % restEvergreen.length : 0;
    const rotatedEvergreen = [
      ...restEvergreen.slice(shift),
      ...restEvergreen.slice(0, shift)
    ];
    rotatedEvergreen.forEach((m) => usedIds.add(m.id));

    const offSeason = menus.filter((m) => !usedIds.has(m.id));

    orderedMenus = [
      spotlightMenu,
      ...restPinned,
      ...restAutoSpotlight,
      ...restInSeason,
      ...rotatedEvergreen,
      ...offSeason
    ];
  }

  return {
    isoYear,
    isoWeek,
    mondayDateStr: formatUTCDate(monday),
    sundayDateStr: formatUTCDate(sunday),
    month: activeMonth,
    solarTerm,
    spotlightMenu,
    orderedMenus,
    nextMondayDateStr: formatUTCDate(nextMonday)
  };
}

/**
 * Generates an upcoming N-week auto-rotation schedule preview for the Operator Console
 */
export function getUpcomingRotationSchedule(
  menus: OfficialCuratedMenu[],
  startDate: Date = new Date(),
  weeksCount = 6
): WeeklyRotationSnapshot[] {
  const result: WeeklyRotationSnapshot[] = [];
  for (let w = 0; w < weeksCount; w++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + w * 7);
    const snap = computeWeeklyMenuRotation(menus, d, false);
    if (snap) {
      result.push(snap);
    }
  }
  return result;
}
