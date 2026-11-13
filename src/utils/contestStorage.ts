import { ContestTheme, ContestSubmission } from '../types/contest';
import { Recipe } from '../types/recipe';
import { UserProfile } from '../types/auth';
import { saveUserRecipe } from './multiUserStorage';
import { AVATAR_SVG_MAP } from './avatarGraphics';
import { formatLocalDate } from './dateUtils';

const CONTEST_STORAGE_KEY = 'culinary_contest_submissions_v2';

export const CONTEST_THEMES: ContestTheme[] = [
  {
    id: 'theme_pork',
    dishName: '秘制慢炖红烧肉',
    dishEnglishName: 'Braised Pork Belly Master Challenge',
    category: '家常中餐',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    seasonTag: '秋季火候擂台 · 第12期',
    description: '浓油赤酱、肥而不腻、入口即化！同一块五花肉，谁能做出最让人心动的焦糖色与醇厚肉香？',
    rules: '评审标准：火候与软糯度 (40%)、糖色与挂汁美感 (30%)、肥瘦平衡与风味独创 (30%)',
    deadline: '2026-11-30',
    prizeNote: '金牌手帐奖章 · 官方食味广场置顶推荐',
    benchmarkRecipeId: 'rec_1',
    tags: ['红烧肉', '慢火煨炖', '镬气焦糖']
  },
  {
    id: 'theme_chiffon',
    dishName: '云朵舒芙蕾戚风',
    dishEnglishName: 'Cloud Chiffon Baking Championship',
    category: '烘焙甜点',
    coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    seasonTag: '甜蜜手作擂台 · 第11期',
    description: '不开裂、不回缩、云朵般轻盈蓬松！比拼蛋白霜打发稳定性与烤箱温控的极致技艺。',
    rules: '评审标准：组织细腻度与气孔 (40%)、膨胀高度与色泽 (30%)、口感润泽不噎喉 (30%)',
    deadline: '2026-11-28',
    prizeNote: '主厨金搅拌棒荣誉徽章',
    benchmarkRecipeId: 'rec_2',
    tags: ['戚风蛋糕', '云朵舒芙蕾', '烘焙控温']
  },
  {
    id: 'theme_pasta',
    dishName: '意式经典罗勒宽面',
    dishEnglishName: 'Artisanal Italian Basil Pasta Cup',
    category: '西式轻餐',
    coverImage: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    seasonTag: 'Bistro风味季 · 第8期',
    description: 'Al dente 弹牙筋道！橄榄油、松子青酱与帕玛森干酪在乳化汁水中的交融艺术。',
    rules: '评审标准：面条弹牙嚼劲 (40%)、酱汁乳化挂壁 (30%)、香气层次与点缀 (30%)',
    deadline: '2026-12-05',
    prizeNote: '罗勒匠人手帐封印印章',
    benchmarkRecipeId: 'rec_8',
    tags: ['意式宽面', '手作青酱', 'Al dente']
  }
];

