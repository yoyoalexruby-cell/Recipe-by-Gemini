import React, { useState, useEffect } from 'react';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import {
  OFFICIAL_ACCOUNT_UID,
  OFFICIAL_EDITORIAL_USER,
  OfficialCuratedMenu,
  getOfficialCuratedMenus,
  saveOfficialCuratedMenus
} from '../data/officialSquareSeed';
import {
  computeWeeklyMenuRotation,
  getUpcomingRotationSchedule,
  isAutoMenuRotationEnabled,
  setAutoMenuRotationEnabled
} from '../utils/seasonalMenuRotation';
import { loginAsOfficialEditorial, logoutUser } from '../utils/authService';
import { formatLocalDate } from '../utils/dateUtils';
import {
  UGCReportItem,
  getReportedItems,
  takedownUGCItem,
  dismissUGCReport,
  blockUser,
  getBlockedUserIds,
  unblockUser,
  auditUGCContentSafety
} from '../utils/ugcModeration';
import {
  X,
  ChefHat,
  BookOpen,
  ShieldCheck,
  Plus,
  Check,
  Trash2,
  Pin,
  AlertTriangle,
  Sparkles,
  LogOut,
  Lock,
  Calendar
} from 'lucide-react';
import { useI18n } from '../i18n/context';

interface OfficialOpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  publicRecipes: Recipe[];
  onSwitchToOfficialSuccess: (user: UserProfile) => void;
  onCreateOfficialRecipe: () => void;
  onMenusUpdated: () => void;
}

