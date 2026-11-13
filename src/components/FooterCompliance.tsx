import React from 'react';
import { ShieldCheck, Smartphone, Share2, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { useI18n } from '../i18n/context';

interface FooterComplianceProps {
  onOpenCompliance: (tab?: 'privacy' | 'terms' | 'permissions' | 'cancellation' | 'filings') => void;
  onOpenMultiPlatform: () => void;
  onOpenShare?: () => void;
  onOpenLegalPage?: (section: 'privacy' | 'support' | 'terms' | 'delete-account') => void;
  onOpenStoreAssets?: () => void;
}

export const FooterCompliance: React.FC<FooterComplianceProps> = ({
  onOpenCompliance,
  onOpenMultiPlatform,
  onOpenShare,
  onOpenLegalPage,
  onOpenStoreAssets
}) => {
  const { currentOption, language, t } = useI18n();

  return (
    <footer className="mt-16 border-t border-[#EADBCE] bg-[#FAF7F2] text-[#7A7268] text-xs py-8 px-4 sm:px-6 no-print">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top row: Multi-end tools & Legal navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADBCE]/70 pb-5">
          {/* Brand & Launch Tools */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-journal-title font-bold text-sm text-[#2C2723]">
              {t('footer.brand', '食味手记')}
            </span>
            <span aria-hidden="true" className="text-[#D6CBC0]">·</span>

            <button
              type="button"
              onClick={onOpenMultiPlatform}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#EADBCE] hover:border-[#C85A32] text-[#2C2723] hover:text-[#C85A32] text-[11px] font-medium transition-colors whitespace-nowrap"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{language === 'zh-CN' ? 'App Store 上架与多端指南' : 'App Store & Multi-Platform Guide'}</span>
            </button>

            {onOpenStoreAssets && (
              <button
                type="button"
                onClick={onOpenStoreAssets}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2C2723] hover:bg-[#3E3731] text-amber-100 text-[11px] font-semibold transition-colors whitespace-nowrap"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'zh-CN' ? '图标库与商店截图下载' : 'App Icons & Screenshots'}</span>
              </button>
            )}

            {onOpenShare && (
              <button
                type="button"
                onClick={onOpenShare}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#EADBCE] hover:border-[#5F7A4D] text-[#5F7A4D] text-[11px] font-medium transition-colors whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('footer.shareApp', '分享应用')}</span>
              </button>
            )}
          </div>

          {/* Legal & Support Entry Links */}
          <div className="flex items-center gap-3 flex-wrap text-[11px]">
            <button
              type="button"
              onClick={() => (onOpenLegalPage ? onOpenLegalPage('privacy') : onOpenCompliance('privacy'))}
              className="hover:text-[#C85A32] transition-colors whitespace-nowrap"
            >
              {language === 'zh-CN' ? '隐私保护政策' : 'Privacy Policy'}
            </button>
            <span aria-hidden="true" className="text-[#D6CBC0]">·</span>

            <button
              type="button"
              onClick={() => (onOpenLegalPage ? onOpenLegalPage('support') : onOpenCompliance('filings'))}
              className="hover:text-[#C85A32] transition-colors inline-flex items-center gap-1 whitespace-nowrap"
            >
              <HelpCircle className="w-3 h-3 text-[#C85A32]" />
              <span>{language === 'zh-CN' ? '技术支持中心' : 'App Support'}</span>
            </button>
            <span aria-hidden="true" className="text-[#D6CBC0]">·</span>

            <button
              type="button"
              onClick={() => (onOpenLegalPage ? onOpenLegalPage('terms') : onOpenCompliance('terms'))}
              className="hover:text-[#C85A32] transition-colors whitespace-nowrap"
            >
              {language === 'zh-CN' ? '用户服务协议' : 'Terms of Use'}
            </button>
            <span aria-hidden="true" className="text-[#D6CBC0]">·</span>

            <button
              type="button"
              onClick={() => (onOpenLegalPage ? onOpenLegalPage('delete-account') : onOpenCompliance('cancellation'))}
              className="hover:text-rose-600 transition-colors whitespace-nowrap"
            >
              {language === 'zh-CN' ? '账号注销与数据删除' : 'Account Deletion'}
            </button>
          </div>
        </div>

        {/* Bottom row: Clean Copyright & Local-First Privacy Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#9A9085]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>{t('footer.rights', '© 2026 食味手记 Culinary Journal. All Rights Reserved.')}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1 text-[#5A5248]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5F7A4D]" />
              <span>
                {language === 'zh-CN'
                  ? '本地优先安全存储 · 零广告追踪 · 支持一键导出与彻底注销'
                  : 'Local-first storage · Zero ad tracking · Instant account deletion'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#7A7268]">
            <span className="font-serif italic">
              {t('footer.motto', '“人间烟火气，最抚凡人心”')}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {currentOption.flag} {currentOption.nativeName}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