// Initial seeded contestant submissions
function getInitialSeededSubmissions(): ContestSubmission[] {
  return [
    {
      id: 'sub_pork_1',
      dishId: 'theme_pork',
      dishName: '秘制慢炖红烧肉',
      authorId: 'chef_lin',
      authorName: '林间小厨',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      title: '黄冰糖小火炒糖色 · 双倍黄酒煨足90分钟',
      story: '这道红烧肉是我外婆传下来的法子，一滴水不加，全靠古法绍兴花雕酒慢慢煨透。五花肉切成4cm大方块，焯水后沥干逼油，每一块都裹着琥珀般晶莹的胶质。',
      coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      secretTip: '一定要最后大火收汁收浓，不断淋汁在肉块上，挂汁才油润发亮！',
      ingredientsHighlight: ['精品下五花肉 800g', '老冰糖 45g', '古越龙山花雕酒 500ml', '老抽 2勺'],
      totalScore: 9.8,
      voteCount: 142,
      ratings: { taste: 4.9, plating: 4.8, heat: 4.9 },
      ratedBy: ['demo_1'],
      badges: ['🥇 本期擂台第一名', '糖色大师'],
      createdAt: '2026-11-06',
      comments: [
        {
          id: 'cm_1',
          authorName: '烘焙日记',
          score: 10,
          content: '看这焦糖油光就流口水！跟着你的配比试做了一次，全家抢光！',
          createdAt: '2026-11-07'
        },
        {
          id: 'cm_2',
          authorName: '周末大厨',
          score: 9.6,
          content: '不加水全用花雕酒的做法太地道了，肉香浓郁没有一丝腥味！',
          createdAt: '2026-11-08'
        }
      ],
      recipeData: {
        id: 'rec_contest_pork_1',
        title: '林间外婆传家红烧肉 (90分钟古法花雕慢煨)',
        subtitle: '不加一滴水，全靠花雕酒与黄冰糖煨出的琥珀红润。',
        category: '家常中餐',
        subCategory: '慢炖红烧',
        cuisine: '江南本帮',
        prepTimeMinutes: 20,
        cookTimeMinutes: 90,
        difficulty: 4,
        baseServings: 4,
        coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        weatherStamp: '微风暖阳',
        utensils: ['厚底砂锅/铸铁炖锅', '厨房食品夹'],
        ingredients: [
          { id: 'i1', name: '精品三层五花肉', amount: 800, unit: 'g', category: 'main', note: '切成4cm大块' },
          { id: 'i2', name: '老冰糖', amount: 45, unit: 'g', category: 'seasoning', note: '黄冰糖更润' },
          { id: 'i3', name: '绍兴花雕酒', amount: 500, unit: 'ml', category: 'seasoning', note: '替代清水' },
          { id: 'i4', name: '生抽', amount: 4, unit: '勺', category: 'seasoning' },
          { id: 'i5', name: '酿造老抽', amount: 2, unit: '勺', category: 'seasoning', note: '上色' },
          { id: 'i6', name: '老姜片与小葱结', amount: 1, unit: '份', category: 'garnish' }
        ],
        steps: [
          { id: 's1', stepNumber: 1, title: '冷水焯肉', description: '五花肉切大方块冷水下锅，加姜片料酒煮沸3分钟，撇净浮沫温水洗净控干。', durationMinutes: 8, heat: '大火' },
          { id: 's2', stepNumber: 2, title: '煸炒出油与炒糖色', description: '锅内少许底油煎至五花肉微卷微黄出油捞出；用锅内余油下冰糖小火慢熬成琥珀色大泡转小泡，肉块回锅迅速翻炒均匀挂糖色。', durationMinutes: 10, heat: '小火' },
          { id: 's3', stepNumber: 3, title: '花雕慢煨70分钟', description: '转入砂锅，倒入整瓶花雕酒、生抽、老抽、葱姜，大火煮沸后盖盖转极小火慢煨70分钟。', durationMinutes: 70, heat: '微火' },
          { id: 's4', stepNumber: 4, title: '大火收汁亮油', description: '拣出葱姜，转大火不断用勺子舀汤汁浇淋肉块表面，直到汤汁浓稠挂勺，撒几粒熟白芝麻出锅。', durationMinutes: 10, heat: '大火' }
        ],
        review: {
          cookDate: '2026-11-06',
          tastingNotes: '肥肉部分入口化成一汪香浓，瘦肉丝丝入味不柴，收汁时一定不要离开锅边。',
          pitfallsAndLessons: '炒糖色时油温不能过高，否则会有焦苦味；花雕酒推荐半甜型。',
          pairingSuggestions: '东北大米饭或烫熟小青菜，清爽解腻。',
          ratings: { taste: 5, difficulty: 3, reproducibility: 5, presentation: 5 },
          stickers: ['✨ 满分硬菜', '🍚 米饭杀手'],
          dinerFeedback: '家人评价比私房菜馆做得还要诱人！'
        },
        tags: ['厨神大赛作品', '经典红烧肉', '慢火煨炖'],
        createdAt: '2026-11-06',
        updatedAt: '2026-11-06'
      }
    },
    {
      id: 'sub_pork_2',
      dishId: 'theme_pork',
      dishName: '秘制慢炖红烧肉',
      authorId: 'chef_sophie',
      authorName: '苏菲的香草厨房',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      title: '加入两颗干山楂的解腻版苏式红烧肉',
      story: '在红烧肉焖煮时加入2颗干山楂片，天然果酸不仅能极大加速肉质软化，而且吃起来肥而不腻，带有一丝若有若无的回甘！',
      coverImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      secretTip: '山楂两颗即可，多放会过酸。加入一小颗八角提香，千万别放太多香料夺味。',
      ingredientsHighlight: ['黑猪五花肉 700g', '无硫干山楂片 2片', '冰糖 40g', '优质黄酒 400ml'],
      totalScore: 9.6,
      voteCount: 98,
      ratings: { taste: 4.8, plating: 4.8, heat: 4.7 },
      ratedBy: [],
      badges: ['🥈 本期擂台第二名', '独创解腻配方'],
      createdAt: '2026-11-08',
      comments: [
        {
          id: 'cm_3',
          authorName: '陈大厨',
          score: 9.8,
          content: '放干山楂这一步绝了，软烂得快而且一点也不腻！',
          createdAt: '2026-11-09'
        }
      ],
      recipeData: {
        id: 'rec_contest_pork_2',
        title: '苏菲解腻山楂红烧肉',
        subtitle: '干山楂天然软肉化腻，色若红珀。',
        category: '家常中餐',
        subCategory: '慢炖红烧',
        cuisine: '江南本帮',
        prepTimeMinutes: 15,
        cookTimeMinutes: 80,
        difficulty: 3,
        baseServings: 3,
        coverImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        weatherStamp: '秋高气爽',
        utensils: ['厚底炖锅', '耐热硅胶铲'],
        ingredients: [
          { id: 'p1', name: '黑猪五花肉', amount: 700, unit: 'g', category: 'main' },
          { id: 'p2', name: '干山楂片', amount: 2, unit: '片', category: 'seasoning', note: '天然软肉解腻' },
          { id: 'p3', name: '冰糖', amount: 40, unit: 'g', category: 'seasoning' },
          { id: 'p4', name: '生抽+老抽', amount: 5, unit: '勺', category: 'seasoning' }
        ],
        steps: [
          { id: 's1', stepNumber: 1, title: '切块下锅微煎', description: '五花肉切均匀厚块，下锅小火干煸出多余油脂。', durationMinutes: 8, heat: '小火' },
          { id: 's2', stepNumber: 2, title: '下山楂与料汁煨煮', description: '放入山楂、冰糖、酱油与料酒，加盖慢火炖煮1小时。', durationMinutes: 60, heat: '微火' },
          { id: 's3', stepNumber: 3, title: '收浓出锅', description: '大火收至汤汁成琥珀琉璃色即可盛出。', durationMinutes: 10, heat: '大火' }
        ],
        review: {
          cookDate: '2026-11-08',
          tastingNotes: '山楂微酸把五花肉的厚重化解得恰到好处。',
          pitfallsAndLessons: '山楂不要煮化碎在汤里，收汁前可以捞出。',
          pairingSuggestions: '普洱熟茶或者白米饭。',
          ratings: { taste: 5, difficulty: 3, reproducibility: 5, presentation: 5 },
          stickers: ['🌿 治愈系美味', '✨ 满分硬菜'],
          dinerFeedback: '酸甜微咸非常开胃！'
        },
        tags: ['厨神大赛作品', '创意解腻', '苏式红烧'],
        createdAt: '2026-11-08',
        updatedAt: '2026-11-08'
      }
    },
    {
      id: 'sub_chiffon_1',
      dishId: 'theme_chiffon',
      dishName: '云朵舒芙蕾戚风',
      authorId: 'chef_baker_amy',
      authorName: '艾米烘焙舍',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      title: '小弯钩蛋白霜 · 145度低温慢烤不塌不裂',
      story: '烤戚风的真谛在于低温长时烘焙！用145度烤足55分钟，出炉震两下倒扣完全晾凉，云朵般的轻盈组织，手指按下去秒回弹！',
      coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      secretTip: '分三次加糖打到小弯钩偏硬中性即可，千万不要打成直立尖角的干性，否则容易开裂。',
      ingredientsHighlight: ['洋鸡蛋 3个', '低筋面粉 50g', '玉米油 35g', '纯牛奶 40g', '细砂糖 45g'],
      totalScore: 9.9,
      voteCount: 168,
      ratings: { taste: 4.9, plating: 4.9, heat: 4.9 },
      ratedBy: [],
      badges: ['🥇 烘焙擂台总冠军', '零回缩配方'],
      createdAt: '2026-11-05',
      comments: [
        {
          id: 'cm_4',
          authorName: '甜品控',
          score: 10,
          content: '用你的145度慢烤真的不塌不裂！第一次成功做出这么美的戚风！',
          createdAt: '2026-11-06'
        }
      ],
      recipeData: {
        id: 'rec_contest_chiffon_1',
        title: '艾米零失败云朵戚风蛋糕 (6寸)',
        subtitle: '低温慢烤，不回缩不塌陷的烘焙圣杯。',
        category: '烘焙甜点',
        subCategory: '西式烘焙',
        cuisine: '法式甜点',
        prepTimeMinutes: 25,
        cookTimeMinutes: 55,
        difficulty: 3,
        baseServings: 4,
        coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        weatherStamp: '晴空万里',
        utensils: ['阳极活底铝模 6寸', '电动打蛋器', '硅胶刮刀'],
        ingredients: [
          { id: 'c1', name: '新鲜鸡蛋', amount: 3, unit: '个', category: 'main' },
          { id: 'c2', name: '低筋面粉', amount: 50, unit: 'g', category: 'main' },
          { id: 'c3', name: '玉米油', amount: 35, unit: 'g', category: 'seasoning' },
          { id: 'c4', name: '纯牛奶', amount: 40, unit: 'g', category: 'seasoning' },
          { id: 'c5', name: '细砂糖', amount: 45, unit: 'g', category: 'seasoning' }
        ],
        steps: [
          { id: 's1', stepNumber: 1, title: '蛋黄糊乳化', description: '玉米油与牛奶充分搅拌至乳化无油星，筛入低粉Z字拌匀，加入蛋黄拌至顺滑。', durationMinutes: 8, heat: '小火' },
          { id: 's2', stepNumber: 2, title: '打发蛋白霜', description: '蛋清分三次加入细砂糖，打发至提起打蛋器呈小弯钩的大中性发泡状态。', durationMinutes: 10, heat: '中火' },
          { id: 's3', stepNumber: 3, title: '翻拌与低温慢烤', description: '三分之一蛋白霜与蛋黄糊切拌均匀后倒回原盆拌匀。入模轻震，烤箱145度慢烤55分钟。', durationMinutes: 55, heat: '烤箱预热/烘烤' }
        ],
        review: {
          cookDate: '2026-11-05',
          tastingNotes: '出炉后从20cm高处摔一下震出热气，立即倒扣至完全冷却后再脱模。',
          pitfallsAndLessons: '模具严禁涂油或垫纸，否则蛋糕无法顺着模壁爬升。',
          pairingSuggestions: '英式红茶或美式咖啡。',
          ratings: { taste: 5, difficulty: 3, reproducibility: 5, presentation: 5 },
          stickers: ['🌿 治愈系美味', '✨ 满分硬菜'],
          dinerFeedback: '蓬松轻柔像吃云朵一样！'
        },
        tags: ['厨神大赛作品', '经典戚风', '完美不塌'],
        createdAt: '2026-11-05',
        updatedAt: '2026-11-05'
      }
    }
  ];
}

