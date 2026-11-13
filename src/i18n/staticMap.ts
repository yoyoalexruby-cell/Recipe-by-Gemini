import { SupportedLanguage } from './types';

export interface StaticTranslationEntry {
  'zh-CN': string;
  'en-US': string;
  'ja-JP'?: string;
  'fr-FR'?: string;
  'es-ES'?: string;
}

export const STATIC_UI_MAP: Record<string, StaticTranslationEntry> = {
  // Navigation & Core Menu
  '厨神大赛': {
    'zh-CN': '厨神大赛',
    'en-US': 'Chef Contest',
    'ja-JP': '料理対決',
    'fr-FR': 'Concours de Chefs',
    'es-ES': 'Concurso de Chefs'
  },
  '个人中心': {
    'zh-CN': '个人中心',
    'en-US': 'Personal Center',
    'ja-JP': 'マイページ',
    'fr-FR': 'Mon Compte',
    'es-ES': 'Centro Personal'
  },
  '个人主页': {
    'zh-CN': '个人主页',
    'en-US': 'Profile',
    'ja-JP': 'プロフィール',
    'fr-FR': 'Mon Profil',
    'es-ES': 'Mi Perfil'
  },
  '我的手帐': {
    'zh-CN': '我的手帐',
    'en-US': 'My Journal',
    'ja-JP': 'マイ手帳',
    'fr-FR': 'Mon Carnet',
    'es-ES': 'Mi Cuaderno'
  },
  '烹饪日历': {
    'zh-CN': '烹饪日历',
    'en-US': 'Calendar',
    'ja-JP': '料理カレンダー',
    'fr-FR': 'Calendrier',
    'es-ES': 'Calendario'
  },
  '食味广场': {
    'zh-CN': '食味广场',
    'en-US': 'Community',
    'ja-JP': '料理広場',
    'fr-FR': 'Communauté',
    'es-ES': 'Comunidad'
  },
  '下厨制作': {
    'zh-CN': '下厨制作',
    'en-US': 'Workbench',
    'ja-JP': '調理モード',
    'fr-FR': 'En Cuisine',
    'es-ES': 'Modo Cocinar'
  },
  '心得墙': {
    'zh-CN': '心得墙',
    'en-US': 'Reflections Wall',
    'ja-JP': '感想ノート',
    'fr-FR': 'Carnet de Notes',
    'es-ES': 'Notas y Diario'
  },
  '备份管理': {
    'zh-CN': '备份管理',
    'en-US': 'Backup & Sync',
    'ja-JP': 'バックアップ',
    'fr-FR': 'Sauvegarde',
    'es-ES': 'Copia de Seguridad'
  },
  '记新菜谱': {
    'zh-CN': '记新菜谱',
    'en-US': 'New Recipe',
    'ja-JP': 'レシピを書く',
    'fr-FR': 'Nouvelle Recette',
    'es-ES': 'Nueva Receta'
  },
  '新建私房食谱': {
    'zh-CN': '新建私房食谱',
    'en-US': 'New Recipe',
    'ja-JP': '新規レシピ',
    'fr-FR': 'Nouvelle Recette',
    'es-ES': 'Nueva Receta'
  },
  '登录 / 注册': {
    'zh-CN': '登录 / 注册',
    'en-US': 'Sign In / Register',
    'ja-JP': 'ログイン / 登録',
    'fr-FR': 'Connexion / Inscription',
    'es-ES': 'Iniciar Sesión / Registro'
  },
  '登录': {
    'zh-CN': '登录',
    'en-US': 'Sign In',
    'ja-JP': 'ログイン',
    'fr-FR': 'Connexion',
    'es-ES': 'Iniciar Sesión'
  },
  '注册': {
    'zh-CN': '注册',
    'en-US': 'Register',
    'ja-JP': '登録',
    'fr-FR': 'Inscription',
    'es-ES': 'Registro'
  },
  '退出登录': {
    'zh-CN': '退出登录',
    'en-US': 'Log Out',
    'ja-JP': 'ログアウト',
    'fr-FR': 'Déconnexion',
    'es-ES': 'Cerrar Sesión'
  },
  '安装App': {
    'zh-CN': '安装App',
    'en-US': 'Install App',
    'ja-JP': 'アプリを導入',
    'fr-FR': "Installer l'App",
    'es-ES': 'Instalar App'
  },
  '分享App': {
    'zh-CN': '分享App',
    'en-US': 'Share App',
    'ja-JP': 'アプリを共有',
    'fr-FR': "Partager l'App",
    'es-ES': 'Compartir App'
  },
  'GitHub 备份': {
    'zh-CN': 'GitHub 备份',
    'en-US': 'GitHub Backup',
    'ja-JP': 'GitHub連携',
    'fr-FR': 'Sauvegarde GitHub',
    'es-ES': 'Copia en GitHub'
  },

  // Publishing & Buttons
  '发布': {
    'zh-CN': '发布',
    'en-US': 'Publish',
    'ja-JP': '投稿',
    'fr-FR': 'Publier',
    'es-ES': 'Publicar'
  },
  '立即发布': {
    'zh-CN': '立即发布',
    'en-US': 'Publish Now',
    'ja-JP': '今すぐ投稿',
    'fr-FR': 'Publier Maintenant',
    'es-ES': 'Publicar Ahora'
  },
  '发布菜谱': {
    'zh-CN': '发布菜谱',
    'en-US': 'Publish Recipe',
    'ja-JP': 'レシピを投稿',
    'fr-FR': 'Publier la Recette',
    'es-ES': 'Publicar Receta'
  },
  '发布手帐': {
    'zh-CN': '发布手帐',
    'en-US': 'Publish Journal',
    'ja-JP': '手帳を投稿',
    'fr-FR': 'Publier le Carnet',
    'es-ES': 'Publicar Cuaderno'
  },
  '公开发布': {
    'zh-CN': '公开发布',
    'en-US': 'Public',
    'ja-JP': '一般公開',
    'fr-FR': 'Public',
    'es-ES': 'Público'
  },
  '保存入手帐': {
    'zh-CN': '保存入手帐',
    'en-US': 'Save to Journal',
    'ja-JP': '手帳に保存',
    'fr-FR': 'Enregistrer au Carnet',
    'es-ES': 'Guardar en Cuaderno'
  },
  '保存': {
    'zh-CN': '保存',
    'en-US': 'Save',
    'ja-JP': '保存',
    'fr-FR': 'Enregistrer',
    'es-ES': 'Guardar'
  },
  '取消': {
    'zh-CN': '取消',
    'en-US': 'Cancel',
    'ja-JP': 'キャンセル',
    'fr-FR': 'Annuler',
    'es-ES': 'Cancelar'
  },
  '编辑': {
    'zh-CN': '编辑',
    'en-US': 'Edit',
    'ja-JP': '編集',
    'fr-FR': 'Modifier',
    'es-ES': 'Editar'
  },
  '删除': {
    'zh-CN': '删除',
    'en-US': 'Delete',
    'ja-JP': '削除',
    'fr-FR': 'Supprimer',
    'es-ES': 'Eliminar'
  },
  '复制': {
    'zh-CN': '复制',
    'en-US': 'Copy',
    'ja-JP': 'コピー',
    'fr-FR': 'Copier',
    'es-ES': 'Copiar'
  },
  '重置': {
    'zh-CN': '重置',
    'en-US': 'Reset',
    'ja-JP': 'リセット',
    'fr-FR': 'Réinitialiser',
    'es-ES': 'Restablecer'
  },
  '搜索': {
    'zh-CN': '搜索',
    'en-US': 'Search',
    'ja-JP': '検索',
    'fr-FR': 'Rechercher',
    'es-ES': 'Buscar'
  },
  '筛选': {
    'zh-CN': '筛选',
    'en-US': 'Filter',
    'ja-JP': '絞り込み',
    'fr-FR': 'Filtrer',
    'es-ES': 'Filtrar'
  },
  '关闭': {
    'zh-CN': '关闭',
    'en-US': 'Close',
    'ja-JP': '閉じる',
    'fr-FR': 'Fermer',
    'es-ES': 'Cerrar'
  },
  '打卡下厨': {
    'zh-CN': '打卡下厨',
    'en-US': 'Mark Cooked',
    'ja-JP': '調理記録をつける',
    'fr-FR': "Cuisiné Aujourd'hui",
    'es-ES': 'Marcar como Cocinado'
  },
  '制作手帐卡': {
    'zh-CN': '制作手帐卡',
    'en-US': 'Share Card',
    'ja-JP': 'カード作成',
    'fr-FR': 'Carte Recette',
    'es-ES': 'Crear Tarjeta'
  },
  '制作长图卡': {
    'zh-CN': '制作长图卡',
    'en-US': 'Share Card',
    'ja-JP': 'カード作成',
    'fr-FR': 'Carte Recette',
    'es-ES': 'Crear Tarjeta'
  },
  '复制链接': {
    'zh-CN': '复制链接',
    'en-US': 'Copy Link',
    'ja-JP': 'リンクをコピー',
    'fr-FR': 'Copier le Lien',
    'es-ES': 'Copiar Enlace'
  },
  '已复制链接！': {
    'zh-CN': '已复制链接！',
    'en-US': 'Copied Link!',
    'ja-JP': 'コピー完了！',
    'fr-FR': 'Lien Copié !',
    'es-ES': '¡Enlace Copiado!'
  },
  '收进手帐': {
    'zh-CN': '收进手帐',
    'en-US': 'Save to Journal',
    'ja-JP': '手帳に保存',
    'fr-FR': 'Enregistrer au Carnet',
    'es-ES': 'Guardar en Cuaderno'
  },
  '收进我的手帐': {
    'zh-CN': '收进我的手帐',
    'en-US': 'Save to Journal',
    'ja-JP': '手帳に保存',
    'fr-FR': 'Enregistrer au Carnet',
    'es-ES': 'Guardar en Cuaderno'
  },
  '已收录！': {
    'zh-CN': '已收录！',
    'en-US': 'Saved to Journal!',
    'ja-JP': '保存済み！',
    'fr-FR': 'Enregistré !',
    'es-ES': '¡Guardado!'
  },
  '已克隆到我的手帐！': {
    'zh-CN': '已克隆到我的手帐！',
    'en-US': 'Saved to Journal!',
    'ja-JP': '保存済み！',
    'fr-FR': 'Enregistré !',
    'es-ES': '¡Guardado!'
  },
  '一键选购': {
    'zh-CN': '一键选购',
    'en-US': 'Buy Ingredients',
    'ja-JP': '材料を購入',
    'fr-FR': 'Acheter les Ingrédients',
    'es-ES': 'Comprar Ingredientes'
  },
  '生成打印版手帐': {
    'zh-CN': '生成打印版手帐',
    'en-US': 'Printable Journal',
    'ja-JP': '印刷用手帳を作成',
    'fr-FR': 'Version Imprimable',
    'es-ES': 'Versión Imprimible'
  },

  // Contest Arena
  '参与打擂': {
    'zh-CN': '参与打擂',
    'en-US': 'Enter Contest',
    'ja-JP': '対決に参加',
    'fr-FR': 'Participer au Concours',
    'es-ES': 'Participar'
  },
  '参与打擂 · 提交我的参赛手帐': {
    'zh-CN': '参与打擂 · 提交我的参赛手帐',
    'en-US': 'Submit My Contest Entry',
    'ja-JP': '料理対決に参加・手帳を提出',
    'fr-FR': 'Participer et Soumettre ma Recette',
    'es-ES': 'Participar y Enviar Receta'
  },
  '提交参赛手帐': {
    'zh-CN': '提交参赛手帐',
    'en-US': 'Submit Contest Entry',
    'ja-JP': '手帳を提出',
    'fr-FR': 'Soumettre la Recette',
    'es-ES': 'Enviar Receta'
  },
  '确认提交参赛': {
    'zh-CN': '确认提交参赛',
    'en-US': 'Confirm Submission',
    'ja-JP': '提出を確定',
    'fr-FR': 'Confirmer la Soumission',
    'es-ES': 'Confirmar Envío'
  },
  '立即提交我的手帐': {
    'zh-CN': '立即提交我的手帐',
    'en-US': 'Submit My Entry',
    'ja-JP': '今すぐ手帳を提出',
    'fr-FR': 'Soumettre Mon Carnet',
    'es-ES': 'Enviar Mi Entrada'
  },
  '打榜作品榜单': {
    'zh-CN': '打榜作品榜单',
    'en-US': 'Contest Leaderboard',
    'ja-JP': 'ランキング一覧',
    'fr-FR': 'Classement du Concours',
    'es-ES': 'Clasificación'
  },
  '厨神大赛打擂': {
    'zh-CN': '厨神大赛打擂',
    'en-US': 'Master Chef Contest',
    'ja-JP': '料理対決に参加',
    'fr-FR': 'Participer au Concours',
    'es-ES': 'Participar en Concurso'
  },
  '发表点评': {
    'zh-CN': '发表点评',
    'en-US': 'Post Review',
    'ja-JP': '感想を投稿',
    'fr-FR': 'Publier un Avis',
    'es-ES': 'Publicar Reseña'
  },
  '登录后点评': {
    'zh-CN': '登录后点评',
    'en-US': 'Sign In to Review',
    'ja-JP': 'ログインして感想を書く',
    'fr-FR': 'Connectez-vous pour donner un avis',
    'es-ES': 'Inicia sesión para reseñar'
  },
  '暖胃点赞': {
    'zh-CN': '暖胃点赞',
    'en-US': 'Warm Kudos',
    'ja-JP': 'いいね',
    'fr-FR': 'Coup de Cœur',
    'es-ES': 'Me Gusta'
  },
  '浏览广场灵感': {
    'zh-CN': '浏览广场灵感',
    'en-US': 'Explore Community',
    'ja-JP': '料理広場を見る',
    'fr-FR': 'Explorer la Communauté',
    'es-ES': 'Explorar Comunidad'
  },
  '去食味广场找灵感': {
    'zh-CN': '去食味广场找灵感',
    'en-US': 'Explore Community',
    'ja-JP': '料理広場を見る',
    'fr-FR': 'Explorer la Communauté',
    'es-ES': 'Explorar Comunidad'
  },

  // Categories & Subcategories
  '全部美食': {
    'zh-CN': '全部美食',
    'en-US': 'All Cuisines',
    'ja-JP': '全ての料理',
    'fr-FR': 'Toutes les Recettes',
    'es-ES': 'Todas las Recetas'
  },
  '全部菜系': {
    'zh-CN': '全部菜系',
    'en-US': 'All Cuisines',
    'ja-JP': '全ての料理',
    'fr-FR': 'Toutes les Recettes',
    'es-ES': 'Todas las Recetas'
  },
  '全部细分': {
    'zh-CN': '全部细分',
    'en-US': 'All Subcategories',
    'ja-JP': '全てのサブカテゴリ',
    'fr-FR': 'Toutes les Sous-catégories',
    'es-ES': 'Todas las Subcategorías'
  },
  '自定义名录': {
    'zh-CN': '自定义名录',
    'en-US': 'Custom Categories',
    'ja-JP': 'カスタムカテゴリ',
    'fr-FR': 'Catégories Personnalisées',
    'es-ES': 'Categorías Personalizadas'
  },
  '添加细分': {
    'zh-CN': '添加细分',
    'en-US': 'Add Subcategory',
    'ja-JP': 'サブカテゴリ追加',
    'fr-FR': 'Ajouter Sous-catégorie',
    'es-ES': 'Añadir Subcategoría'
  },
  '甜点细分直达：': {
    'zh-CN': '甜点细分直达：',
    'en-US': 'Dessert Quick Access:',
    'ja-JP': 'スイーツ一覧：',
    'fr-FR': 'Accès Desserts :',
    'es-ES': 'Acceso Postres:'
  },
  '细分：': {
    'zh-CN': '细分：',
    'en-US': 'Subcategories:',
    'ja-JP': 'サブカテゴリ：',
    'fr-FR': 'Sous-catégories :',
    'es-ES': 'Subcategorías:'
  },

  // Profile, Achievements & Shop
  '厨神成就墙': {
    'zh-CN': '厨神成就墙',
    'en-US': 'Chef Achievements Wall',
    'ja-JP': '実績メダル一覧',
    'fr-FR': 'Mur des Trophées',
    'es-ES': 'Muro de Trofeos'
  },
  '查看全部勋章': {
    'zh-CN': '查看全部勋章',
    'en-US': 'View All Medals',
    'ja-JP': 'すべてのメダルを見る',
    'fr-FR': 'Voir Tous les Trophées',
    'es-ES': 'Ver Todos los Trofeos'
  },
  '换装工坊': {
    'zh-CN': '换装工坊',
    'en-US': 'Avatar Workshop',
    'ja-JP': 'アトリエ',
    'fr-FR': 'Atelier Avatars',
    'es-ES': 'Taller de Avatares'
  },
  '修改个人资料': {
    'zh-CN': '修改个人资料',
    'en-US': 'Edit Profile',
    'ja-JP': 'プロフィール編集',
    'fr-FR': 'Modifier Profil',
    'es-ES': 'Editar Perfil'
  },
  '保存修改': {
    'zh-CN': '保存修改',
    'en-US': 'Save Changes',
    'ja-JP': '変更を保存',
    'fr-FR': 'Enregistrer',
    'es-ES': 'Guardar Cambios'
  },
  '等级与成长': {
    'zh-CN': '等级与成长',
    'en-US': 'Levels & Growth',
    'ja-JP': 'レベルと成長',
    'fr-FR': 'Niveaux & Progression',
    'es-ES': 'Niveles y Progreso'
  },
  '大厨会员与等级成长': {
    'zh-CN': '大厨会员与等级成长',
    'en-US': 'Chef Membership & Level',
    'ja-JP': '会員レベルと成長',
    'fr-FR': 'Adhésion & Niveau de Chef',
    'es-ES': 'Membresía y Nivel de Chef'
  },
  '筛选收藏': {
    'zh-CN': '筛选收藏',
    'en-US': 'Favorites',
    'ja-JP': 'お気に入り',
    'fr-FR': 'Favoris',
    'es-ES': 'Favoritos'
  },
  '只看常做收藏': {
    'zh-CN': '只看常做收藏',
    'en-US': 'Favorites Only',
    'ja-JP': 'お気に入りのみ',
    'fr-FR': 'Favoris Uniquement',
    'es-ES': 'Solo Favoritos'
  },
  // Category & Taxonomy Manager
  '自定义菜谱名录 · 分类管理': {
    'zh-CN': '自定义菜谱名录 · 分类管理',
    'en-US': 'Custom Recipe Catalog · Category Manager',
    'ja-JP': 'カスタムレシピ目録・カテゴリ管理',
    'fr-FR': 'Catalogue Personnalisé · Gestion des Catégories',
    'es-ES': 'Catálogo Personalizado · Gestión de Categorías'
  },
  '随心扩充一级大类与二级细分，打造贴合个人烹饪习惯的名录索引': {
    'zh-CN': '随心扩充一级大类与二级细分，打造贴合个人烹饪习惯的名录索引',
    'en-US': 'Expand categories and subcategories to tailor recipe indices to your cooking style',
    'ja-JP': 'カテゴリと細分を自由に拡張し、独自の料理目録を作成',
    'fr-FR': 'Étendez les catégories et sous-catégories selon vos habitudes culinaires',
    'es-ES': 'Amplía categorías y subcategorías según tus hábitos de cocina'
  },
  '添加二级细分名录': {
    'zh-CN': '添加二级细分名录',
    'en-US': 'Add Subcategory',
    'ja-JP': 'サブカテゴリを追加',
    'fr-FR': 'Ajouter une Sous-catégorie',
    'es-ES': 'Añadir Subcategoría'
  },
  '新建一级大类名录': {
    'zh-CN': '新建一级大类名录',
    'en-US': 'New Primary Category',
    'ja-JP': 'メインカテゴリを新規作成',
    'fr-FR': 'Nouvelle Catégorie Principale',
    'es-ES': 'Nueva Categoría Principal'
  },
  '名录总览与管理': {
    'zh-CN': '名录总览与管理',
    'en-US': 'Catalog Overview & Manage',
    'ja-JP': '目録一覧と管理',
    'fr-FR': 'Aperçu & Gestion du Catalogue',
    'es-ES': 'Resumen y Gestión del Catálogo'
  },
  '归属的一级分类': {
    'zh-CN': '归属的一级分类',
    'en-US': 'Parent Category',
    'ja-JP': '親カテゴリ',
    'fr-FR': 'Catégorie Parente',
    'es-ES': 'Categoría Principal'
  },
  '细分名录名称': {
    'zh-CN': '细分名录名称',
    'en-US': 'Subcategory Name',
    'ja-JP': 'サブカテゴリ名',
    'fr-FR': 'Nom de la Sous-catégorie',
    'es-ES': 'Nombre de la Subcategoría'
  },
  '选择图标 / Emoji': {
    'zh-CN': '选择图标 / Emoji',
    'en-US': 'Select Icon / Emoji',
    'ja-JP': 'アイコン/絵文字を選択',
    'fr-FR': 'Choisir une Icône / Émoji',
    'es-ES': 'Elegir Icono / Emoji'
  },
  '当前图标：': {
    'zh-CN': '当前图标：',
    'en-US': 'Current Icon:',
    'ja-JP': '現在のアイコン：',
    'fr-FR': 'Icône Actuelle :',
    'es-ES': 'Icono Actual:'
  },
  '可直接输入任意表情符号': {
    'zh-CN': '可直接输入任意表情符号',
    'en-US': 'Enter any emoji directly',
    'ja-JP': '絵文字を直接入力できます',
    'fr-FR': 'Vous pouvez saisir n\'importe quel émoji',
    'es-ES': 'Puedes escribir cualquier emoji directamente'
  },
  '细分说明 / 特色代表（可选）': {
    'zh-CN': '细分说明 / 特色代表（可选）',
    'en-US': 'Description / Highlights (Optional)',
    'ja-JP': '説明 / 特徴（任意）',
    'fr-FR': 'Description / Points Forts (Optionnel)',
    'es-ES': 'Descripción / Destacados (Opcional)'
  },
  '大类名录名称': {
    'zh-CN': '大类名录名称',
    'en-US': 'Category Name',
    'ja-JP': 'カテゴリ名',
    'fr-FR': 'Nom de la Catégorie',
    'es-ES': 'Nombre de la Categoría'
  },
  '选择大类图标 / Emoji': {
    'zh-CN': '选择大类图标 / Emoji',
    'en-US': 'Select Category Icon / Emoji',
    'ja-JP': 'カテゴリ絵文字を選択',
    'fr-FR': 'Choisir l\'Icône de Catégorie',
    'es-ES': 'Elegir Icono de Categoría'
  },
  '名录简介（可选）': {
    'zh-CN': '名录简介（可选）',
    'en-US': 'Description (Optional)',
    'ja-JP': '目録の説明（任意）',
    'fr-FR': 'Description (Optionnel)',
    'es-ES': 'Descripción (Opcional)'
  },
  '创建一级名录': {
    'zh-CN': '创建一级名录',
    'en-US': 'Create Category',
    'ja-JP': 'カテゴリを作成',
    'fr-FR': 'Créer la Catégorie',
    'es-ES': 'Crear Categoría'
  },
  '自定义大类': {
    'zh-CN': '自定义大类',
    'en-US': 'Custom Category',
    'ja-JP': 'カスタムカテゴリ',
    'fr-FR': 'Catégorie Personnalisée',
    'es-ES': 'Categoría Personalizada'
  },
  '系统内置': {
    'zh-CN': '系统内置',
    'en-US': 'System Built-in',
    'ja-JP': 'システム標準',
    'fr-FR': 'Intégré au Système',
    'es-ES': 'Predeterminado del Sistema'
  },
  '厨友灵感广场 · 烟火人间': {
    'zh-CN': '厨友灵感广场 · 烟火人间',
    'en-US': 'Foodies & Flavors · Culinary Inspiration',
    'ja-JP': '食のひらめき広場・心温まる食卓',
    'fr-FR': 'Place des Gourmets · Inspiration Culinaire',
    'es-ES': 'Plaza Gourmet · Inspiración Culinaria'
  },
  '食味广场：看大家今天都在做什么好吃的': {
    'zh-CN': '食味广场：看大家今天都在做什么好吃的',
    'en-US': 'Culinary Square: See what delicious food everyone is cooking today',
    'ja-JP': '料理広場：みんなが今日作った美味しいもの',
    'fr-FR': 'Place Culinaire : Découvrez ce que chacun cuisine aujourd\'hui',
    'es-ES': 'Plaza Culinaria: Mira qué delicias cocina la comunidad hoy'
  },
  '搜索广场公开菜谱、作者、食材...': {
    'zh-CN': '搜索广场公开菜谱、作者、食材...',
    'en-US': 'Search community recipes, chefs, ingredients...',
    'ja-JP': '公開レシピ、料理人、食材を検索...',
    'fr-FR': 'Rechercher des recettes, auteurs, ingrédients...',
    'es-ES': 'Buscar recetas, autores, ingredientes...'
  },
  '搜索广场公开菜谱': {
    'zh-CN': '搜索广场公开菜谱',
    'en-US': 'Search community recipes',
    'ja-JP': '公開レシピを検索',
    'fr-FR': 'Rechercher des recettes',
    'es-ES': 'Buscar recetas comunitarias'
  },
  '分享App (微信/二维码)': {
    'zh-CN': '分享App (微信/二维码)',
    'en-US': 'Share App (QR / Link)',
    'ja-JP': 'アプリをシェア (QR/リンク)',
    'fr-FR': 'Partager l\'App (QR / Lien)',
    'es-ES': 'Compartir App (QR / Enlace)'
  },
  '多端支持：安卓 · 苹果 · 微信小程序 · 网页': {
    'zh-CN': '多端支持：安卓 · 苹果 · 微信小程序 · 网页',
    'en-US': 'Multi-Platform: iOS · Android · Mini Program · Web',
    'ja-JP': 'マルチ対応：iOS・Android・WeChat・Web',
    'fr-FR': 'Multiplateforme : iOS · Android · Mini-Programme · Web',
    'es-ES': 'Multiplataforma: iOS · Android · Mini Programa · Web'
  },
  '《隐私保护政策》': {
    'zh-CN': '《隐私保护政策》',
    'en-US': 'Privacy Policy',
    'ja-JP': '「プライバシーポリシー」',
    'fr-FR': 'Politique de Confidentialité',
    'es-ES': 'Política de Privacidad'
  },
  '《用户服务协议》': {
    'zh-CN': '《用户服务协议》',
    'en-US': 'Terms of Service',
    'ja-JP': '「利用規約」',
    'fr-FR': 'Conditions d\'Utilisation',
    'es-ES': 'Términos de Servicio'
  },
  '《权限与个人信息清单》': {
    'zh-CN': '《权限与个人信息清单》',
    'en-US': 'Permissions & Personal Data',
    'ja-JP': '「権限と個人情報リスト」',
    'fr-FR': 'Autorisations & Données Personnelles',
    'es-ES': 'Permisos y Datos Personales'
  },
  '账号注销与数据导出': {
    'zh-CN': '账号注销与数据导出',
    'en-US': 'Account Deletion & Data Export',
    'ja-JP': 'アカウント削除とデータ出力',
    'fr-FR': 'Suppression de Compte & Export',
    'es-ES': 'Cancelación de Cuenta y Exportación'
  },
  '“人间烟火气，最抚凡人心”': {
    'zh-CN': '“人间烟火气，最抚凡人心”',
    'en-US': '“Good food warms the heart and hearth”',
    'ja-JP': '「温もりあふれる食卓、心安らぐ時間」',
    'fr-FR': '« Les saveurs du quotidien réchauffent le cœur »',
    'es-ES': '«La buena cocina reconforta el alma»'
  },
  '❖ 食味手记': {
    'zh-CN': '❖ 食味手记',
    'en-US': '❖ Culinary Journal',
    'ja-JP': '❖ 食味手記',
    'fr-FR': '❖ Journal Culinaire',
    'es-ES': '❖ Cuaderno Culinario'
  },
  // Annual Cooking Review & Posters
  '年度烹饪回顾': {
    'zh-CN': '年度烹饪回顾',
    'en-US': 'Year in Review',
    'ja-JP': '年間料理レビュー',
    'fr-FR': 'Bilan Culinaire Annuel',
    'es-ES': 'Resumen Culinario Anual'
  },
  '生成年度数据海报': {
    'zh-CN': '生成年度数据海报',
    'en-US': 'Generate Annual Poster',
    'ja-JP': '年間ポスターを生成',
    'fr-FR': 'Générer l\'Affiche Annuelle',
    'es-ES': 'Generar Póster Anual'
  },
  '年度厨神数据海报': {
    'zh-CN': '年度厨神数据海报',
    'en-US': 'Annual Chef Data Poster',
    'ja-JP': '年間シェフデータポスター',
    'fr-FR': 'Affiche Culinaire du Chef',
    'es-ES': 'Póster de Datos del Chef'
  },
  '导入手帐制作': {
    'zh-CN': '导入手帐制作',
    'en-US': 'Import Recipe',
    'ja-JP': 'レシピを取り込む',
    'fr-FR': 'Importer la Recette',
    'es-ES': 'Importar Receta'
  },
  '导入手帐进入下厨工作台': {
    'zh-CN': '导入手帐进入下厨工作台',
    'en-US': 'Import Recipe to Workbench',
    'ja-JP': '調理ワークベンチに手記を取り込む',
    'fr-FR': 'Importer la Recette dans l\'Atelier',
    'es-ES': 'Importar Receta al Banco de Cocina'
  },
  '我的私房手帐': {
    'zh-CN': '我的私房手帐',
    'en-US': 'My Handbooks',
    'ja-JP': 'マイクッキング手記',
    'fr-FR': 'Mes Carnets Culinaires',
    'es-ES': 'Mis Cuadernos Privados'
  },
  '广场收藏与收录': {
    'zh-CN': '广场收藏与收录',
    'en-US': 'Saved Community Dishes',
    'ja-JP': '保存・収録された手記',
    'fr-FR': 'Plats Enregistrés de la Communauté',
    'es-ES': 'Platos Guardados de la Comunidad'
  },
  '食味广场精选': {
    'zh-CN': '食味广场精选',
    'en-US': 'Explore Food Square',
    'ja-JP': '食味広場の厳選レシピ',
    'fr-FR': 'Sélection de la Place Gourmande',
    'es-ES': 'Selección de la Plaza Culinaria'
  },
  '导入并编辑': {
    'zh-CN': '导入并编辑',
    'en-US': 'Import & Edit',
    'ja-JP': '取り込んで編集',
    'fr-FR': 'Importer et Modifier',
    'es-ES': 'Importar y Editar'
  },
  '导入工作台': {
    'zh-CN': '导入工作台',
    'en-US': 'Import to Cook',
    'ja-JP': 'ワークベンチに取り込む',
    'fr-FR': 'Importer dans l\'Atelier',
    'es-ES': 'Importar a la Cocina'
  },
  '编辑此手帐': {
    'zh-CN': '编辑此手帐',
    'en-US': 'Edit Recipe',
    'ja-JP': 'この手記を編集',
    'fr-FR': 'Modifier cette Recette',
    'es-ES': 'Editar este Cuaderno'
  },
  '定制复刻此菜': {
    'zh-CN': '定制复刻此菜',
    'en-US': 'Fork & Customize',
    'ja-JP': '複製してカスタマイズ',
    'fr-FR': 'Dupliquer et Personnaliser',
    'es-ES': 'Replicar y Personalizar'
  },
  '下载年度烹饪纪念版 PDF': {
    'zh-CN': '下载年度烹饪纪念版 PDF',
    'en-US': 'Download Commemorative PDF',
    'ja-JP': '記念版PDFをダウンロード',
    'fr-FR': 'Télécharger le PDF Commémoratif',
    'es-ES': 'Descargar PDF Conmemorativo'
  },
  '纪念版手帐 PDF': {
    'zh-CN': '纪念版手帐 PDF',
    'en-US': 'Annual PDF Report',
    'ja-JP': '記念版手記PDF',
    'fr-FR': 'Rapport Annuel PDF',
    'es-ES': 'Informe Anual en PDF'
  },
  '导入工作台制作': {
    'zh-CN': '导入工作台制作',
    'en-US': 'Cook in Workbench',
    'ja-JP': 'ワークベンチで調理',
    'fr-FR': 'Cuisiner dans l\'Atelier',
    'es-ES': 'Cocinar en el Banco'
  },
  '下厨微调与备忘': {
    'zh-CN': '下厨微调与备忘',
    'en-US': 'Cook Notes & Tweaks',
    'ja-JP': '調理メモ・微調整',
    'fr-FR': 'Notes et Ajustements de Cuisson',
    'es-ES': 'Ajustes y Notas de Cocina'
  },
  '保存修改至手帐': {
    'zh-CN': '保存修改至手帐',
    'en-US': 'Save to Recipe',
    'ja-JP': '手記に変更を保存',
    'fr-FR': 'Enregistrer les Modifications',
    'es-ES': 'Guardar Cambios en la Receta'
  }
};

// Global bidirectional reverse map from any translation value in any language to the entry
export const STATIC_REVERSE_MAP = new Map<string, StaticTranslationEntry>();
for (const entry of Object.values(STATIC_UI_MAP)) {
  for (const [lang, text] of Object.entries(entry)) {
    if (text) {
      STATIC_REVERSE_MAP.set(text.trim().toLowerCase(), entry);
    }
  }
}
