import React, { useState } from 'react';
import {
  ShieldCheck,
  HelpCircle,
  FileText,
  UserX,
  Mail,
  Check,
  Copy,
  ArrowLeft,
  Globe,
  Send,
  BookOpen,
  Lock,
  Smartphone,
  Download,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../types/auth';

export type PublicPageSection = 'privacy' | 'support' | 'terms' | 'delete-account';

interface PublicLegalSupportPageProps {
  initialSection: PublicPageSection;
  currentUser: UserProfile | null;
  onBackToApp: () => void;
  onExportAllData: () => void;
  onDeleteAccount: () => void;
}

export const PublicLegalSupportPage: React.FC<PublicLegalSupportPageProps> = ({
  initialSection,
  currentUser,
  onBackToApp,
  onExportAllData,
  onDeleteAccount
}) => {
  const [section, setSection] = useState<PublicPageSection>(initialSection);
  const [docLang, setDocLang] = useState<'bilingual' | 'en' | 'zh'>('bilingual');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Support ticket state
  const [ticketEmail, setTicketEmail] = useState(currentUser?.email || '');
  const [ticketTopic, setTicketTopic] = useState<'general' | 'bug' | 'account' | 'ugc'>('general');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Web Account Deletion confirmation state
  const [confirmWebDeleteChecked, setConfirmWebDeleteChecked] = useState(false);
  const [webDeleteCompleted, setWebDeleteCompleted] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://culinary-journal.app';
  const supportEmail = 'yoyoalexruby@gmail.com';

  const switchSection = (next: PublicPageSection) => {
    setSection(next);
    if (typeof window !== 'undefined') {
      const nextUrl = `${window.location.pathname}?page=${next}`;
      window.history.replaceState({}, '', nextUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyLink = (pathQuery: string, label: string) => {
    const full = `${origin}/${pathQuery}`;
    navigator.clipboard.writeText(full);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    const refId = 'CJ-' + Date.now().toString(36).toUpperCase();
    try {
      const existing = JSON.parse(localStorage.getItem('culinary_support_tickets_v1') || '[]');
      existing.unshift({
        id: refId,
        email: ticketEmail.trim() || 'anonymous',
        topic: ticketTopic,
        message: ticketMessage.trim(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('culinary_support_tickets_v1', JSON.stringify(existing.slice(0, 30)));
    } catch {
      // ignore storage quota errors
    }
    setSubmittedTicketId(refId);
    setTicketMessage('');
  };

  const handleWebAccountDelete = () => {
    if (!confirmWebDeleteChecked) return;
    onDeleteAccount();
    setWebDeleteCompleted(true);
    setConfirmWebDeleteChecked(false);
  };

  const showEn = docLang === 'bilingual' || docLang === 'en';
  const showZh = docLang === 'bilingual' || docLang === 'zh';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2723] flex flex-col font-sans">
      {/* Top Bar Contract: 3 clean zones */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EADBCE] px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={onBackToApp}
            className="text-base sm:text-lg font-bold font-journal-title text-[#2C2723] whitespace-nowrap shrink-0 hover:text-[#C85A32] transition-colors"
          >
            食味手记 Culinary Journal
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#5A5248]">
            <button
              type="button"
              onClick={() => switchSection('privacy')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                section === 'privacy'
                  ? 'border-[#C85A32] text-[#C85A32] font-semibold'
                  : 'border-transparent hover:text-[#2C2723]'
              }`}
            >
              隐私政策 Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => switchSection('support')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                section === 'support'
                  ? 'border-[#C85A32] text-[#C85A32] font-semibold'
                  : 'border-transparent hover:text-[#2C2723]'
              }`}
            >
              技术支持 App Support
            </button>
            <button
              type="button"
              onClick={() => switchSection('terms')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                section === 'terms'
                  ? 'border-[#C85A32] text-[#C85A32] font-semibold'
                  : 'border-transparent hover:text-[#2C2723]'
              }`}
            >
              服务协议 Terms & EULA
            </button>
            <button
              type="button"
              onClick={() => switchSection('delete-account')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                section === 'delete-account'
                  ? 'border-[#C85A32] text-[#C85A32] font-semibold'
                  : 'border-transparent hover:text-[#2C2723]'
              }`}
            >
              账号注销 Account Deletion
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <button
            type="button"
            onClick={onBackToApp}
            className="px-4 py-2 bg-[#2C2723] hover:bg-[#3E3731] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 min-h-[40px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>打开手帐 Open App</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Mobile Section Switcher + Language Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADBCE]">
          <div className="flex items-center gap-1.5 p-1 bg-[#F2EBE1] rounded-xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => switchSection('privacy')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors min-h-[40px] ${
                section === 'privacy' ? 'bg-white text-[#2C2723] shadow-2xs font-semibold' : 'text-[#5A5248] hover:text-[#2C2723]'
              }`}
            >
              隐私政策 Privacy
            </button>
            <button
              type="button"
              onClick={() => switchSection('support')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors min-h-[40px] ${
                section === 'support' ? 'bg-white text-[#2C2723] shadow-2xs font-semibold' : 'text-[#5A5248] hover:text-[#2C2723]'
              }`}
            >
              用户支持 Support
            </button>
            <button
              type="button"
              onClick={() => switchSection('terms')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors min-h-[40px] ${
                section === 'terms' ? 'bg-white text-[#2C2723] shadow-2xs font-semibold' : 'text-[#5A5248] hover:text-[#2C2723]'
              }`}
            >
              服务协议 Terms
            </button>
            <button
              type="button"
              onClick={() => switchSection('delete-account')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors min-h-[40px] ${
                section === 'delete-account' ? 'bg-white text-rose-700 shadow-2xs font-semibold' : 'text-[#5A5248] hover:text-[#2C2723]'
              }`}
            >
              注销账号 Deletion
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F2EBE1] rounded-xl self-start sm:self-auto shrink-0">
            <Globe className="w-3.5 h-3.5 text-[#7A7268] ml-2 mr-1" />
            <button
              type="button"
              onClick={() => setDocLang('bilingual')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                docLang === 'bilingual' ? 'bg-white text-[#2C2723] shadow-2xs font-semibold' : 'text-[#5A5248]'
              }`}
            >
              中英双语
            </button>
            <button
              type="button"
              onClick={() => setDocLang('en')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                docLang === 'en' ? 'bg-white text-[#2C2723] shadow-2xs font-semibold' : 'text-[#5A5248]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setDocLang('zh')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                docLang === 'zh' ? 'bg-white text-[#2C2723] shadow-2xs font-semibold' : 'text-[#5A5248]'
              }`}
            >
              简体中文
            </button>
          </div>
        </div>

        {/* Copy Official URL Quick Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 bg-white border border-[#EADBCE] rounded-xl text-xs">
          <div className="text-[#5A5248] flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#2C2723]">当前公开链接 Official Public URL:</span>
            <code className="font-mono text-[#C85A32] break-all">
              {`${origin}/?page=${section}`}
            </code>
          </div>
          <button
            type="button"
            onClick={() => handleCopyLink(`?page=${section}`, section)}
            className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EBE1] border border-[#EADBCE] rounded-lg text-[#2C2723] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            {copiedUrl === section ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-700">已复制 Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>复制链接 Copy URL</span>
              </>
            )}
          </button>
        </div>

        {/* ==================== SECTION 1: PRIVACY POLICY ==================== */}
        {section === 'privacy' && (
          <article className="bg-white border border-[#EADBCE] rounded-2xl p-6 sm:p-10 space-y-8 leading-relaxed">
            <header className="space-y-2 border-b border-[#F0E6DC] pb-6">
              <div className="text-xs text-[#7A7268] flex items-center gap-2 flex-wrap">
                <span>食味手记 Culinary Journal</span>
                <span aria-hidden="true">·</span>
                <span>Bundle ID: com.culinary.journal</span>
                <span aria-hidden="true">·</span>
                <span>Effective Date: November 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] text-balance">
                隐私保护政策 / Privacy Policy
              </h1>
              <p className="text-sm text-[#5A5248]">
                Developer & Data Controller: Yimu Na · Contact: {supportEmail}
              </p>
            </header>

            {showEn && (
              <div className="space-y-6 text-sm text-[#3E3731]">
                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">1. Overview & Privacy Commitment</h2>
                  <p>
                    Culinary Journal ("食味手记", "the App", "we", "our") is a personal recipe scrapbook and kitchen cooking companion designed with a strict <strong>Local-First & Data-Minimization</strong> architecture. We do not sell, rent, or trade your personal information, private recipes, or photos to any third party, nor do we track you across third-party apps or websites.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">2. Information We Collect & How It Is Stored</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Account Information (Optional):</strong> You may use Culinary Journal in Guest Mode without registering. If you create an account, we store your chosen username, optional email address, display name, and avatar preference to isolate your personal recipe notebook.
                    </li>
                    <li>
                      <strong>User-Created Culinary Content:</strong> Recipes, ingredient lists, cooking step timers, meal calendar logs, and dish photos you create are stored locally on your device (via Web/App Sandbox LocalStorage & IndexedDB). If you explicitly mark a recipe as "Public" for the Culinary Square community, its title, steps, and author display name are visible in the community feed.
                    </li>
                    <li>
                      <strong>Optional GitHub Backup:</strong> Only if you manually configure your own Personal Access Token in Backup Settings will your recipes sync directly between your device and your own GitHub repository.
                    </li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">3. Device Permissions (iOS / Android / Web)</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Camera & Photo Library:</strong> Requested strictly when you tap "Upload Dish Photo", "Step Photo", or "Save Poster / PDF". Used solely to attach dish photos to your recipe journal or export recipe cards. We never scan or upload your photo library in the background.
                    </li>
                    <li>
                      <strong>Microphone & Speech Recognition:</strong> Requested strictly when you tap "Voice Input" or enable "Hands-Free Kitchen Voice Assistant" while cooking. Audio is processed solely to recognize step navigation commands (e.g., "Next step", "Start timer") or dictate recipe notes, and is never recorded, stored, or transmitted for advertising.
                    </li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">4. Third-Party Tracking & Analytics</h2>
                  <p>
                    Culinary Journal contains <strong>zero third-party behavioral advertising SDKs</strong>, collects no IDFA (Identifier for Advertisers), and performs no cross-app tracking under Apple's App Tracking Transparency (ATT) framework.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">5. Data Retention, Export & Account Deletion (Apple Guideline 5.1.1(v))</h2>
                  <p>
                    You retain full ownership and control over your data at all times:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      <strong>Instant In-App Account Deletion:</strong> Open the App → tap your Avatar / <strong>Personal Center (个人中心)</strong> → select <strong>Edit Profile (修改个人资料)</strong> → scroll to <strong>Account Security & Deletion</strong> → tap <strong>Delete Account Permanently (注销并永久删除账号)</strong>. All account credentials, private/public recipes, bookmarks, and preferences are erased immediately and irreversibly.
                    </li>
                    <li>
                      <strong>Data Portability:</strong> Before deleting your account, you can export all your recipes as a standard JSON file or printable PDF at any time.
                    </li>
                    <li>
                      <strong>Support Assistance:</strong> You may also visit <button type="button" onClick={() => switchSection('delete-account')} className="text-[#C85A32] underline font-medium">our Account Deletion page</button> or email <a href={`mailto:${supportEmail}`} className="text-[#C85A32] underline font-medium">{supportEmail}</a> for privacy inquiries.
                    </li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">6. Children's Privacy</h2>
                  <p>
                    Culinary Journal does not knowingly collect personal identifiable information from children under 13 (or the applicable age of digital consent in your jurisdiction).
                  </p>
                </section>
              </div>
            )}

            {showEn && showZh && <hr className="border-[#EADBCE]" />}

            {showZh && (
              <div className="space-y-6 text-sm text-[#3E3731]">
                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">一、隐私保护总则</h2>
                  <p>
                    「食味手记」（英文名：Culinary Journal）是一款专注于私房菜谱记录、下厨备料时序管理与烹饪复盘的个人美食手帐应用。我们严格遵循<strong>「本地优先存储」、「最小必要原则」</strong>与<strong>「零第三方广告追踪」</strong>规范，绝不向任何第三方出售、出租或共享您的个人身份信息与私房食谱数据。
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">二、信息收集与存储说明</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>账号注册与免登录体验：</strong>您无需注册即可使用本机手帐全部核心功能。当您主动注册账号时，系统仅保存您设置的用户名、选填邮箱、昵称及卡通头像配置，用于在同一设备或多账号间独立隔离手帐空间。
                    </li>
                    <li>
                      <strong>菜谱与烹饪记录数据：</strong>您创建的私房菜谱、食材清单、步骤配图、日历打卡及年度烹饪统计默认保存在您设备本地的应用安全沙盒（IndexedDB / LocalStorage）中。仅当您主动开启某篇菜谱的「公开至食味广场」开关时，该菜谱才会展示在社区灵感列表中。
                    </li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">三、系统权限调用透明清单</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>相册与相机权限：</strong>仅在您主动点击「上传菜品封面」、「步骤实拍图」或「保存手帐海报/PDF」时按需调用，绝不在后台静默读取相册。
                    </li>
                    <li>
                      <strong>麦克风与语音识别权限：</strong>仅在您主动点击「语音输入」或在下厨工作台开启「免动手语音伴厨」时调用，用于在双手沾水或沾油时通过口令切换步骤，绝不进行后台录音或声纹采集。
                    </li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2C2723]">四、账号注销与数据彻底删除权利</h2>
                  <p>
                    您拥有随时导出、修改或彻底删除个人账号及全部数据的权利：
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      <strong>应用内一键彻底注销：</strong>进入应用右上角<strong>「个人中心」→「修改个人资料」→ 底部「账号安全与永久注销」→ 点击「注销并永久删除账号」</strong>，确认后即刻销毁账号凭证及名下所有菜谱、收藏与打卡记录，无需人工等待。
                    </li>
                    <li>
                      <strong>联系开发者：</strong>如有任何隐私合规疑问，请发送邮件至 <a href={`mailto:${supportEmail}`} className="text-[#C85A32] underline font-medium">{supportEmail}</a>。
                    </li>
                  </ul>
                </section>
              </div>
            )}
          </article>
        )}

        {/* ==================== SECTION 2: OFFICIAL APP SUPPORT ==================== */}
        {section === 'support' && (
          <div className="space-y-8">
            <section className="bg-white border border-[#EADBCE] rounded-2xl p-6 sm:p-10 space-y-6">
              <div className="space-y-2 border-b border-[#F0E6DC] pb-5">
                <div className="text-xs text-[#7A7268] flex items-center gap-2 flex-wrap">
                  <span>Official Support Center</span>
                  <span aria-hidden="true">·</span>
                  <span>食味手记官方用户支持</span>
                  <span aria-hidden="true">·</span>
                  <span>Response Time: Within 24 Hours</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723] text-balance">
                  技术支持与帮助中心 / Official App Support
                </h1>
                <p className="text-sm text-[#5A5248] leading-relaxed">
                  {showEn && 'Need help with Culinary Journal, recipe backups, kitchen voice mode, or account management? Browse common answers below or send a support request directly to our team.'}
                  {showEn && showZh && ' / '}
                  {showZh && '如果您在使用《食味手记》记录食谱、备份导入、下厨计时或管理账号时遇到任何问题，可通过下方常见问题或在线工单直接联系开发者。'}
                </p>
              </div>

              {/* Direct Contact & Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#2C2723] flex items-center gap-1.5 text-sm">
                    <Mail className="w-4 h-4 text-[#C85A32]" />
                    <span>官方支持邮箱 Support Email</span>
                  </div>
                  <p className="text-[#5A5248] font-mono break-all">{supportEmail}</p>
                  <a
                    href={`mailto:${supportEmail}?subject=${encodeURIComponent('[Culinary Journal Support] Help Request')}`}
                    className="inline-block pt-1 text-[#C85A32] font-semibold hover:underline"
                  >
                    发送邮件 Send Email →
                  </a>
                </div>

                <div className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#2C2723] flex items-center gap-1.5 text-sm">
                    <Download className="w-4 h-4 text-[#5F7A4D]" />
                    <span>数据备份导出 Data Backup</span>
                  </div>
                  <p className="text-[#5A5248]">
                    支持一键导出全部食谱为 JSON 文件或高清纪念 PDF 手帐。
                  </p>
                  <button
                    type="button"
                    onClick={onExportAllData}
                    className="pt-1 text-[#5F7A4D] font-semibold hover:underline"
                  >
                    立即导出当前数据 Export JSON →
                  </button>
                </div>

                <div className="p-4 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#2C2723] flex items-center gap-1.5 text-sm">
                    <UserX className="w-4 h-4 text-rose-600" />
                    <span>账号与隐私管理 Account & Privacy</span>
                  </div>
                  <p className="text-[#5A5248]">
                    支持应用内或网页端随时自助注销账号并清空个人数据。
                  </p>
                  <button
                    type="button"
                    onClick={() => switchSection('delete-account')}
                    className="pt-1 text-rose-600 font-semibold hover:underline"
                  >
                    前往注销指引 Manage Deletion →
                  </button>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4 pt-2">
                <h2 className="text-lg font-bold text-[#2C2723]">
                  常见问题解答 / Frequently Asked Questions
                </h2>

                <div className="divide-y divide-[#EADBCE] border-y border-[#EADBCE] text-sm">
                  <div className="py-4 space-y-1">
                    <h3 className="font-bold text-[#2C2723]">
                      1. Will my recipes be lost when updating the App or offline? / 断网或更新版本会丢失菜谱吗？
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                      No. Culinary Journal uses an offline-first sandbox database on your device, so you can browse recipes, check off ingredients, and run timers even without internet access. App updates never overwrite your saved recipes. For switching phones, use Backup & Sync to export/import your JSON archive. / 不会。所有私房手帐均持久化保存在设备本地安全沙盒中，厨房无信号也能正常看步骤与倒计时；换机时可通过「数据备份」一键导出 JSON 迁移。
                    </p>
                  </div>

                  <div className="py-4 space-y-1">
                    <h3 className="font-bold text-[#2C2723]">
                      2. How does Hands-Free Voice Guidance work? / 免动手语音伴厨如何使用？
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                      In the Cooking Workbench, tap "Voice Assistant" to grant microphone permission. While cooking with wet or floury hands, say commands like "Next step" or tap the speaker button to have steps read aloud. Audio is never uploaded or stored. / 在「下厨制作」工作台开启语音伴厨后，做菜双手不便触屏时即可语音切换上下步或朗读当前步骤火候，音频仅在本地实时识别，绝不上传保存。
                    </p>
                  </div>

                  <div className="py-4 space-y-1">
                    <h3 className="font-bold text-[#2C2723]">
                      3. How do I report objectionable content or block a user in Culinary Square? / 如何举报违规食谱或屏蔽用户？
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                      Tap the flag/report button on any public recipe or comment in Culinary Square to report inappropriate content or immediately block that author. Blocked authors' posts disappear from your feed instantaneously, and our team reviews all reports within 24 hours. / 在「食味广场」任意公开菜谱或评论旁点击举报/拉黑按钮，即可一键屏蔽该作者全部内容并提交违规举报，我们承诺在 24 小时内巡检处理。
                    </p>
                  </div>

                  <div className="py-4 space-y-1">
                    <h3 className="font-bold text-[#2C2723]">
                      4. How do I permanently delete my account? / 如何彻底注销我的账号？
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                      Go to Personal Center (top-right avatar) → Edit Profile → Account Security & Deletion → Delete Account Permanently. Your account and associated data are deleted immediately. / 打开右上角「个人中心」→「修改个人资料」→ 滑至底部点击「注销并永久删除账号」，确认后立即生效。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Support Ticket Form */}
            <section className="bg-white border border-[#EADBCE] rounded-2xl p-6 sm:p-10 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#2C2723]">
                  在线提交支持反馈 / Submit a Support Request
                </h2>
                <p className="text-xs sm:text-sm text-[#7A7268] mt-1">
                  Submit a ticket below or email {supportEmail} directly. / 填写下方表单提交问题，我们将在 24 小时内回复。
                </p>
              </div>

              {submittedTicketId ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs sm:text-sm text-emerald-950">
                  <div className="font-bold flex items-center gap-2 text-emerald-800">
                    <Check className="w-4 h-4" />
                    <span>反馈已收到 Support Request Received (#{submittedTicketId})</span>
                  </div>
                  <p>
                    Thank you! Your ticket reference is <strong className="font-mono">{submittedTicketId}</strong>. For urgent App Review or account inquiries, you can also send this reference directly via email to <a href={`mailto:${supportEmail}?subject=Ticket%20${submittedTicketId}`} className="underline font-semibold">{supportEmail}</a>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicketId(null)}
                    className="mt-2 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    继续提交新反馈 Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#2C2723] mb-1.5">
                        联系邮箱 Your Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl focus:outline-hidden focus:border-[#C85A32]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#2C2723] mb-1.5">
                        咨询类型 Issue Category
                      </label>
                      <select
                        value={ticketTopic}
                        onChange={(e) => setTicketTopic(e.target.value as 'general' | 'bug' | 'account' | 'ugc')}
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl focus:outline-hidden focus:border-[#C85A32]"
                      >
                        <option value="general">功能咨询 General Question</option>
                        <option value="bug">问题反馈 Bug Report</option>
                        <option value="account">账号与隐私数据 Account & Privacy</option>
                        <option value="ugc">社区违规内容举报 UGC Abuse Report</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2C2723] mb-1.5">
                      详细说明 How can we help?
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="请描述您遇到的问题或建议 / Describe your question or issue..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full p-3.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl focus:outline-hidden focus:border-[#C85A32]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
                    <span className="text-xs text-[#7A7268]">
                      Direct developer email: {supportEmail}
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#B34C26] text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2 min-h-[44px]"
                    >
                      <Send className="w-4 h-4" />
                      <span>提交工单 Submit Support Request</span>
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}

        {/* ==================== SECTION 3: TERMS OF USE & EULA ==================== */}
        {section === 'terms' && (
          <article className="bg-white border border-[#EADBCE] rounded-2xl p-6 sm:p-10 space-y-8 leading-relaxed text-sm text-[#3E3731]">
            <header className="space-y-2 border-b border-[#F0E6DC] pb-6">
              <div className="text-xs text-[#7A7268]">
                Terms of Use · End User License Agreement (EULA) · UGC Safety Policy
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723]">
                用户服务协议与社区公约 / Terms of Use & EULA
              </h1>
            </header>

            {showEn && (
              <div className="space-y-5">
                <section className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#2C2723]">1. Acceptance of Terms</h2>
                  <p>
                    By downloading, accessing, or using Culinary Journal ("食味手记"), you agree to be bound by these Terms of Use and Apple's Standard Licensed Application End User License Agreement (EULA).
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#2C2723]">2. User-Generated Content (UGC) Zero-Tolerance Policy (Guideline 1.2)</h2>
                  <p>
                    When publishing recipes or comments to the public Culinary Square, you agree that there is <strong>zero tolerance for objectionable content or abusive users</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>You may not post unlawful, defamatory, hateful, sexually explicit, infringing, or spam content.</li>
                    <li>Users can flag/report any objectionable recipe or comment and immediately block abusive authors directly in the App.</li>
                    <li>Reported content is reviewed and acted upon (removed and offending accounts ejected) within <strong>24 hours</strong>.</li>
                  </ul>
                </section>

                <section className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#2C2723]">3. Intellectual Property</h2>
                  <p>
                    You retain full copyright ownership of the original recipes, notes, and photographs you create in Culinary Journal.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#2C2723]">4. Kitchen & Dietary Safety Disclaimer</h2>
                  <p>
                    Cooking involves open flames, hot oil, sharp utensils, and potential food allergens (nuts, dairy, seafood, gluten, etc.). Cooking times and temperatures in Culinary Journal are for informational reference only; always exercise safe kitchen practices and verify ingredient allergens.
                  </p>
                </section>
              </div>
            )}

            {showEn && showZh && <hr className="border-[#EADBCE]" />}

            {showZh && (
              <div className="space-y-5">
                <section className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#2C2723]">一、协议确认与原创版权归属</h2>
                  <p>
                    您在《食味手记》中录入的私房菜谱、食材配比、心得体会与实拍图片，其著作权完全归您本人所有。
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#2C2723]">二、社区内容安全与零容忍公约（Apple Guideline 1.2 合规）</h2>
                  <p>
                    使用「食味广场」公开分享或评论互动时，我们对违法违规、侵权盗图、垃圾广告及恶意骚扰行为实行<strong>零容忍政策</strong>：任何用户均可对不当内容发起一键举报或一键拉黑屏蔽作者（拉黑后即时从您的列表中隐藏），运营团队将在收到举报后 24 小时内下架违规内容并封禁违规账号。
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#2C2723]">三、厨房安全与过敏原提示</h2>
                  <p>
                    下厨涉及明火、高温油脂、高压锅具及刀具操作，且不同人群存在特定食物过敏原差异。手帐内的火候与耗时仅供参考，请务必注意用火用电通风安全。
                  </p>
                </section>
              </div>
            )}
          </article>
        )}

        {/* ==================== SECTION 4: ACCOUNT & DATA DELETION ==================== */}
        {section === 'delete-account' && (
          <section className="bg-white border border-[#EADBCE] rounded-2xl p-6 sm:p-10 space-y-6 text-sm text-[#3E3731]">
            <header className="space-y-2 border-b border-[#F0E6DC] pb-5">
              <div className="text-xs text-[#7A7268]">
                Account & Personal Data Deletion · Apple Guideline 5.1.1(v)
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-journal-title text-[#2C2723]">
                账号注销与个人数据彻底删除 / Account Deletion
              </h1>
            </header>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#2C2723]">
                方法一：在 App 内随时自助一键注销（即时生效）/ Option 1: Instant In-App Deletion
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-[#5A5248]">
                <li>
                  Open <strong>Culinary Journal (食味手记)</strong> and tap your profile button in the top-right corner to open <strong>Personal Center (个人中心)</strong>.
                </li>
                <li>
                  Select the <strong>Edit Profile (修改个人资料)</strong> tab and scroll down to <strong>Account Security & Permanent Deletion (账号安全与永久注销)</strong>.
                </li>
                <li>
                  Check the confirmation box and tap <strong>Delete Account Permanently (注销并永久删除账号)</strong>. Your credentials, user-created recipes, bookmarks, and profile are permanently erased immediately.
                </li>
              </ol>
            </div>

            <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-bold text-rose-950">
                    方法二：在此网页直接抹除当前登录账号 / Option 2: Delete Active Session Right Here
                  </h2>
                  <p className="text-xs text-rose-800 mt-1">
                    {currentUser
                      ? `当前已登录账号 Signed in as: ${currentUser.displayName} (UID: ${currentUser.uid})`
                      : '当前浏览器未登录账号 / No active account signed in on this browser.'}
                  </p>
                </div>
              </div>

              {webDeleteCompleted ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
                  ✓ 账号及关联的本地菜谱、收藏与认证数据已永久抹除。 / Your account and associated data have been permanently deleted.
                </div>
              ) : currentUser ? (
                <div className="space-y-3 pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-rose-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmWebDeleteChecked}
                      onChange={(e) => setConfirmWebDeleteChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-rose-600 rounded"
                    />
                    <span>
                      我已知晓注销操作不可撤销，确认永久删除账号「{currentUser.displayName}」及其名下所有私房食谱与个人资料。 / I understand this action is irreversible and permanently deletes my account and all recipes.
                    </span>
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={onExportAllData}
                      className="px-4 py-2 bg-white border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2C2723] hover:bg-[#FAF7F2] min-h-[40px]"
                    >
                      先导出数据备份 Export JSON First
                    </button>
                    <button
                      type="button"
                      disabled={!confirmWebDeleteChecked}
                      onClick={handleWebAccountDelete}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold transition-colors min-h-[40px]"
                    >
                      确认永久注销账号 Delete Account Permanently
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-900">
                  如需人工协助核销任何历史反馈记录，也可发送邮件至 <a href={`mailto:${supportEmail}?subject=Account%20Deletion%20Request`} className="underline font-semibold">{supportEmail}</a>，我们将在 24 小时内处理完毕。
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#EADBCE] bg-white py-6 px-4 sm:px-8 text-xs text-[#7A7268]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            © 2026 食味手记 Culinary Journal · Contact: {supportEmail}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button type="button" onClick={() => switchSection('privacy')} className="hover:text-[#C85A32]">
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={() => switchSection('support')} className="hover:text-[#C85A32]">
              Support
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={() => switchSection('terms')} className="hover:text-[#C85A32]">
              Terms of Use
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={() => switchSection('delete-account')} className="hover:text-rose-600">
              Account Deletion
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
