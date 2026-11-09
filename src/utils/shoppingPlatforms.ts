export interface ShoppingPlatform {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  badge: string;
  color: string;
  getSearchUrl: (keyword: string) => string;
  description: string;
}

export const SHOPPING_PLATFORMS: ShoppingPlatform[] = [
  {
    id: 'jd',
    name: '京东到家 / 京东生鲜',
    shortName: '京东生鲜',
    icon: '🐶',
    badge: '极速冷链',
    color: 'text-red-700 bg-red-50 border-red-200',
    getSearchUrl: (keyword: string) =>
      `https://search.jd.com/Search?keyword=${encodeURIComponent(keyword)}&enc=utf-8`,
    description: '产地直发生鲜、自营冷链次日达'
  },
  {
    id: 'taobao',
    name: '淘宝 / 天猫生鲜超市',
    shortName: '天猫生鲜',
    icon: '🛍️',
    badge: '品类最全',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    getSearchUrl: (keyword: string) =>
      `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`,
    description: '南北干货、烘焙调味、特色调料全网搜'
  },
  {
    id: 'hema',
    name: '盒马鲜生',
    shortName: '盒马鲜生',
    icon: '🦛',
    badge: '30分钟达',
    color: 'text-sky-700 bg-sky-50 border-sky-200',
    getSearchUrl: (keyword: string) =>
      `https://www.freshhema.com/search?keyword=${encodeURIComponent(keyword)}`,
    description: '日日鲜蔬菜肉禽、高品质生鲜即时达'
  },
  {
    id: 'meituan',
    name: '美团买菜 / 小象超市',
    shortName: '小象超市',
    icon: '🟡',
    badge: '社区速达',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    getSearchUrl: (keyword: string) =>
      `https://mall.meituan.com/search?q=${encodeURIComponent(keyword)}`,
    description: '前置仓即时配送、应急买葱姜蒜最快半小时'
  },
  {
    id: 'pdd',
    name: '拼多多生鲜 / 多多买菜',
    shortName: '多多买菜',
    icon: '🔴',
    badge: '实惠平价',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    getSearchUrl: (keyword: string) =>
      `https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(keyword)}`,
    description: '农产地直销、平价大宗果蔬粮油'
  },
  {
    id: 'sams',
    name: '山姆会员商店',
    shortName: '山姆会员',
    icon: '🏪',
    badge: '大包装高品质',
    color: 'text-blue-800 bg-blue-50 border-blue-200',
    getSearchUrl: (keyword: string) =>
      `https://www.samsclub.cn/search?keyword=${encodeURIComponent(keyword)}`,
    description: '高品质谷饲牛肉、优质乳品烘焙大包装'
  }
];

export interface PurchaseItem {
  id: string;
  name: string;
  amount: number | string;
  unit: string;
  category?: string;
  checked?: boolean; // whether already in pantry
  recipeTitle?: string;
}
