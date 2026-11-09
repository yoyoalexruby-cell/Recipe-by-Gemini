import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Sparkles, AlertCircle, Volume2 } from 'lucide-react';

interface VoiceTranscriptionButtonProps {
  onTranscript: (text: string, mode: 'append' | 'replace') => void;
  currentValue?: string;
  className?: string;
}

export const VoiceTranscriptionButton: React.FC<VoiceTranscriptionButtonProps> = ({
  onTranscript,
  currentValue = '',
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechCapturedRef = useRef<string>('');

  // Clean up timer and media streams on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setInterimText('');
    setRecordingDuration(0);
    speechCapturedRef.current = '';
    audioChunksRef.current = [];

    // 1. Request microphone permission
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err: any) {
      console.warn('Microphone access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('麦克风权限被拒绝，请在浏览器地址栏允许麦克风访问');
      } else {
        setErrorMessage('无法访问麦克风设备，请检查音频输入设置');
      }
      return;
    }

    setIsRecording(true);

    // 2. Start duration counter
    timerIntervalRef.current = window.setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    // 3. Initialize Browser Web Speech API for real-time live preview
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let webSpeechActive = false;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            speechCapturedRef.current = (speechCapturedRef.current + ' ' + finalTranscript).trim();
          }

          setInterimText(currentInterim || speechCapturedRef.current);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition warning:', e?.error);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        webSpeechActive = true;
      } catch (err) {
        console.warn('Web Speech API initialization fallback to Gemini audio API:', err);
      }
    }

    // 4. Also record audio via MediaRecorder for backend Gemini transcription
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(500); // 500ms chunks
    } catch (err) {
      console.warn('MediaRecorder error:', err);
      if (!webSpeechActive) {
        setErrorMessage('当前环境暂不支持音频录制，请换用 Chrome/Edge 浏览器');
        stopRecording();
      }
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setIsRecording(false);

    // Stop Web Speech Recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Stop MediaStream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // If live speech recognition captured content, use it immediately
    const liveText = (speechCapturedRef.current || interimText).trim();

    // If we have recorded audio chunks, let's also pass to backend Gemini transcription
    // for superior culinary accuracy if liveText is short or as primary engine
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsTranscribing(true);

      const recorder = mediaRecorderRef.current;
      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm'
          });

          // If blob is non-empty, convert to base64 and call /api/transcribe
          if (audioBlob.size > 1000) {
            const base64Audio = await blobToBase64(audioBlob);

            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioData: base64Audio,
                mimeType: recorder.mimeType || 'audio/webm'
              })
            });

            if (res.ok) {
              const data = await res.json();
              const transcribedText = data.text?.trim();

              if (transcribedText) {
                applyTranscribedText(transcribedText);
                setIsTranscribing(false);
                setInterimText('');
                return;
              }
            }
          }
        } catch (apiErr) {
          console.warn('Gemini transcription backend failed, falling back to live speech text:', apiErr);
        }

        // Fallback to live recognized text if backend failed or returned empty
        if (liveText) {
          applyTranscribedText(liveText);
        } else {
          setErrorMessage('未能识别到清晰语音，请重新录制');
          setTimeout(() => setErrorMessage(null), 3500);
        }

        setIsTranscribing(false);
        setInterimText('');
      };

      recorder.stop();
    } else if (liveText) {
      applyTranscribedText(liveText);
      setInterimText('');
    } else {
      setErrorMessage('未检测到有效语音');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const applyTranscribedText = (newText: string) => {
    if (!newText.trim()) return;
    // If current value already has content, intelligently append with space/comma
    if (currentValue && currentValue.trim()) {
      const endsWithPunctuation = /[，。！？；、,.!?]$/.test(currentValue.trim());
      const separator = endsWithPunctuation ? ' ' : '，';
      onTranscript(`${currentValue.trim()}${separator}${newText.trim()}`, 'replace');
    } else {
      onTranscript(newText.trim(), 'replace');
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read audio blob as base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* 1. Normal State Voice Button */}
      {!isRecording && !isTranscribing && (
        <button
          type="button"
          onClick={startRecording}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#C85A32] bg-[#FAF3EC] hover:bg-[#C85A32] hover:text-white border border-[#C85A32]/30 hover:border-[#C85A32] rounded-md transition-all shadow-2xs group"
          title="点击麦克风，说出烹饪步骤，实时转写为文字"
        >
          <Mic className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>语音录入描述</span>
        </button>
      )}

      {/* 2. Recording Active Floating Pill */}
      {isRecording && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-300 rounded-full shadow-md animate-fade-in text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
          
          {/* Animated sound wave bars */}
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="w-0.5 h-3.5 bg-rose-600 rounded-full animate-pulse delay-75" />
            <span className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-pulse delay-150" />
            <span className="w-0.5 h-3 bg-rose-600 rounded-full animate-pulse delay-100" />
          </div>

          <span className="font-mono font-bold text-rose-700">
            {formatDuration(recordingDuration)}
          </span>

          <span className="text-[11px] text-rose-600 truncate max-w-[120px]">
            {interimText ? `“${interimText}”` : '请描述操作步骤...'}
          </span>

          <button
            type="button"
            onClick={stopRecording}
            className="px-2 py-0.5 bg-rose-600 text-white font-medium text-[11px] rounded-full hover:bg-rose-700 transition-colors ml-1 shadow-2xs"
          >
            完成转写
          </button>
        </div>
      )}

      {/* 3. Transcribing Spinner State */}
      {isTranscribing && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-amber-50 border border-amber-300 text-[#C85A32] rounded-full animate-fade-in">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>AI 实时转写中...</span>
        </div>
      )}

      {/* 4. Error Message Alert */}
      {errorMessage && (
        <div className="absolute left-0 top-full mt-1 z-30 inline-flex items-center gap-1 text-[11px] text-rose-600 bg-white border border-rose-200 px-2 py-1 rounded shadow-md whitespace-nowrap animate-fade-in">
          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-stone-400 hover:text-stone-700 ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
