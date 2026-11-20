# 食味手记 · 私房烹饪手帐 (Culinary Journal)

温暖手帐风的离线优先私房烹饪手帐应用，支持结构化食谱记录、按份数动态换算食材与生鲜采购清单、下厨分步语音与防休眠引导、烹饪日历打卡、食味广场时令菜单、高清图文手帐海报 / PDF 导出与全量数据跨设备迁移。

## 核心架构与数据模型

- **前端框架**：React 19 + TypeScript (`strict: true`) + Tailwind CSS v4 + Vite 8 + `vite-plugin-pwa`
- **后端服务 (`server.ts`)**：Express 4 全栈入口，提供：
  - `POST /api/transcribe`：服务端代理语音转写（包含单代理 IP 限流、MIME/体积上限、25s 超时控制与轻量 `X-App-Client` 客户端标识头——注：`X-App-Client` 仅作来源标记，不构成独立鉴权安全边界；未配置密钥时前端自动降级至浏览器原生 `SpeechRecognition`）
  - `POST /api/admin/login` & `GET /api/admin/session`：官方主厨运营与内容安全监管台的服务端恒定时间口令校验与 HMAC 临时会话签发（前端零硬编码口令；官方身份仅保存在 `sessionStorage` 并在执行敏感操作前再次向服务端核验）
- **本机离线优先存储（单机数据作用域说明）**：
  - 当前版本为**离线优先的本地个人手帐架构**，「食味广场」「主题菜单」「厨友互动点赞与评论」「内容举报队列」均运行于当前设备浏览器本地存储，不依赖远端多租户社区数据库；多账号切换用于同机不同厨师视图与归属区分。
  - 主食谱库：`localStorage` 统一键 `food_journal_master_recipes_v2`（配合 `storage` 原生事件跨标签页同步），其他个人偏好与 GitHub 同步 PAT (`food_journal_github_config_v1_<uid>`)、任务签到、头像、备菜台与屏蔽名单均按账号 UID 隔离存储。
  - 大容量视频与高清媒体库：`IndexedDB` (`culinary_media_db_v1`，以 `idb://` 引用解耦，避免 5MB `localStorage` 配额溢出）。
  - 全量备份 (`src/utils/fullBackupService.ts`)：Schema `v1.2.0` 覆盖食谱、烹饪日历打卡、自定义分类、采购偏好、广场收藏、大赛作品、成长成就；默认导出轻量版以规避移动端内存峰值，可在备份页按需勾选内嵌视频包（上限 20MB 原始媒体，导入支持 40MB 体积预检与分域恢复状态汇报），并支持跨设备导入重映射 `ownerId`。
  - 本地账号口令安全：基于浏览器原生 Web Crypto `PBKDF2-HMAC-SHA256`（100,000 轮迭代 + 随机盐）。

## 环境变量配置

复制 `.env.example` 为 `.env` 并按需填写（切勿将真实密钥提交至代码库）：

```bash
GEMINI_API_KEY=""               # 可选：用于服务端高精度烹饪步骤语音转写
GEMINI_TRANSCRIBE_MODEL="gemini-3.5-transcribe"
OFFICIAL_OPERATOR_SECRET=""     # 可选：服务端官方主厨与内容巡检控制台解锁口令（留空则保持只读锁定）
APP_URL="http://localhost:3000"
```

## 本地开发、测试与构建

```bash
# 1. 安装依赖
npm install

# 2. 启动全栈开发服务 (http://localhost:3000)
npm run dev

# 3. TypeScript 严格类型检查与自动化单元测试
npm run lint
npm test

# 4. 构建生产环境前端静态产物与离线 PWA Service Worker
npm run build

# 5. 启动生产环境服务（自动托管 dist/ 静态资源与 /api/* 接口）
npm start
```