export function getContestSubmissions(dishId?: string): ContestSubmission[] {
  try {
    const raw = localStorage.getItem(CONTEST_STORAGE_KEY);
    let list: ContestSubmission[] = [];
    if (raw) {
      list = JSON.parse(raw);
    } else {
      list = getInitialSeededSubmissions();
      localStorage.setItem(CONTEST_STORAGE_KEY, JSON.stringify(list));
    }
    if (dishId) {
      return list.filter((s) => s.dishId === dishId);
    }
    return list;
  } catch (e) {
    console.error('Failed to load contest submissions', e);
    return getInitialSeededSubmissions();
  }
}

export function saveContestSubmission(
  dish: ContestTheme,
  submission: {
    title: string;
    story: string;
    coverImage: string;
    secretTip?: string;
    ingredientsHighlight?: string[];
    recipeData?: Recipe;
  },
  currentUser: UserProfile | null
): ContestSubmission {
  const currentList = getContestSubmissions();
  const authorName = currentUser?.displayName || '私房小厨神';
  const authorAvatar = currentUser?.avatarUrl || AVATAR_SVG_MAP.chef_boy_cap;
  const authorId = currentUser?.uid || `guest_${Date.now()}`;
  const now = formatLocalDate();

  // Default fallback recipeData if user uploaded photos & story directly
  const recipeData: Recipe = submission.recipeData || {
    id: `rec_contest_${Date.now()}`,
    title: submission.title,
    subtitle: submission.story.slice(0, 40) + '...',
    category: dish.category,
    subCategory: dish.tags[0] || '大师打擂',
    cuisine: '私房名家',
    prepTimeMinutes: 20,
    cookTimeMinutes: 45,
    difficulty: 3,
    baseServings: 2,
    coverImage: submission.coverImage,
    weatherStamp: '微风暖阳',
    utensils: ['厚底炖锅', '耐热硅胶铲'],
    ingredients: (submission.ingredientsHighlight || ['精选食材 适量']).map((name, i) => ({
      id: `ci_${i}`,
      name,
      amount: 1,
      unit: '份',
      category: 'main'
    })),
    steps: [
      {
        id: 'cs_1',
        stepNumber: 1,
        title: '参赛烹饪制作',
        description: submission.story,
        durationMinutes: 30,
        heat: '中火'
      }
    ],
    review: {
      cookDate: now,
      tastingNotes: submission.story,
      pitfallsAndLessons: submission.secretTip || '火候老道，精心调配。',
      pairingSuggestions: '家庭餐桌绝佳搭配。',
      ratings: { taste: 5, difficulty: 3, reproducibility: 5, presentation: 5 },
      stickers: ['✨ 满分硬菜'],
      dinerFeedback: '风味独具匠心。'
    },
    tags: ['厨神大赛作品', dish.dishName],
    createdAt: now,
    updatedAt: now
  };

  const newEntry: ContestSubmission = {
    id: `sub_${Date.now()}`,
    dishId: dish.id,
    dishName: dish.dishName,
    authorId,
    authorName,
    authorAvatar,
    title: submission.title,
    story: submission.story,
    coverImage: submission.coverImage,
    secretTip: submission.secretTip,
    ingredientsHighlight: submission.ingredientsHighlight,
    recipeData,
    totalScore: 9.5,
    voteCount: 1,
    ratings: { taste: 4.8, plating: 4.8, heat: 4.7 },
    ratedBy: currentUser?.uid ? [currentUser.uid] : [],
    comments: [
      {
        id: `cm_welcome_${Date.now()}`,
        authorName: '大赛评审组',
        score: 9.8,
        content: '感谢提交参赛手帐！卖相诱人，火候心得非常扎实，期待更多厨友品鉴！',
        createdAt: now
      }
    ],
    createdAt: now,
    badges: ['新晋打擂作品']
  };

  const updated = [newEntry, ...currentList];
  try {
    localStorage.setItem(CONTEST_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('contest-updated', { detail: updated }));
  } catch (err) {
    console.error('Error saving contest submission', err);
  }

  return newEntry;
}

