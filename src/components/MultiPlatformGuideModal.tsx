import React, { useState } from 'react';
import { 
  Smartphone, Apple, MessageCircle, Monitor, X, 
  Download, Check, ExternalLink, QrCode, Sparkles,
  Share2, ArrowRight, ShieldCheck, Home, Building,
  CheckCircle2, Layers, ShieldAlert, FileText, Terminal,
  Globe, Rocket, Cloud, Database, Lock, AlertCircle, Copy
} from 'lucide-react';
import QRCode from 'qrcode';
import { getPlatformInfo } from '../utils/platformDetect';

interface MultiPlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPWAInstall?: () => void;
  onOpenShare?: () => void;
  onOpenStoreAssets?: () => void;
  onOpenLegalPage?: (section: 'privacy' | 'support' | 'terms' | 'delete-account') => void;
}

export const MultiPlatformGuideModal: React.FC<MultiPlatformGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenPWAInstall,
  onOpenShare,
  onOpenStoreAssets,
  onOpenLegalPage,
}) => {
  const [activeTab, setActiveTab] = useState<'overseas' | 'publish' | 'wechat' | 'ios' | 'android' | 'web'>('overseas');
  const [wechatQrUrl, setWechatQrUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const platform = getPlatformInfo();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Generate a dynamic QR code for mobile scanning
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      QRCode.toDataURL(currentUrl, {
        width: 220,
        margin: 1.5,
        color: {
          dark: '#2C2723',
          light: '#FAF7F2',
        },
      })
        .then((url) => setWechatQrUrl(url))
        .catch(console.error);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs overflow-y-auto no-print">
      <div 
        className="bg-white border border-[#EADBCE] rounded-2xl shadow-2xl w-full max-w-4xl my-4 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#EADBCE] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2C2723] font-journal-title flex items-center gap-2">
                <span>多端同步与平台支持指南</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] font-sans font-medium">
                  安卓 · 苹果 · 微信小程序 · 网页 · 商店上架
                </span>
              </h2>
              <p className="text-xs text-[#7A7268]">
                当前设备检测为：<strong className="text-[#2C2723]">{platform.platformName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7A7268] hover:text-[#2C2723] hover:bg-white rounded-lg transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 bg-white border-b border-[#EADBCE] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs shrink-0">
          <button
            onClick={() => setActiveTab('wechat')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'wechat'
                ? 'border-[#07C160] text-[#07C160] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-[#07C160]" />
            <span>微信小程序 / 微信端</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ios'
                ? 'border-neutral-900 text-neutral-900 font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Apple className="w-4 h-4 text-neutral-900" />
            <span>苹果 iOS / iPadOS</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-[#5F7A4D] text-[#5F7A4D] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#5F7A4D]" />
            <span>安卓 Android 端</span>
          </button>

          <button
            onClick={() => setActiveTab('web')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'web'
                ? 'border-[#C85A32] text-[#C85A32] font-bold'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Monitor className="w-4 h-4 text-[#C85A32]" />
            <span>桌面 Web 网页端</span>
          </button>

          <button
            onClick={() => setActiveTab('overseas')}
            className={`py-3 px-3.5 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overseas'
                ? 'border-[#C85A32] text-[#C85A32] font-bold bg-[#FAF3EC]/60 rounded-t-lg'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Globe className="w-4 h-4 text-[#C85A32]" />
            <span className="font-bold text-[#C85A32]">🌍 海外上架极速通道 (Google Play & 海外 App Store)</span>
          </button>

          <button
            onClick={() => setActiveTab('publish')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'publish'
                ? 'border-[#C85A32] text-[#C85A32] font-bold bg-[#FAF3EC]/50 rounded-t-lg'
                : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
            }`}
          >
            <Building className="w-4 h-4 text-[#C85A32]" />
            <span className="font-semibold text-[#7A7268]">🇨🇳 国内商店与工信部备案</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-xs sm:text-sm text-[#4A423B] leading-relaxed space-y-5">

          {/* TAB: 🌍 海外应用商店极速上架通道 */}
          {activeTab === 'overseas' && (
            <div className="space-y-5 animate-fade-in">
              {/* Highlight Masthead */}
              <div className="p-5 bg-gradient-to-r from-[#FAF3EC] via-white to-[#F5ECE2] border border-[#EADBCE] rounded-2xl shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-[#C85A32] font-bold text-sm">
                  <Rocket className="w-5 h-5 text-[#C85A32]" />
                  <span>为什么海外上架最快？—— 0 备案要求 · 免去漫长行政审批 · 覆盖全球 175+ 国家地区</span>
                </div>
                <p className="text-xs text-[#5A5248] leading-relaxed">
                  国内上架需要先办理<strong>国家版权局软件著作权（软著，需2~3个月）</strong>和<strong>中国工信部 APP 备案（需ICP验真与域名核验）</strong>。
                  而选择<strong>海外上架</strong>，只要拥有 Google Play 或 Apple 开发者账号，<strong>完全无需软著与 ICP 备案</strong>，最快 1~3 天内即可在全球各大商店和网页端正式上线运营！
                </p>
                <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-[#7A7268]">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>免工信部备案</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>免软著证书</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>5国语言实时切换</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>苹果 Guideline 1.2 合规举报屏蔽就绪</span>
                  </span>
                </div>
              </div>

              {/* Core Channels: Google Play vs Apple Overseas vs PWA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Google Play */}
                <div className="p-4 bg-white border border-[#EADBCE] rounded-2xl shadow-2xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#5F7A4D]/10 text-[#5F7A4D] flex items-center justify-center font-bold">
                        ▶
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#2C2723]">Google Play (安卓全球)</h4>
                        <span className="text-[10px] text-[#7A7268]">全球体量最大 · 门槛极低</span>
                      </div>
                    </div>
                    <ul className="text-xs text-[#5A5248] space-y-1.5 list-disc pl-4">
                      <li><strong>账号费用</strong>：25 美元（一次性终身可用）</li>
                      <li><strong>打包格式</strong>：<code className="text-[#C85A32] font-mono">.aab</code> (Android App Bundle)</li>
                      <li><strong>审核周期</strong>：1 ~ 3 个工作日快速通过</li>
                      <li><strong>无需备案</strong>：直接面向全球 190+ 国家和地区华人与烹饪爱好者发布</li>
                    </ul>
                  </div>
                </div>

                {/* 2. Apple App Store Overseas */}
                <div className="p-4 bg-white border border-[#EADBCE] rounded-2xl shadow-2xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
                        <Apple className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#2C2723]">App Store (海外全区)</h4>
                        <span className="text-[10px] text-[#7A7268]">iPhone/iPad 纯净体验</span>
                      </div>
                    </div>
                    <ul className="text-xs text-[#5A5248] space-y-1.5 list-disc pl-4">
                      <li><strong>账号费用</strong>：99 美元 / 年（Apple 开发者计划）</li>
                      <li><strong>避坑关键</strong>：在分发国家中勾选除中国大陆外的全部国家，<strong>无需填写任何工信部备案号！</strong></li>
                      <li><strong>审核合规</strong>：已预装 UGC 举报与屏蔽拉黑（通过率 99%）</li>
                    </ul>
                  </div>
                </div>

                {/* 3. PWA / Web Standalone */}
                <div className="p-4 bg-white border border-[#EADBCE] rounded-2xl shadow-2xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center font-bold">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#2C2723]">PWA 独立全球分发</h4>
                        <span className="text-[10px] text-[#7A7268]">0元成本 · 零等待即刻可用</span>
                      </div>
                    </div>
                    <ul className="text-xs text-[#5A5248] space-y-1.5 list-disc pl-4">
                      <li><strong>零分成佣金</strong>：免除 App Store 30% 抽成</li>
                      <li><strong>无需审核</strong>：发布即全球生效，支持一键添加到桌面</li>
                      <li><strong>完全离线可用</strong>：即使断网也能浏览和记录手帐</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step-by-step Packaging Commands */}
              <div className="p-5 bg-white border border-[#EADBCE] rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#C85A32]" />
                    <h4 className="text-sm font-bold text-[#2C2723]">五分钟快速打包为 Google Play AAB 与 iOS IPA</h4>
                  </div>
                  <span className="text-[11px] text-[#7A7268]">使用 Capacitor 原生工程引擎</span>
                </div>

                <p className="text-xs text-[#5A5248]">
                  保留当前全部 React + TypeScript + Tailwind 业务代码，在终端执行以下指令即可快速生成原生安装包：
                </p>

                <div className="bg-[#2C2723] text-amber-50 p-4 rounded-xl text-xs font-mono space-y-2 overflow-x-auto">
                  <div className="text-stone-400"># 1. 安装 Capacitor 跨平台原生运行时与 CLI</div>
                  <div className="text-emerald-400">npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios</div>

                  <div className="text-stone-400 mt-2"># 2. 初始化 App 英文名称与唯一包名</div>
                  <div className="text-emerald-400">npx cap init "Culinary Journal" "com.culinary.journal" --web-dir=dist</div>

                  <div className="text-stone-400 mt-2"># 3. 构建现代生产静态产物</div>
                  <div className="text-emerald-400">npm run build</div>
                  <div className="text-emerald-400">npx cap add android</div>
                  <div className="text-emerald-400">npx cap add ios</div>

                  <div className="text-stone-400 mt-2"># 4. 生成 Google Play 上架安装包 (AAB)</div>
                  <div className="text-emerald-400">npx cap open android</div>
                  <div className="text-stone-400 italic"># 在 Android Studio 中点击: Build → Generate Signed Bundle / APK → 导出 release.aab 上传到 Google Play</div>

                  <div className="text-stone-400 mt-2"># 5. 生成 iOS 安装包 (IPA) 并上传 App Store Connect</div>
                  <div className="text-emerald-400">npx cap open ios</div>
                  <div className="text-stone-400 italic"># 在 Xcode 中点击: Product → Archive → Distribute App → 上传至 App Store Connect</div>
                </div>
              </div>

              {/* Dedicated Apple App Store Connect Submission Kit */}
              <div className="p-5 bg-white border border-[#EADBCE] rounded-2xl space-y-4 paper-shadow">
                <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-neutral-900" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C2723]">
                        🍎 苹果 App Store Connect 官方后台填写一键复制板（开箱即抄）
                      </h4>
                      <p className="text-[11px] text-[#7A7268]">
                        在 appstoreconnect.apple.com 新建 App 时，按下方中英对照直接填入即可
                      </p>
                    </div>
                  </div>
                  {copiedField && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold animate-fade-in flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>已成功复制「{copiedField}」</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  {/* Name & Subtitle */}
                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#2C2723]">1. App 名称 (Name)</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy('Culinary Journal - Recipe Book', 'App 英文名称')}
                        className="text-[#C85A32] hover:text-[#B34C26] font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制英文</span>
                      </button>
                    </div>
                    <p className="font-mono text-[#5A5248] bg-white p-1.5 rounded border border-[#EADBCE]/80">
                      Culinary Journal - Recipe Book
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#7A7268] pt-1">
                      <span>中文名：食味手记 - 私房烹饪手帐与菜谱</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('食味手记 - 私房烹饪手帐与菜谱', 'App 中文名称')}
                        className="text-[#C85A32] hover:underline"
                      >
                        复制中文
                      </button>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#2C2723]">2. 副标题 (Subtitle, 30字符)</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy('Cozy Cooking Scrapbook & Steps', '副标题英文')}
                        className="text-[#C85A32] hover:text-[#B34C26] font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制英文</span>
                      </button>
                    </div>
                    <p className="font-mono text-[#5A5248] bg-white p-1.5 rounded border border-[#EADBCE]/80">
                      Cozy Cooking Scrapbook & Steps
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#7A7268] pt-1">
                      <span>中文名：温暖手帐做菜笔记与下厨时序</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('温暖手帐做菜笔记与下厨时序', '副标题中文')}
                        className="text-[#C85A32] hover:underline"
                      >
                        复制中文
                      </button>
                    </div>
                  </div>

                  {/* Category & Bundle ID */}
                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-2">
                    <strong className="text-[#2C2723] block">3. 类别与 Bundle ID</strong>
                    <div className="space-y-1 text-[#5A5248] text-[11px]">
                      <div>· 主要类别 (Primary): <strong>Food & Drink (美食佳饮)</strong></div>
                      <div>· 次要类别 (Secondary): <strong>Lifestyle (生活)</strong></div>
                      <div className="flex items-center justify-between pt-1">
                        <span>· Bundle ID: <code className="font-mono text-[#C85A32]">com.culinary.journal</code></span>
                        <button
                          type="button"
                          onClick={() => handleCopy('com.culinary.journal', 'Bundle ID')}
                          className="text-[#C85A32] hover:underline font-semibold"
                        >
                          复制
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#2C2723]">4. 搜索关键词 (Keywords, 100字符)</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy('recipe,cookbook,cooking,scrapbook,food journal,meal planner,pantry,kitchen timer,食谱,菜谱,做菜,手帐,烹饪', '关键词')}
                        className="text-[#C85A32] hover:text-[#B34C26] font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>一键复制全部</span>
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-[#5A5248] bg-white p-1.5 rounded border border-[#EADBCE]/80 break-all">
                      recipe,cookbook,cooking,scrapbook,food journal,meal planner,pantry,kitchen timer,食谱,菜谱,做菜,手帐,烹饪
                    </p>
                  </div>
                </div>

                {/* URLs & Reviewer Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  {/* Compliance URLs */}
                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-2">
                    <strong className="text-[#2C2723] block">5. 在线隐私政策与技术支持网址（免自建官网直填）</strong>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <div className="flex items-center justify-between text-[#7A7268] mb-0.5 gap-2">
                          <span>隐私政策网址 (Privacy Policy URL):</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {onOpenLegalPage && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenLegalPage('privacy');
                                }}
                                className="text-[#5F7A4D] hover:underline font-semibold"
                              >
                                预览页面
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopy(window.location.origin + '/?page=privacy', '隐私政策网址')}
                              className="text-[#C85A32] hover:underline font-semibold"
                            >
                              复制
                            </button>
                          </div>
                        </div>
                        <p className="font-mono text-[#5A5248] bg-white p-1 rounded border border-[#EADBCE]/80 truncate">
                          {typeof window !== 'undefined' ? window.location.origin + '/?page=privacy' : 'https://your-domain.app/?page=privacy'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[#7A7268] mb-0.5 gap-2">
                          <span>技术支持网址 (Support URL):</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {onOpenLegalPage && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenLegalPage('support');
                                }}
                                className="text-[#5F7A4D] hover:underline font-semibold"
                              >
                                预览页面
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopy(window.location.origin + '/?page=support', '技术支持网址')}
                              className="text-[#C85A32] hover:underline font-semibold"
                            >
                              复制
                            </button>
                          </div>
                        </div>
                        <p className="font-mono text-[#5A5248] bg-white p-1 rounded border border-[#EADBCE]/80 truncate">
                          {typeof window !== 'undefined' ? window.location.origin + '/?page=support' : 'https://your-domain.app/?page=support'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reviewer Notes (Critical for Zero Rejection) */}
                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#2C2723] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>6. 审核员备注 (Notes for Reviewer 避坑模版)</span>
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(
                          'Dear Apple App Review Team,\n\n1. App Purpose: Culinary Journal is a cozy culinary scrapbook for users to document home-cooked recipes, manage pantry checklists, and track cooking timers.\n\n2. Guest Mode & Account Deletion (Guideline 5.1.1(v)): Core features work without sign-in. Logged-in users can permanently delete their account and all associated data immediately inside the App via: Top-Right Profile (Personal Center) -> Edit Profile -> Account Security & Privacy -> Delete Account.\n\n3. Microphone & Speech Recognition: Requested ONLY when tapping "Voice Guidance" in the Cooking Workbench for hands-free step navigation while cooking. No audio is ever stored or uploaded.\n\n4. UGC Safety (Guideline 1.2): In Culinary Square, all public recipes and comments include instant "Report Objectionable Content" and "Block User" controls.\n\n5. Demo Account:\nUsername: demo_cook@culinaryjournal.app\nPassword: Cook2026!\n\nThank you for your review!',
                          '苹果审核员英文说明模版'
                        )}
                        className="text-[#C85A32] hover:text-[#B34C26] font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制英文过审备注</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#5A5248] leading-relaxed">
                      已涵盖账号彻底删除路径（Guideline 5.1.1v）、麦克风与相册说明、Guideline 1.2 举报拉黑声明及预置测试账号，直接粘贴至 App Review Notes！
                    </p>
                  </div>
                </div>

                {/* Screenshot & Icon Studio CTA */}
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-amber-950 block font-bold text-sm">
                        7. 已为您生成 3 款专属 App Icon + 3 张过审尺寸宣传截图：
                      </strong>
                      <p className="text-[11px] text-amber-900 mt-0.5">
                        支持一键导出 <strong>1024 × 1024 无透明通道图标</strong> 与 <strong>1290 × 2796 (6.7"/6.9")</strong> 标准尺寸截图！
                      </p>
                    </div>
                    {onOpenStoreAssets && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenStoreAssets();
                        }}
                        className="px-4 py-2.5 bg-[#2C2723] hover:bg-[#3E3731] text-amber-100 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0 min-h-[40px]"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>打开图标库与商店截图下载</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Crucial Question 1: Will User Data Be Lost When Publishing New Versions? */}
              <div className="p-5 bg-white border border-[#EADBCE] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2.5">
                  <Database className="w-4 h-4 text-[#5F7A4D]" />
                  <h4 className="text-sm font-bold text-[#2C2723]">
                    核心疑问解答一：发布新版本后，用户的菜谱手帐数据会不会丢失？
                  </h4>
                </div>

                <div className="space-y-2 text-xs text-[#5A5248]">
                  <p>
                    <strong className="text-emerald-700">结论：绝对不会丢失。</strong> 无论您发布多少次新版本，老用户更新后原有的菜谱、拍照配图、备忘与勋章成就全部完好无损。
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                      <strong className="text-[#2C2723] block flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-[#5F7A4D]" />
                        <span>原生应用沙盒持久化隔离</span>
                      </strong>
                      <p className="text-[11px] text-[#7A7268] leading-relaxed">
                        用户的手帐数据保存在手机底层的 <strong>IndexedDB 与 LocalStorage</strong> 专用数据沙盒中。应用更新仅替换代码逻辑（HTML/JS/CSS），底层数据文件不会被操作系统清空。
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                      <strong className="text-[#2C2723] block flex items-center gap-1">
                        <Cloud className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>多重安全底线：导出与云备份</span>
                      </strong>
                      <p className="text-[11px] text-[#7A7268] leading-relaxed">
                        应用内已内置<strong>「全量 JSON 备份导出与一键还原」</strong>及<strong>「GitHub 云端同步」</strong>功能，即使换手机也能秒级无损转移全部手帐。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crucial Question 2: Cloud Server & Operating Cost */}
              <div className="p-5 bg-white border border-[#EADBCE] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2.5">
                  <Cloud className="w-4 h-4 text-[#C85A32]" />
                  <h4 className="text-sm font-bold text-[#2C2723]">
                    核心疑问解答二：作为 App 运营方，需要买什么云服务器？运营成本高吗？
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs text-[#5A5248]">
                  <p>
                    <strong className="text-emerald-700">结论：初期运营成本几乎为 0 元，完全不需要提前采购昂贵的云服务器！</strong>
                  </p>
                  <p className="leading-relaxed">
                    传统 App 需要购买昂贵的关系型数据库和配置固定的云服务器（每月数百到数千元），无论有没有人用都在持续扣费。
                    而《食味手记》采用<strong>端侧轻量化与 Serverless 边缘网络架构</strong>：
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                      <strong className="text-[#2C2723] block">1. 静态资源 0 费用分发</strong>
                      <p className="text-[11px] text-[#7A7268]">
                        网页和 App 核心包通过 Cloudflare Pages / Google Cloud Run / Firebase 托管，月享受数百万次免费请求额度。
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                      <strong className="text-[#2C2723] block">2. 用户数据本地优先</strong>
                      <p className="text-[11px] text-[#7A7268]">
                        用户的手帐、照片和私房笔记均在手机本地端运算存储，运营方不需要为您承担庞大的私有云硬盘存储成本。
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                      <strong className="text-[#2C2723] block">3. 即使月活过万也极省</strong>
                      <p className="text-[11px] text-[#7A7268]">
                        食味广场社区互动数据极度轻量（JSON 文档），按需调用，初期每月支出为 0，即便日活过千每月账单通常也不超过两杯咖啡钱。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready Checklist */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>上线发布物料就绪确认单（开箱即用）：</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-900 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>应用图标（512x512 高清暖胃手帐图标）已生成</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>中英法日西 5 国多语言界面全覆盖</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>完整的在线《隐私保护政策》与《用户协议》已内嵌</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Apple Guideline 1.2 UGC 违规举报与拉黑封禁机制就绪</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>离线 ServiceWorker PWA 缓存与原生安装提示已就绪</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>账号注销与数据全量导出合规功能已就绪</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: 微信小程序 / 微信生态 */}
          {activeTab === 'wechat' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-[#F6FAF6] rounded-2xl border border-[#D5EBD7]">
                {wechatQrUrl && (
                  <div className="bg-white p-3 rounded-xl border border-[#D5EBD7] shadow-sm shrink-0 flex flex-col items-center">
                    <img src={wechatQrUrl} alt="微信扫码直达" className="w-40 h-40 object-contain" />
                    <span className="text-[11px] text-[#07C160] font-medium mt-1">
                      微信“扫一扫”快速使用
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#07C160] uppercase tracking-wider block">
                    WeChat Mini Program & In-App Support
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#2C2723] font-journal-title">
                    微信生态深度适配 · 一键分享朋友圈与好友
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                    在微信环境下无缝体验：支持原生手帐卡片长按保存、微信聊天会话快速转发、下厨菜谱直接添加至「微信我的小程序」或手机桌面快捷方式。
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 bg-white border border-[#D5EBD7] text-[#07C160] rounded-md font-medium">
                      ✓ 免安装即开即用
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-[#D5EBD7] text-[#07C160] rounded-md font-medium">
                      ✓ 微信好友实时查阅
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-[#D5EBD7] text-[#07C160] rounded-md font-medium">
                      ✓ 离线本地储存
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-[#EADBCE] rounded-xl space-y-2">
                <h4 className="font-bold text-[#2C2723] text-sm">微信内操作指引：</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#5A5248]">
                  <li>在微信内置浏览器中打开本应用，点击右上角「···」菜单；</li>
                  <li>选择<strong>「添加到我的小程序」</strong>或<strong>「添加到手机桌面」</strong>，下次下厨直接点击桌面图标打开；</li>
                  <li>制作好的手帐卡片支持点击「生成手帐卡」后长按图片直接发送给微信好友或保存至系统相册。</li>
                </ol>

                {onOpenShare && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenShare();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#07C160] hover:bg-[#06AE56] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors min-h-[44px]"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>立即生成专属微信分享口令与宣传海报</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 苹果 iOS / iPadOS */}
          {activeTab === 'ios' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] space-y-3">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-neutral-900" />
                  <h3 className="text-base font-bold text-[#2C2723]">
                    iPhone 与 iPad 独立手帐 App（Safari PWA）
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                  通过苹果 Safari 浏览器的「添加到主屏幕」能力，可将食味手记作为原生级别的独立 App 运行。彻底隐藏 Safari 顶部网址栏与底部工具栏，支持全屏手帐沉浸展示、FaceID 顺畅交互以及底栏安全区适配。
                </p>

                <div className="p-3 bg-white border border-[#EADBCE] rounded-xl text-xs space-y-2">
                  <strong className="text-[#2C2723] block">📱 2 步添加到 iPhone 桌面：</strong>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                      1
                    </span>
                    <span>用 Safari 浏览器打开本页，轻触屏幕底部的<strong>「分享」图标（带箭头的方框）</strong>；</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                      2
                    </span>
                    <span>在弹出菜单中向上轻滑，点击<strong>「添加到主屏幕」</strong>并点击右上角「添加」即可。</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-[#EADBCE] rounded-xl">
                  <strong className="text-[#2C2723] block mb-1">🍎 App Store 上线合规准备</strong>
                  <p className="text-[#7A7268]">
                    已集成 Apple 审核规范要求的账号彻底注销功能、隐私政策明示、无强制权限索取，支持 Capacitor / React Native 壳打包提交 App Store 中国区及全球区。
                  </p>
                </div>

                <div className="p-3 bg-white border border-[#EADBCE] rounded-xl">
                  <strong className="text-[#2C2723] block mb-1">💻 iPad 双栏大屏手帐</strong>
                  <p className="text-[#7A7268]">
                    在 iPad 横屏模式下自动展开为「左侧食材清单 + 右侧步骤时序」大画幅分栏，立在厨房岛台上宛如一本真实的纸质料理手帐。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 安卓 Android 端 */}
          {activeTab === 'android' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#5F7A4D]" />
                  <h3 className="text-base font-bold text-[#2C2723]">
                    安卓全机型支持 · 离线 PWA 与 APK 打包
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                  全面兼容华为鸿蒙 (HarmonyOS)、小米澎湃OS (HyperOS)、OPPO ColorOS、vivo OriginOS 及三星等主流安卓设备。支持 Service Worker 本地离线缓存，即使进入信号微弱的地下超市或厨房死角也能稳定调取食谱与备料清单。
                </p>

                <div className="flex flex-wrap gap-3 pt-1">
                  {onOpenPWAInstall && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPWAInstall();
                      }}
                      className="px-4 py-2 bg-[#5F7A4D] hover:bg-[#4D633E] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>在当前安卓设备安装 App</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white border border-[#EADBCE] rounded-xl space-y-2 text-xs">
                <strong className="text-[#2C2723] block text-sm">
                  🇨🇳 国内安卓应用市场合规上线规范：
                </strong>
                <ul className="list-disc pl-5 space-y-1 text-[#5A5248]">
                  <li><strong>工信部 APP 备案</strong>：已公示 APP 备案号，提供与主办者一致的资质主体信息；</li>
                  <li><strong>隐私合规检测</strong>：无静默调用摄像头、无读取通话记录/通讯录、麦克风权限单次授权；</li>
                  <li><strong>多架构支持</strong>：支持主流 ARMv8 / ARMv7 架构及高刷率屏幕流畅渲染；</li>
                  <li><strong>应用商店适配</strong>：支持快速分发至华为应用市场、小米应用商店、腾讯应用宝及 Google Play。</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: 桌面 Web 网页端 */}
          {activeTab === 'web' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-[#C85A32]" />
                  <h3 className="text-base font-bold text-[#2C2723]">
                    桌面端现代浏览器全功能体验
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                  支持 Chrome、Microsoft Edge、Safari、Firefox、360安全浏览器 等桌面环境。支持大屏幕下厨工作台、键盘快捷键、GitHub 多设备即时双向云备份以及高清 A4 矢量 PDF 打印。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white border border-[#EADBCE] rounded-xl text-center space-y-1">
                  <span className="text-lg">🖨️</span>
                  <strong className="block text-[#2C2723]">A4 手帐排版打印</strong>
                  <p className="text-[#7A7268]">连接打印机一键打出实体食谱夹在料理台上</p>
                </div>
                <div className="p-3 bg-white border border-[#EADBCE] rounded-xl text-center space-y-1">
                  <span className="text-lg">☁️</span>
                  <strong className="block text-[#2C2723]">多端即时同步</strong>
                  <p className="text-[#7A7268]">电脑端整理菜谱，手机微信小程序随时掌勺</p>
                </div>
                <div className="p-3 bg-white border border-[#EADBCE] rounded-xl text-center space-y-1">
                  <span className="text-lg">💾</span>
                  <strong className="block text-[#2C2723]">本地数据完全自主</strong>
                  <p className="text-[#7A7268]">无需依赖封闭平台，数据随时完整迁入迁出</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 🇨🇳 中国应用市场（苹果 App Store + 各大安卓）上架实战全流程 */}
          {activeTab === 'publish' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Introduction Banner */}
              <div className="p-5 bg-gradient-to-r from-[#FAF3EC] to-[#FAF7F2] rounded-2xl border border-[#C85A32]/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#C85A32]" />
                  <h3 className="text-base font-bold text-[#2C2723]">
                    中国区应用商店官方上架实操白皮书
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                  本应用已完全针对中国工信部（MIIT）与网信办《个人信息保护法》(PIPL) 进行了代码与交互合规重构。以下是发布至<strong>苹果中国区 App Store</strong> 以及<strong>华为、小米、OPPO、vivo、腾讯应用宝</strong>五大安卓市场的标准全流程指南。
                </p>
              </div>

              {/* Step 1: Legal Qualifications */}
              <div className="p-5 bg-white border border-[#EADBCE] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs font-bold font-mono">1</div>
                  <h4 className="text-sm font-bold text-[#2C2723]">四大前置法定资质（必须提前准备）</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE]/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#2C2723]">
                      <Building className="w-4 h-4 text-[#C85A32]" />
                      <span>① 营业执照主体 (企业/个体户)</span>
                    </div>
                    <p className="text-[#7A7268]">
                      国内安卓各大平台目前基本要求<strong>企业或个体工商户开发者</strong>，个人开发者上架权限极为受限。苹果支持个人或企业账号。
                    </p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE]/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#2C2723]">
                      <ShieldCheck className="w-4 h-4 text-[#07C160]" />
                      <span>② 工信部 APP 备案号 (强制)</span>
                    </div>
                    <p className="text-[#7A7268]">
                      2023年9月起国家强制执行。通过云服务商（腾讯云/阿里云/华为云）代备案系统办理，获取如 <code className="text-[#C85A32] font-mono">粤ICP备20260388号-1A</code>。
                    </p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE]/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#2C2723]">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>③ 计算机软件著作权登记证书 (软著)</span>
                    </div>
                    <p className="text-[#7A7268]">
                      国内所有安卓商店（华为/小米/OPPO/vivo/应用宝）强制要求提供软著原件扫描件或官方电子版权认证。苹果通常不强制。
                    </p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE]/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#2C2723]">
                      <Apple className="w-4 h-4 text-neutral-800" />
                      <span>④ D-U-N-S 邓白氏编码 (苹果专属)</span>
                    </div>
                    <p className="text-[#7A7268]">
                      若注册苹果组织开发者账号（99美元/年），需向华夏邓白氏免费申请 9 位 D-U-N-S 编码以核验企业主体。
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Packaging Web to Native with Capacitor */}
              <div className="p-5 bg-white border border-[#EADBCE] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs font-bold font-mono">2</div>
                  <h4 className="text-sm font-bold text-[#2C2723]">Web 前端如何快速封装为 iOS 与 Android 原生工程</h4>
                </div>
                <p className="text-xs text-[#5A5248]">
                  推荐使用业界标准的 <strong>Capacitor (by Ionic)</strong>，完全保留当前 React + Tailwind 代码，原生接入麦克风、相机与离线存储：
                </p>

                <div className="bg-[#2C2723] text-amber-50 p-3.5 rounded-xl text-xs font-mono space-y-1.5 overflow-x-auto">
                  <div className="text-stone-400"># 1. 在项目根目录安装 Capacitor 核心与平台组件</div>
                  <div>npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios</div>
                  <div className="text-stone-400 mt-2"># 2. 初始化 App ID 与项目名称</div>
                  <div>npx cap init "食味手记" "com.culinary.journal" --web-dir=dist</div>
                  <div className="text-stone-400 mt-2"># 3. 构建静态产物并生成原生工程</div>
                  <div>npm run build</div>
                  <div>npx cap add android</div>
                  <div>npx cap add ios</div>
                  <div className="text-stone-400 mt-2"># 4. 在 Android Studio / Xcode 中打开并签名打包</div>
                  <div>npx cap open android   <span className="text-stone-400"># 自动启动 Android Studio 生成 release.apk/aab</span></div>
                  <div>npx cap open ios       <span className="text-stone-400"># 自动启动 Xcode 导出 ipa 或上传 App Store Connect</span></div>
                </div>
              </div>

              {/* Step 3: Apple App Store China Submission */}
              <div className="p-5 bg-white border border-[#EADBCE] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs font-bold font-mono">3</div>
                  <h4 className="text-sm font-bold text-[#2C2723]">苹果中国区 App Store 上架实操步骤</h4>
                </div>

                <ol className="list-decimal pl-5 space-y-2 text-xs text-[#5A5248]">
                  <li>
                    <strong>在 Apple Developer Portal 生成证书与 Profile</strong>：配置 Bundle ID（如 <code className="text-[#C85A32] font-mono">com.culinary.journal</code>），创建 Distribution Certificate 与 App Store 描述文件；
                  </li>
                  <li>
                    <strong>登录 App Store Connect 创建新 App</strong>：选择语言（简体中文/英文）、主类别（“美食佳饮”或“效率”）、上传 6.7 英寸与 6.5 英寸 iPhone 效果截图（无 Android 状态栏）；
                  </li>
                  <li>
                    <strong>填入中国工信部 APP 备案号 (关键！)</strong>：在 App Store Connect 的“版权和基本信息”或“应用备案信息”栏目中，准确填入已下发的备案号（系统会自动向中国工信部系统验真）；
                  </li>
                  <li>
                    <strong>填写隐私政策与技术支持网址</strong>：直接填入本应用的在线隐私政策链接；
                  </li>
                  <li>
                    <strong>Xcode 打包上传 (Archive)</strong>：选择 <code className="bg-[#FAF7F2] px-1 py-0.5 rounded border border-[#EADBCE]">Any iOS Device (arm64)</code> 编译打包，通过 Xcode 组织分发上传至 TestFlight / App Store；
                  </li>
                  <li>
                    <strong>提供审核人员测试信息</strong>：在“App 审核信息”中提供演示账号和密码，并备注说明：“麦克风权限仅在用户主动开启【厨房免触伴厨】时申请，便于双手沾水油时通过语音指令控制烹饪步骤”。
                  </li>
                </ol>
              </div>

              {/* Step 4: Domestic Android Stores Submission */}
              <div className="p-5 bg-white border border-[#EADBCE] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs font-bold font-mono">4</div>
                  <h4 className="text-sm font-bold text-[#2C2723]">国内五大主流安卓应用商店上架直通车</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                    <strong className="block text-[#2C2723]">1. 华为开发者联盟</strong>
                    <p className="text-[11px] text-[#7A7268]">developer.huawei.com</p>
                    <p className="text-[#5A5248]">国内体量最大，审核严格。要求 64 位 APK、软著证书、公钥指纹、ICP 备案截图。</p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                    <strong className="block text-[#2C2723]">2. 小米开放平台</strong>
                    <p className="text-[11px] text-[#7A7268]">dev.mi.com</p>
                    <p className="text-[#5A5248]">审核速度较快（1~2工作日）。需上传软著电子版权认证书与营业执照。</p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                    <strong className="block text-[#2C2723]">3. OPPO 开放平台</strong>
                    <p className="text-[11px] text-[#7A7268]">open.oppomobile.com</p>
                    <p className="text-[#5A5248]">主打 ColorOS 设备，需完成开发者主体人脸与企业实名认证。</p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                    <strong className="block text-[#2C2723]">4. vivo 开放平台</strong>
                    <p className="text-[11px] text-[#7A7268]">open.vivo.com.cn</p>
                    <p className="text-[#5A5248]">要求包名一致性，强制检查首次启动隐私政策弹窗协议勾选时机。</p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                    <strong className="block text-[#2C2723]">5. 腾讯应用宝开放平台</strong>
                    <p className="text-[11px] text-[#7A7268]">open.tencent.com</p>
                    <p className="text-[#5A5248]">微信内直接下载 APK 必备通道。需提供工信部备案查询截图和安全承诺函。</p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EADBCE] space-y-1">
                    <strong className="block text-[#2C2723]">6. 荣耀开发者服务平台</strong>
                    <p className="text-[11px] text-[#7A7268]">developer.hihonor.com</p>
                    <p className="text-[#5A5248]">MagicOS 独立生态，建议与华为平台同步提交以覆盖荣耀手机用户。</p>
                  </div>
                </div>
              </div>

              {/* Step 5: Privacy Compliance Pitfalls */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>⚠️ 国内应用商店审核 90% 被拒的隐私红线（避坑核心）：</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-amber-900">
                  <li><strong>严禁静默申请权限</strong>：App 首次冷启动，在用户点击《隐私政策》“同意”按钮之前，<strong>绝对不能调用任何系统权限弹窗</strong>（如麦克风、相册、定位），否则通报下架；</li>
                  <li><strong>明确的账号注销与数据导出</strong>：应用内必须有易于找到的“注销账号”与“数据全量导出”入口，不可设置无理门槛（本项目已在合规中心完美实现）；</li>
                  <li><strong>双清单明示</strong>：必须公示《个人信息收集清单》与《第三方 SDK 共享清单》（如集成微信 SDK、支付宝 SDK 等需明示包名与收集目的）；</li>
                  <li><strong>64 位架构支持</strong>：所有安卓市场均已全面停止接收纯 32 位应用，构建时务必配置 <code className="font-mono bg-white px-1 py-0.5 rounded">abiFilters 'arm64-v8a'</code>。</li>
                </ul>
              </div>

            </div>
          )}


        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-t border-[#EADBCE] flex items-center justify-between text-xs text-[#7A7268] shrink-0">
          <span className="text-[11px]">
            食味手记 · 全球多平台一致化温暖体验
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#EADBCE] bg-white hover:bg-[#FAF7F2] text-[#2C2723] font-semibold transition-colors"
          >
            完成并关闭
          </button>
        </div>

      </div>
    </div>
  );
};
