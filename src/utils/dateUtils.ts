/**
 * 本地时区日期格式化工具
 * 无论处于任何时区（包括 UTC+8 凌晨时段），均基于当前设备本地日历生成标准的 'YYYY-MM-DD' 字符串
 */
export function formatLocalDate(date: Date | string | number = new Date()): string {
  if (typeof date === 'string') {
    const trimmed = date.trim();
    // 若已经是标准 YYYY-MM-DD 纯日期字符串，直接原样返回，避免 Date 解析为 UTC 零点引发跨日偏移
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const parsed = date instanceof Date ? date : new Date(date);
  const validDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const day = String(validDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 基于本地时区对指定日期增减天数并返回 'YYYY-MM-DD'
 */
export function addDaysLocal(days: number, baseDate: Date = new Date()): string {
  const copy = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + days
  );
  return formatLocalDate(copy);
}
