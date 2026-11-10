import React from 'react';
import { ShieldCheck, Smartphone, ExternalLink, Globe, Heart, Share2 } from 'lucide-react';
import { useI18n } from '../i18n/context';

interface FooterComplianceProps {
  onOpenCompliance: (tab?: 'privacy' | 'terms' | 'permissions' | 'cancellation' | 'filings') => void;
  onOpenMultiPlatform: () => void;
  onOpenShare?: () => void;
}

export const FooterCompliance: React.FC<FooterComplianceProps> = ({
  onOpenCompliance,
  onOpenMultiPlatform,
  onOpenShare
}) => {
  const { currentOption } = useI18n();

  return (
    <footer className="mt-16 border-t border-[#EADBCE] bg-[#FAF7F2] text-[#7A7268] text-xs py-8 px-4 sm:px-6 no-print">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* Top row: Multi-end badges & Legal navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADBCE]/70 pb-5">
          
          {/* Brand & Multi-End Support Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-journal-title font-bold text-sm text-[#2C2723]">
              ❖ 食味手记
            </span>
            <span aria-hidden="true" className="text-[#D6CBC0]">·</span>
            
            {/* Multi-platform pill triggers */}
            <button
              type="button"
              onClick={onOpenMultiPlatform}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#EADBCE] hover:border-[#C85A32] text-[#2C2723] hover:text-[#C85A32] text-[11px] font-medium transition-colors shadow-2xs"
              title="查看安卓、苹果、微信小程序与网页端多端同步指南"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>多端支持：安卓 · 苹果 · 微信小程序 · 网页</span>
            </button>

            {/* Share App Button */}
            {onOpenShare && (
              <button
                type="button"
                onClick={onOpenShare}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#EADBCE] hover:border-[#07C160] text-[#07C160] hover:bg-emerald-50/50 text-[11px] font-medium transition-colors shadow-2xs"
                title="通过微信或二维码分享APP给好友"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>分享App (微信/二维码)</span>
              </button>
            )}
          </div>

          {/* Legal Compliance Entry Links */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-[11px]">
            <button
              type="button"
              onClick={() => onOpenCompliance('privacy')}
              className="hover:text-[#C85A32] transition-colors"
            >
              《隐私保护政策》
            </button>
            <span aria-hidden="true" className="text-[#D6CBC0]">·</span>

            <button
              type="button"
              onClick={() => onOpenCompliance('terms')}
              className="hover:text-[#C85A32] transition-colors"
            >
              《用户服务协议》
            </button>
            <span aria-hidden="true" className="text-[#D6CBC0]">·</span>

            <button
              type="button"
              onClick={() => onOpenCompliance('permissions')}
              className="hover:text-[#C85A32] transition-colors"
            >
              《权限与个人信息清单》
            </button>
            <span aria-hidden="true" className="text-[#D6CBC0]">·</span>

            <button
              type="button"
              onClick={() => onOpenCompliance('cancellation')}
              className="hover:text-rose-600 transition-colors"
            >
              账号注销与数据导出
            </button>
          </div>

        </div>

        {/* Bottom row: MIIT ICP & Cyber Public Security Filings (Mandatory in China) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#9A9085]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>© 2026 食味手记 Culinary Journal. All Rights Reserved.</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            
            {/* MIIT ICP APP Filing with Official Gov Link */}
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#C85A32] transition-colors inline-flex items-center gap-1 font-mono"
              title="工业和信息化部域名信息备案管理系统"
            >
              <span>粤ICP备20260388号-1A</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <span aria-hidden="true" className="hidden sm:inline">·</span>
            
            {/* Public Security Filing */}
            <span className="font-mono">
              粤公网安备 44030502008888号
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-serif italic text-[#7A7268]">
              “人间烟火气，最抚凡人心”
            </span>
            <span className="text-[10px] text-[#C85A32] bg-[#FAF3EC] px-1.5 py-0.5 rounded border border-[#C85A32]/20">
              {currentOption.flag} {currentOption.nativeName}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
