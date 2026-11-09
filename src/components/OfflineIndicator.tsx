import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-[#2C2723] text-amber-100 text-xs py-2 px-3.5 rounded-lg border border-[#EADBCE] shadow-lg">
      <WifiOff className="w-3.5 h-3.5 text-[#C85A32] animate-pulse" />
      <span>当前处于离线手帐模式，所有菜谱与照片均可流畅查阅</span>
    </div>
  );
};
