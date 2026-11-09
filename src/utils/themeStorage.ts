export type AppTheme = 'light' | 'dark' | 'kraft' | 'matcha';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  previewColor: string;
  icon: string;
  desc: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    name: '暖阳宣纸 (经典浅色)',
    previewColor: '#FAF7F2',
    icon: '☀️',
    desc: '温润奶白纸质，还原手作手帐质感'
  },
  {
    id: 'dark',
    name: '深夜小馆 (黑曜深色)',
    previewColor: '#171412',
    icon: '🌙',
    desc: '静谧深夜氛围，护眼舒适省电'
  },
  {
    id: 'kraft',
    name: '岁月牛皮纸 (复古泛黄)',
    previewColor: '#EAE1D0',
    icon: '📜',
    desc: '复古暖棕纸香，老菜谱时光韵味'
  },
  {
    id: 'matcha',
    name: '和风竹青 (抹茶雅致)',
    previewColor: '#F1F4ED',
    icon: '🍵',
    desc: '清新鲜活绿意，身心熨帖舒朗'
  }
];

const THEME_KEY = 'food_journal_app_theme_v1';

export function getSavedTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(THEME_KEY) as AppTheme;
    if (saved && ['light', 'dark', 'kraft', 'matcha'].includes(saved)) {
      return saved;
    }
  } catch {}
  return 'light';
}

export function applyTheme(theme: AppTheme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }));
  } catch (e) {
    console.error('Failed to apply theme', e);
  }
}
