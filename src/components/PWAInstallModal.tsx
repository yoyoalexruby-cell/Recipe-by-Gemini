import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, CheckCircle, Share, PlusSquare, X, Copy, Check, QrCode } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-5iynx7acz5wmc4zbh2uoyc-66813115109.asia-northeast1.run.app';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] shadow-2xl max-w-lg w-full overflow-hidden relative my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#EADBCE] bg-white">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#C85A32]" />
            <h2 className="text-base font-bold font-journal-title text-[#2C2723]">
              在手机上安装「食味手记」App
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Step 1: Open on Phone */}
          <div className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-3 shadow-2xs">
            <h3 className="font-bold text-sm text-[#2C2723] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#C85A32] text-white text-xs flex items-center justify-center font-mono">1</span>
              <span>用手机打开本手帐网址</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF7F2] p-3 rounded-lg border border-[#EADBCE]">
              {/* QR Code */}
              <div className="w-28 h-28 bg-white p-1 rounded-lg border border-[#EADBCE] flex items-center justify-center shrink-0 shadow-2xs">
                <img 
                  src={qrUrl} 
                  alt="扫码在手机打开" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-[#5A5248] text-xs leading-relaxed">
                  拿出手机<strong>微信扫一扫</strong>或<strong>手机相机扫码</strong>，或将网址发送到手机浏览器中打开：
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 text-[11px] font-mono px-2 py-1.5 bg-white border border-[#EADBCE] rounded truncate"
                  />
                  <button
                    onClick={copyUrl}
                    className="px-2.5 py-1.5 bg-[#C85A32] text-white rounded font-medium hover:bg-[#B34C26] transition-colors shrink-0 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? '已复制' : '复制'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Instructions based on OS */}
          <div className="bg-white p-4 rounded-xl border border-[#EADBCE] space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-[#2C2723] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#C85A32] text-white text-xs flex items-center justify-center font-mono">2</span>
              <span>在手机上一键添加到主屏幕 (生成App)</span>
            </h3>

            {/* If direct PWA trigger is available on current device */}
            {isInstallable && !isInstalled && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center space-y-2">
                <p className="text-amber-900 font-semibold">检测到当前浏览器支持一键自动安装：</p>
                <button
                  onClick={async () => {
                    const ok = await install();
                    if (ok) onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-[#C85A32] hover:bg-[#B34C26] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>立即安装「食味手记」到手机/电脑</span>
                </button>
              </div>
            )}

            {/* Apple iPhone / iPad instructions */}
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] space-y-2">
              <h4 className="font-bold text-[#C85A32] flex items-center gap-1.5">
                <span>🍎 苹果 iPhone / iPad (Safari 浏览器)</span>
              </h4>
              <ol className="text-xs text-[#5A5248] space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>在 Safari 底部中间点击 <strong>「分享」按钮</strong>（带向上箭头的方框图标 <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" />）</li>
                <li>向上滑动菜单，找到并轻点 <strong>「添加到主屏幕」</strong>（<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-700" />）</li>
                <li>点击右上角的 <strong>「添加」</strong>，手机桌面上就会立即出现「食味手记」App 图标！</li>
              </ol>
            </div>

            {/* Android instructions */}
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] space-y-2">
              <h4 className="font-bold text-[#5F7A4D] flex items-center gap-1.5">
                <span>🤖 安卓手机 (Chrome / 微信 / 华为 / 小米等自带浏览器)</span>
              </h4>
              <ol className="text-xs text-[#5A5248] space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>打开页面后，顶部或底部通常会自动弹出 <strong>「添加食味手记到主屏幕」</strong> 提示，直接点击确认；</li>
                <li>或者点击浏览器右上角的 <strong>三点菜单 (⋮)</strong>，选择 <strong>「添加到主屏幕」</strong> 或 <strong>「安装应用」</strong>；</li>
                <li>即可在手机桌面和应用抽屉中生成 App。</li>
              </ol>
            </div>
          </div>

          {/* App Advantages */}
          <div className="bg-[#FFFDF9] p-3 rounded-lg border border-[#E8DCC4] flex items-center justify-around text-center text-[#7A7268] text-[11px]">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-[#5F7A4D]" />
              <span>全屏无浏览器边框</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-[#5F7A4D]" />
              <span>断网离线畅读</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-[#5F7A4D]" />
              <span>桌面一触即达</span>
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EADBCE] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#2C2723] bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] rounded-lg transition-colors"
          >
            知道了，去安装
          </button>
        </div>

      </div>
    </div>
  );
};
