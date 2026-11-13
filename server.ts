import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Cap JSON body payload to 12MB (supports ~8MB compressed audio clips while preventing memory exhaustion)
app.use(express.json({ limit: '12mb' }));

const TRANSCRIBE_MODEL = process.env.GEMINI_TRANSCRIBE_MODEL || 'gemini-3.5-transcribe';
const MAX_BASE64_AUDIO_CHARS = 11_000_000; // ~8MB decoded audio limit
const REQUEST_TIMEOUT_MS = 25_000; // 25s server timeout
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15; // Max 15 transcriptions per minute per IP

const ipRequestTimestamps = new Map<string, number[]>();

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (ipRequestTimestamps.get(ip) || []).filter((ts) => ts > windowStart);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequestTimestamps.set(ip, recent);
    return false;
  }
  recent.push(now);
  ipRequestTimestamps.set(ip, recent);
  return true;
}

if (!process.env.GEMINI_API_KEY) {
  console.warn('[server] GEMINI_API_KEY is not configured; /api/transcribe will return 503 so clients fall back to browser SpeechRecognition.');
}

// Initialize GoogleGenAI client on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'missing-key',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Audio transcription endpoint using gemini-3.5-transcribe with rate limit, validation & timeout
app.post('/api/transcribe', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: '服务端未配置语音转写密钥，已自动切换浏览器本地语音识别',
        success: false,
      });
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    if (!checkIpRateLimit(clientIp)) {
      return res.status(429).json({
        error: '语音转写请求过于频繁，请稍候一分钟再试',
        success: false,
      });
    }

    const { audioData, mimeType } = req.body || {};
    if (!audioData || typeof audioData !== 'string') {
      return res.status(400).json({ error: '缺少有效的录音数据 (audioData)', success: false });
    }

    const resolvedMime = typeof mimeType === 'string' && mimeType.trim() ? mimeType.trim() : 'audio/webm';
    if (!resolvedMime.startsWith('audio/')) {
      return res.status(400).json({ error: '不支持的音频 MIME 格式，仅允许 audio/* 类型', success: false });
    }

    const base64Audio = audioData.replace(/^data:[^;]+;base64,/, '');
    if (!base64Audio || base64Audio.length > MAX_BASE64_AUDIO_CHARS) {
      return res.status(413).json({
        error: '单段录音文件过大（上限约 8MB），请缩短单次录音时长',
        success: false,
      });
    }

    const audioPart = {
      inlineData: {
        mimeType: resolvedMime,
        data: base64Audio,
      },
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('语音转写请求超时，请稍后重试')), REQUEST_TIMEOUT_MS);
    });

    const response = await Promise.race([
      ai.models.generateContent({
        model: TRANSCRIBE_MODEL,
        contents: {
          parts: [
            audioPart,
            {
              text: '请将这段烹饪步骤语音录音精准转写为通顺的简体中文文本。只输出转写后的文本内容，不要输出任何多余的开场白、标号、提示语或解释。请准确保留火候（大火/中火/小火）、调料名称、食材用量与操作动作。',
            },
          ],
        },
      }),
      timeoutPromise,
    ]);

    const text = response.text?.trim() || '';
    return res.json({ text, success: true });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    return res.status(500).json({
      error: error?.message || '语音转写服务出现异常，请稍后重试',
      success: false,
    });
  }
});

// Start Express server with Vite middleware in dev or static in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    // Intercept /@vite/client to completely prevent WebSocket connection attempts and errors in cloud sandbox
    app.get('/@vite/client', async (_req, res, next) => {
      try {
        const result = await vite.transformRequest('/@vite/client');
        if (result && result.code) {
          const patched = result.code
            .replace(
              'reject(/* @__PURE__ */ new Error("WebSocket closed without opened."));',
              'resolve(); /* suppressed in cloud sandbox */'
            )
            .replace(
              'reject(new Error("WebSocket closed without opened."));',
              'resolve(); /* suppressed in cloud sandbox */'
            )
            .replace(
              /console\.error\(`\[vite\] failed to connect to websocket/g,
              'console.debug(`[vite] hmr disabled in cloud sandbox'
            );
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-cache');
          return res.send(patched);
        }
        next();
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food Journal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
