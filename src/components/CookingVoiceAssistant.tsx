import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CookingStep } from '../types/recipe';
import { 
  Volume2, VolumeX, Mic, MicOff, Play, Pause, 
  RotateCcw, SkipForward, SkipBack, Sparkles, 
  Timer, Check, AlertCircle, HelpCircle, FastForward
} from 'lucide-react';
import { useI18n } from '../i18n/context';

interface CookingVoiceAssistantProps {
  recipeTitle: string;
  steps: CookingStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onToggleStepCheck: (stepId: string, forceState?: boolean) => void;
  checkedSteps: Record<string, boolean>;
  onStartTimer?: (minutes: number, label: string) => void;
  onFinishAll?: () => void;
  className?: string;
}

export const CookingVoiceAssistant: React.FC<CookingVoiceAssistantProps> = ({
  recipeTitle,
  steps,
  currentStepIndex,
  onStepChange,
  onToggleStepCheck,
  checkedSteps,
  onStartTimer,
  onFinishAll,
  className = ''
}) => {
  const { t, language, currentOption } = useI18n();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [recognizedFeedback, setRecognizedFeedback] = useState<string | null>(null);
  const [liveInterimText, setLiveInterimText] = useState<string>('');
  const [micError, setMicError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState({
    tts: typeof window !== 'undefined' && 'speechSynthesis' in window,
    stt: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  });

  // Refs for tracking mutable states in event callbacks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const currentStepIndexRef = useRef(currentStepIndex);
  currentStepIndexRef.current = currentStepIndex;

  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const autoAdvanceRef = useRef(autoAdvance);
  autoAdvanceRef.current = autoAdvance;

  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  const feedbackTimerRef = useRef<number | null>(null);

  const showFeedback = useCallback((msg: string) => {
    setRecognizedFeedback(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setRecognizedFeedback(null);
    }, 4500);
  }, []);

  // Format text for speech synthesis according to active language
  const formatStepUtterance = useCallback((step: CookingStep, index: number, total: number) => {
    const parts: string[] = [];
    if (language === 'en-US') {
      parts.push(`Step ${index + 1} of ${total}. ${step.title}.`);
      if (step.heat) parts.push(`Heat: ${step.heat}.`);
      if (step.durationMinutes) parts.push(`Suggested duration: ${step.durationMinutes} minutes.`);
      parts.push(step.description);
      if (step.tip) parts.push(`Chef Tip: ${step.tip}`);
    } else if (language === 'ja-JP') {
      parts.push(`ステップ ${index + 1}、全 ${total} ステップ。${step.title}。`);
      if (step.heat) parts.push(`火加減：${step.heat}。`);
      if (step.durationMinutes) parts.push(`目安時間：${step.durationMinutes} 分。`);
      parts.push(step.description);
      if (step.tip) parts.push(`調理のコツ：${step.tip}`);
    } else if (language === 'fr-FR') {
      parts.push(`Étape ${index + 1} sur ${total}. ${step.title}.`);
      if (step.heat) parts.push(`Feu : ${step.heat}.`);
      if (step.durationMinutes) parts.push(`Durée suggérée : ${step.durationMinutes} minutes.`);
      parts.push(step.description);
      if (step.tip) parts.push(`Astuce du chef : ${step.tip}`);
    } else if (language === 'es-ES') {
      parts.push(`Paso ${index + 1} de ${total}. ${step.title}.`);
      if (step.heat) parts.push(`Fuego: ${step.heat}.`);
      if (step.durationMinutes) parts.push(`Tiempo estimado: ${step.durationMinutes} minutos.`);
      parts.push(step.description);
      if (step.tip) parts.push(`Consejo del chef: ${step.tip}`);
    } else {
      parts.push(`第 ${index + 1} 步，共 ${total} 步。${step.title}。`);
      if (step.heat) parts.push(`火候要求：${step.heat}。`);
      if (step.durationMinutes) parts.push(`建议烹饪时长：${step.durationMinutes} 分钟。`);
      parts.push(step.description);
      if (step.tip) parts.push(`烹饪小贴士：${step.tip}`);
    }
    return parts.join(' ');
  }, [language]);

  // Speak a step by index
  const speakStep = useCallback((index: number) => {
    if (!('speechSynthesis' in window)) return;

    const targetSteps = stepsRef.current;
    if (!targetSteps || index < 0 || index >= targetSteps.length) return;

    window.speechSynthesis.cancel();

    const step = targetSteps[index];
    const textToSpeak = formatStepUtterance(step, index, targetSteps.length);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const speechLang = currentOption?.speechCode || 'zh-CN';
    utterance.lang = speechLang;
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick matching language voice if available
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = speechLang.slice(0, 2).toLowerCase();
    const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);

      // Auto advance to next step if enabled
      if (autoAdvanceRef.current && index < targetSteps.length - 1) {
        setTimeout(() => {
          const nextIdx = index + 1;
          onStepChange(nextIdx);
          speakStep(nextIdx);
        }, 1500);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis warning:', e);
      }
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [currentOption?.speechCode, formatStepUtterance, onStepChange, speechRate]);


  // Voice Command Handlers
  const handleNextStepCommand = useCallback(() => {
    const curIdx = currentStepIndexRef.current;
    const allSteps = stepsRef.current;
    
    // Mark current step as completed
    if (allSteps[curIdx]) {
      onToggleStepCheck(allSteps[curIdx].id, true);
    }

    if (curIdx < allSteps.length - 1) {
      const nextIdx = curIdx + 1;
      onStepChange(nextIdx);
      showFeedback(`已标记第 ${curIdx + 1} 步完成，跳转至第 ${nextIdx + 1} 步并朗读`);
      speakStep(nextIdx);
    } else {
      showFeedback(`🎉 太棒了！本道菜全部步骤已完成！`);
      if (onFinishAll) onFinishAll();
      const finishUtterance = new SpeechSynthesisUtterance(`太棒了！《${recipeTitle}》全部步骤已制作完成，可以出锅盛盘啦！`);
      finishUtterance.lang = 'zh-CN';
      window.speechSynthesis.speak(finishUtterance);
    }
  }, [onFinishAll, onStepChange, onToggleStepCheck, recipeTitle, showFeedback, speakStep]);

  const handlePrevStepCommand = useCallback(() => {
    const curIdx = currentStepIndexRef.current;
    if (curIdx > 0) {
      const prevIdx = curIdx - 1;
      onStepChange(prevIdx);
      showFeedback(`回到第 ${prevIdx + 1} 步`);
      speakStep(prevIdx);
    } else {
      showFeedback(`当前已是第一步`);
      speakStep(0);
    }
  }, [onStepChange, showFeedback, speakStep]);

  const handleRepeatStepCommand = useCallback(() => {
    const curIdx = currentStepIndexRef.current;
    showFeedback(`重读第 ${curIdx + 1} 步`);
    speakStep(curIdx);
  }, [showFeedback, speakStep]);

  const handlePauseCommand = useCallback(() => {
    if (window.speechSynthesis) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setIsSpeaking(false);
        showFeedback(`已暂停语音播报`);
      }
    }
  }, [showFeedback]);

  const handleResumeCommand = useCallback(() => {
    if (window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsSpeaking(true);
        showFeedback(`恢复播报`);
      } else {
        speakStep(currentStepIndexRef.current);
      }
    }
  }, [showFeedback, speakStep]);

  const handleTimerCommand = useCallback(() => {
    const curIdx = currentStepIndexRef.current;
    const curStep = stepsRef.current[curIdx];
    if (curStep && curStep.durationMinutes && onStartTimer) {
      onStartTimer(curStep.durationMinutes, `${recipeTitle} - 步骤${curIdx + 1}`);
      showFeedback(`⏱️ 已启动 ${curStep.durationMinutes} 分钟倒计时`);
      const timerUtterance = new SpeechSynthesisUtterance(`好的，已为你开启 ${curStep.durationMinutes} 分钟倒计时`);
      timerUtterance.lang = 'zh-CN';
      window.speechSynthesis.speak(timerUtterance);
    } else if (onStartTimer) {
      onStartTimer(5, `${recipeTitle} - 步骤${curIdx + 1}`);
      showFeedback(`⏱️ 该步骤未标明时间，已为你开启默认 5 分钟计时`);
    } else {
      showFeedback(`计时器功能当前未激活`);
    }
  }, [onStartTimer, recipeTitle, showFeedback]);

  // Command Parser
  const processVoiceCommand = useCallback((transcript: string) => {
    const clean = transcript.toLowerCase().replace(/[\s\p{P}]/gu, '');
    if (!clean) return;

    // 1. Next step
    if (
      clean.includes('下一步') || 
      clean.includes('下一个') || 
      clean.includes('下一步骤') || 
      clean.includes('下个') ||
      clean.includes('搞定') ||
      clean.includes('做好了') ||
      clean.includes('next') ||
      clean.includes('次へ') ||
      clean.includes('つぎ') ||
      clean.includes('suivant') ||
      clean.includes('siguiente')
    ) {
      handleNextStepCommand();
      return;
    }

    // 2. Repeat step
    if (
      clean.includes('重复') || 
      clean.includes('重读') || 
      clean.includes('再说一遍') || 
      clean.includes('再念一遍') || 
      clean.includes('没听清') || 
      clean.includes('重听') || 
      clean.includes('再说一次') ||
      clean.includes('repeat') ||
      clean.includes('again') ||
      clean.includes('もう一度') ||
      clean.includes('リピート') ||
      clean.includes('répéter') ||
      clean.includes('repetir')
    ) {
      handleRepeatStepCommand();
      return;
    }

    // 3. Previous step
    if (
      clean.includes('上一步') || 
      clean.includes('上一个') || 
      clean.includes('回退') || 
      clean.includes('上个步骤') ||
      clean.includes('previous') ||
      clean.includes('back') ||
      clean.includes('戻る') ||
      clean.includes('まえ') ||
      clean.includes('précédent') ||
      clean.includes('anterior')
    ) {
      handlePrevStepCommand();
      return;
    }

    // 4. Pause
    if (
      clean.includes('暂停') || 
      clean.includes('停一下') || 
      clean.includes('别念了') || 
      clean.includes('稍等') ||
      clean.includes('pause') ||
      clean.includes('stop') ||
      clean.includes('一時停止') ||
      clean.includes('pausa')
    ) {
      handlePauseCommand();
      return;
    }

    // 5. Resume
    if (
      clean.includes('继续') || 
      clean.includes('接着念') || 
      clean.includes('恢复') ||
      clean.includes('resume') ||
      clean.includes('continue') ||
      clean.includes('再開') ||
      clean.includes('reprendre') ||
      clean.includes('continuar')
    ) {
      handleResumeCommand();
      return;
    }

    // 6. Timer
    if (
      clean.includes('计时') || 
      clean.includes('定时') || 
      clean.includes('倒计时') ||
      clean.includes('timer') ||
      clean.includes('タイマー') ||
      clean.includes('minuteur') ||
      clean.includes('temporizador')
    ) {
      handleTimerCommand();
      return;
    }

    // 7. Finish all
    if (
      clean.includes('全部完成') || 
      clean.includes('出锅') || 
      clean.includes('盛盘') || 
      clean.includes('做完啦') ||
      clean.includes('finish') ||
      clean.includes('done') ||
      clean.includes('完了') ||
      clean.includes('terminé') ||
      clean.includes('terminar')
    ) {
      if (onFinishAll) onFinishAll();
      showFeedback(`🎉 太棒了！全部步骤制作完成！`);
      return;
    }

    // Unrecognized intent
    if (language === 'en-US') {
      showFeedback(`Unrecognized: "${transcript}". Try: "Next", "Repeat", "Back", "Pause", "Timer"`);
    } else if (language === 'ja-JP') {
      showFeedback(`未対応の指示: 「${transcript}」。「次へ」「もう一度」「戻る」「一時停止」「タイマー」を話してください`);
    } else {
      showFeedback(`未匹配指令：「${transcript}」，支持说：“下一步”、“重复上一步”、“上一步”、“暂停”、“开始计时”`);
    }
  }, [
    handleNextStepCommand, 
    handleRepeatStepCommand, 
    handlePrevStepCommand, 
    handlePauseCommand, 
    handleResumeCommand, 
    handleTimerCommand, 
    language,
    onFinishAll, 
    showFeedback
  ]);

  // Start continuous speech recognition for hands-free listening
  const startListening = useCallback(async () => {
    setMicError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('您的浏览器未开放 Web Speech 语音识别接口（推荐使用 Chrome/Edge 浏览器开启免触体验）');
      return;
    }

    try {
      // Test mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError('麦克风权限未开启，请在浏览器地址栏允许麦克风访问');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentOption?.speechCode || 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setLiveInterimText(final);
          processVoiceCommand(final);
        } else {
          setLiveInterimText(interim);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech') return;
        if (e.error === 'not-allowed') {
          setMicError('麦克风权限被拒绝');
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        // If user still wants listening, automatically restart
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            // ignore
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      isListeningRef.current = true;
      showFeedback(`🎙️ 厨房免触听写已就绪！试着说：“下一步”、“重复上一步”`);
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setMicError('无法启动语音识别引擎');
    }
  }, [processVoiceCommand, showFeedback]);

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    setLiveInterimText('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
      showFeedback(`已关闭免触控语音指令`);
    } else {
      startListening();
    }
  };

  // Stop speech
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const currentStep = steps[currentStepIndex];

  return (
    <div className={`bg-[#FFFDF9] border border-[#EADBCE] rounded-2xl p-4 sm:p-5 paper-shadow space-y-3.5 relative overflow-hidden ${className}`}>
      
      {/* Decorative Washi Tape Accent */}
      <div className="absolute top-0 left-8 -translate-y-1/2 pointer-events-none">
        <div className="washi-tape px-4 py-0.5 bg-[#C85A32] text-amber-50 text-[10px] font-mono tracking-wider uppercase shadow-2xs">
          VOICE CHEF ASSISTANT
        </div>
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FAF3EC] text-[#C85A32] flex items-center justify-center shrink-0">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-sm font-bold font-serif text-[#2C2723]">
              {t('voice.title')}
            </h4>
            {isSpeaking && (
              <span className="text-[11px] font-medium text-[#C85A32] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-ping" />
                {t('voice.speakStep')} {currentStepIndex + 1}
              </span>
            )}
            {isPaused && (
              <span className="text-[11px] font-medium text-amber-700">
                ({t('voice.pause')})
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#7A7268] leading-tight">
            {t('voice.subtitle')}
          </p>
        </div>

        {/* Speed & Auto Advance Toggles */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {/* Rate Switcher */}
          <div className="flex items-center border border-[#EADBCE] rounded-lg overflow-hidden bg-white">
            <span className="px-2 py-1 text-[11px] text-[#7A7268] bg-[#FAF7F2] border-r border-[#EADBCE]">
              {t('voice.speed')}
            </span>
            {[0.9, 1.0, 1.2].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSpeechRate(r)}
                className={`px-2 py-1 text-[11px] font-mono transition-colors ${
                  speechRate === r ? 'bg-[#C85A32] text-white font-bold' : 'text-[#5A5248] hover:bg-[#FAF7F2]'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Auto advance next step toggle */}
          <button
            type="button"
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors flex items-center gap-1 ${
              autoAdvance
                ? 'bg-[#5F7A4D] text-white border-[#5F7A4D]'
                : 'bg-white text-[#7A7268] border-[#EADBCE] hover:text-[#2C2723]'
            }`}
            title={t('voice.autoAdvance')}
          >
            <FastForward className="w-3 h-3" />
            <span>{t('voice.autoAdvance')}</span>
          </button>
        </div>
      </div>

      {/* Main Control Strip with Large Touch Targets (>= 44px) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#EADBCE] rounded-xl shadow-2xs">
        
        {/* Playback Controls Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Previous Step Button */}
          <button
            type="button"
            onClick={handlePrevStepCommand}
            disabled={currentStepIndex === 0}
            className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium text-[#5A5248] hover:text-[#2C2723] bg-[#FAF7F2] hover:bg-[#EADBCE]/50 border border-[#EADBCE] rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shadow-2xs"
            title={t('voice.prevStep')}
          >
            <SkipBack className="w-4 h-4 text-[#7A7268]" />
            <span className="hidden sm:inline">{t('voice.prevStep')}</span>
          </button>

          {/* Primary Speak / Pause / Resume Button */}
          {!isSpeaking && !isPaused && (
            <button
              type="button"
              onClick={() => speakStep(currentStepIndex)}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B34C26] rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95"
              title={t('voice.speakStep')}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t('voice.speakStep')} {currentStepIndex + 1}</span>
            </button>
          )}

          {isSpeaking && (
            <button
              type="button"
              onClick={handlePauseCommand}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95"
              title={t('voice.pause')}
            >
              <Pause className="w-4 h-4 fill-amber-900" />
              <span>{t('voice.pause')}</span>
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              onClick={handleResumeCommand}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-[#5F7A4D] hover:bg-[#4E663F] rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95"
              title={t('voice.resume')}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t('voice.resume')}</span>
            </button>
          )}

          {/* Repeat Current Step */}
          <button
            type="button"
            onClick={handleRepeatStepCommand}
            className="min-h-[44px] px-3 py-2 text-xs font-medium text-[#7A7268] hover:text-[#C85A32] bg-[#FAF7F2] hover:bg-[#FAF3EC] border border-[#EADBCE] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            title={t('voice.repeatStep')}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('voice.repeatStep')}</span>
          </button>

          {/* Next Step & Mark Done Button */}
          <button
            type="button"
            onClick={handleNextStepCommand}
            disabled={currentStepIndex >= steps.length - 1 && checkedSteps[currentStep?.id]}
            className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-[#5F7A4D] hover:text-white bg-[#FAF7F2] hover:bg-[#5F7A4D] border border-[#5F7A4D]/40 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            title={t('voice.nextStep')}
          >
            <span>{t('voice.nextStep')}</span>
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Stop Button */}
          {(isSpeaking || isPaused) && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="min-h-[44px] px-3 py-2 text-xs text-[#7A7268] hover:text-rose-600 bg-white border border-[#EADBCE] rounded-xl transition-colors flex items-center gap-1"
              title={t('voice.stop')}
            >
              <VolumeX className="w-4 h-4" />
              <span className="hidden sm:inline">{t('voice.stop')}</span>
            </button>
          )}
        </div>

        {/* Hands-Free Voice Commands Listening Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm ${
              isListening
                ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                : 'bg-[#FAF3EC] text-[#C85A32] border border-[#C85A32]/40 hover:bg-[#C85A32] hover:text-white'
            }`}
            title={isListening ? t('voice.listening') : t('voice.handsFree')}
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 text-white animate-bounce" />
                <span>{t('voice.listening')}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>{t('voice.handsFree')}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Live Voice Status & Command Recognition Feedback Banner */}
      <div className="p-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-2 text-[#5A5248]">
            <span className="font-semibold text-[#2C2723]">当前正在播放：</span>
            <span className="font-serif font-bold text-[#C85A32]">
              步骤 {currentStepIndex + 1}/{steps.length} · {currentStep?.title || '未选择步骤'}
            </span>
          </div>

          {/* Listening Indicator */}
          {isListening && (
            <div className="flex items-center gap-1.5 text-rose-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>麦克风正实时聆听中...</span>
              {liveInterimText && (
                <span className="text-[#2C2723] font-serif bg-white px-2 py-0.5 rounded border border-[#EADBCE]">
                  “{liveInterimText}”
                </span>
              )}
            </div>
          )}
        </div>

        {/* Recognized Command Alert Toast */}
        {recognizedFeedback && (
          <div className="p-2 bg-white border border-[#C85A32]/40 rounded-lg text-xs font-medium text-[#C85A32] flex items-center gap-2 animate-fade-in shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
            <span>{recognizedFeedback}</span>
          </div>
        )}

        {/* Mic Error Alert */}
        {micError && (
          <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        {/* Interactive Voice Command Quick Guide / Clickable Shortcuts */}
        <div className="pt-1 flex items-center gap-1.5 flex-wrap text-[11px] text-[#7A7268]">
          <span className="font-semibold text-[#2C2723]">支持语音指令：</span>
          
          <button
            type="button"
            onClick={handleNextStepCommand}
            className="px-2 py-0.5 bg-white hover:bg-[#FAF3EC] text-[#2C2723] hover:text-[#C85A32] border border-[#EADBCE] rounded transition-colors"
            title="点击或说出「下一步」"
          >
            “下一步”
          </button>
          
          <button
            type="button"
            onClick={handleRepeatStepCommand}
            className="px-2 py-0.5 bg-white hover:bg-[#FAF3EC] text-[#2C2723] hover:text-[#C85A32] border border-[#EADBCE] rounded transition-colors"
            title="点击或说出「重复上一步」或「重读」"
          >
            “重复上一步”
          </button>

          <button
            type="button"
            onClick={handlePrevStepCommand}
            className="px-2 py-0.5 bg-white hover:bg-[#FAF3EC] text-[#2C2723] hover:text-[#C85A32] border border-[#EADBCE] rounded transition-colors"
            title="点击或说出「上一步」"
          >
            “上一步”
          </button>

          <button
            type="button"
            onClick={handlePauseCommand}
            className="px-2 py-0.5 bg-white hover:bg-[#FAF3EC] text-[#2C2723] hover:text-[#C85A32] border border-[#EADBCE] rounded transition-colors"
            title="点击或说出「暂停」"
          >
            “暂停”
          </button>

          {currentStep?.durationMinutes && (
            <button
              type="button"
              onClick={handleTimerCommand}
              className="px-2 py-0.5 bg-white hover:bg-[#FAF3EC] text-[#C85A32] border border-[#C85A32]/30 rounded transition-colors font-medium flex items-center gap-1"
              title="点击或说出「开始计时」"
            >
              <Timer className="w-3 h-3" />
              <span>“开始计时” ({currentStep.durationMinutes}分钟)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onFinishAll) onFinishAll();
              showFeedback(`已标记全部完成！`);
            }}
            className="px-2 py-0.5 bg-white hover:bg-[#FAF3EC] text-[#5F7A4D] border border-[#5F7A4D]/30 rounded transition-colors font-medium"
            title="点击或说出「全部完成」"
          >
            “全部完成”
          </button>
        </div>

      </div>

    </div>
  );
};
