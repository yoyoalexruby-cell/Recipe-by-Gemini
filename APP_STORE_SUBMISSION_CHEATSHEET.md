# 食味手记 (Culinary Journal) · App Store Connect 提审复制粘贴小抄单

> **使用说明**：当您的 Apple Developer 个人开发者账号审核通过后，打开 [App Store Connect](https://appstoreconnect.apple.com/) 新建 App，按本文件从上往下直接复制粘贴即可（所有字数均已严格卡准苹果后台上限）。

---

## 一、新建 App 基础身份参数

| 苹果后台字段 | 直接填写 / 选择内容 | 备注 |
| :--- | :--- | :--- |
| **平台 (Platforms)** | 勾选 `iOS` | |
| **名称 (Name)** | `食味手记 - 私房烹饪手帐` | 英文主语言可填 `Culinary Journal: Recipe Book`（均 ≤ 30 字符上限） |
| **主要语言 (Primary Language)** | `简体中文 (Simplified Chinese)` | 建议同时在右上角添加 `English (U.S.)` 本地化语言，覆盖全球海外市场 |
| **套装 ID (Bundle ID)** | `com.culinary.journal` | 需先在 Developer 后台 Identifiers 注册此 ID |
| **SKU** | `culinary-journal-ios-2026` | 仅自己可见的内部编号，直接复制即可 |
| **用户访问权限** | `完全访问权限 (Full Access)` | |
| **主要类别 (Primary Category)** | `美食佳饮 (Food & Drink)` | |
| **次要类别 (Secondary Category)** | `生活 (Lifestyle)` | |
| **版权 (Copyright)** | `2026 Yimu Na` | 年份 + 您的开发者姓名拼音 |
| **版本号 (Version)** | `1.0.0` | 首次上架标准版本号 |

---

## 二、必填合规公开网址（无需自建官网，直接复制）

> **重要提醒**：提审前请确保您已在 AI Studio 右上角重新点击部署更新，确保以下链接为最新版本。

- **隐私政策网址 (Privacy Policy URL)** *(必填)*：
  ```text
  https://ais-pre-5iynx7acz5wmc4zbh2uoyc-66813115109.asia-northeast1.run.app/?page=privacy
  ```
- **技术支持网址 (Support URL)** *(必填)*：
  ```text
  https://ais-pre-5iynx7acz5wmc4zbh2uoyc-66813115109.asia-northeast1.run.app/?page=support
  ```
- **营销网址 (Marketing URL)** *(选填，可留空或填主站)*：
  ```text
  https://ais-pre-5iynx7acz5wmc4zbh2uoyc-66813115109.asia-northeast1.run.app
  ```

---

## 三、价格与销售范围（中国大陆开发者出海避坑）

1. **价格时间表 (Pricing)**：选择 **`$0.00 (免费 / Free)`**
2. **App 销售范围 (App Availability)**：
   - 默认全选全球 175 个国家和地区；
   - **关键一步**：如果您目前**尚未办理中国工信部 ICP App 备案**，请点击编辑地区，**取消勾选「中国大陆 (China mainland)」**，保留其余 **174 个国家和地区**（包括中国香港、中国澳门、中国台湾、美国、加拿大、英国、新加坡、马来西亚、澳大利亚、日本等）。这样**无需任何备案号，审核通过当天即可在全球海外市场正式上架**。

---

## 四、商店展示文案（双语版 · 严格符合苹果字数限制）

### A. 简体中文（覆盖港澳台、新马及全球中文系统用户）

- **名称（≤ 30 字符）**：
  ```text
  食味手记 - 私房烹饪手帐
  ```
- **副标题 Subtitle（≤ 30 字符）**：
  ```text
  四季节气菜单·火候计时·下厨复盘笔记
  ```
- **关键词 Keywords（≤ 100 字符，英文逗号分隔且不加空格）**：
  ```text
  菜谱,食谱,做饭,手帐,烘焙,减脂餐,轻食,家常菜,煲汤,厨房计时器,菜单,备菜,美食日记,一人食,便当
  ```
- **宣传文本 Promotional Text（≤ 170 字符）**：
  ```text
  把每一顿热气腾腾的饭菜写进温暖手帐！内置官方主厨四季节气精选菜单、动态人数食材换算、沉浸式备菜打勾工作台与精准火候倒计时，让新手下厨零翻车。
  ```
- **描述 Description**：
  ```text
  「食味手记」是一款专为热爱下厨与认真生活的人打造的私房烹饪手帐与备菜工作台。无论是传家红烧肉的火候秘诀、周末流心巴斯克的精确克数，还是工作日 15 分钟快手一人食，都能在这里化作一张张温暖隽永的手帐页。

  【核心亮点功能】
  1. 结构化私房食谱手帐
  清晰记录主料、辅料、调味精确用量与厨具清单；支持按用餐人数（1～12人份）一键动态换算全部食材克数与预估卡路里。

  2. 下厨备菜工作台与精准火候计时
  进入厨房备菜模式，大字号防误触勾选配料进度；关键炖煮烘烤步骤自带一键倒计时提醒，手忙脚乱也不怕糊锅。

  3. 食味广场与二十四节气官方精选菜单
  内置家常中餐、日韩和风、西式轻餐、暖胃汤羹、健康轻食、烘焙甜点 6 大全品类严选食谱；每周随二十四节气自动轮换应季主题菜单，支持单篇或整套菜单一键克隆收入私人手帐自由改版。

  4. 每次下厨心得复盘与手帐日历墙
  记录色香味评分、防翻车避坑总结与家人食客反馈，点亮年度美食勋章与下厨日历足迹，还能一键导出精美手帐分享海报。

  5. 隐私优先与离线无忧
  免注册即可本机离线体验完整手帐与计时功能，厨房弱网环境依然流畅秒开；支持全量 JSON 数据自由导出备份。
  ```

---

### B. English (U.S.)（覆盖欧美澳加日韩等英语及国际用户）

- **Name（≤ 30 chars）**：
  ```text
  Culinary Journal: Recipe Book
  ```
- **Subtitle（≤ 30 chars）**：
  ```text
  Seasonal Menus & Kitchen Timer
  ```
- **Keywords（≤ 100 chars, no spaces after commas）**：
  ```text
  recipe,cookbook,cooking,mealprep,timer,baking,foodjournal,kitchen,healthy,asianfood,menu,grocery,diet
  ```
- **Promotional Text（≤ 170 chars）**：
  ```text
  Capture your favorite home recipes in a cozy culinary scrapbook! Scale ingredients dynamically, follow step-by-step timers, and explore weekly seasonal curated menus.
  ```
- **Description**：
  ```text
  Culinary Journal is a warm, tactile recipe organizer and hands-free cooking workbench crafted for home cooks and baking lovers. Turn your family recipes, baking formulas, and everyday meals into timeless scrapbook pages.

  KEY FEATURES:
  • Smart Recipe Scrapbook & Portion Scaler
  Organize ingredients, utensils, heat levels, and step-by-step instructions. Instantly scale ingredient amounts and estimated calories for 1 to 12 servings.

  • Hands-Free Prep Workbench & Step Timers
  Check off prepped ingredients on a clean kitchen screen and launch built-in step timers for precise steaming, simmering, and baking.

  • Culinary Square & Weekly Seasonal Menus
  Explore foolproof dishes across 6 major categories—Home Chinese, Japanese & Korean, Western Bistro, Warm Broths, Clean Bowls, and Home Bakery. Discover curated seasonal menus updated weekly and clone entire menus into your personal journal with one tap.

  • Tasting Notes & Cooking Calendar
  Log flavor ratings, lessons learned, and diner feedback after every cook. Track your culinary streak on the calendar and export printable recipe cards.

  • Offline-Ready & Privacy First
  Works seamlessly offline in the kitchen with instant guest access and full JSON data export.
  ```

---

## 五、App 审核信息（App Review Information · 重中之重！）

在提审页底部的 **App Review 信息** 区域，请按以下内容填写，可大幅加快美国审核团队通过速度并避免误拒：

1. **需要登录 (Sign-in required)**：**勾选 `需要登录`**（虽然支持免登录，但提供现成测试号能让审核员顺畅测完食味广场发帖、收藏与账号删除闭环）：
   - **用户名 (User name)**：`demo_cook@culinaryjournal.app`
   - **密码 (Password)**：`Cook2026!`
2. **联系信息 (Contact Information)**：
   - First Name: `Yimu`
   - Last Name: `Na`
   - Phone Number: `+86 15901039532`（注意前面带 `+86 `）
   - Email: `yoyoalexruby@gmail.com`
3. **备注 (Notes — 请直接复制下面这段英文给苹果审核员看)**：
   ```text
   Dear App Review Team,

   Thank you for reviewing Culinary Journal! Here are quick testing notes for your convenience:

   1. Core Features & Guest Access:
   - All core recipe journaling, ingredient scaling, step-by-step cooking timers, and browsing public recipes/menus in "Culinary Square" work immediately without login, or you may sign in using the provided demo account (demo_cook@culinaryjournal.app / Cook2026!).

   2. Account Deletion (Guideline 5.1.1(v) Compliance):
   - When signed in, tap the user avatar in the top-right header -> select the "Edit Profile / 修改个人资料" tab -> scroll to the red "Delete Account / 永久注销并删除账号" section -> check the confirmation box and tap confirm for immediate, permanent deletion of the account and all associated data (no email/phone customer service required).

   3. UGC Safety & Moderation (Guideline 1.2 Compliance):
   - Pre-publish Filter: Public recipes and comments pass through an automated prohibited-term & food-safety hazard filter before appearing in Culinary Square.
   - Report & Instant Block: Every public recipe card in Culinary Square features a Flag icon in its top-right corner allowing users to report objectionable content and immediately block the author (instantly hiding all content from that author).
   - 24h Moderation: Reported items are reviewed and removed within 24 hours.
   ```

---

## 六、「App 隐私 (App Privacy)」与「年龄分级」问卷标准勾选答案

### 1. App 隐私营养标签（App Privacy）
- **您或您的第三方合作伙伴是否从此 App 中收集数据？**
  - 如果您当前上架的是**纯本机离线存储版（未接云端收集用户数据到外部服务器）**：可选择 **「否，我们不会从此 App 中收集数据 (No, we do not collect data from this app)」**。
  - *（稳妥备选）* 若苹果审核员因看到邮箱注册框提示补充声明，只需勾选收集以下两项，且全部选 **「仅用于 App 功能 (App Functionality)」**、**「不用于追踪用户 (No, we do not use data for tracking)」**：
    - `联系信息 -> 电子邮件地址`（用于账号登录展示）
    - `用户内容 -> 其他用户内容 / 照片或视频`（用于用户自己保存菜谱手帐）

### 2. 年龄分级（Age Rating）
- 卡通/幻想暴力、现实暴力、色情、粗俗幽默、恐怖、烟酒毒品、模拟赌博等全部勾选 **`无 (None)`**。
- 无限制 Web 访问（Unrestricted Web Access）：选 **`否 (No)`**。
- 最终自动计算出的分级为 **`4+`**（若勾选包含受监管的社区用户生成内容 UGC 选项，可能显示 `9+` 或 `12+`，均完全正常，不影响全球上架）。

---

## 七、图标与截图下载清单（已在应用底部为您备好）

在浏览器打开您的应用，滚动到页面最底部点击 **「App Store 上架素材包」**：
1. **App Icon**：选定 1 张下载，已是 **无透明通道纯 RGB `1024 × 1024 px` PNG**（请勿用圆角裁剪软件二次处理，直接拖入 App Store Connect 和 Xcode 的 `AppIcon` 槽位即可）。
2. **iPhone 截图**：下载全部 3 张 **`6.7" (1290 × 2796 px)` PNG**，上传至 App Store Connect 的 **6.7 英寸 iPhone 显示屏** 槽位（勾选“将 6.7 英寸截图同时用于 6.5 英寸机型”，无需重复做多套尺寸）。

---

## 八、Mac 电脑 Xcode 打包上传 5 步命令速查

收到苹果开发者账号开通邮件后，在您的 Mac 电脑上打开「终端 (Terminal)」：

```bash
# 1. 进入您下载解压后的项目根目录，安装依赖
npm install

# 2. 安装 Capacitor iOS 原生桥接包（首次执行一次即可）
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 3. 编译生成前端生产静态包 (dist 目录)
npm run build

# 4. 初始化并同步生成原生 iOS Xcode 工程
npx cap add ios
npx cap sync ios

# 5. 在 Xcode 中打开工程准备签名上传
npx cap open ios
```

### 在 Xcode 中必检查的 3 个小细节：
1. 点击左侧蓝色的 **`App`** 根节点 -> **`Signing & Capabilities`**：勾选 `Automatically manage signing`，在 **`Team`** 下拉框选择您刚开通的个人开发者账号（`Yimu Na`），确认 `Bundle Identifier` 为 `com.culinary.journal`。
2. 点击顶部 **`Info`** 标签页，确保添加以下两条相册权限说明（防止用户上传菜谱成品图时被苹果机审拦截）：
   - `Privacy - Photo Library Usage Description`：`用于从相册选择您拍摄的美食照片作为食谱手帐封面与步骤配图 / Select dish photos from your library to illustrate your recipes.`
   - `Privacy - Camera Usage Description`：`用于拍摄下厨步骤与成品美食照片记录到食谱手帐中 / Take photos of your cooking steps and finished dishes for your recipe journal.`
3. 顶部设备栏选择 **`Any iOS Device (arm64)`** -> 菜单栏点击 **`Product` -> `Archive`** -> 打包完成后点击右侧蓝色 **`Distribute App` -> `App Store Connect` -> `Upload`** 即可！

---

## 九、您自己的主理人运营口令备忘（请妥善保存）

- **食味广场「官方运营与内容监管台」入口**：打开 `食味广场` -> 右上角点击 `官方运营与内容监管台`
- **官方主厨快捷切换口令**：`Official2026!`（或快捷码 `8888`）
- **官方主厨独立登录账号**：`official@culinaryjournal.app` / 密码：`Official2026!`
- **四季菜单自动轮换状态**：已默认开启 **全年二十四节气与周度自动轮换（每周一 00:00 自动换新首屏主打菜单）**。
