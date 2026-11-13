/**
 * UGC Content Safety, Pre-Publish Automated Filter & Moderation Queue
 * Compliant with Apple App Store Guideline 1.2 (User-Generated Content Safety)
 */

const BLOCKED_USERS_KEY = 'culinary_blocked_users_v1';
const REPORTED_ITEMS_KEY = 'culinary_reported_items_v1';
const TAKEDOWN_IDS_KEY = 'culinary_takedown_ids_v1';

export interface UGCReportItem {
  id?: string;
  targetId: string;
  targetType: 'recipe' | 'contest_submission' | 'comment';
  targetTitle: string;
  authorId: string;
  authorName: string;
  reason: string;
  reportedAt: string;
  status?: 'pending' | 'removed' | 'dismissed';
}

export interface ContentAuditResult {
  passed: boolean;
  category?: 'prohibited_spam_abuse' | 'food_safety_hazard';
  matchedTerm?: string;
  reasonZh?: string;
  reasonEn?: string;
}

// 1. Prohibited Abuse / Spam / Illegal Keywords (Pre-Publish Automated Filter)
const PROHIBITED_KEYWORDS = [
  '赌博', '博彩', '六合彩', '裸聊', '约炮', '色情', '代开发票', '刷单兼职', '加薇', '加v信',
  '高利贷', '迷药', '枪支', '毒品', '冰毒', '大麻', '杀猪盘', '傻逼', '去死', '滚蛋',
  'casino', 'porno', 'xxx', 'escort', 'kill yourself', 'crypto giveaway', 'whatsapp +'
];

// 2. Culinary & Food Toxicology Red-Line Terms (Food Safety Protection)
const FOOD_HAZARD_KEYWORDS = [
  '河豚卵巢', '河豚肝脏', '野生毒蘑菇', '白毒伞', '断肠草', '生吃福寿螺', '工业酒精', '亚硝酸钠直接调味', '罂粟壳'
];

/**
 * Pre-publish automated audit for public recipes & comments (Guideline 1.2 Pillar 1: Content Filtering)
 */
export function auditUGCContentSafety(textFields: string[]): ContentAuditResult {
  const combined = textFields.filter(Boolean).join(' ').toLowerCase();

  for (const bad of PROHIBITED_KEYWORDS) {
    if (combined.includes(bad.toLowerCase())) {
      return {
        passed: false,
        category: 'prohibited_spam_abuse',
        matchedTerm: bad,
        reasonZh: `内容包含社区违禁或不当词汇「${bad}」，已被自动风控拦截，请修改后再公开发布。`,
        reasonEn: `Content contains prohibited or abusive term ("${bad}") and was blocked by automated safety filter.`
      };
    }
  }

  for (const hazard of FOOD_HAZARD_KEYWORDS) {
    if (combined.includes(hazard.toLowerCase())) {
      return {
        passed: false,
        category: 'food_safety_hazard',
        matchedTerm: hazard,
        reasonZh: `检测到高危食品安全风险食材「${hazard}」，为保障厨友生命健康禁止公开发布。`,
        reasonEn: `High-risk toxic ingredient ("${hazard}") detected; blocked for food safety compliance.`
      };
    }
  }

  return { passed: true };
}

export function getBlockedUserIds(): string[] {
  try {
    const raw = localStorage.getItem(BLOCKED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function blockUser(authorId: string, authorName: string): boolean {
  try {
    const list = getBlockedUserIds();
    if (list.includes(authorId)) return true;
    const updated = [...list, authorId];
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ugc-moderation-updated', { detail: { type: 'block', authorId, authorName } }));
    return true;
  } catch {
    return false;
  }
}

export function unblockUser(authorId: string): boolean {
  try {
    const list = getBlockedUserIds();
    const updated = list.filter((id) => id !== authorId);
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ugc-moderation-updated', { detail: { type: 'unblock', authorId } }));
    return true;
  } catch {
    return false;
  }
}

export function getTakenDownItemIds(): string[] {
  try {
    const raw = localStorage.getItem(TAKEDOWN_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function takedownUGCItem(targetId: string): void {
  try {
    const ids = getTakenDownItemIds();
    if (!ids.includes(targetId)) {
      localStorage.setItem(TAKEDOWN_IDS_KEY, JSON.stringify([...ids, targetId]));
    }
    const reports = getReportedItems().map((r) =>
      r.targetId === targetId ? { ...r, status: 'removed' as const } : r
    );
    localStorage.setItem(REPORTED_ITEMS_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('ugc-moderation-updated', { detail: { type: 'takedown', targetId } }));
    window.dispatchEvent(new CustomEvent('recipes-updated'));
  } catch (err) {
    console.error('Failed to takedown item', err);
  }
}

export function dismissUGCReport(reportIndex: number): void {
  try {
    const reports = getReportedItems();
    if (reports[reportIndex]) {
      reports[reportIndex] = { ...reports[reportIndex], status: 'dismissed' };
      localStorage.setItem(REPORTED_ITEMS_KEY, JSON.stringify(reports));
      window.dispatchEvent(new CustomEvent('ugc-moderation-updated', { detail: { type: 'dismiss' } }));
    }
  } catch (err) {
    console.error('Failed to dismiss report', err);
  }
}

export function getReportedItems(): UGCReportItem[] {
  try {
    const raw = localStorage.getItem(REPORTED_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function reportUGCContent(item: Omit<UGCReportItem, 'reportedAt'>): boolean {
  try {
    const current = getReportedItems();
    const newEntry: UGCReportItem = {
      ...item,
      id: 'rep_' + Date.now().toString(36),
      status: 'pending',
      reportedAt: new Date().toISOString()
    };
    const updated = [newEntry, ...current];
    localStorage.setItem(REPORTED_ITEMS_KEY, JSON.stringify(updated));

    // Auto-quarantine threshold: if >= 2 reports target the same item, automatically take down from public Square
    const pendingCountForTarget = updated.filter(
      (r) => r.targetId === item.targetId && r.status !== 'dismissed'
    ).length;
    if (pendingCountForTarget >= 2) {
      takedownUGCItem(item.targetId);
    }

    window.dispatchEvent(new CustomEvent('ugc-moderation-updated', { detail: { type: 'report', item: newEntry } }));
    return true;
  } catch {
    return false;
  }
}