export const OfficialOpsModal: React.FC<OfficialOpsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  publicRecipes,
  onSwitchToOfficialSuccess,
  onCreateOfficialRecipe,
  onMenusUpdated
}) => {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'editorial' | 'menus' | 'moderation'>('editorial');

  // Operator switch state
  const [passcode, setPasscode] = useState('Official2026!');
  const [authError, setAuthError] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Menus state & Auto-rotation state
  const [menus, setMenus] = useState<OfficialCuratedMenu[]>(() => getOfficialCuratedMenus());
  const [autoRotation, setAutoRotation] = useState<boolean>(() => isAutoMenuRotationEnabled());
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [newMenuTitle, setNewMenuTitle] = useState('');
  const [newMenuSubtitle, setNewMenuSubtitle] = useState('');
  const [newMenuTag, setNewMenuTag] = useState('时令精选');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);

  // Moderation state
  const [reports, setReports] = useState<UGCReportItem[]>(() => getReportedItems());
  const [blockedIds, setBlockedIds] = useState<string[]>(() => getBlockedUserIds());
  const [sandboxText, setSandboxText] = useState('');
  const [sandboxResult, setSandboxResult] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMenus(getOfficialCuratedMenus());
    setReports(getReportedItems());
    setBlockedIds(getBlockedUserIds());
  }, [isOpen]);

  useEffect(() => {
    const syncMod = () => {
      setReports(getReportedItems());
      setBlockedIds(getBlockedUserIds());
    };
    window.addEventListener('ugc-moderation-updated', syncMod);
    return () => window.removeEventListener('ugc-moderation-updated', syncMod);
  }, []);

  if (!isOpen) return null;

  const isOfficialLoggedIn = currentUser?.uid === OFFICIAL_ACCOUNT_UID;
  const officialRecipes = publicRecipes.filter((r) => r.ownerId === OFFICIAL_ACCOUNT_UID);
  const officialTotalLikes = officialRecipes.reduce((acc, r) => acc + (r.likesCount || 0), 0);
  const pendingReportsCount = reports.filter((r) => !r.status || r.status === 'pending').length;
  const currentRotation = computeWeeklyMenuRotation(menus);
  const upcomingSchedule = getUpcomingRotationSchedule(menus, new Date(), 6);

  const showToast = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 3200);
  };

  const handleSwitchOfficial = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const officialUser = loginAsOfficialEditorial(passcode);
      onSwitchToOfficialSuccess(officialUser);
      showToast(
        language === 'zh-CN'
          ? '已切换至「食味手记官方主厨」运营身份！现在发布或评论均带有官方标识。'
          : 'Switched to Official Editorial Chef account.'
      );
    } catch (err: any) {
      setAuthError(err?.message || '口令验证失败');
    }
  };

  const handleTogglePinMenu = (menuId: string) => {
    const updated = menus.map((m) => (m.id === menuId ? { ...m, pinned: !m.pinned } : m));
    setMenus(updated);
    saveOfficialCuratedMenus(updated);
    onMenusUpdated();
  };

  const handleDeleteMenu = (menuId: string) => {
    const updated = menus.filter((m) => m.id !== menuId);
    setMenus(updated);
    saveOfficialCuratedMenus(updated);
    onMenusUpdated();
    showToast(language === 'zh-CN' ? '已移除该主题菜单' : 'Menu removed');
  };

  const handleCreateMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuTitle.trim() || selectedRecipeIds.length === 0) {
      showToast(language === 'zh-CN' ? '请填写菜单标题并至少勾选 1 道食谱' : 'Enter title and select at least 1 recipe');
      return;
    }
    const audit = auditUGCContentSafety([newMenuTitle, newMenuSubtitle, newMenuTag]);
    if (!audit.passed) {
      showToast(audit.reasonZh || '内容未通过安全风控');
      return;
    }

    const firstWithCover = publicRecipes.find(
      (r) => selectedRecipeIds.includes(r.id) && r.coverImage
    );
    const created: OfficialCuratedMenu = {
      id: 'menu-custom-' + Date.now().toString(36),
      title: newMenuTitle.trim(),
      titleEn: newMenuTitle.trim(),
      subtitle: newMenuSubtitle.trim() || '食味手记官方主厨严选搭配，照着做零翻车。',
      subtitleEn: newMenuSubtitle.trim() || 'Curated by Culinary Journal Official Chef.',
      sceneTag: newMenuTag.trim() || '官方精选',
      sceneTagEn: newMenuTag.trim() || 'Curated',
      coverImage: firstWithCover?.coverImage || '',
      curatorName: OFFICIAL_EDITORIAL_USER.displayName,
      recipeIds: selectedRecipeIds,
      pinned: true,
      updatedAt: formatLocalDate()
    };

    const updated = [created, ...menus];
    setMenus(updated);
    saveOfficialCuratedMenus(updated);
    onMenusUpdated();
    setNewMenuTitle('');
    setNewMenuSubtitle('');
    setSelectedRecipeIds([]);
    setIsCreatingMenu(false);
    showToast(language === 'zh-CN' ? `新主题菜单《${created.title}》已上线食味广场！` : 'Curated menu published!');
  };

  const toggleRecipeInDraftMenu = (id: string) => {
    setSelectedRecipeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRunSandboxTest = () => {
    if (!sandboxText.trim()) return;
    const res = auditUGCContentSafety([sandboxText]);
    if (res.passed) {
      setSandboxResult({
        passed: true,
        message:
          language === 'zh-CN'
            ? '检测通过：未发现涉黄赌毒引流违禁词或高危有毒食材，允许公开发布。'
            : 'Passed: No prohibited spam/abuse or toxic ingredient hazards detected.'
      });
    } else {
      setSandboxResult({
        passed: false,
        message: (language === 'zh-CN' ? res.reasonZh : res.reasonEn) || '已拦截'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col paper-shadow overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#EADBCE] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C2723] text-amber-100 flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-journal-title text-[#2C2723]">
                {language === 'zh-CN' ? '官方账号运营与内容安全监管工作台' : 'Official Editorial & UGC Safety Console'}
              </h2>
              <p className="text-xs text-[#7A7268]">
                {language === 'zh-CN'
                  ? '官方主厨日常发谱 · 精选主题菜单编排 · 24h 违规内容巡检处置（符合 Apple Guideline 1.2）'
                  : 'Official recipe publishing, curated menu management, and 24h UGC safety moderation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedbackBanner && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 bg-white border-b border-[#EADBCE] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('editorial')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'editorial'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>{language === 'zh-CN' ? '官方主厨账号运营' : 'Official Chef Account'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('menus')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'menus'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {language === 'zh-CN' ? `官方精选菜单 (${menus.length})` : `Curated Menus (${menus.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'moderation'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {language === 'zh-CN' ? '不合规内容监管台' : 'UGC Safety Queue'}
              {pendingReportsCount > 0 ? ` (${pendingReportsCount})` : ''}
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: OFFICIAL ACCOUNT OPERATIONS */}
          {activeTab === 'editorial' && (
            <div className="space-y-5">
              {/* Official Metrics Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-[#EADBCE] rounded-xl p-4">
                  <div className="text-xs text-[#7A7268] mb-1">
                    {language === 'zh-CN' ? '官方主厨已发广场食谱' : 'Official Public Recipes'}
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#2C2723] tabular-nums">
                    {officialRecipes.length} <span className="text-xs font-sans font-normal text-[#7A7268]">道 (全6大品类覆盖)</span>
                  </div>
                </div>
                <div className="bg-white border border-[#EADBCE] rounded-xl p-4">
                  <div className="text-xs text-[#7A7268] mb-1">
                    {language === 'zh-CN' ? '官方主题菜单合集' : 'Curated Theme Menus'}
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#2C2723] tabular-nums">
                    {menus.length} <span className="text-xs font-sans font-normal text-[#7A7268]">套场景菜单</span>
                  </div>
                </div>
                <div className="bg-white border border-[#EADBCE] rounded-xl p-4">
                  <div className="text-xs text-[#7A7268] mb-1">
                    {language === 'zh-CN' ? '官方食谱累计获赞' : 'Total Community Likes'}
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#C85A32] tabular-nums">
                    {officialTotalLikes}
                  </div>
                </div>
              </div>

              {/* Account Identity Switcher */}
              <div className="bg-white border border-[#EADBCE] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0E6DC]">
                  <div className="flex items-center gap-3">
                    <img
                      src={OFFICIAL_EDITORIAL_USER.avatarUrl}
                      alt={OFFICIAL_EDITORIAL_USER.displayName}
                      className="w-12 h-12 rounded-full border border-[#EADBCE] bg-[#FAF7F2]"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#2C2723]">
                        {OFFICIAL_EDITORIAL_USER.displayName}
                        <span className="ml-2 text-xs font-normal text-[#C85A32]">
                          · 官方认证编辑部账号
                        </span>
                      </div>
                      <p className="text-xs text-[#7A7268] mt-0.5">{OFFICIAL_EDITORIAL_USER.bio}</p>
                    </div>
                  </div>

                  {isOfficialLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        logoutUser();
                        showToast('已退出官方主厨身份，切回普通访客视图');
                      }}
                      className="px-3.5 py-2 rounded-lg border border-[#EADBCE] text-xs font-semibold text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] inline-flex items-center gap-1.5 shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>退出官方身份</span>
                    </button>
                  ) : null}
                </div>

                {isOfficialLoggedIn ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EADBCE]">
                    <div className="text-xs text-[#2C2723] leading-relaxed">
                      <strong>当前已处于「食味手记官方主厨」运营状态：</strong>
                      您现在新建菜谱（勾选公开到广场）、在食味广场给厨友点赞点评，均会以官方主厨身份展示。
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onCreateOfficialRecipe();
                      }}
                      className="px-4 py-2.5 bg-[#C85A32] hover:bg-[#B34C26] text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>以官方身份发布新食谱</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSwitchOfficial} className="space-y-3">
                    <label className="block text-xs font-semibold text-[#2C2723]">
                      输入官方主理人运营口令，一键切换为「食味手记官方主厨」发帖与回复评论：
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Lock className="w-3.5 h-3.5 text-[#9A9085] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="输入运营口令 (默认 Official2026! 或 8888)"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#2C2723] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
                      >
                        切换至官方主厨身份
                      </button>
                    </div>
                    {authError && <p className="text-xs text-rose-600">{authError}</p>}
                    <p className="text-[11px] text-[#7A7268]">
                      提示：您也可以在普通登录弹窗使用账号 <code className="font-mono text-[#2C2723]">official@culinaryjournal.app</code> 与密码 <code className="font-mono text-[#2C2723]">Official2026!</code> 登录。
                    </p>
                  </form>
                )}
              </div>

              {/* Weekly Operating SOP Guide */}
              <div className="bg-white border border-[#EADBCE] rounded-xl p-5">
                <h3 className="text-sm font-bold text-[#2C2723] mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C85A32]" />
                  <span>一人轻量化运营官方号 · 每周 30 分钟冷启动SOP建议</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5A5248] leading-relaxed">
                  <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EADBCE]/70">
                    <div className="font-bold text-[#2C2723] mb-1">1. 每周五更新 1 套时令菜单</div>
                    围绕节气或痛点（如「立冬暖身汤」「打工人带饭周计划」），在「精选菜单」分页把 4~5 道食谱打包置顶，解决用户“今天吃什么”的决策焦虑。
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EADBCE]/70">
                    <div className="font-bold text-[#2C2723] mb-1">2. 官方号给新人首帖暖心点评</div>
                    每天抽 3 分钟以「食味手记官方主厨」身份给广场新发布的厨友作品点赞留评，极高概率促成新用户二次留存与主动分享朋友圈。
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EADBCE]/70">
                    <div className="font-bold text-[#2C2723] mb-1">3. 联动「厨神大赛」征集菜单</div>
                    每月将厨神打擂里高赞的优质民间食谱选入《官方月度精选菜单》，赋予创作者荣誉感，源源不断反哺广场内容池。
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL CURATED MENUS MANAGEMENT */}
          {activeTab === 'menus' && (
            <div className="space-y-4">
              {/* Automatic Solar-Term & Weekly Rotation Control Card */}
              <div className="bg-white border border-[#C85A32]/40 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#F0E6DC]">
                  <div>
                    <div className="text-sm font-bold text-[#2C2723] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C85A32]" />
                      <span>全年二十四节气与周度自动轮换引擎（已开启全托管）</span>
                    </div>
                    <p className="text-xs text-[#7A7268] mt-1 leading-relaxed">
                      无需人工值守，系统每周一 00:00 根据真实月份与二十四节气，自动从 <strong>{menus.length} 套四季菜单库</strong>中切换「本周时令主打」置顶首屏。
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !autoRotation;
                      setAutoRotation(next);
                      setAutoMenuRotationEnabled(next);
                      onMenusUpdated();
                      showToast(
                        next
                          ? '已开启「二十四节气与周度全自动轮换」托管模式'
                          : '已暂停自动轮换，切换为纯手动置顶排序'
                      );
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 border ${
                      autoRotation
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-[#FAF7F2] text-[#7A7268] border-[#EADBCE] hover:text-[#2C2723]'
                    }`}
                  >
                    {autoRotation ? '自动轮换托管：运行中' : '自动轮换已暂停（点击开启）'}
                  </button>
                </div>

                {currentRotation && autoRotation && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-[#7A7268]">本周当值（第 {currentRotation.isoWeek} 周 · {currentRotation.solarTerm.zh}）：</span>
                        <strong className="text-[#C85A32] ml-1">《{currentRotation.spotlightMenu.title}》</strong>
                      </div>
                      <span className="text-[#7A7268] font-mono text-[11px] shrink-0">
                        下次自动换新：{currentRotation.nextMondayDateStr} (周一)
                      </span>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-[#7A7268] mb-2">
                        未来 6 周自动排期预览（全自动按周轮值，零人工干预）：
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {upcomingSchedule.map((slot, i) => (
                          <div
                            key={`${slot.isoYear}-W${slot.isoWeek}`}
                            className={`p-2.5 rounded-lg border text-xs ${
                              i === 0
                                ? 'bg-amber-50/70 border-[#C85A32]/50'
                                : 'bg-[#FAF7F2]/70 border-[#EADBCE]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] text-[#7A7268] mb-1">
                              <span className="font-mono">
                                {i === 0 ? '本周正在展示' : `${slot.mondayDateStr} 起`}
                              </span>
                              <span className="text-[#C85A32] font-semibold">{slot.solarTerm.zh}</span>
                            </div>
                            <div className="font-bold text-[#2C2723] line-clamp-1">
                              {slot.spotlightMenu.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-[#7A7268]">
                  您也可以随时手动置顶某套临时特辑菜单（手动置顶优先级高于自动轮换），或补充新菜单进入轮换池：
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreatingMenu(!isCreatingMenu)}
                  className="px-3.5 py-2 bg-[#C85A32] hover:bg-[#B34C26] text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingMenu ? '收起新建面板' : '新建官方主题菜单'}</span>
                </button>
              </div>

              {isCreatingMenu && (
                <form
                  onSubmit={handleCreateMenuSubmit}
                  className="bg-white border border-[#C85A32]/40 rounded-xl p-4 sm:p-5 space-y-3.5"
                >
                  <div className="text-sm font-bold text-[#2C2723]">编排新官方主题菜单</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#7A7268] mb-1">
                        菜单标题 *
                      </label>
                      <input
                        type="text"
                        value={newMenuTitle}
                        onChange={(e) => setNewMenuTitle(e.target.value)}
                        placeholder="例如：春日野餐便当 · 高颜值冷吃不腥5道菜"
                        className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#7A7268] mb-1">
                        场景短签
                      </label>
                      <input
                        type="text"
                        value={newMenuTag}
                        onChange={(e) => setNewMenuTag(e.target.value)}
                        placeholder="如：时令节气 / 减脂便当"
                        className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A7268] mb-1">
                      主厨导语推荐词
                    </label>
                    <input
                      type="text"
                      value={newMenuSubtitle}
                      onChange={(e) => setNewMenuSubtitle(e.target.value)}
                      placeholder="一句话告诉厨友这套菜单适合什么场合、有什么烹饪亮点..."
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A7268] mb-1.5">
                      勾选纳入本菜单的广场食谱（已选 {selectedRecipeIds.length} 道）：
                    </label>
                    <div className="max-h-44 overflow-y-auto border border-[#EADBCE] rounded-lg bg-[#FAF7F2] p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {publicRecipes.map((rec) => {
                        const checked = selectedRecipeIds.includes(rec.id);
                        return (
                          <label
                            key={rec.id}
                            className={`flex items-center gap-2 p-2 rounded-md text-xs cursor-pointer transition-colors ${
                              checked ? 'bg-amber-50 border border-[#C85A32]/40 text-[#2C2723] font-semibold' : 'bg-white border border-transparent text-[#5A5248]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleRecipeInDraftMenu(rec.id)}
                              className="accent-[#C85A32]"
                            />
                            <span className="truncate flex-1">{rec.title}</span>
                            <span className="text-[10px] text-[#9A9085] shrink-0">{rec.category}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingMenu(false)}
                      className="px-3.5 py-1.5 text-xs text-[#7A7268] hover:text-[#2C2723]"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#2C2723] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      保存并发布至食味广场
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {menus.map((menu) => (
                  <div
                    key={menu.id}
                    className="bg-white border border-[#EADBCE] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[#7A7268] mb-0.5 flex-wrap">
                        <span className="font-semibold text-[#C85A32]">{menu.sceneTag}</span>
                        {menu.seasonLabel && (
                          <>
                            <span>·</span>
                            <span>{menu.seasonLabel}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>包含 {menu.recipeIds.length} 道菜谱</span>
                        {menu.pinned && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-700 font-semibold">人工强置顶中</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[#2C2723] truncate">{menu.title}</div>
                      <p className="text-xs text-[#7A7268] truncate mt-0.5">{menu.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePinMenu(menu.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-1 ${
                          menu.pinned
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-[#FAF7F2] border-[#EADBCE] text-[#7A7268] hover:text-[#2C2723]'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{menu.pinned ? '已置顶' : '设为置顶'}</span>
                      </button>
                      {menu.id.startsWith('menu-custom-') && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="p-2 rounded-lg text-[#9A9085] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="删除自定义菜单"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: UGC MODERATION & SAFETY SANDBOX */}
          {activeTab === 'moderation' && (
            <div className="space-y-5">
              {/* Pre-publish Automated Filter Sandbox */}
              <div className="bg-white border border-[#EADBCE] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-[#2C2723] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>第一道防线：事前敏感词与「高危有毒食材」自动拦截测试器</span>
                  </div>
                  <span className="text-[11px] text-[#7A7268]">已实时挂载至公开菜谱与广场评论发布口</span>
                </div>
                <p className="text-xs text-[#7A7268] leading-relaxed">
                  除了拦截涉黄赌毒、诈骗微信号引流与人身辱骂外，专门针对美食社区内置了<strong>食安毒理红线词库</strong>（如：野生毒蘑菇、白毒伞、河豚肝脏、断肠草、罂粟壳、工业酒精等），防止危险食谱误导用户引发法律纠纷。
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={sandboxText}
                    onChange={(e) => setSandboxText(e.target.value)}
                    placeholder="输入测试语句（例如：教你凉拌河豚肝脏 / 加v信刷单兼职 / 清蒸海鲈鱼）..."
                    className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32]"
                  />
                  <button
                    type="button"
                    onClick={handleRunSandboxTest}
                    className="px-4 py-2 bg-[#2C2723] hover:bg-[#C85A32] text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
                  >
                    模拟风控检测
                  </button>
                </div>
                {sandboxResult && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                      sandboxResult.passed
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {sandboxResult.passed ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{sandboxResult.message}</span>
                  </div>
                )}
              </div>

              {/* 24h User Report Queue */}
              <div className="bg-white border border-[#EADBCE] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-[#2C2723]">
                    第四道防线：社区举报工单与 24 小时人工巡检队列 ({reports.length})
                  </div>
                  <span className="text-[11px] text-[#7A7268]">
                    同一内容被举报 ≥ 2 次将触发自动熔断隐藏
                  </span>
                </div>

                {reports.length === 0 ? (
                  <div className="py-8 text-center bg-[#FAF7F2] rounded-xl border border-dashed border-[#EADBCE] text-xs text-[#7A7268]">
                    当前食味广场环境清朗，暂无待处理的违规举报工单。
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {reports.map((rep, idx) => {
                      const status = rep.status || 'pending';
                      return (
                        <div
                          key={rep.id || idx}
                          className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="text-xs text-[#7A7268]">
                              <span className="font-semibold text-[#2C2723]">《{rep.targetTitle}》</span>
                              <span className="mx-1.5">·</span>
                              <span>作者：{rep.authorName}</span>
                              <span className="mx-1.5">·</span>
                              <span>
                                状态：
                                {status === 'removed'
                                  ? '已下架屏蔽'
                                  : status === 'dismissed'
                                  ? '已驳回误报'
                                  : '待核查处置'}
                              </span>
                            </div>
                            <div className="text-xs text-rose-800 font-medium">
                              举报原因：{rep.reason}
                            </div>
                          </div>

                          {status === 'pending' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  takedownUGCItem(rep.targetId);
                                  showToast(`已从食味广场下架《${rep.targetTitle}》`);
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                下架违规内容
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  takedownUGCItem(rep.targetId);
                                  blockUser(rep.authorId, rep.authorName);
                                  showToast(`已下架内容并封禁作者「${rep.authorName}」`);
                                }}
                                className="px-3 py-1.5 bg-[#2C2723] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                下架并封禁作者
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  dismissUGCReport(idx);
                                  showToast('已标记为误报并归档');
                                }}
                                className="px-2.5 py-1.5 border border-[#EADBCE] bg-white text-[#7A7268] hover:text-[#2C2723] text-xs rounded-lg transition-colors"
                              >
                                驳回
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {blockedIds.length > 0 && (
                  <div className="pt-3 border-t border-[#F0E6DC] flex items-center justify-between flex-wrap gap-2 text-xs text-[#7A7268]">
                    <span>当前本机已拉黑/封禁作者 ID：{blockedIds.join(', ')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        blockedIds.forEach((id) => unblockUser(id));
                        showToast('已清空拉黑屏蔽名单');
                      }}
                      className="text-[#C85A32] hover:underline font-medium"
                    >
                      全部解除屏蔽
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
