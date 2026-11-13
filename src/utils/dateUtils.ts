/**
 * 本地时区日期格式化工具
 * 解决 new Date().toISOString().slice(0, 10) 在东八区 00:00–08:00 产生前一天日期（UTC 偏移）的问题
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 基于本地时区对当前日期增减天数并返回 YYYY-MM-DD
 */
export function addDaysLocal(days: number, baseDate: Date = new Date()): string {
  const copy = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + days);
  return formatLocalDate(copy);
}
