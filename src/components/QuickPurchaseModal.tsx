import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  ShoppingBag, X, ExternalLink, QrCode, Copy, Check, 
  Search, Sparkles, Filter, ChevronRight, Store, ArrowRight, Smartphone
} from 'lucide-react';
import { SHOPPING_PLATFORMS, PurchaseItem, ShoppingPlatform } from '../utils/shoppingPlatforms';

interface QuickPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PurchaseItem[];
  sourceTitle?: string;
}

export const QuickPurchaseModal: React.FC<QuickPurchaseModalProps> = ({
  isOpen,
  onClose,
  items,
  sourceTitle = '食谱食材清单'
}) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('jd');
  const [filterMode, setFilterMode] = useState<'missing' | 'all'>('missing');
  const [searchScope, setSearchScope] = useState<'bundle' | 'single'>('bundle');
  const [qrContentType, setQrContentType] = useState<'search' | 'checklist'>('search');
  const [activeIngredientName, setActiveIngredientName] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activePlatform: ShoppingPlatform = useMemo(() => {
    return SHOPPING_PLATFORMS.find((p) => p.id === selectedPlatformId) || SHOPPING_PLATFORMS[0];
  }, [selectedPlatformId]);

  // Missing vs All items
  const missingItems = useMemo(() => items.filter((i) => !i.checked), [items]);
  const displayItems = useMemo(() => {
    if (filterMode === 'missing' && missingItems.length > 0) {
      return missingItems;
    }
    return items;
  }, [filterMode, missingItems, items]);

  // Complete bundle keyword from all ingredients in display
  const bundleKeyword = useMemo(() => {
    const cleanNames = displayItems
      .map(i => i.name.replace(/\(.*?\)|（.*?）/g, '').trim())
      .filter(Boolean);
    // Join top 8 ingredients for combined e-commerce query
    return cleanNames.slice(0, 8).join(' ');
  }, [displayItems]);

  // Active keyword based on scope
  const activeKeyword = useMemo(() => {
    if (searchScope === 'single' && activeIngredientName) {
      return activeIngredientName;
    }
    if (searchScope === 'bundle') {
      return bundleKeyword || '生鲜食材';
    }
    return activeIngredientName || bundleKeyword || '生鲜食材';
  }, [searchScope, activeIngredientName, bundleKeyword]);

  const targetSearchUrl = useMemo(() => {
    return activePlatform.getSearchUrl(activeKeyword);
  }, [activePlatform, activeKeyword]);

  // Formatted checklist text for text QR code take-away
  const formattedChecklistText = useMemo(() => {
    const lines = [
      `【食味手记 · 烹饪食材采买清单】`,
      `菜谱：${sourceTitle}`,
      `生成时间：${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`,
      `---------------------------------`,
      ...displayItems.map((ing, idx) => {
        const stateMark = ing.checked ? '[已备]' : '[待购]';
        return `${idx + 1}. ${stateMark} ${ing.name}：${ing.amount} ${ing.unit}`;
      }),
      `---------------------------------`,
      `共 ${displayItems.length} 项用料。下厨双手带油水，手机备忘轻松买。`
    ];
    return lines.join('\n');
  }, [sourceTitle, displayItems]);

  // What to encode in the QR code: search URL or formatted text checklist
  const qrRawContent = useMemo(() => {
    if (qrContentType === 'checklist') {
      return formattedChecklistText;
    }
    return targetSearchUrl;
  }, [qrContentType, formattedChecklistText, targetSearchUrl]);

  // Generate QR Code dynamically
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    QRCode.toDataURL(qrRawContent, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#2C2723',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, qrRawContent]);

  if (!isOpen) return null;

  const handleCopySearchText = (text: string, label: string = '食材关键词') => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setToastMsg(`已复制「${label}」到剪贴板，可直接在买菜App中粘贴搜索！`);
    setTimeout(() => {
      setIsCopied(false);
      setToastMsg(null);
    }, 3000);
  };

  const handleCopyAllMissingBundle = () => {
    const names = displayItems.map((i) => i.name).join(' ');
    handleCopySearchText(names, '全部待购清单');
  };

  const handleDownloadQrImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `culinary-shopping-qr-${Date.now()}.png`;
    a.click();
    setToastMsg('二维码图片已保存，可发送至微信或相册扫码！');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto no-print">
      <div 
        className="bg-white border border-[#EADBCE] rounded-2xl shadow-2xl w-full max-w-4xl my-4 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#EADBCE] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32] shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2C2723] font-journal-title flex items-center gap-2">
                <span>一键选购食材</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-sans font-medium">
                  生鲜平台搜索接口 & 二维码直达
                </span>
              </h2>
              <p className="text-xs text-[#7A7268] mt-0.5">
                来源：{sourceTitle} · 共 {items.length} 种食材 (缺 {missingItems.length} 种待采购)
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

        {/* Platform Selector Bar */}
        <div className="px-5 py-3 bg-[#FFFDF9] border-b border-[#EADBCE] shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-[#5A5248] flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>选择首选购物平台：</span>
            </span>
            <span className="text-[11px] text-[#9A9085]">点击平台自动切换商品搜索接口</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SHOPPING_PLATFORMS.map((platform) => {
              const isSelected = platform.id === selectedPlatformId;
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatformId(platform.id)}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-xs'
                      : 'bg-[#FAF7F2] border-[#EADBCE] hover:border-[#D6CBC0] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{platform.icon}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${platform.color}`}>
                      {platform.badge}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#2C2723] truncate">
                    {platform.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-fade-in shrink-0">
            <span>✨ {toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area: Left QR Code & Direct Search | Right Ingredients List */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#FAF7F2]/40">
          
          {/* Left Column: QR Code & Mobile Scan Card (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            
            {/* Mode Switcher: E-Commerce Search URL vs Checklist Text QR Code */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#EADBCE] shadow-2xs">
              <button
                type="button"
                onClick={() => setQrContentType('search')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  qrContentType === 'search'
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>电商搜索直达</span>
              </button>
              <button
                type="button"
                onClick={() => setQrContentType('checklist')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  qrContentType === 'checklist'
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'text-[#7A7268] hover:text-[#2C2723]'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>清单扫码带走</span>
              </button>
            </div>

            <div className="bg-white border border-[#EADBCE] rounded-xl p-5 shadow-xs flex flex-col items-center text-center">
              
              {qrContentType === 'search' ? (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#C85A32] mb-1">
                    <QrCode className="w-4 h-4" />
                    <span>手机扫码在【{activePlatform.shortName}】选购</span>
                  </div>
                  <p className="text-[11px] text-[#7A7268] mb-2">
                    微信或自带相机扫码，直接打开该平台的商品搜索页
                  </p>

                  {/* Scope Selector: Complete Bundle vs Single Item */}
                  <div className="flex items-center gap-1 p-0.5 bg-[#FAF7F2] rounded-lg border border-[#EADBCE] mb-3 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchScope('bundle');
                        setActiveIngredientName(null);
                      }}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        searchScope === 'bundle'
                          ? 'bg-[#2C2723] text-white font-semibold shadow-2xs'
                          : 'text-[#7A7268] hover:text-[#2C2723]'
                      }`}
                    >
                      🌟 完整清单打包 ({displayItems.length}味)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchScope('single')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        searchScope === 'single'
                          ? 'bg-[#2C2723] text-white font-semibold shadow-2xs'
                          : 'text-[#7A7268] hover:text-[#2C2723]'
                      }`}
                    >
                      🥬 单项食材精准
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5F7A4D] mb-1">
                    <QrCode className="w-4 h-4" />
                    <span>扫码将清单存入手机</span>
                  </div>
                  <p className="text-[11px] text-[#7A7268] mb-3">
                    微信扫一扫即可在手机展示完整备料清单，外出菜场随时核对
                  </p>
                </>
              )}

              {/* QR Code Container */}
              <div className="p-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl shadow-inner relative group mb-3">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={qrContentType === 'search' ? `扫码在${activePlatform.shortName}选购` : '扫码查看清单'}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg bg-white p-1"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-[#9A9085]">
                    生成二维码中...
                  </div>
                )}
                <div className="mt-1 text-[10px] text-[#7A7268] font-mono truncate max-w-[200px]">
                  {qrContentType === 'search' ? (
                    <span>检索词: <strong className="text-[#C85A32]">{activeKeyword}</strong></span>
                  ) : (
                    <span>完整清单 · 共 {displayItems.length} 种用料</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2">
                {qrContentType === 'search' ? (
                  <>
                    <a
                      href={targetSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                      title="在新标签页中打开搜索"
                    >
                      <span>在 {activePlatform.shortName} 立即搜购</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopySearchText(targetSearchUrl, '电商搜索链接')}
                        className="flex-1 py-1.5 px-2 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#5A5248] text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制链接</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadQrImage}
                        className="py-1.5 px-2 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#5A5248] text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                        title="保存二维码图片"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>存图</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCopySearchText(formattedChecklistText, '食材备料清单文本')}
                      className="w-full py-2 px-3 rounded-lg bg-[#5F7A4D] hover:bg-[#4E663F] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制清单纯文本 (粘贴至备忘录)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadQrImage}
                      className="w-full py-1.5 px-3 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#5A5248] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>保存清单二维码图片</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-[#FFFDF9] border border-[#EADBCE] rounded-xl p-3.5 text-xs text-[#7A7268] space-y-1.5">
              <div className="font-semibold text-[#2C2723] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>选购小贴士：</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                · <strong>完整清单打包模式</strong>：系统已自动遍历当前所有食材生成综合检索词，点击直达京东/淘宝批量选购；
              </p>
              <p className="leading-relaxed text-[11px]">
                · <strong>清单扫码带走模式</strong>：微信扫码直接显示结构化备料单，出门买菜省心不漏买。
              </p>
            </div>
          </div>

          {/* Right Column: Ingredients Selector List (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-3">
            
            {/* Complete Bundle Hero Card */}
            <div 
              onClick={() => {
                setSearchScope('bundle');
                setActiveIngredientName(null);
                setQrContentType('search');
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                searchScope === 'bundle' && qrContentType === 'search'
                  ? 'bg-gradient-to-r from-orange-50 to-amber-50/60 border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-xs'
                  : 'bg-white border-[#EADBCE] hover:border-[#C85A32]/50 hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#C85A32] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs">
                  🌟
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-[#2C2723]">
                      完整食材清单一键打包搜购
                    </strong>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C85A32] text-white font-medium">
                      推荐
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7268] truncate mt-0.5">
                    已遍历当前用料：<span className="font-mono text-[#C85A32]">{bundleKeyword || '全部食材'}</span>
                  </p>
                </div>
              </div>

              <a
                href={activePlatform.getSearchUrl(bundleKeyword || '生鲜食材')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 rounded-lg bg-[#C85A32] hover:bg-[#B34C26] text-white text-xs font-semibold shrink-0 flex items-center gap-1 shadow-2xs transition-colors"
                title={`在 ${activePlatform.shortName} 中一次性搜索全部食材`}
              >
                <span>直达搜购</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Filter and Batch Copy Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#EADBCE] text-xs">
                <button
                  onClick={() => setFilterMode('missing')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filterMode === 'missing'
                      ? 'bg-[#C85A32] text-white shadow-2xs font-semibold'
                      : 'text-[#7A7268] hover:text-[#2C2723]'
                  }`}
                >
                  仅待采购 ({missingItems.length})
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filterMode === 'all'
                      ? 'bg-[#C85A32] text-white shadow-2xs font-semibold'
                      : 'text-[#7A7268] hover:text-[#2C2723]'
                  }`}
                >
                  全部用料 ({items.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQrContentType('checklist')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#EADBCE] hover:border-[#5F7A4D] text-xs text-[#5F7A4D] font-semibold transition-colors shadow-2xs"
                  title="生成清单扫码带走二维码"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>扫码带走</span>
                </button>

                <button
                  onClick={handleCopyAllMissingBundle}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-[#EADBCE] hover:border-[#C85A32] text-xs text-[#C85A32] font-semibold transition-colors shadow-2xs"
                  title="将所有待采购食材名称打包复制"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>打包复制</span>
                </button>
              </div>
            </div>

            {/* List of Ingredients */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {displayItems.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-dashed border-[#EADBCE] text-center text-xs text-[#9A9085]">
                  🎉 太棒了！当前清单中的食材已全部标记备齐！
                  <button
                    onClick={() => setFilterMode('all')}
                    className="block mx-auto mt-2 text-[#C85A32] underline hover:text-[#B34C26]"
                  >
                    查看全部用料
                  </button>
                </div>
              ) : (
                displayItems.map((ing) => {
                  const isCurrentActive = searchScope === 'single' && activeIngredientName === ing.name;
                  const itemSearchUrl = activePlatform.getSearchUrl(ing.name);

                  return (
                    <div
                      key={ing.id}
                      onClick={() => {
                        setSearchScope('single');
                        setActiveIngredientName(ing.name);
                        setQrContentType('search');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrentActive
                          ? 'bg-orange-50/70 border-[#C85A32] ring-1 ring-[#C85A32]/40 shadow-xs'
                          : 'bg-white border-[#EADBCE] hover:border-[#D6CBC0] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${ing.checked ? 'bg-[#5F7A4D]' : 'bg-[#C85A32]'}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#2C2723] truncate">
                              {ing.name}
                            </span>
                            {ing.category && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF7F2] text-[#7A7268] border border-[#EADBCE]">
                                {ing.category === 'main' ? '主料' : ing.category === 'seasoning' ? '调味' : '配菜'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#7A7268] block">
                            需采购：<strong>{ing.amount} {ing.unit}</strong>
                            {ing.recipeTitle && <span className="text-[11px] text-[#9A9085] ml-1.5">({ing.recipeTitle})</span>}
                          </span>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={itemSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-medium text-[#C85A32] bg-white border border-[#EADBCE] hover:border-[#C85A32] rounded-md transition-colors flex items-center gap-1"
                          title={`在 ${activePlatform.shortName} 中搜购此项`}
                        >
                          <span>搜索</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setSearchScope('single');
                            setActiveIngredientName(ing.name);
                            setQrContentType('search');
                          }}
                          className={`p-1.5 rounded-md border text-xs transition-colors ${
                            isCurrentActive
                              ? 'bg-[#C85A32] text-white border-[#C85A32]'
                              : 'bg-white text-[#7A7268] border-[#EADBCE] hover:text-[#2C2723]'
                          }`}
                          title="在左侧生成该单品二维码"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#FAF7F2] border-t border-[#EADBCE] flex items-center justify-between text-xs text-[#7A7268] shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            <span>
              已接入 {SHOPPING_PLATFORMS.length} 大主流电商生鲜平台 · 搜索结果即刻在手机端呈现
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-[#EADBCE] bg-white hover:bg-[#FAF7F2] text-[#2C2723] font-medium transition-colors"
          >
            完成
          </button>
        </div>

      </div>
    </div>
  );
};
