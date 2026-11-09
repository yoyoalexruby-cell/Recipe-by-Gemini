import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, X, Bell } from 'lucide-react';

interface KitchenTimerProps {
  initialMinutes?: number;
  label?: string;
  onClose?: () => void;
}

export const KitchenTimer: React.FC<KitchenTimerProps> = ({
  initialMinutes = 5,
  label = '烹饪计时器',
  onClose
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Update if initialMinutes changes
  useEffect(() => {
    setTotalSeconds(initialMinutes * 60);
    setRemainingSeconds(initialMinutes * 60);
    setIsRunning(false);
    setHasFinished(false);
  }, [initialMinutes]);

  // Audio tone generator using Web Audio API
  const playAlertSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      const playBeep = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playBeep(880, now, 0.25);
      playBeep(1108, now + 0.3, 0.25);
      playBeep(1320, now + 0.6, 0.5);
    } catch {
      // Audio might be blocked if no user gesture
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasFinished(true);
            playAlertSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggleRun = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
      setHasFinished(false);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    setHasFinished(false);
  };

  const addExtraMinutes = (mins: number) => {
    setRemainingSeconds((prev) => prev + mins * 60);
    setTotalSeconds((prev) => prev + mins * 60);
    setHasFinished(false);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-white/95 backdrop-blur-md rounded-xl border border-[#EADBCE] shadow-2xl p-4 w-76 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0E6DC] mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#7A7268]">
          <Bell className="w-3.5 h-3.5 text-[#C85A32]" />
          <span className="truncate max-w-[170px]">{label}</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-[#9A9085] hover:text-[#2C2723] p-0.5 rounded transition-colors"
            title="关闭计时器"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center my-2">
        <div className={`text-4xl font-mono tabular-nums font-bold tracking-tight transition-colors ${hasFinished ? 'text-rose-600 animate-bounce' : 'text-[#2C2723]'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        {hasFinished && (
          <div className="text-xs font-medium text-rose-600 mt-1 flex items-center justify-center gap-1">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span>时间到！请检查火候与食材</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#F3ECE4] h-1.5 rounded-full overflow-hidden my-3">
        <div 
          className={`h-full transition-all duration-500 ${hasFinished ? 'bg-rose-500' : 'bg-[#C85A32]'}`}
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-2 mt-3">
        <button
          onClick={toggleRun}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-white ${
            isRunning 
              ? 'bg-[#C08A3E] hover:bg-[#A87632]' 
              : 'bg-[#C85A32] hover:bg-[#B34C26]'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isRunning ? '暂停' : remainingSeconds === 0 ? '重新开始' : '开始计时'}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-1.5 rounded-md border border-[#EADBCE] text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] transition-colors"
          title="重置"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => addExtraMinutes(1)}
          className="py-1 px-2 rounded-md border border-[#EADBCE] text-[11px] text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] transition-colors"
          title="增加1分钟"
        >
          +1m
        </button>
      </div>
    </div>
  );
};
