import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Share2, X, Copy, Check, QrCode, Download, 
  MessageCircle, ExternalLink, Sparkles, Smartphone,
  Apple, Globe, Heart, ShieldCheck
} from 'lucide-react';
import { formatLocalDate } from '../utils/dateUtils';

interface AppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppShareModal: React.FC<AppShareModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopiedText, setIsCopiedText] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isNativeShareSupported, setIsNativeShareSupported] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine current active URL for sharing
  const appShareUrl = typeof window !== 'undefined' ? window.location.href : 'https://culinary-journal.app';

  // Check if Web Share API is available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setIsNativeShareSupported(true);
    }
  }, []);

  // Generate high-contrast QR Code for mobile WeChat scanning
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(appShareUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#2C2723',
        light: '#FFFFFF'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate share QR code:', err));
  }, [isOpen, appShareUrl]);

  if (!isOpen) return null;

  // Formatted WeChat invitation copy
  const wechatShareMessage = `🍲【好友邀请】我正在使用《食味手记》做菜手帐！
✨ 双手油水不沾屏免触语音伴厨，还能一键生成A4精美手帐与买菜清单。
👉 点击链接直接打开体验：${appShareUrl}
（支持手机微信、Safari、Chrome及电脑端实时同步）`;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appShareUrl);
    setIsCopiedLink(true);
    showToast('APP 下载与体验链接已复制到剪贴板！');
    setTimeout(() => setIsCopiedLink(false), 2500);
  };

  const handleCopyWeChatMessage = () => {
    navigator.clipboard.writeText(wechatShareMessage);
    setIsCopiedText(true);
    showToast('微信分享口令文案已复制！可直接粘贴发送给微信好友或群聊。');
    setTimeout(() => setIsCopiedText(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '食味手记 · 私房烹饪手帐',
          text: '让每一次下厨都成为值得珍藏的手帐记忆，双手免触语音伴厨，点击体验！',
          url: appShareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyWeChatMessage();
        }
      }
    } else {
      handleCopyWeChatMessage();
    }
  };

  // Draw and download tactile scrapbook share poster
  const handleDownloadPoster = () => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 750;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Warm kraft paper background
    ctx.fillStyle = '#FAF7F2';
    ctx.fillRect(0, 0, 750, 1100);

    // Decorative inner border
    ctx.strokeStyle = '#EADBCE';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 690, 1040);

    ctx.strokeStyle = '#C85A32';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(38, 38, 674, 1024);

    // 2. Washi tape header
    ctx.fillStyle = '#C85A32';
    ctx.fillRect(250, 25, 250, 32);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CULINARY JOURNAL · 厨艺手帐', 375, 47);

    // 3. Brand Wordmark & Slogan
    ctx.fillStyle = '#2C2723';
    ctx.font = 'bold 38px "Noto Serif SC", serif';
    ctx.fillText('❖ 食味手记 · 私房做菜手帐', 375, 130);

    ctx.fillStyle = '#7A7268';
    ctx.font = 'italic 20px "Noto Serif SC", serif';
    ctx.fillText('“人间烟火气，最抚凡人心”', 375, 175);

    // 4. Feature Highlights Box
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(60, 215, 630, 230);
    ctx.strokeStyle = '#EADBCE';
    ctx.strokeRect(60, 215, 630, 230);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('✨ 为什么爱上下厨：', 85, 255);

    ctx.fillStyle = '#4A423B';
    ctx.font = '16px sans-serif';
    const features = [
      '• 🍳 极美手帐质感排版：私房家传菜谱、步骤图文、烹饪短视频与心得复盘',
      '• 🎙️ 厨房免触语音伴厨：双手沾油水不碰屏，说“下一步”“开始计时”即可控制',
      '• 🛒 一键选购全部食材：生成京东/淘宝直链及带走二维码，买菜绝不漏项',
      '• 🖨️ A4 矢量手帐 PDF 打印：四套复古边框排版，贴在冰箱或装订成实体菜谱'
    ];
    features.forEach((feat, i) => {
      ctx.fillText(feat, 85, 295 + i * 36);
    });

    // 5. Draw QR Code
    if (qrDataUrl) {
      const qrImg = new Image();
      qrImg.onload = () => {
        // Draw white card for QR Code
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.fillRect(215, 485, 320, 360);
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = '#EADBCE';
        ctx.lineWidth = 1;
        ctx.strokeRect(215, 485, 320, 360);

        ctx.drawImage(qrImg, 245, 505, 260, 260);

        ctx.fillStyle = '#2C2723';
        ctx.font = 'bold 17px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('微信 / 手机相机“扫一扫”立刻体验', 375, 800);

        ctx.fillStyle = '#7A7268';
        ctx.font = '13px sans-serif';
        ctx.fillText('免安装即用 · 安卓 / 苹果 / 微信小程序 / 网页全支持', 375, 825);

        // 6. Footer badge
        ctx.fillStyle = '#FAF3EC';
        ctx.fillRect(80, 890, 590, 95);
        ctx.strokeStyle = '#C85A32';
        ctx.strokeRect(80, 890, 590, 95);

        ctx.fillStyle = '#C85A32';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('多端同步支持 · 随时随地掌勺美味', 375, 930);

        ctx.fillStyle = '#7A7268';
        ctx.font = '13px sans-serif';
        ctx.fillText('🍏 苹果 iOS  ·  📱 安卓 Android  ·  💬 微信小程序  ·  💻 桌面网页', 375, 960);

        // Export as image
        const imgUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = `食味手记-分享海报-${formatLocalDate()}.png`;
        a.click();
        showToast('🎨 高清手帐分享海报已生成并下载！可直接发送微信朋友圈或好友。');
      };
      qrImg.src = qrDataUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs overflow-y-auto no-print">
      <div 
        className="bg-white border border-[#EADBCE] rounded-2xl shadow-2xl w-full max-w-3xl my-4 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#EADBCE] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32] shadow-2xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2C2723] font-journal-title flex items-center gap-2">
                <span>分享《食味手记》App</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#07C160]/10 text-[#07C160] border border-[#07C160]/20 font-sans font-medium">
                  微信 · 朋友圈 · 跨端扫码直达
                </span>
              </h2>
              <p className="text-xs text-[#7A7268] mt-0.5">
                邀请好友掌勺互动，分享美味手帐与免触伴厨体验
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

        {/* Toast Notification */}
        {toastMsg && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-fade-in shrink-0">
            <span>✨ {toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#FAF7F2]/40">
          
          {/* Left Column: Scrapbook Poster & QR Code Card (6 cols) */}
          <div className="md:col-span-6 flex flex-col items-center">
            <div className="w-full bg-[#FFFDF9] border border-[#EADBCE] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col items-center text-center">
              
              {/* Decorative Washi Tape */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="washi-tape px-4 py-0.5 bg-[#C85A32] text-white text-[10px] font-mono tracking-wider uppercase shadow-2xs">
                  APP SHARE POSTER
                </div>
              </div>

              {/* Poster Header */}
              <div className="pt-2 pb-2 space-y-1">
                <div className="text-base sm:text-lg font-bold font-serif text-[#2C2723]">
                  ❖ 食味手记 · 私房做菜手帐
                </div>
                <p className="text-[11px] text-[#7A7268] font-serif italic">
                  “人间烟火气，最抚凡人心”
                </p>
              </div>

              {/* Dynamic QR Code Card */}
              <div className="my-2 p-3 bg-white border border-[#EADBCE] rounded-xl shadow-inner relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="微信扫一扫直接体验食味手记"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-[#9A9085]">
                    生成二维码中...
                  </div>
                )}
                <div className="mt-1 text-[11px] font-medium text-[#07C160] flex items-center justify-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>微信 / 手机相机“扫一扫”打开</span>
                </div>
              </div>

              {/* Multi-platform Badges */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap text-[11px] text-[#7A7268] pt-1 pb-2">
                <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EADBCE]">🍏 iOS</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EADBCE]">📱 安卓</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EADBCE]">💬 微信小程序</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EADBCE]">💻 网页端</span>
              </div>

              {/* Download Poster Button */}
              <button
                type="button"
                onClick={handleDownloadPoster}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#C85A32] text-[#C85A32] text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>生成并保存高清手帐海报图片 (PNG)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Multi-Channel Share Actions (6 cols) */}
          <div className="md:col-span-6 flex flex-col gap-4">
            
            {/* Action 1: WeChat Share Message */}
            <div className="bg-white border border-[#EADBCE] rounded-xl p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C2723] flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#07C160]" />
                  <span>微信好友 / 微信群 / 朋友圈分享口令</span>
                </span>
                <span className="text-[10px] text-[#07C160] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  一键复制
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-lg text-xs text-[#5A5248] leading-relaxed font-mono whitespace-pre-wrap select-all">
                {wechatShareMessage}
              </div>

              <button
                type="button"
                onClick={handleCopyWeChatMessage}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                  isCopiedText
                    ? 'bg-[#5F7A4D] text-white'
                    : 'bg-[#07C160] hover:bg-[#06AC56] text-white active:scale-[0.98]'
                }`}
              >
                {isCopiedText ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>已复制微信文案，快去粘贴发送！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制微信分享口令文案</span>
                  </>
                )}
              </button>
            </div>

            {/* Action 2: Direct URL Copy */}
            <div className="bg-white border border-[#EADBCE] rounded-xl p-4 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-[#2C2723] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#C85A32]" />
                <span>APP 体验与下载直达网址</span>
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appShareUrl}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EADBCE] rounded-lg font-mono text-[#5A5248] select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] border border-[#EADBCE] hover:border-[#C85A32] text-[#2C2723] hover:text-[#C85A32] text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-2xs flex items-center gap-1"
                >
                  {isCopiedLink ? <Check className="w-3.5 h-3.5 text-[#5F7A4D]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedLink ? '已复制' : '复制链接'}</span>
                </button>
              </div>
            </div>

            {/* Action 3: System Native Share (on Mobile) */}
            {isNativeShareSupported && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2C2723] hover:bg-[#4A423B] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Smartphone className="w-4 h-4 text-amber-200" />
                <span>调起手机系统分享面板 (直接发送微信/QQ联系人)</span>
              </button>
            )}

            {/* Quick Sharing Tips */}
            <div className="bg-[#FFFDF9] border border-[#EADBCE] rounded-xl p-3.5 text-xs text-[#7A7268] space-y-1">
              <strong className="text-[#2C2723] block text-xs">
                💡 分享建议：
              </strong>
              <p className="leading-relaxed text-[11px]">
                · 点击“保存海报”可直接将精美图文海报发至<strong>朋友圈、小红书或美食群</strong>，自带扫码直达；
              </p>
              <p className="leading-relaxed text-[11px]">
                · 好友通过微信直接扫一扫，无需下载安装即可立即使用，享受免触伴厨与做菜日历。
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-t border-[#EADBCE] flex items-center justify-between text-xs text-[#7A7268] shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Heart className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>食味手记 · 让每一次下厨都成为值得珍藏的手帐记忆</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#EADBCE] bg-white hover:bg-[#FAF7F2] text-[#2C2723] font-semibold transition-colors"
          >
            完成
          </button>
        </div>

      </div>
    </div>
  );
};
