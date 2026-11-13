/**
 * Hand-Drawn Vector SVG Avatars for Chef Scrapbook
 * 20 distinct illustrated culinary characters rendered as high-fidelity SVG data URIs.
 * Guaranteed offline availability, zero network latency, and aesthetic hand-drawn scrapbook style.
 */

function svgToDataUri(svgContent: string): string {
  const cleanSvg = svgContent.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
}

export const AVATAR_SVG_MAP: Record<string, string> = {
  // 1. 高帽料理少年 (Toque Apprentice)
  chef_boy_cap: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <radialGradient id="bg_boy" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#FFF8E7"/>
          <stop offset="100%" stop-color="#F5E6CC"/>
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill="url(#bg_boy)" stroke="#D4A373" stroke-width="3"/>
      <!-- Body & Neck -->
      <path d="M48 140 C48 116 112 116 112 140 Z" fill="#E76F51" stroke="#2C2723" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M72 116 L88 116 L84 126 L76 126 Z" fill="#F4A261" stroke="#2C2723" stroke-width="2"/>
      <!-- Apron Strap -->
      <path d="M62 122 L76 140" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
      <path d="M98 122 L84 140" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
      <!-- Head -->
      <ellipse cx="80" cy="84" rx="28" ry="26" fill="#FCE5CD" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Ears -->
      <ellipse cx="52" cy="84" rx="5" ry="7" fill="#FCE5CD" stroke="#2C2723" stroke-width="2"/>
      <ellipse cx="108" cy="84" rx="5" ry="7" fill="#FCE5CD" stroke="#2C2723" stroke-width="2"/>
      <!-- Hair -->
      <path d="M52 76 C52 56 108 56 108 76 C102 70 96 68 88 70 C80 66 70 68 64 74 Z" fill="#78350F" stroke="#2C2723" stroke-width="2"/>
      <!-- Blush -->
      <ellipse cx="65" cy="90" rx="5" ry="3" fill="#F43F5E" opacity="0.4"/>
      <ellipse cx="95" cy="90" rx="5" ry="3" fill="#F43F5E" opacity="0.4"/>
      <!-- Eyes & Wink -->
      <circle cx="68" cy="82" r="3" fill="#2C2723"/>
      <path d="M90 82 Q94 77 98 82" stroke="#2C2723" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Smile -->
      <path d="M74 92 Q80 98 86 92" stroke="#2C2723" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Tall Chef Hat -->
      <path d="M56 64 C52 32 108 32 104 64 Z" fill="#FFFFFF" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M68 64 C64 42 74 38 78 64" stroke="#E2E8F0" stroke-width="2" fill="none"/>
      <path d="M82 64 C86 42 96 38 92 64" stroke="#E2E8F0" stroke-width="2" fill="none"/>
      <rect x="55" y="60" width="50" height="9" rx="3" fill="#C85A32" stroke="#2C2723" stroke-width="2"/>
      <!-- Little Spatula Badge -->
      <path d="M110 92 L124 106 M122 104 L130 96 C132 94 130 90 126 92 Z" stroke="#C85A32" stroke-width="2.5" stroke-linecap="round" fill="#FDBA74"/>
    </svg>
  `),

  // 2. 碎花围裙甜点娘 (Pastry Maiden)
  chef_girl_apron: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FFF0F5" stroke="#F472B6" stroke-width="3"/>
      <!-- Pastry Dress & Collar -->
      <path d="M46 142 C46 118 114 118 114 142 Z" fill="#FB7185" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M60 120 C70 135 90 135 100 120" stroke="#FFF" stroke-width="3" fill="#FFF"/>
      <!-- Hair Braids / Twin Buns -->
      <circle cx="48" cy="82" r="12" fill="#D97706" stroke="#2C2723" stroke-width="2"/>
      <circle cx="112" cy="82" r="12" fill="#D97706" stroke="#2C2723" stroke-width="2"/>
      <!-- Head -->
      <ellipse cx="80" cy="84" rx="27" ry="25" fill="#FFE4D6" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Bangs -->
      <path d="M55 76 C58 64 102 64 105 76 C98 70 92 68 80 72 C68 68 62 70 55 76 Z" fill="#D97706" stroke="#2C2723" stroke-width="2"/>
      <!-- Sweet Blush -->
      <circle cx="64" cy="90" r="4" fill="#FB7185" opacity="0.6"/>
      <circle cx="96" cy="90" r="4" fill="#FB7185" opacity="0.6"/>
      <!-- Big Sparkle Eyes -->
      <ellipse cx="68" cy="82" rx="3.5" ry="4" fill="#2C2723"/>
      <circle cx="67" cy="80.5" r="1.2" fill="#FFF"/>
      <ellipse cx="92" cy="82" rx="3.5" ry="4" fill="#2C2723"/>
      <circle cx="91" cy="80.5" r="1.2" fill="#FFF"/>
      <!-- Open Smile -->
      <path d="M75 92 Q80 97 85 92" stroke="#2C2723" stroke-width="2.5" stroke-linecap="round" fill="#F43F5E"/>
      <!-- Baker Puff Cap with Strawberry -->
      <path d="M56 62 C50 42 110 42 104 62 Z" fill="#FFFFFF" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M78 40 L82 36 M82 40 L78 36" stroke="#FB7185" stroke-width="2"/>
      <circle cx="80" cy="42" r="4" fill="#E11D48"/>
      <rect x="58" y="58" width="44" height="6" rx="3" fill="#FBCFE8" stroke="#2C2723" stroke-width="1.8"/>
      <!-- Whisk icon -->
      <path d="M30 110 L44 124 M38 104 C44 98 48 102 44 108" stroke="#FB7185" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),

  // 3. 八字胡私房老饕 (Mustache Gourmet)
  chef_mustache_gourmet: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FEF3C7" stroke="#D97706" stroke-width="3"/>
      <!-- Dark Red Chef Robe -->
      <path d="M45 142 C45 116 115 116 115 142 Z" fill="#991B1B" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M74 116 L80 135 L86 116 Z" fill="#FEF3C7" stroke="#2C2723" stroke-width="2"/>
      <!-- Round Head -->
      <ellipse cx="80" cy="82" rx="29" ry="27" fill="#FDE68A" stroke="#2C2723" stroke-width="2.5"/>
      <ellipse cx="50" cy="82" rx="4.5" ry="6" fill="#FDE68A" stroke="#2C2723" stroke-width="2"/>
      <ellipse cx="110" cy="82" rx="4.5" ry="6" fill="#FDE68A" stroke="#2C2723" stroke-width="2"/>
      <!-- Gray Hair on sides -->
      <path d="M51 75 C48 68 56 64 58 72" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>
      <path d="M109 75 C112 68 104 64 102 72" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>
      <!-- Round Glasses -->
      <circle cx="68" cy="78" r="9" fill="none" stroke="#2C2723" stroke-width="2"/>
      <circle cx="92" cy="78" r="9" fill="none" stroke="#2C2723" stroke-width="2"/>
      <path d="M77 78 L83 78" stroke="#2C2723" stroke-width="2"/>
      <circle cx="68" cy="78" r="2.5" fill="#2C2723"/>
      <circle cx="92" cy="78" r="2.5" fill="#2C2723"/>
      <!-- Majestic Curled Mustache -->
      <path d="M80 88 C76 84 64 82 60 88 C58 92 64 96 70 92 C74 90 78 90 80 92 C82 90 86 90 90 92 C96 96 102 92 100 88 C96 82 84 84 80 88 Z" fill="#334155" stroke="#2C2723" stroke-width="1.8"/>
      <!-- Happy Lower Chin -->
      <path d="M76 98 Q80 102 84 98" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Traditional Master Chef Cap -->
      <path d="M58 60 C54 36 106 36 102 60 Z" fill="#F8FAFC" stroke="#2C2723" stroke-width="2.5"/>
      <rect x="56" y="56" width="48" height="8" rx="2" fill="#B91C1C" stroke="#2C2723" stroke-width="2"/>
      <!-- Golden Wok Ladle -->
      <path d="M116 104 L132 120 M128 116 C136 112 138 122 130 126 Z" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" fill="#F59E0B"/>
    </svg>
  `),

  // 4. 头巾拉面匠人 (Ramen Artisan)
  chef_ramen_master: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#EEF2FF" stroke="#4F46E5" stroke-width="3"/>
      <!-- Deep Blue Kimono / Cook Jacket -->
      <path d="M46 142 C46 116 114 116 114 142 Z" fill="#1E1B4B" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M66 116 L80 134 L94 116" stroke="#E0E7FF" stroke-width="3" fill="none"/>
      <!-- Head -->
      <ellipse cx="80" cy="82" rx="27" ry="26" fill="#FCD34D" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Strong spirited eyebrows -->
      <path d="M62 74 L74 77" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round"/>
      <path d="M98 74 L86 77" stroke="#1E1B4B" stroke-width="3" stroke-linecap="round"/>
      <!-- Fierce determined eyes -->
      <ellipse cx="68" cy="82" rx="3.5" ry="3" fill="#1E1B4B"/>
      <ellipse cx="92" cy="82" rx="3.5" ry="3" fill="#1E1B4B"/>
      <!-- Confident grin -->
      <path d="M72 93 Q80 98 88 91" stroke="#2C2723" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Bandana / Tenugui Headband -->
      <rect x="52" y="60" width="56" height="12" rx="3" fill="#312E81" stroke="#2C2723" stroke-width="2.2"/>
      <path d="M52 64 L108 64" stroke="#818CF8" stroke-width="1.5" stroke-dasharray="3 3"/>
      <!-- Bandana Knot at side -->
      <circle cx="48" cy="66" r="4" fill="#312E81" stroke="#2C2723" stroke-width="1.5"/>
      <path d="M46 68 L40 76 M48 70 L46 80" stroke="#312E81" stroke-width="3" stroke-linecap="round"/>
      <!-- Chopsticks & Steaming Noodle Bowl Accent -->
      <ellipse cx="120" cy="116" rx="14" ry="8" fill="#DC2626" stroke="#2C2723" stroke-width="2"/>
      <path d="M112 110 Q116 102 120 110 Q124 102 128 110" stroke="#FDE68A" stroke-width="2" fill="none"/>
      <path d="M106 104 L134 94" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),

  // 5. 小酒馆风味主厨 (Bistro Head Chef)
  chef_bistro_gentle: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#F0FDF4" stroke="#16A34A" stroke-width="3"/>
      <!-- Olive Green Bistro Vest -->
      <path d="M46 142 C46 116 114 116 114 142 Z" fill="#14532D" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M72 116 L80 130 L88 116 Z" fill="#FEF08A" stroke="#2C2723" stroke-width="1.8"/>
      <!-- Face -->
      <ellipse cx="80" cy="82" rx="27" ry="26" fill="#FDE68A" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Neat hair -->
      <path d="M53 74 C53 60 107 60 107 74 Z" fill="#451A03" stroke="#2C2723" stroke-width="2"/>
      <!-- French Chic Beret Tilted -->
      <ellipse cx="86" cy="56" rx="28" ry="14" fill="#166534" stroke="#2C2723" stroke-width="2.2" transform="rotate(-8 86 56)"/>
      <circle cx="88" cy="42" r="3" fill="#166534"/>
      <!-- Gentle smiling eyes -->
      <path d="M64 80 Q69 76 74 80" stroke="#2C2723" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      <path d="M86 80 Q91 76 96 80" stroke="#2C2723" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      <!-- Mild blush -->
      <circle cx="65" cy="88" r="4" fill="#F87171" opacity="0.4"/>
      <circle cx="95" cy="88" r="4" fill="#F87171" opacity="0.4"/>
      <!-- Gentle Smile -->
      <path d="M75 90 Q80 95 85 90" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Rosemary / Basil sprig -->
      <path d="M112 100 Q122 92 126 104" stroke="#15803D" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="118" cy="94" r="3" fill="#86EFAC"/>
      <circle cx="124" cy="98" r="3" fill="#86EFAC"/>
    </svg>
  `),

  // 6. 笑面点心巧娘 (Dim Sum Artisan)
  chef_dimsum_auntie: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FFFBEB" stroke="#F59E0B" stroke-width="3"/>
      <!-- Floral Chinese Traditional Apron -->
      <path d="M46 142 C46 116 114 116 114 142 Z" fill="#DC2626" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M70 120 L80 134 L90 120" stroke="#FEF3C7" stroke-width="2.5" fill="none"/>
      <!-- Hair Bun with Jade Pin -->
      <circle cx="80" cy="46" r="14" fill="#18181B" stroke="#2C2723" stroke-width="2"/>
      <path d="M64 44 L96 44" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
      <!-- Chubby Joyful Face -->
      <ellipse cx="80" cy="84" rx="30" ry="27" fill="#FED7AA" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Rosy Cheeks -->
      <circle cx="62" cy="92" r="6" fill="#F43F5E" opacity="0.45"/>
      <circle cx="98" cy="92" r="6" fill="#F43F5E" opacity="0.45"/>
      <!-- Happy Crescent Eye Curves -->
      <path d="M64 80 Q70 74 76 80" stroke="#2C2723" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <path d="M84 80 Q90 74 96 80" stroke="#2C2723" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <!-- Warm Big Smile -->
      <path d="M73 94 Q80 102 87 94" stroke="#2C2723" stroke-width="2.5" stroke-linecap="round" fill="#E11D48"/>
      <!-- Bamboo Steamer Basket Accent -->
      <rect x="108" y="106" width="26" height="16" rx="3" fill="#D97706" stroke="#2C2723" stroke-width="1.8"/>
      <ellipse cx="121" cy="106" rx="13" ry="4" fill="#FDE68A" stroke="#2C2723" stroke-width="1.5"/>
      <circle cx="121" cy="104" r="3" fill="#FFF"/>
    </svg>
  `),

  // 7. 平底锅猫小厨 (Sous Chef Kitty)
  creature_cat_pan: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FFF7ED" stroke="#EA580C" stroke-width="3"/>
      <!-- Tabby Cat Ears -->
      <polygon points="52,66 40,40 68,52" fill="#F97316" stroke="#2C2723" stroke-width="2.5"/>
      <polygon points="50,62 44,46 62,54" fill="#FDE047"/>
      <polygon points="108,66 120,40 92,52" fill="#F97316" stroke="#2C2723" stroke-width="2.5"/>
      <polygon points="110,62 116,46 98,54" fill="#FDE047"/>
      <!-- Chubby Head -->
      <ellipse cx="80" cy="86" rx="33" ry="28" fill="#FB923C" stroke="#2C2723" stroke-width="2.5"/>
      <!-- White Muzzle -->
      <ellipse cx="80" cy="94" rx="16" ry="12" fill="#FFFFFF" stroke="#2C2723" stroke-width="1.5"/>
      <!-- Nose & Mouth -->
      <polygon points="80,89 77,86 83,86" fill="#F43F5E"/>
      <path d="M75 94 Q80 98 80 91 Q80 98 85 94" stroke="#2C2723" stroke-width="2" fill="none"/>
      <!-- Whiskers -->
      <path d="M50 88 L62 90 M48 95 L62 94" stroke="#2C2723" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M110 88 L98 90 M112 95 L98 94" stroke="#2C2723" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Huge Glossy Eyes -->
      <circle cx="67" cy="82" r="5" fill="#15803D"/>
      <circle cx="65.5" cy="80.5" r="1.8" fill="#FFF"/>
      <circle cx="93" cy="82" r="5" fill="#15803D"/>
      <circle cx="91.5" cy="80.5" r="1.8" fill="#FFF"/>
      <!-- Tiny Chef Hat tilted between ears -->
      <path d="M72 54 C66 38 94 38 88 54 Z" fill="#FFF" stroke="#2C2723" stroke-width="2"/>
      <rect x="70" y="52" width="20" height="5" rx="1.5" fill="#DC2626" stroke="#2C2723" stroke-width="1.2"/>
      <!-- Little Paws holding Mini Skillet with Fried Egg -->
      <circle cx="48" cy="116" r="12" fill="#1F2937" stroke="#2C2723" stroke-width="2"/>
      <path d="M38 122 L24 132" stroke="#1F2937" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="48" cy="116" rx="8" ry="6" fill="#FFF"/>
      <circle cx="48" cy="116" r="3.5" fill="#FBBF24"/>
      <!-- Paws -->
      <ellipse cx="62" cy="118" rx="6" ry="5" fill="#FFF" stroke="#2C2723" stroke-width="1.5"/>
      <ellipse cx="98" cy="118" rx="6" ry="5" fill="#FFF" stroke="#2C2723" stroke-width="1.5"/>
    </svg>
  `),

  // 8. 法棍柴犬烘焙师 (Baguette Shiba)
  creature_shiba_baker: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FEF9C3" stroke="#CA8A04" stroke-width="3"/>
      <!-- Shiba Ears -->
      <polygon points="50,64 42,36 68,52" fill="#EAB308" stroke="#2C2723" stroke-width="2.5"/>
      <polygon points="50,60 46,42 64,52" fill="#FEF08A"/>
      <polygon points="110,64 118,36 92,52" fill="#EAB308" stroke="#2C2723" stroke-width="2.5"/>
      <polygon points="110,60 114,42 96,52" fill="#FEF08A"/>
      <!-- Shiba Face -->
      <ellipse cx="80" cy="84" rx="34" ry="29" fill="#EAB308" stroke="#2C2723" stroke-width="2.5"/>
      <!-- White Cheeks & Muzzle -->
      <path d="M52 84 C52 108 108 108 108 84 C96 88 88 84 80 88 C72 84 64 88 52 84 Z" fill="#FFFFFF" stroke="#2C2723" stroke-width="1.5"/>
      <!-- White Eyebrow Dots -->
      <circle cx="66" cy="72" r="3.5" fill="#FFFFFF"/>
      <circle cx="94" cy="72" r="3.5" fill="#FFFFFF"/>
      <!-- Eyes -->
      <ellipse cx="68" cy="80" rx="3.5" ry="3" fill="#2C2723"/>
      <ellipse cx="92" cy="80" rx="3.5" ry="3" fill="#2C2723"/>
      <!-- Black Nose & Tongue -->
      <ellipse cx="80" cy="88" rx="4" ry="3" fill="#18181B"/>
      <path d="M78 94 Q80 100 82 94" stroke="#2C2723" stroke-width="2" fill="#FB7185"/>
      <!-- Red Bandana around neck -->
      <path d="M54 114 C66 126 94 126 106 114 L80 134 Z" fill="#DC2626" stroke="#2C2723" stroke-width="2"/>
      <circle cx="80" cy="120" r="2.5" fill="#FFF"/>
      <!-- Giant Crunchy French Baguette in Paws -->
      <g transform="rotate(-25 110 110)">
        <rect x="96" y="94" width="38" height="14" rx="7" fill="#D97706" stroke="#2C2723" stroke-width="2"/>
        <line x1="104" y1="96" x2="108" y2="106" stroke="#FEF3C7" stroke-width="2"/>
        <line x1="114" y1="96" x2="118" y2="106" stroke="#FEF3C7" stroke-width="2"/>
        <line x1="124" y1="96" x2="128" y2="106" stroke="#FEF3C7" stroke-width="2"/>
      </g>
    </svg>
  `),

  // 9. 慢炖砂锅小熊 (Stew Bear)
  creature_bear_stew: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FDF4FF" stroke="#A855F7" stroke-width="3"/>
      <!-- Round Bear Ears -->
      <circle cx="48" cy="54" r="14" fill="#78350F" stroke="#2C2723" stroke-width="2.5"/>
      <circle cx="48" cy="54" r="8" fill="#FBCFE8"/>
      <circle cx="112" cy="54" r="14" fill="#78350F" stroke="#2C2723" stroke-width="2.5"/>
      <circle cx="112" cy="54" r="8" fill="#FBCFE8"/>
      <!-- Chubby Bear Head -->
      <circle cx="80" cy="84" r="33" fill="#92400E" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Light Tan Muzzle -->
      <ellipse cx="80" cy="94" rx="17" ry="13" fill="#FDE68A" stroke="#2C2723" stroke-width="1.8"/>
      <!-- Big Black Snout -->
      <ellipse cx="80" cy="88" rx="5" ry="3.5" fill="#18181B"/>
      <path d="M76 96 Q80 100 84 96" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Sleepy / Gentle Button Eyes -->
      <circle cx="66" cy="78" r="3.5" fill="#18181B"/>
      <circle cx="94" cy="78" r="3.5" fill="#18181B"/>
      <!-- Gingham Cook Bib -->
      <path d="M52 118 C64 136 96 136 108 118" stroke="#DC2626" stroke-width="8" stroke-linecap="round" fill="none"/>
      <!-- Clay Stew Pot with Steam -->
      <ellipse cx="80" cy="132" rx="22" ry="12" fill="#7C2D12" stroke="#2C2723" stroke-width="2"/>
      <rect x="62" y="126" width="36" height="4" rx="2" fill="#B45309" stroke="#2C2723" stroke-width="1.2"/>
      <!-- Steam curves -->
      <path d="M72 118 Q70 110 74 104" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M86 118 Q88 110 84 104" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>
  `),

  // 10. 沏茶白兔点心师 (Teahouse Bunny)
  creature_rabbit_tea: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#F0FDF4" stroke="#22C55E" stroke-width="3"/>
      <!-- Long Bunny Ears -->
      <ellipse cx="60" cy="38" rx="10" ry="26" fill="#FFFFFF" stroke="#2C2723" stroke-width="2.5" transform="rotate(-10 60 38)"/>
      <ellipse cx="60" cy="38" rx="5" ry="18" fill="#FBCFE8" transform="rotate(-10 60 38)"/>
      <ellipse cx="100" cy="38" rx="10" ry="26" fill="#FFFFFF" stroke="#2C2723" stroke-width="2.5" transform="rotate(10 100 38)"/>
      <ellipse cx="100" cy="38" rx="5" ry="18" fill="#FBCFE8" transform="rotate(10 100 38)"/>
      <!-- Green Matcha Ribbon on Right Ear -->
      <circle cx="106" cy="48" r="5" fill="#15803D" stroke="#2C2723" stroke-width="1.5"/>
      <path d="M102 52 L96 60 M110 52 L116 60" stroke="#15803D" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Fluffy White Head -->
      <ellipse cx="80" cy="88" rx="30" ry="26" fill="#FFFFFF" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Pink Bunny Nose & Mouth -->
      <polygon points="80,91 77,88 83,88" fill="#F43F5E"/>
      <path d="M76 96 Q80 99 80 93 Q80 99 84 96" stroke="#2C2723" stroke-width="1.8" fill="none"/>
      <!-- Big Ruby Eyes -->
      <circle cx="68" cy="84" r="4.5" fill="#E11D48"/>
      <circle cx="66.5" cy="82.5" r="1.5" fill="#FFF"/>
      <circle cx="92" cy="84" r="4.5" fill="#E11D48"/>
      <circle cx="90.5" cy="82.5" r="1.5" fill="#FFF"/>
      <!-- Soft Pink Cheeks -->
      <circle cx="60" cy="94" r="5" fill="#FDA4AF" opacity="0.6"/>
      <circle cx="100" cy="94" r="5" fill="#FDA4AF" opacity="0.6"/>
      <!-- Teacup with Matcha Green Tea -->
      <path d="M70 126 C70 138 90 138 90 126 Z" fill="#F0FDF4" stroke="#2C2723" stroke-width="2"/>
      <ellipse cx="80" cy="126" rx="10" ry="3" fill="#16A34A"/>
    </svg>
  `),

  // 11. 刨冰企鹅冷盘手 (Popsicle Penguin)
  creature_penguin_ice: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#E0F2FE" stroke="#0284C7" stroke-width="3"/>
      <!-- Black Penguin Body -->
      <ellipse cx="80" cy="86" rx="34" ry="32" fill="#0F172A" stroke="#2C2723" stroke-width="2.5"/>
      <!-- White Belly/Face Patch -->
      <ellipse cx="80" cy="90" rx="22" ry="24" fill="#FFFFFF" stroke="#2C2723" stroke-width="1.8"/>
      <!-- Big Eyes -->
      <circle cx="70" cy="80" r="4.5" fill="#0F172A"/>
      <circle cx="68.5" cy="78.5" r="1.5" fill="#FFF"/>
      <circle cx="90" cy="80" r="4.5" fill="#0F172A"/>
      <circle cx="88.5" cy="78.5" r="1.5" fill="#FFF"/>
      <!-- Orange Beak -->
      <polygon points="80,90 73,84 87,84" fill="#F97316" stroke="#2C2723" stroke-width="1.5"/>
      <!-- Striped Ice Scarf -->
      <path d="M52 108 C64 122 96 122 108 108" stroke="#38BDF8" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M96 112 L102 130" stroke="#38BDF8" stroke-width="6" stroke-linecap="round"/>
      <!-- Shaved Ice Glass with Cherry -->
      <polygon points="36,128 48,128 44,140 40,140" fill="#BAE6FD" stroke="#2C2723" stroke-width="1.5"/>
      <circle cx="42" cy="122" r="8" fill="#EC4899"/>
      <circle cx="44" cy="114" r="2.5" fill="#DC2626"/>
    </svg>
  `),

  // 12. 福气元气蒸饺 (Chibi Dumpling)
  chibi_dumpling_joy: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FFFBEB" stroke="#F59E0B" stroke-width="3"/>
      <!-- Crescent Plump Dumpling Body -->
      <path d="M38 90 C38 60 122 60 122 90 C122 120 38 120 38 90 Z" fill="#FFFDF5" stroke="#2C2723" stroke-width="3"/>
      <!-- Pinched Wheat Pleats on Top -->
      <path d="M48 74 Q54 62 60 72 Q66 60 72 72 Q78 58 84 72 Q90 60 96 72 Q102 62 108 74" stroke="#2C2723" stroke-width="2.5" fill="#FEF08A"/>
      <!-- Cute Eyes & Big Smile -->
      <circle cx="66" cy="88" r="4" fill="#2C2723"/>
      <circle cx="94" cy="88" r="4" fill="#2C2723"/>
      <path d="M74 96 Q80 104 86 96" stroke="#2C2723" stroke-width="2.5" stroke-linecap="round" fill="#EF4444"/>
      <!-- Chili Red Oil Freckle Marks -->
      <circle cx="56" cy="94" r="5" fill="#F87171" opacity="0.6"/>
      <circle cx="104" cy="94" r="5" fill="#F87171" opacity="0.6"/>
      <!-- Little Sesame Seeds -->
      <ellipse cx="64" cy="78" rx="2" ry="1" fill="#78350F" transform="rotate(20 64 78)"/>
      <ellipse cx="94" cy="76" rx="2" ry="1" fill="#78350F" transform="rotate(-15 94 76)"/>
      <ellipse cx="80" cy="74" rx="2" ry="1" fill="#78350F"/>
    </svg>
  `),

  // 13. 抹茶小福团 (Matcha Mochi)
  chibi_matcha_mochi: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#F0FDF4" stroke="#16A34A" stroke-width="3"/>
      <!-- Bouncy Green Matcha Mochi Body -->
      <ellipse cx="80" cy="94" rx="42" ry="32" fill="#86EFAC" stroke="#2C2723" stroke-width="3"/>
      <!-- Matcha Powder dusting tone -->
      <ellipse cx="80" cy="86" rx="34" ry="22" fill="#4ADE80" opacity="0.7"/>
      <!-- Cute Strawberry Topping -->
      <polygon points="80,52 68,72 92,72" fill="#EF4444" stroke="#2C2723" stroke-width="2"/>
      <circle cx="76" cy="62" r="1" fill="#FEF08A"/>
      <circle cx="84" cy="66" r="1" fill="#FEF08A"/>
      <polygon points="80,50 74,46 86,46" fill="#15803D"/>
      <!-- Shy Face -->
      <circle cx="68" cy="94" r="3.5" fill="#2C2723"/>
      <circle cx="92" cy="94" r="3.5" fill="#2C2723"/>
      <ellipse cx="58" cy="98" rx="5" ry="3" fill="#F43F5E" opacity="0.5"/>
      <ellipse cx="102" cy="98" rx="5" ry="3" fill="#F43F5E" opacity="0.5"/>
      <path d="M77 98 Q80 102 83 98" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>
  `),

  // 14. 太阳蛋热吐司 (Sunny Egg Toast)
  chibi_egg_toast_sunny: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FEF9C3" stroke="#EAB308" stroke-width="3"/>
      <!-- Crust Toast Outline -->
      <path d="M44 58 C44 46 64 42 80 46 C96 42 116 46 116 58 L116 116 C116 122 110 126 104 126 L56 126 C50 126 44 122 44 116 Z" fill="#D97706" stroke="#2C2723" stroke-width="3"/>
      <!-- Soft Bread Interior -->
      <path d="M50 62 C50 52 66 48 80 52 C94 48 110 52 110 62 L110 114 C110 118 106 120 100 120 L60 120 C54 120 50 118 50 114 Z" fill="#FEF08A"/>
      <!-- Fried Egg White on top -->
      <path d="M60 84 C60 72 98 70 100 84 C104 98 84 104 78 100 C70 104 58 96 60 84 Z" fill="#FFFFFF" stroke="#2C2723" stroke-width="1.8"/>
      <!-- Golden Smiling Egg Yolk -->
      <circle cx="80" cy="88" r="14" fill="#F59E0B" stroke="#2C2723" stroke-width="2"/>
      <circle cx="75" cy="85" r="2" fill="#2C2723"/>
      <circle cx="85" cy="85" r="2" fill="#2C2723"/>
      <path d="M78 90 Q80 94 82 90" stroke="#2C2723" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>
  `),

  // 15. 千层牛角可颂精 (Golden Croissant)
  chibi_croissant_butter: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FFF7ED" stroke="#F97316" stroke-width="3"/>
      <!-- Flaky Curved Golden Croissant -->
      <path d="M34 110 C40 60 120 60 126 110 C106 104 96 86 80 86 C64 86 54 104 34 110 Z" fill="#F59E0B" stroke="#2C2723" stroke-width="3"/>
      <!-- Layer ribs -->
      <path d="M60 76 C68 90 70 100 70 100" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M100 76 C92 90 90 100 90 100" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Sleeping/Satisfied Happy Face -->
      <path d="M70 82 Q74 78 78 82" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M82 82 Q86 78 90 82" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M78 88 Q80 91 82 88" stroke="#2C2723" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <!-- Butter Pad on head -->
      <rect x="73" y="60" width="14" height="10" rx="2" fill="#FEF08A" stroke="#2C2723" stroke-width="1.5"/>
    </svg>
  `),

  // 16. 海苔柴鱼饭团君 (Seaweed Onigiri)
  chibi_onigiri_seaweed: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#F8FAFC" stroke="#64748B" stroke-width="3"/>
      <!-- Triangular Rice Ball -->
      <path d="M80 44 C84 44 116 106 114 116 C112 122 48 122 46 116 C44 106 76 44 80 44 Z" fill="#FFFFFF" stroke="#2C2723" stroke-width="3"/>
      <!-- Dark Nori Seaweed Wrap -->
      <rect x="66" y="92" width="28" height="30" rx="4" fill="#0F172A" stroke="#2C2723" stroke-width="2"/>
      <!-- Cute Eyes & Umeboshi Blush -->
      <circle cx="68" cy="80" r="3.5" fill="#2C2723"/>
      <circle cx="92" cy="80" r="3.5" fill="#2C2723"/>
      <circle cx="58" cy="86" r="4.5" fill="#F43F5E" opacity="0.6"/>
      <circle cx="102" cy="86" r="4.5" fill="#F43F5E" opacity="0.6"/>
      <!-- Smile -->
      <path d="M76 86 Q80 90 84 86" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Pickled Plum / Umeboshi on forehead -->
      <circle cx="80" cy="56" r="4" fill="#DC2626"/>
    </svg>
  `),

  // 17. 人偶素体 · 见习厨郎 (Base Doll Boy)
  doll_base_boy_linen: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FBF7EE" stroke="#A8A29E" stroke-width="3"/>
      <!-- Linen Base Outfit with Strap Hooks -->
      <path d="M50 142 C50 118 110 118 110 142 Z" fill="#D6D3D1" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M68 118 L68 140 M92 118 L92 140" stroke="#78716C" stroke-width="2"/>
      <!-- Chibi Head Base -->
      <ellipse cx="80" cy="84" rx="27" ry="26" fill="#FCE7D2" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Neutral Boy Hair Base -->
      <path d="M53 76 C53 60 107 60 107 76 C98 70 82 72 80 66 C76 72 62 70 53 76 Z" fill="#57534E" stroke="#2C2723" stroke-width="2"/>
      <!-- Clear Gentle Anime Eyes -->
      <circle cx="68" cy="84" r="3.5" fill="#2C2723"/>
      <circle cx="67" cy="82.5" r="1.2" fill="#FFF"/>
      <circle cx="92" cy="84" r="3.5" fill="#2C2723"/>
      <circle cx="91" cy="82.5" r="1.2" fill="#FFF"/>
      <!-- Gentle Smile -->
      <path d="M76 92 Q80 95 84 92" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Skin / Outfit Interface Badges -->
      <rect x="24" y="24" width="36" height="14" rx="4" fill="#E7E5E4" stroke="#78716C" stroke-width="1.2"/>
      <text x="42" y="34" font-size="8" font-family="sans-serif" text-anchor="middle" fill="#44403C" font-weight="bold">素体SKIN</text>
    </svg>
  `),

  // 18. 人偶素体 · 治愈厨娘 (Base Doll Girl)
  doll_base_girl_linen: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="76" fill="#FDF8F6" stroke="#A8A29E" stroke-width="3"/>
      <!-- Linen Base Dress with Apron Hooks -->
      <path d="M50 142 C50 118 110 118 110 142 Z" fill="#E7E5E4" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M68 118 L72 140 M92 118 L88 140" stroke="#A8A29E" stroke-width="2"/>
      <!-- Chibi Head Base -->
      <ellipse cx="80" cy="84" rx="27" ry="26" fill="#FCE7D2" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Side Pigtails / Soft Bangs -->
      <circle cx="50" cy="86" r="7" fill="#78716C" stroke="#2C2723" stroke-width="1.8"/>
      <circle cx="110" cy="86" r="7" fill="#78716C" stroke="#2C2723" stroke-width="1.8"/>
      <path d="M54 74 C54 60 106 60 106 74 C96 68 84 72 80 66 C74 72 64 68 54 74 Z" fill="#78716C" stroke="#2C2723" stroke-width="2"/>
      <!-- Soft Big Eyes & Blush -->
      <circle cx="68" cy="84" r="3.5" fill="#2C2723"/>
      <circle cx="67" cy="82.5" r="1.2" fill="#FFF"/>
      <circle cx="92" cy="84" r="3.5" fill="#2C2723"/>
      <circle cx="91" cy="82.5" r="1.2" fill="#FFF"/>
      <circle cx="62" cy="90" r="4" fill="#FB7185" opacity="0.4"/>
      <circle cx="98" cy="90" r="4" fill="#FB7185" opacity="0.4"/>
      <path d="M76 92 Q80 96 84 92" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
      <rect x="24" y="24" width="36" height="14" rx="4" fill="#E7E5E4" stroke="#78716C" stroke-width="1.2"/>
      <text x="42" y="34" font-size="8" font-family="sans-serif" text-anchor="middle" fill="#44403C" font-weight="bold">素体SKIN</text>
    </svg>
  `),

  // 19. 金牌侍酒品味师 (Elite Sommelier - LV3)
  doll_sommelier_wine: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <radialGradient id="bg_wine" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FDF2F8"/>
          <stop offset="100%" stop-color="#FCE7F3"/>
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill="url(#bg_wine)" stroke="#9D174D" stroke-width="3"/>
      <!-- Burgundy Sommelier Tuxedo & Tie -->
      <path d="M46 142 C46 116 114 116 114 142 Z" fill="#581C87" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M68 116 L80 132 L92 116 Z" fill="#FFF" stroke="#2C2723" stroke-width="1.8"/>
      <polygon points="80,122 76,120 80,126 84,120" fill="#9D174D"/>
      <!-- Face -->
      <ellipse cx="80" cy="82" rx="27" ry="26" fill="#FDE68A" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Elegant Styled Hair -->
      <path d="M53 72 C53 56 107 56 107 72 C98 66 84 66 80 62 C74 66 62 66 53 72 Z" fill="#312E81" stroke="#2C2723" stroke-width="2"/>
      <!-- Sophisticated Eyes -->
      <ellipse cx="68" cy="82" rx="3.5" ry="3" fill="#2C2723"/>
      <circle cx="67" cy="80.5" r="1" fill="#FFF"/>
      <ellipse cx="92" cy="82" rx="3.5" ry="3" fill="#2C2723"/>
      <circle cx="91" cy="80.5" r="1" fill="#FFF"/>
      <!-- Confident Half-smile -->
      <path d="M75 92 Q80 95 86 91" stroke="#2C2723" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Wine Glass & Grape Badge -->
      <path d="M116 104 C116 116 128 116 128 104 Z" fill="#BE185D" stroke="#2C2723" stroke-width="1.8"/>
      <line x1="122" y1="116" x2="122" y2="126" stroke="#2C2723" stroke-width="2"/>
      <line x1="118" y1="126" x2="126" y2="126" stroke="#2C2723" stroke-width="2"/>
      <!-- Silver Tastevin Badge -->
      <circle cx="60" cy="126" r="6" fill="#E2E8F0" stroke="#2C2723" stroke-width="1.5"/>
      <circle cx="60" cy="126" r="3" fill="#94A3B8"/>
    </svg>
  `),

  // 20. 殿堂金冠神厨 (Grandmaster Golden Toque - LV5)
  doll_legendary_gold_toque: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <radialGradient id="bg_gold" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#FFFBEB"/>
          <stop offset="60%" stop-color="#FEF3C7"/>
          <stop offset="100%" stop-color="#FDE68A"/>
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill="url(#bg_gold)" stroke="#D97706" stroke-width="3"/>
      <!-- Radiant Golden Halo / Star Rays -->
      <g stroke="#F59E0B" stroke-width="2" opacity="0.7">
        <line x1="80" y1="10" x2="80" y2="20"/>
        <line x1="126" y1="34" x2="118" y2="40"/>
        <line x1="34" y1="34" x2="42" y2="40"/>
        <line x1="148" y1="80" x2="138" y2="80"/>
        <line x1="12" y1="80" x2="22" y2="80"/>
      </g>
      <!-- Grandmaster Golden Embroidered Robe -->
      <path d="M44 142 C44 112 116 112 116 142 Z" fill="#1C1917" stroke="#2C2723" stroke-width="2.5"/>
      <path d="M66 116 L80 134 L94 116" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" fill="none"/>
      <!-- Head -->
      <ellipse cx="80" cy="84" rx="28" ry="26" fill="#FDE68A" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Eyes & Smile -->
      <circle cx="68" cy="84" r="3.5" fill="#2C2723"/>
      <circle cx="67" cy="82.5" r="1.2" fill="#FFF"/>
      <circle cx="92" cy="84" r="3.5" fill="#2C2723"/>
      <circle cx="91" cy="82.5" r="1.2" fill="#FFF"/>
      <path d="M74 93 Q80 99 86 93" stroke="#2C2723" stroke-width="2.5" stroke-linecap="round" fill="#EF4444"/>
      <!-- Tall Grand Chef Golden Toque -->
      <path d="M52 64 C48 24 112 24 108 64 Z" fill="#F8FAFC" stroke="#2C2723" stroke-width="2.5"/>
      <!-- Golden Crown Band on Toque -->
      <rect x="52" y="58" width="56" height="10" rx="3" fill="#F59E0B" stroke="#2C2723" stroke-width="2"/>
      <polygon points="70,58 74,52 78,58" fill="#FCD34D" stroke="#2C2723" stroke-width="1"/>
      <polygon points="80,58 84,48 88,58" fill="#FCD34D" stroke="#2C2723" stroke-width="1"/>
      <polygon points="90,58 94,52 98,58" fill="#FCD34D" stroke="#2C2723" stroke-width="1"/>
      <!-- Ruby Jewel on Crown -->
      <circle cx="84" cy="56" r="2.5" fill="#DC2626"/>
    </svg>
  `)
};

/**
 * Returns the SVG Data URI for an avatar ID, or falls back to the default or raw URL.
 */
export function getAvatarGraphicUri(avatarId: string, fallbackUrl?: string): string {
  if (AVATAR_SVG_MAP[avatarId]) {
    return AVATAR_SVG_MAP[avatarId];
  }
  return fallbackUrl || AVATAR_SVG_MAP.chef_boy_cap;
}