export function rateContestSubmission(
  submissionId: string,
  scores: { taste: number; plating: number; heat: number; comment?: string },
  currentUser: UserProfile | null
): { success: boolean; newScore: number; newCount: number } {
  const currentList = getContestSubmissions();
  const index = currentList.findIndex((s) => s.id === submissionId);
  if (index === -1) return { success: false, newScore: 0, newCount: 0 };

  const target = currentList[index];
  const userId = currentUser?.uid || `voter_${Date.now()}`;

  // Average 3 criteria into a 10-point scale: ((taste + plating + heat) / 15) * 10
  const thisVoteScore = Number((((scores.taste + scores.plating + scores.heat) / 15) * 10).toFixed(1));
  const newVoteCount = target.voteCount + 1;
  const newTotalScore = Number(((target.totalScore * target.voteCount + thisVoteScore) / newVoteCount).toFixed(1));

  const newRatings = {
    taste: Number(((target.ratings.taste * target.voteCount + scores.taste) / newVoteCount).toFixed(1)),
    plating: Number(((target.ratings.plating * target.voteCount + scores.plating) / newVoteCount).toFixed(1)),
    heat: Number(((target.ratings.heat * target.voteCount + scores.heat) / newVoteCount).toFixed(1))
  };

  const newComments = [...target.comments];
  if (scores.comment && scores.comment.trim()) {
    newComments.unshift({
      id: `cm_${Date.now()}`,
      authorName: currentUser?.displayName || '大众评审食客',
      authorAvatar: currentUser?.avatarUrl,
      score: thisVoteScore,
      content: scores.comment.trim(),
      createdAt: formatLocalDate()
    });
  }

  const updatedEntry: ContestSubmission = {
    ...target,
    totalScore: newTotalScore,
    voteCount: newVoteCount,
    ratings: newRatings,
    ratedBy: [...(target.ratedBy || []), userId],
    comments: newComments
  };

  currentList[index] = updatedEntry;

  try {
    localStorage.setItem(CONTEST_STORAGE_KEY, JSON.stringify(currentList));
    window.dispatchEvent(new CustomEvent('contest-updated', { detail: currentList }));
  } catch (err) {
    console.error('Error saving vote', err);
  }

  return { success: true, newScore: newTotalScore, newCount: newVoteCount };
}

