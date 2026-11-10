export interface PlatformInfo {
  isAndroid: boolean;
  isIOS: boolean;
  isWeChat: boolean;
  isMiniProgram: boolean;
  isStandalone: boolean;
  isDesktop: boolean;
  platformName: string;
}

export const getPlatformInfo = (): PlatformInfo => {
  if (typeof window === 'undefined') {
    return {
      isAndroid: false,
      isIOS: false,
      isWeChat: false,
      isMiniProgram: false,
      isStandalone: false,
      isDesktop: true,
      platformName: 'Web',
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android|adr/.test(ua);
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isWeChat = /micromessenger/.test(ua);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isMiniProgram = isWeChat && ((window as any).__wxjs_environment === 'miniprogram' || /miniprogram/.test(ua));
  
  // Standalone PWA mode
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches || 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true;

  const isDesktop = !isAndroid && !isIOS && !isWeChat;

  let platformName = 'Web 网页端';
  if (isMiniProgram) platformName = '微信小程序端';
  else if (isWeChat) platformName = '微信内置浏览器';
  else if (isAndroid) platformName = isStandalone ? 'Android 原生PWA' : 'Android 安卓移动端';
  else if (isIOS) platformName = isStandalone ? 'iOS 独立手帐App' : 'iOS 苹果移动端';
  else if (isDesktop) platformName = '桌面端 Web';

  return {
    isAndroid,
    isIOS,
    isWeChat,
    isMiniProgram,
    isStandalone,
    isDesktop,
    platformName,
  };
};

/**
 * Safe clipboard copy with fallback
 */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
};
