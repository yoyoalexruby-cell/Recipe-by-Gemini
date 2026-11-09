import { Recipe } from '../types/recipe';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'recipe-braised-pork',
    title: '私房陈年花雕秘制红烧肉',
    subtitle: '肥而不腻、软糯醇厚，浓油赤酱里藏着治愈的时光慢炖。',
    coverImage: '',
    category: '家常中餐',
    subCategory: '慢炖红烧',
    cuisine: '本帮/江浙',
    prepTimeMinutes: 20,
    cookTimeMinutes: 60,
    baseServings: 3,
    estimatedCalories: 2650,
    difficulty: 3,
    utensils: ['厚底铸铁炖锅', '厨房不粘煎锅', '食品料理夹'],
    weatherStamp: '🌧️ 雨天暖锅',
    isFavorite: true,
    createdAt: '2026-10-20',
    updatedAt: '2026-10-24',
    ingredients: [
      { id: 'i1', name: '高品质五花三层带皮五花肉', amount: 600, unit: '克', category: 'main', note: '切成3cm见方均匀小方块' },
      { id: 'i2', name: '黄冰糖（散碎状）', amount: 35, unit: '克', category: 'seasoning', note: '炒糖色专用，色泽红亮温润' },
      { id: 'i3', name: '陈年花雕酒 / 绍兴黄酒', amount: 150, unit: '毫升', category: 'seasoning', note: '醇香去腥，不加一滴生水' },
      { id: 'i4', name: '特级酿造生抽', amount: 35, unit: '毫升', category: 'seasoning', note: '提鲜咸口' },
      { id: 'i5', name: '老抽', amount: 12, unit: '毫升', category: 'seasoning', note: '深邃着色' },
      { id: 'i6', name: '老姜片', amount: 5, unit: '厚片', category: 'seasoning', note: '拍松散发姜油' },
      { id: 'i7', name: '京葱葱白段', amount: 3, unit: '段', category: 'seasoning', note: '约手指长' },
      { id: 'i8', name: '八角（大茴香）', amount: 2, unit: '枚', category: 'seasoning', note: '不可贪多，以免药味重' },
      { id: 'i9', name: '桂皮', amount: 1, unit: '小片', category: 'seasoning' },
      { id: 'i10', name: '香葱碎与熟白芝麻', amount: 1, unit: '小碟', category: 'garnish', note: '出锅点缀提香' },
    ],
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: '冷水焯水去血沫',
        description: '五花肉冷水下锅，加入2片生姜与20ml料酒。大火煮沸后撇去浮沫，再煮3分钟至肉块紧实，捞出用温热水冲洗干净表面沥干。',
        durationMinutes: 8,
        heat: '大火',
        tip: '千万不要用冷水冲洗刚出锅的热肉，肉质遇冷骤缩会发柴，一定要用温热水冲洗！'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: '小火煸煎油脂',
        description: '不粘锅无需倒油，直接下入沥干的五花肉块，中小火慢煎。逼出多余油脂，直至四面微微焦黄金脆，夹出控油。',
        durationMinutes: 6,
        heat: '中火',
        tip: '逼出猪油可以让红烧肉吃起来香而不腻，煎出来的原油可以留着炒青菜极其喷香。'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: '慢炒晶莹琥珀糖色',
        description: '锅底留少许底油，下入碎黄冰糖，最小火慢搅。当冰糖完全融化，由浅黄转为浓郁的琥珀色，并冒出细腻小泡沫瞬间，立刻倒入肉块翻炒挂霜上色。',
        durationMinutes: 4,
        heat: '微火',
        tip: '炒糖色讲究眼疾手快，冒密集大泡时转小泡即可下肉，晚3秒就会发苦变焦！'
      },
      {
        id: 's4',
        stepNumber: 4,
        title: '花雕慢炖与香料入味',
        description: '转入铸铁厚底锅，下葱段、姜片、八角、桂皮。倒入150ml陈年花雕酒、生抽、老抽，倒入温开水至刚好没过肉块。大火烧开后加盖，转最小火慢炖45分钟。',
        durationMinutes: 45,
        heat: '微火',
        tip: '铸铁锅锁水极佳，小火煨炖能让胶原蛋白彻底软化成如果冻般的糯感。'
      },
      {
        id: 's5',
        stepNumber: 5,
        title: '大火收汁挂琥珀琉璃芡',
        description: '开盖挑出葱姜和八角香料弃去。转大火不断用锅铲推动肉块收汁，直至汤汁逐渐浓稠如红宝石蜜汁，均匀裹在每块肉肉上，撒葱花和熟芝麻出锅。',
        durationMinutes: 5,
        heat: '大火',
        tip: '收汁时务必守在灶台边，浓汁容易糊底，轻轻翻动让每块肉都裹上亮晶晶的琉璃芡。'
      }
    ],
    review: {
      tastingNotes: '肥肉入口即化，瘦肉软烂拉丝！糖色炒得很精准，花雕酒香随着热气四溢，回甘层次极其饱满。汤汁拌热腾腾的五常大米饭，连吃了两碗。',
      pitfallsAndLessons: '第4步收汁前尝了下咸淡刚好，无需再加额外盐；下次可以提前15分钟加几个虎皮鹌鹑蛋或结子百叶，吸满肉汁肯定绝配。',
      pairingSuggestions: '东北香米饭、清炒爽脆芥蓝、陈年普洱茶或温热黄酒。',
      ratings: {
        taste: 5,
        difficulty: 3,
        reproducibility: 5,
        presentation: 5
      },
      stickers: ['🍚 米饭杀手', '✨ 满分硬菜', '🌿 治愈系美味', '🔥 锅气十足'],
      dinerFeedback: '“这是家里近一年做过最好吃的红烧肉，皮Q肉糯，完全停不下来！”—— 家人一致全票通过',
      cookDate: '2026-10-24'
    }
  },
  {
    id: 'recipe-matcha-chiffon',
    title: '若竹宇治抹茶云朵戚风',
    subtitle: '如云朵般轻盈柔软，微苦清冽的茶香与醇厚奶香在舌尖回甘。',
    coverImage: '',
    category: '烘焙甜点',
    subCategory: '西式烘焙',
    cuisine: '西式烘焙法',
    prepTimeMinutes: 30,
    cookTimeMinutes: 40,
    baseServings: 4,
    estimatedCalories: 905,
    difficulty: 4,
    utensils: ['6寸阳极活底戚风模具', '电动手持打蛋器', '硅胶软刮刀', '面粉筛网', '厨房电子秤'],
    weatherStamp: '🍂 微风闲日',
    isFavorite: true,
    createdAt: '2026-10-18',
    updatedAt: '2026-10-22',
    ingredients: [
      { id: 'm1', name: '冷藏新鲜鸡蛋（单枚带壳约60g）', amount: 3, unit: '个', category: 'main', note: '蛋白与蛋黄严格分立，容器无水无油' },
      { id: 'm2', name: '日式若竹抹茶粉', amount: 9, unit: '克', category: 'main', note: '过筛2遍，色泽鲜绿清甘' },
      { id: 'm3', name: '低筋面粉', amount: 45, unit: '克', category: 'main', note: '与抹茶粉混合过筛' },
      { id: 'm4', name: '全脂纯牛奶', amount: 45, unit: '克', category: 'seasoning', note: '微温35℃便于化解抹茶' },
      { id: 'm5', name: '玉米油 / 无味植物油', amount: 30, unit: '克', category: 'seasoning' },
      { id: 'm6', name: '细砂糖（蛋白霜打发）', amount: 40, unit: '克', category: 'seasoning', note: '分三次加入蛋白霜' },
      { id: 'm7', name: '细砂糖（蛋黄糊乳化）', amount: 10, unit: '克', category: 'seasoning' },
      { id: 'm8', name: '新鲜柠檬汁 / 白醋', amount: 4, unit: '滴', category: 'seasoning', note: '稳定蛋白泡沫' },
      { id: 'm9', name: '装饰用防潮糖粉与新鲜薄荷', amount: 1, unit: '撮', category: 'garnish' }
    ],
    steps: [
      {
        id: 'ms1',
        stepNumber: 1,
        title: '抹茶液乳化与蛋黄糊制作',
        description: '微温牛奶倒入抹茶粉中，用茶筅或手抽仔细搅匀至无颗粒。加入玉米油和10g细砂糖，快速搅拌乳化至酸奶状。筛入低筋面粉，划Z字拌匀，最后加入3个蛋黄拌顺滑。',
        durationMinutes: 10,
        heat: '中火',
        tip: '划Z字搅拌，不要画圈搅拌以免面粉起筋导致蛋糕坍塌。'
      },
      {
        id: 'ms2',
        stepNumber: 2,
        title: '蛋白打发至湿性偏干状态',
        description: '冷藏蛋白滴入柠檬汁，打蛋器高速打至鱼眼大泡加1/3糖；细密泡沫加1/3糖；出现纹路加最后1/3糖。转低速整理气泡，提起到微弯小鸟嘴状态（偏干性发泡）。',
        durationMinutes: 8,
        heat: '小火',
        tip: '盆底蛋白也要刮起打匀，盆壁刮干净，打发过头容易开裂，打发不足容易缩腰。'
      },
      {
        id: 'ms3',
        stepNumber: 3,
        title: '翻拌混合面糊',
        description: '取1/3蛋白霜入蛋黄糊，用翻拌手法（2点到8点方向抄底翻起）混合均匀。再倒回剩余蛋白霜中，快速轻柔翻拌至颜色均匀一致的淡翡翠绿。',
        durationMinutes: 4,
        heat: '微火',
        tip: '动作要轻快，切忌画圈，30次翻拌以内完成以防消泡。'
      },
      {
        id: 'ms4',
        stepNumber: 4,
        title: '入模震泡与低温烘烤',
        description: '面糊从20cm高处倒入6寸阳极模具中，按住烟囱模或在桌上震两下震出大气泡。放入预热150℃烤箱中下层，上下火烘烤42分钟。',
        durationMinutes: 42,
        heat: '烤箱预热/烘烤',
        tip: '烤箱必须提前预热到位；烘烤中途严禁打开烤箱门，以免冷空气骤入回缩。'
      },
      {
        id: 'ms5',
        stepNumber: 5,
        title: '倒扣彻底晾凉脱模',
        description: '出炉后立即从高处摔一下震出热气，随后迅速倒扣在晾网或酒瓶颈上。完全凉透（约1.5小时后）再手工徒手脱模，切块撒防潮糖粉。',
        durationMinutes: 60,
        heat: '关火焖',
        tip: '没凉透绝不能脱模，内部水汽尚未散尽会导致蛋糕体塌陷。'
      }
    ],
    review: {
      tastingNotes: '高度爬升非常完美，毛孔组织细腻如丝绸！用若竹抹茶的微苦平衡了糖分，入口化水感很强烈，配上一杯冷萃煎茶简直是春天的味道。',
      pitfallsAndLessons: '蛋白打到偏硬性一点点支撑力更强，烤箱温度实际148℃最稳。下次可以尝试中间夹入蜜红豆粒增加咀嚼乐趣。',
      pairingSuggestions: '冷萃日本玉露煎茶、热燕麦拿铁、香草打发鲜奶油。',
      ratings: {
        taste: 5,
        difficulty: 4,
        reproducibility: 4,
        presentation: 5
      },
      stickers: ['☕ 下午茶时光', '🌿 治愈系美味', '✨ 满分硬菜', '🎯 零失败配方'],
      dinerFeedback: '“朋友来家里下午茶，一口惊艳，说比烘焙店买的戚风还轻盈无负担！”',
      cookDate: '2026-10-22'
    }
  },
  {
    id: 'recipe-mango-pomelo-sago',
    title: '港式满记风味杨枝甘露',
    subtitle: '浓郁椰浆西米浸润，金黄台芒与爆汁红西柚的冰爽碰撞。',
    coverImage: '',
    category: '烘焙甜点',
    subCategory: '港式甜品',
    cuisine: '传统港式糖水',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    baseServings: 2,
    difficulty: 2,
    utensils: ['小奶锅', '手持料理搅拌机', '滤网勺', '玻璃甜品碗'],
    weatherStamp: '☀️ 晴暖好食',
    isFavorite: true,
    createdAt: '2026-10-26',
    updatedAt: '2026-10-28',
    ingredients: [
      { id: 'yg1', name: '熟透台农小芒果（肉质香甜无丝）', amount: 3, unit: '个', category: 'main', note: '2个打泥，1个切小块装饰' },
      { id: 'yg2', name: '小西米', amount: 50, unit: '克', category: 'main', note: '水开下锅煮10分钟关火焖10分钟' },
      { id: 'yg3', name: '红心蜜柚 / 西柚果粒', amount: 40, unit: '克', category: 'main', note: '细心撕下晶莹果肉，不要白色筋膜' },
      { id: 'yg4', name: '全脂纯椰浆 (浓缩无糖)', amount: 100, unit: '毫升', category: 'seasoning', note: '醇厚椰香底料' },
      { id: 'yg5', name: '全脂牛奶 / 淡奶', amount: 100, unit: '毫升', category: 'seasoning' },
      { id: 'yg6', name: '纯正炼乳 / 细砂糖', amount: 20, unit: '克', category: 'seasoning', note: '依芒果甜度微调' }
    ],
    steps: [
      {
        id: 'ygs1',
        stepNumber: 1,
        title: '煮至晶莹透明小西米',
        description: '小锅水烧大开后撒入西米，中火煮10分钟（中间仍有小白芯），关火加盖焖10分钟至完全透明。捞出在冰水里反复过凉，西米粒粒Q弹清亮。',
        durationMinutes: 20,
        heat: '中火',
        tip: '必须滚水下西米！冷水下锅西米会直接化成糊状。'
      },
      {
        id: 'ygs2',
        stepNumber: 2,
        title: '搅打丝滑芒果甘露底',
        description: '取2个芒果果肉，加入100ml椰浆、100ml牛奶和20g炼乳，放入料理机高速搅打30秒成稠厚亮黄的丝滑果泥汤底，放入冰箱冷藏30分钟。',
        durationMinutes: 5,
        heat: '微火',
        tip: '冷藏后再吃风味更加冰凉沁爽，椰香与芒果融合得更紧密。'
      },
      {
        id: 'ygs3',
        stepNumber: 3,
        title: '组装分层与红西柚点缀',
        description: '玻璃碗底铺上两大勺Q弹西米，缓缓倒入浓稠芒果椰浆。表面铺满新鲜芒果方丁，撒上一大把酸甜微苦的红西柚果粒，插上薄荷叶即可享用。',
        durationMinutes: 5,
        heat: '微火',
        tip: '西柚微酸能中和芒果的甜腻，千万不要省去，这是正宗港式杨枝甘露的灵魂。'
      }
    ],
    review: {
      tastingNotes: '芒果泥绵密浓郁，椰浆奶香温润厚重。每一勺都能舀到Q弹滑溜的西米和在嘴里爆汁的酸甜西柚粒，比甜品店现卖的还要真材实料！',
      pitfallsAndLessons: '西柚撕果肉时一定要去除所有白色内皮，否则会带苦味；椰浆用高达或佳乐浓椰浆最地道。',
      pairingSuggestions: '港式菠萝油、鸡蛋仔、清咖。',
      ratings: {
        taste: 5,
        difficulty: 2,
        reproducibility: 5,
        presentation: 5
      },
      stickers: ['☕ 下午茶时光', '🌿 治愈系美味', '🎯 零失败配方', '👶 阖家皆欢'],
      dinerFeedback: '“炎热午后来一碗冰镇杨枝甘露，甜而不腻，一口入魂！”',
      cookDate: '2026-10-27'
    }
  },
  {
    id: 'recipe-taro-balls-jelly',
    title: '九份手作古早芋圆烧仙草',
    subtitle: '软糯Q弹的三色手工芋圆，搭配滑嫩黑凉粉与蜜红豆沙。',
    coverImage: '',
    category: '烘焙甜点',
    subCategory: '台式甜品',
    cuisine: '台式古早味',
    prepTimeMinutes: 30,
    cookTimeMinutes: 15,
    baseServings: 3,
    difficulty: 3,
    utensils: ['蒸锅', '深煮锅', '食品防粘揉面垫', '大沙拉碗'],
    weatherStamp: '☀️ 晴暖好食',
    isFavorite: true,
    createdAt: '2026-10-22',
    updatedAt: '2026-10-26',
    ingredients: [
      { id: 'tb1', name: '荔浦芋头（蒸熟压泥）', amount: 150, unit: '克', category: 'main', note: '原色芋圆' },
      { id: 'tb2', name: '红心红薯 / 蜜地瓜（蒸熟泥）', amount: 150, unit: '克', category: 'main', note: '金黄地瓜圆' },
      { id: 'tb3', name: '紫薯泥（蒸熟捣烂）', amount: 150, unit: '克', category: 'main', note: '梦幻紫薯圆' },
      { id: 'tb4', name: '木薯淀粉 (Tapioca Starch)', amount: 180, unit: '克', category: 'main', note: '每种薯泥约配60g，是Q弹关键' },
      { id: 'tb5', name: '古法黑糖 / 红糖', amount: 40, unit: '克', category: 'seasoning', note: '熬煮红糖姜汁底汤' },
      { id: 'tb6', name: '现成仙草冻 / 龟苓膏', amount: 150, unit: '克', category: 'garnish', note: '切成大方块' },
      { id: 'tb7', name: '蜜红豆与酥脆花生碎', amount: 2, unit: '汤匙', category: 'garnish' }
    ],
    steps: [
      {
        id: 'tbs1',
        stepNumber: 1,
        title: '蒸熟薯类并趁热揉团',
        description: '芋头、地瓜、紫薯切厚片蒸20分钟至筷子轻松穿透。趁滚烫时分别压成细腻泥状，趁热分次加入木薯淀粉和少许温水，揉成柔软如耳垂般不粘手的面团。',
        durationMinutes: 20,
        heat: '大火',
        tip: '必须趁薯泥滚烫时加入木薯粉烫熟部分淀粉（糊化），做出的芋圆才会极其软糯弹牙不松散。'
      },
      {
        id: 'tbs2',
        stepNumber: 2,
        title: '搓长条切段与防粘',
        description: '将三色面团搓成细长条（约小拇指粗细），用刮板切成1.5cm均匀小粒，表面均匀筛上一层薄薄的木薯生粉防粘。多余部分可冷冻随吃随煮。',
        durationMinutes: 10,
        heat: '微火',
        tip: '一次可以多做几倍分量，密封分袋冷冻保存一个月，想吃时直接下沸水。'
      },
      {
        id: 'tbs3',
        stepNumber: 3,
        title: '滚水煮浮过冰水与装碗',
        description: '宽水大火烧沸，下入芋圆轻轻推散防粘底。煮至全部浮起后再煮1分30秒。捞出迅速投入冰水中冰镇。碗中加入仙草冻块、三色芋圆、蜜红豆，浇上温热古早红糖水或冰牛奶。',
        durationMinutes: 8,
        heat: '大火',
        tip: '煮好立刻泡冰水，热胀冷缩会让表皮瞬间紧致，产生惊艳的嚼劲。'
      }
    ],
    review: {
      tastingNotes: '手工芋圆嚼劲十足，能清晰尝到天然芋头与红薯的原香颗粒，完全不是市售香精冻圆可比！搭配滑溜凉润的仙草冻，微甜解燥。',
      pitfallsAndLessons: '紫薯相对偏干，揉面时需稍微多补5-10ml温水；红薯水分较大，可以适当多加一小勺木薯粉。',
      pairingSuggestions: '古早红茶冰、椰汁露、热姜红糖水。',
      ratings: {
        taste: 5,
        difficulty: 3,
        reproducibility: 5,
        presentation: 5
      },
      stickers: ['🌿 治愈系美味', '👶 阖家皆欢', '☕ 下午茶时光', '🎯 零失败配方'],
      dinerFeedback: '“自己手搓的芋圆太好吃了，地瓜圆甜软、芋头圆粉糯，连吃了两碗仙草底！”',
      cookDate: '2026-10-25'
    }
  },
  {
    id: 'recipe-sesame-pastry',
    title: '江南非遗古法核桃酥饼',
    subtitle: '金黄酥脆一触即化，满口醇正核桃香与黑芝麻余韵。',
    coverImage: '',
    category: '烘焙甜点',
    subCategory: '中式糕点',
    cuisine: '传统苏式糕点',
    prepTimeMinutes: 20,
    cookTimeMinutes: 22,
    baseServings: 6,
    difficulty: 2,
    utensils: ['大平烤盘', '烘焙油纸', '面粉筛', '手动打蛋器'],
    weatherStamp: '☕ 下午茶时光',
    isFavorite: false,
    createdAt: '2026-10-21',
    updatedAt: '2026-10-25',
    ingredients: [
      { id: 'sp1', name: '低筋面粉', amount: 200, unit: '克', category: 'main', note: '过筛保证酥松' },
      { id: 'sp2', name: '优质熟核桃仁碎', amount: 60, unit: '克', category: 'main', note: '烤香后微捣碎，保留颗粒感' },
      { id: 'sp3', name: '玉米油 / 传统精炼熟猪油', amount: 90, unit: '克', category: 'main', note: '猪油起酥更绝伦' },
      { id: 'sp4', name: '细砂糖 / 糖粉', amount: 65, unit: '克', category: 'seasoning' },
      { id: 'sp5', name: '新鲜全蛋液', amount: 35, unit: '克', category: 'seasoning', note: '常温蛋液，余下少许刷表面' },
      { id: 'sp6', name: '无铝泡打粉与小苏打', amount: 2, unit: '克', category: 'seasoning', note: '各1g，产生自然开裂纹理' },
      { id: 'sp7', name: '纯黑芝麻', amount: 1, unit: '汤匙', category: 'garnish', note: '中心点缀' }
    ],
    steps: [
      {
        id: 'sps1',
        stepNumber: 1,
        title: '油糖乳化与混合粉类',
        description: '植物油或融化猪油中加入细砂糖和蛋液，用手抽顺时针充分搅打乳化至糖融化。将低筋面粉、泡打粉、小苏打混合过筛加入，投入熟核桃仁碎。',
        durationMinutes: 8,
        heat: '微火',
        tip: '用翻拌或压拌方式捏成团，切记不可过度揉搓起筋，起筋后口感会变硬不酥。'
      },
      {
        id: 'sps2',
        stepNumber: 2,
        title: '分剂搓圆压裂与点芝麻',
        description: '将面团分成每个约25g的小球，轻搓圆放在铺好油纸的烤盘上。用拇指在中心按下一个浅坑，边缘会自然形成古朴迷人的自然裂纹。在小窝里刷蛋黄液，撒黑芝麻。',
        durationMinutes: 8,
        heat: '微火',
        tip: '自然裂纹正是传统老式桃酥的灵魂标志，间距留足3cm以便烘烤时延展。'
      },
      {
        id: 'sps3',
        stepNumber: 3,
        title: '烤箱烘烤至金黄酥脆',
        description: '放入预热好180℃的烤箱中层，上下火烘烤20-22分钟，至表面金黄微焦香气四溢。出炉在烤盘中放置5分钟后移至晾架，彻底冷却后极其酥松。',
        durationMinutes: 22,
        heat: '烤箱预热/烘烤',
        tip: '刚出炉时内部较软，完全放凉后才会变得酥到掉渣。'
      }
    ],
    review: {
      tastingNotes: '咬一口酥得掉渣，满口都是核桃坚果的浓郁油脂香！少油少糖改良版吃起来丝毫没有油腻感，配一杯清茶简直停不下来。',
      pitfallsAndLessons: '小苏打不可放多，1g刚好产生碱香和裂纹，多了会发苦；核桃仁一定要提前150℃烤香再拌入。',
      pairingSuggestions: '明前龙井、武夷岩茶、大红袍、温热红茶。',
      ratings: {
        taste: 5,
        difficulty: 2,
        reproducibility: 5,
        presentation: 4
      },
      stickers: ['☕ 下午茶时光', '✨ 满分硬菜', '🎯 零失败配方', '👶 阖家皆欢'],
      dinerFeedback: '“长辈和孩子都特别爱吃，包装好装在手帐铁盒里送朋友非常体面。”',
      cookDate: '2026-10-23'
    }
  },
  {
    id: 'recipe-strawberry-daifuku',
    title: '宇治白玉抹茶草莓大福',
    subtitle: '薄透拉丝雪白冰皮，包裹清冽若竹抹茶豆沙与整颗红颜草莓。',
    coverImage: '',
    category: '烘焙甜点',
    subCategory: '日式和果子',
    cuisine: '日式和果子',
    prepTimeMinutes: 25,
    cookTimeMinutes: 10,
    baseServings: 4,
    difficulty: 3,
    utensils: ['微波炉/蒸锅', '耐热玻璃碗', '硅胶擀面杖', '熟糕粉防粘垫'],
    weatherStamp: '🌸 春日尝鲜',
    isFavorite: false,
    createdAt: '2026-10-19',
    updatedAt: '2026-10-24',
    ingredients: [
      { id: 'df1', name: '水磨糯米粉', amount: 100, unit: '克', category: 'main', note: '粉质细腻无颗粒' },
      { id: 'df2', name: '玉米淀粉', amount: 30, unit: '克', category: 'main', note: '降低黏性增加软韧' },
      { id: 'df3', name: '新鲜纯牛奶', amount: 175, unit: '毫升', category: 'seasoning' },
      { id: 'df4', name: '细砂糖', amount: 35, unit: '克', category: 'seasoning' },
      { id: 'df5', name: '无盐黄油', amount: 20, unit: '克', category: 'seasoning', note: '揉入面团赋予拉丝与抗硬化' },
      { id: 'df6', name: '低糖白芸豆沙 / 细豆沙', amount: 160, unit: '克', category: 'main', note: '拌入5g宇治抹茶粉做馅' },
      { id: 'df7', name: '新鲜红颜草莓（中等大小）', amount: 6, unit: '颗', category: 'main', note: '洗净去蒂彻底擦干' },
      { id: 'df8', name: '熟糯米粉 (手粉)', amount: 30, unit: '克', category: 'garnish', note: '糯米粉小火炒至微黄防粘' }
    ],
    steps: [
      {
        id: 'dfs1',
        stepNumber: 1,
        title: '蒸制软糯拉丝麻薯皮',
        description: '糯米粉、玉米淀粉、细砂糖与纯牛奶搅打均匀过筛入耐热碗，盖上保鲜膜扎小孔。水开大火蒸20分钟至完全凝固无生白心。趁热揉入黄油，拉扯揉捏5分钟至表面光洁拉丝。',
        durationMinutes: 25,
        heat: '大火',
        tip: '戴上食品级PVC手套趁温热反复拉折揉搓，黄油完全被麻薯吸收后，冰皮冷藏3天依然软糯不发硬。'
      },
      {
        id: 'dfs2',
        stepNumber: 2,
        title: '抹茶豆沙包裹草莓心',
        description: '白芸豆沙加入5g抹茶粉揉匀成墨绿色豆沙。分成每份约25g搓圆压扁，包住整颗擦干的草莓，露出尖尖一点红，收口搓圆备用。',
        durationMinutes: 8,
        heat: '微火',
        tip: '草莓表面必须完全用厨房纸吸干水分，否则包入后容易渗水化馅。'
      },
      {
        id: 'dfs3',
        stepNumber: 3,
        title: '擀皮包制与雪白整形',
        description: '麻薯团撒熟糯米粉防粘，均分6等份。擀成中间厚边缘薄的圆面皮，将抹茶草莓倒扣放入，像包包子一样捏拢收口捏紧，收口朝下整理成圆滚滚的可爱大福。',
        durationMinutes: 10,
        heat: '微火',
        tip: '收口处多余的面皮可用剪刀剪去，这样大福底部才不会过厚。'
      }
    ],
    review: {
      tastingNotes: '对半切开颜值惊艳！雪白冰皮薄透软弹，微苦清爽的宇治抹茶豆沙刚好中和了草莓的爆汁甜美，层次感丰富迷人。',
      pitfallsAndLessons: '包大福动作要快，多备熟糯米手粉防粘；切大福时可用缝纫细线十字环绕拉紧切割，切面比刀切平整十倍。',
      pairingSuggestions: '日式煎茶、热抹茶拿铁、玄米茶。',
      ratings: {
        taste: 5,
        difficulty: 3,
        reproducibility: 4,
        presentation: 5
      },
      stickers: ['🌿 治愈系美味', '✨ 满分硬菜', '☕ 下午茶时光', '🎯 零失败配方'],
      dinerFeedback: '“切开的瞬间大家都惊呼太好看了，草莓爆汁和软糯麻薯皮绝配！”',
      cookDate: '2026-10-20'
    }
  },
  {
    id: 'recipe-coconut-sea-salt-gelato',
    title: '生椰海盐焦糖低脂冰淇淋',
    subtitle: '无需冰淇淋机的夏日解暑神器，微咸焦糖与浓香椰奶的丝滑融合。',
    coverImage: '',
    category: '烘焙甜点',
    subCategory: '清凉冰品',
    cuisine: '清凉冰品手作',
    prepTimeMinutes: 20,
    cookTimeMinutes: 10,
    baseServings: 4,
    difficulty: 2,
    utensils: ['手持电动打蛋器', '硅胶软刮刀', '不锈钢保鲜冷冻盒', '冰淇淋挖球器'],
    weatherStamp: '☀️ 晴暖好食',
    isFavorite: false,
    createdAt: '2026-10-25',
    updatedAt: '2026-10-27',
    ingredients: [
      { id: 'cg1', name: '动物性淡奶油 (35%脂肪)', amount: 200, unit: '毫升', category: 'main', note: '冷藏12小时以上打发至6分发' },
      { id: 'cg2', name: '浓缩椰浆 (厚椰乳)', amount: 120, unit: '毫升', category: 'main', note: '提供纯正热带椰子香' },
      { id: 'cg3', name: '原味低脂炼乳', amount: 60, unit: '克', category: 'seasoning', note: '降低冰点，无需搅拌免冰渣的秘诀' },
      { id: 'cg4', name: '太妃海盐焦糖酱', amount: 35, unit: '克', category: 'seasoning', note: '微苦焦香大理石拉花' },
      { id: 'cg5', name: '研磨海盐结晶 (Fleur de Sel)', amount: 1.5, unit: '克', category: 'seasoning', note: '微咸提味解腻' },
      { id: 'cg6', name: '烤香香脆椰子脆片', amount: 2, unit: '汤匙', category: 'garnish', note: '出勺点缀' }
    ],
    steps: [
      {
        id: 'cgs1',
        stepNumber: 1,
        title: '打发淡奶油至浓稠酸奶状',
        description: '冷藏淡奶油倒入深盆中，加入海盐结晶。电动打蛋器中速打发至6分发（出现微微纹路但仍有流动性即可，不可打发过硬）。',
        durationMinutes: 5,
        heat: '微火',
        tip: '炼乳+淡奶油的组合能在冷冻时抑制大冰晶生成，不需要中途反复拿出来搅拌。'
      },
      {
        id: 'cgs2',
        stepNumber: 2,
        title: '混合生椰底料与翻拌',
        description: '将厚椰乳和炼乳分两次倒入打发的淡奶油中，用硅胶刮刀从底部向上轻柔翻拌均匀，质地顺滑如融化的奶昔。',
        durationMinutes: 3,
        heat: '微火',
        tip: '动作要轻柔，避免消泡，保留微小细腻的气孔让冰淇淋口感轻盈。'
      },
      {
        id: 'cgs3',
        stepNumber: 3,
        title: '浇淋焦糖大理石纹与冷冻',
        description: '倒入保鲜盒中，表面挤上海盐焦糖酱，用竹签随意划出大理石拉花。盖紧盖子放入冰箱冷冻室（-18℃）冷冻5小时以上。吃前室温回温5分钟，用挖球器舀出撒椰子脆片。',
        durationMinutes: 10,
        heat: '微火',
        tip: '冷冻时一定要盖密封盖，防止冰箱串味。'
      }
    ],
    review: {
      tastingNotes: '完全没有传统自制冰淇淋的冰渣感，入口即化，丝滑绵密！海盐的微咸衬托得椰香愈加清甜醇正，伴着焦糖的香气简直太治愈了。',
      pitfallsAndLessons: '海盐不可用普通细碘盐替代，海盐片的脆咸颗粒感是这款冰淇淋的点睛之笔。',
      pairingSuggestions: '热浓缩咖啡（Affogato阿芙佳朵吃法）、曲奇饼干。',
      ratings: {
        taste: 5,
        difficulty: 2,
        reproducibility: 5,
        presentation: 5
      },
      stickers: ['☕ 下午茶时光', '🌿 治愈系美味', '⏱️ 15分钟快手', '🎯 零失败配方'],
      dinerFeedback: '“舀一球淋上一杯热浓缩咖啡做成阿芙佳朵，秒杀意式咖啡厅！”',
      cookDate: '2026-10-26'
    }
  },
  {
    id: 'recipe-shrimp-pasta',
    title: '蒜香黄油黑虎虾宽意面',
    subtitle: '锅气腾腾的西式快手晚餐，浓郁蒜香乳化酱汁包裹每一根手工弹韧面条。',
    coverImage: '',
    category: '西式轻餐',
    subCategory: '意面披萨',
    cuisine: '意式经典',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    baseServings: 2,
    difficulty: 2,
    utensils: ['深煮面不锈钢锅', '平底不粘平底锅', '硅胶意面夹', '擦丝器'],
    weatherStamp: '🌙 深夜食堂',
    isFavorite: false,
    createdAt: '2026-10-15',
    updatedAt: '2026-10-21',
    ingredients: [
      { id: 'p1', name: '新鲜黑虎虾（去壳开背去虾线，留尾）', amount: 8, unit: '只', category: 'main', note: '用厨房纸彻底吸干表面水分' },
      { id: 'p2', name: '粗粒小麦硬质宽意面 (Tagliatelle)', amount: 180, unit: '克', category: 'main' },
      { id: 'p3', name: '新鲜大蒜头', amount: 6, unit: '瓣', category: 'seasoning', note: '4瓣切薄蒜片，2瓣压泥' },
      { id: 'p4', name: '无盐发酵黄油', amount: 25, unit: '克', category: 'seasoning', note: '冷藏小方块，最后乳化关键' },
      { id: 'p5', name: '特级初榨橄榄油', amount: 20, unit: '毫升', category: 'seasoning' },
      { id: 'p6', name: '干白葡萄酒', amount: 30, unit: '毫升', category: 'seasoning', note: '去腥提香' },
      { id: 'p7', name: '圣女果 / 小番茄', amount: 6, unit: '颗', category: 'garnish', note: '对半切开' },
      { id: 'p8', name: '现磨黑胡椒碎与海盐', amount: 1, unit: '适量', category: 'seasoning' },
      { id: 'p9', name: '新鲜平叶欧芹碎 (Italian Parsley)', amount: 1, unit: '小把', category: 'garnish' },
      { id: 'p10', name: '帕玛森干酪 (Parmigiano Reggiano)', amount: 15, unit: '克', category: 'garnish', note: '现擦细丝' }
    ],
    steps: [
      {
        id: 'ps1',
        stepNumber: 1,
        title: '煮意面并保留浓白面汤',
        description: '大锅足量水加一小勺盐（如海水般咸），水沸后下入宽面。按包装时间少煮1分30秒（维持Al dente弹牙感）。沥干捞出前务必盛出一小碗煮面水备用！',
        durationMinutes: 8,
        heat: '大火',
        tip: '千万不要倒掉煮面水！里面的淀粉是让橄榄油和黄油完美乳化成奶油般质地的神级秘密。'
      },
      {
        id: 'ps2',
        stepNumber: 2,
        title: '冷油慢炸金黄蒜油',
        description: '平底锅倒入橄榄油，冷油下入蒜片和小番茄，小火慢熬出蒜香至边缘微焦金黄。下入黑虎虾，两面各煎1分钟至虾身卷曲变红，烹入白葡萄酒激出香气，盛出虾备用。',
        durationMinutes: 4,
        heat: '中火',
        tip: '大蒜容易炸焦发苦，务必小火慢浸，闻到浓郁蒜香立刻下虾。'
      },
      {
        id: 'ps3',
        stepNumber: 3,
        title: '猛火晃锅让酱汁乳化挂面',
        description: '原锅倒入80ml热煮面水，倒入煮好的意面。开大火不断摇晃平底锅，面汤与蒜油迅速撞击乳化成乳白色浓稠酱汁，面条吸饱鲜汁。',
        durationMinutes: 2,
        heat: '大火',
        tip: '摇晃平底锅的物理乳化过程（Mantecatura）是意面口感升华的灵魂。'
      },
      {
        id: 'ps4',
        stepNumber: 4,
        title: '关火溶入冷黄油与摆盘',
        description: '关火离开热源！立刻投入冷黄油块、黑虎虾与欧芹碎，用余温快速拌匀，黄油融化让酱汁如同天鹅绒般丝滑。装盘擦上厚厚一层帕玛森干酪与现磨黑胡椒。',
        durationMinutes: 2,
        heat: '关火焖',
        tip: '一定要离火拌入冷黄油，否则黄油油水分离会失去柔滑乳化质感。'
      }
    ],
    review: {
      tastingNotes: '酱汁彻底附着在宽面上，每一口都带着奶香黄油和微焦蒜甜。大虾肉质紧实脆弹，小番茄爆汁解腻，15分钟做出的餐厅级品质。',
      pitfallsAndLessons: '盐分主要依靠煮面水和干酪，锅里调味只加了少许海盐刚刚好；欧芹一定要用新鲜的，干欧芹香气差很远。',
      pairingSuggestions: '长相思干白葡萄酒（Sauvignon Blanc）、冰镇起泡水配柠檬片。',
      ratings: {
        taste: 5,
        difficulty: 2,
        reproducibility: 5,
        presentation: 4
      },
      stickers: ['⏱️ 15分钟快手', '🍷 绝佳佐餐', '✨ 满分硬菜', '🎯 零失败配方'],
      dinerFeedback: '“周五下班疲惫时做这道菜，闻到蒜油香气整个人都被治愈了！”',
      cookDate: '2026-10-21'
    }
  }
];
