import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, X, Bell } from 'lucide-react';

interface KitchenTimerProps {
  initialMinutes?: number;
  label?: string;
  onClose?: () => void;
  autoStart?: boolean;
}

export const KitchenTimer: React.FC<KitchenTimerProps> = ({
  initialMinutes = 5,
  label = '烹饪计时器',
  onClose,
  autoStart = true
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasFinished, setHasFinished] = useState(false);

  // Wall-clock deadline timestamp so background tab throttling never slows down countdown
  const endAtRef = useRef<number | null>(
    autoStart ? Date.now() + initialMinutes * 60 * 1000 : null
  );
  const remainingRef = useRef<number>(initialMinutes * 60);

  // Audio tone generator using Web Audio API
  const playAlertSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  }, []);

  // Update if initialMinutes changes
  useEffect(() => {
    const secs = initialMinutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    remainingRef.current = secs;
    endAtRef.current = autoStart ? Date.now() + secs * 1000 : null;
    setIsRunning(autoStart);
    setHasFinished(false);
  }, [initialMinutes, autoStart]);

  useEffect(() => {
    if (!isRunning) {
      endAtRef.current = null;
      return;
    }

    if (endAtRef.current === null) {
      endAtRef.current = Date.now() + remainingRef.current * 1000;
    }

    const syncFromClock = () => {
      if (endAtRef.current === null) return;
      const msLeft = endAtRef.current - Date.now();
      if (msLeft <= 0) {
        endAtRef.current = null;
        remainingRef.current = 0;
        setRemainingSeconds(0);
        setIsRunning(false);
        setHasFinished(true);
        playAlertSound();
      } else {
        const secsLeft = Math.ceil(msLeft / 1000);
        remainingRef.current = secsLeft;
        setRemainingSeconds(secsLeft);
      }
    };

    const intervalId = window.setInterval(syncFromClock, 250);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromClock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isRunning, playAlertSound]);

  const toggleRun = () => {
    if (isRunning) {
      if (endAtRef.current !== null) {
        const secsLeft = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
        remainingRef.current = secsLeft;
        setRemainingSeconds(secsLeft);
      }
      endAtRef.current = null;
      setIsRunning(false);
    } else {
      const nextBase = remainingSeconds === 0 ? totalSeconds : remainingSeconds;
      remainingRef.current = nextBase;
      setRemainingSeconds(nextBase);
      setHasFinished(false);
      endAtRef.current = Date.now() + nextBase * 1000;
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    endAtRef.current = null;
    setIsRunning(false);
    remainingRef.current = totalSeconds;
    setRemainingSeconds(totalSeconds);
    setHasFinished(false);
  };

  const addExtraMinutes = (mins: number) => {
    const deltaSecs = mins * 60;
    if (endAtRef.current !== null) {
      endAtRef.current += deltaSecs * 1000;
    }
    remainingRef.current += deltaSecs;
    setRemainingSeconds((prev) => prev + deltaSecs);
    setTotalSeconds((prev) => prev + deltaSecs);
    setHasFinished(false);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div
      role="region"
      aria-label={label}
      className="fixed bottom-6 right-6 z-40 bg-white/95 backdrop-blur-md rounded-xl border border-[#EADBCE] shadow-2xl p-4 w-76 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0E6DC] mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#7A7268]">
          <Bell className="w-3.5 h-3.5 text-[#C85A32]" />
          <span className="truncate max-w-[170px]">{label}</span>
        </div>
        {onClose && (
          <button
            type="button"
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
        <div
          className={`text-4xl font-mono tabular-nums font-bold tracking-tight transition-colors ${
            hasFinished ? 'text-rose-600 animate-bounce' : 'text-[#2C2723]'
          }`}
        >
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
          className={`h-full transition-all duration-500 ${
            hasFinished ? 'bg-rose-500' : 'bg-[#C85A32]'
          }`}
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-2 mt-3">
        <button
          type="button"
          onClick={toggleRun}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-white ${
            isRunning ? 'bg-[#C08A3E] hover:bg-[#A87632]' : 'bg-[#C85A32] hover:bg-[#B34C26]'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isRunning ? '暂停' : remainingSeconds === 0 ? '重新开始' : '开始计时'}</span>
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="p-1.5 rounded-md border border-[#EADBCE] text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] transition-colors"
          title="重置"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
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