/**
 * One-Click Clone a Contest Entry into the Current User's Personal Journal
 */
export function cloneContestToUserJournal(submission: ContestSubmission, currentUser: UserProfile | null): Recipe {
  const now = formatLocalDate();
  const clonedRecipe: Recipe = {
    ...submission.recipeData,
    id: `cloned_contest_${Date.now()}`,
    title: `${submission.dishName} (${submission.authorName}参赛版)`,
    subtitle: `收录自【厨神大赛】@${submission.authorName} 的打擂作品 · 评审分 ${submission.totalScore}`,
    originalSource: {
      recipeId: submission.id,
      authorName: submission.authorName
    },
    review: {
      cookDate: now,
      tastingNotes: `从厨神大赛一键收录：作者秘籍「${submission.secretTip || '火候老道'}」。待我亲自下厨复刻品尝！`,
      pitfallsAndLessons: '参考擂主指引，注意火候与调味配比。',
      pairingSuggestions: '可搭配清爽小菜。',
      ratings: { taste: 5, difficulty: submission.recipeData.difficulty || 3, reproducibility: 5, presentation: 5 },
      stickers: ['✨ 满分硬菜'],
      dinerFeedback: `擂台作者：${submission.authorName}`
    },
    createdAt: now,
    updatedAt: now,
    isPublic: false
  };

  return saveUserRecipe(clonedRecipe, currentUser);
}
