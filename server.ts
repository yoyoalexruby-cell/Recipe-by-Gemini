import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Trust single upstream reverse proxy (Cloud Run / Nginx) so req.ip cannot be spoofed via raw X-Forwarded-For chains
app.set('trust proxy', 1);

// Cap JSON body payload to 12MB (supports ~8MB compressed audio clips while preventing memory exhaustion)
app.use(express.json({ limit: '12mb' }));

const TRANSCRIBE_MODEL = process.env.GEMINI_TRANSCRIBE_MODEL || 'gemini-3.5-transcribe';
const MAX_BASE64_AUDIO_CHARS = 11_000_000; // ~8MB decoded audio limit
const REQUEST_TIMEOUT_MS = 25_000; // 25s server timeout
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15; // Max 15 transcriptions per minute per IP

const ADMIN_LOGIN_WINDOW_MS = 5 * 60_000;
const ADMIN_LOGIN_MAX_ATTEMPTS = 5;
const OPERATOR_TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const EPHEMERAL_SIGNING_KEY = crypto.randomBytes(32).toString('hex');

const ipRequestTimestamps = new Map<string, number[]>();
const adminAttemptTimestamps = new Map<string, number[]>();

function checkWindowRateLimit(
  bucket: Map<string, number[]>,
  key: string,
  windowMs: number,
  maxRequests: number
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = (bucket.get(key) || []).filter((ts) => ts > windowStart);
  if (recent.length >= maxRequests) {
    bucket.set(key, recent);
    return false;
  }
  recent.push(now);
  bucket.set(key, recent);
  return true;
}

function getClientIp(req: express.Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function constantTimeSecretMatch(candidate: string, expected: string): boolean {
  const hashA = crypto.createHash('sha256').update(candidate, 'utf8').digest();
  const hashB = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function signOperatorToken(secret: string): string {
  const exp = Date.now() + OPERATOR_TOKEN_TTL_MS;
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = `${exp}.${nonce}`;
  const sig = crypto
    .createHmac('sha256', `${EPHEMERAL_SIGNING_KEY}:${secret}`)
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

function verifyOperatorToken(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const payload = `${expStr}.${nonce}`;
  const expectedSig = crypto
    .createHmac('sha256', `${EPHEMERAL_SIGNING_KEY}:${secret}`)
    .update(payload)
    .digest('hex');

  return constantTimeSecretMatch(sig, expectedSig);
}

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    '[server] GEMINI_API_KEY is not configured; /api/transcribe will return 503 so clients fall back to browser SpeechRecognition.'
  );
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

/**
 * Server-side Official Operator Authentication (Replaces hardcoded frontend passcodes)
 */
app.post('/api/admin/login', (req, res) => {
  const configuredSecret = (process.env.OFFICIAL_OPERATOR_SECRET || '').trim();
  if (!configuredSecret) {
    return res.status(403).json({
      success: false,
      configured: false,
      error:
        '服务端尚未配置 OFFICIAL_OPERATOR_SECRET 环境变量，官方运营控制台处于安全锁定状态（请在服务端环境变量中配置口令）。',
    });
  }

  const clientIp = getClientIp(req);
  if (!checkWindowRateLimit(adminAttemptTimestamps, clientIp, ADMIN_LOGIN_WINDOW_MS, ADMIN_LOGIN_MAX_ATTEMPTS)) {
    return res.status(429).json({
      success: false,
      configured: true,
      error: '运营口令尝试次数过多，请等待 5 分钟后再试。',
    });
  }

  const { passcode } = (req.body || {}) as { passcode?: unknown };
  if (typeof passcode !== 'string' || !passcode.trim()) {
    return res.status(400).json({
      success: false,
      configured: true,
      error: '请输入有效的官方运营口令。',
    });
  }

  if (!constantTimeSecretMatch(passcode.trim(), configuredSecret)) {
    return res.status(401).json({
      success: false,
      configured: true,
      error: '官方运营口令验证未通过。',
    });
  }

  const token = signOperatorToken(configuredSecret);
  return res.json({
    success: true,
    configured: true,
    token,
    expiresInSeconds: OPERATOR_TOKEN_TTL_MS / 1000,
  });
});

app.get('/api/admin/session', (req, res) => {
  const configuredSecret = (process.env.OFFICIAL_OPERATOR_SECRET || '').trim();
  if (!configuredSecret) {
    return res.json({ authenticated: false, configured: false });
  }
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const authenticated = verifyOperatorToken(token, configuredSecret);
  return res.json({ authenticated, configured: true });
});

// Audio transcription endpoint using gemini-3.5-transcribe with client header check, rate limit, validation & timeout
app.post('/api/transcribe', async (req, res) => {
  try {
    if (req.headers['x-app-client'] !== 'culinary-journal-web') {
      return res.status(403).json({
        error: '拒绝未授权的外部直接调用',
        success: false,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: '服务端未配置语音转写密钥，已自动切换浏览器本地语音识别',
        success: false,
      });
    }

    const clientIp = getClientIp(req);
    if (!checkWindowRateLimit(ipRequestTimestamps, clientIp, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS)) {
      return res.status(429).json({
        error: '语音转写请求过于频繁，请稍候一分钟再试',
        success: false,
      });
    }

    const { audioData, mimeType } = (req.body || {}) as { audioData?: unknown; mimeType?: unknown };
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
  } catch (error: unknown) {
    console.error('Audio transcription error:', error);
    const errMsg = error instanceof Error ? error.message : '语音转写服务出现异常，请稍后重试';
    return res.status(500).json({
      error: errMsg,
      success: false,
    });
  }
});

// Start Express server: serve built static assets in production (or when dist/ exists and NODE_ENV !== 'development'), Vite middleware in dev
async function startServer() {
  const distIndex = path.resolve('dist/index.html');
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (process.env.NODE_ENV !== 'development' && fs.existsSync(distIndex));

  if (isProduction && fs.existsSync(distIndex)) {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    // Intercept /@vite/client to prevent WebSocket connection attempts and errors in cloud sandbox
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
    console.log(
      `Culinary Journal server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`
    );
  });
}

startServer();
