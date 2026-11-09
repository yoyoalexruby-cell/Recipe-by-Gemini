import React from 'react';

interface FoodArtProps {
  type?: string;
  className?: string;
}

export const FoodArtFallback: React.FC<FoodArtProps> = ({ type = 'general', className = 'w-full h-full' }) => {
  if (type === 'braised-pork' || type?.includes('肉') || type?.includes('排骨')) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#8C3A27] via-[#5C2314] to-[#3A140B] overflow-hidden ${className}`}>
        {/* Subtle background rays */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-300 via-transparent to-transparent" />
        
        <svg viewBox="0 0 240 180" className="w-4/5 h-4/5 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ceramic Bowl */}
          <ellipse cx="120" cy="142" rx="75" ry="22" fill="#201A16" opacity="0.6" />
          <path d="M48 95 C48 135, 192 135, 192 95 Z" fill="#E8DEC8" stroke="#D1C3A5" strokeWidth="2" />
          <ellipse cx="120" cy="95" rx="72" ry="16" fill="#3D1810" />
          
          {/* Pork cubes with glistening glaze */}
          <rect x="85" y="70" width="32" height="30" rx="6" fill="#A83820" transform="rotate(-6 101 85)" stroke="#D46A4A" strokeWidth="1.5" />
          <rect x="110" y="65" width="34" height="32" rx="6" fill="#8B2612" transform="rotate(8 127 81)" stroke="#C75435" strokeWidth="1.5" />
          <rect x="135" y="74" width="30" height="28" rx="5" fill="#751F0D" transform="rotate(15 150 88)" />
          <rect x="70" y="80" width="32" height="26" rx="5" fill="#932D17" transform="rotate(-15 86 93)" />
          <rect x="100" y="80" width="38" height="28" rx="6" fill="#B34224" stroke="#E27D5E" strokeWidth="1" />

          {/* Glaze highlights */}
          <ellipse cx="118" cy="85" rx="14" ry="4" fill="#FFD1B3" opacity="0.45" />
          <ellipse cx="98" cy="76" rx="8" ry="3" fill="#FFE2D1" opacity="0.4" />

          {/* Star anise & Scallions */}
          <circle cx="145" cy="70" r="5" fill="#421C0E" />
          <line x1="88" y1="72" x2="114" y2="68" stroke="#78B159" strokeWidth="3" strokeLinecap="round" />
          <line x1="125" y1="88" x2="148" y2="82" stroke="#90C56E" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="105" y1="92" x2="120" y2="94" stroke="#5F8C43" strokeWidth="2.5" strokeLinecap="round" />

          {/* Steaming heat lines */}
          <path d="M105 52 Q100 40 108 30" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <path d="M125 50 Q132 38 122 26" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M142 54 Q138 42 144 32" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
        </svg>

        <div className="absolute bottom-2.5 right-3 text-[11px] font-serif tracking-widest text-amber-100/70 border border-amber-200/20 px-2 py-0.5 rounded-sm">
          浓香慢煨
        </div>
      </div>
    );
  }

  if (type === 'matcha' || type?.includes('蛋糕') || type?.includes('甜点') || type?.includes('戚风')) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#4A643E] via-[#354B2B] to-[#20301A] overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-200 via-transparent to-transparent" />
        
        <svg viewBox="0 0 240 180" className="w-4/5 h-4/5 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ceramic Plate */}
          <ellipse cx="120" cy="140" rx="82" ry="24" fill="#141E11" opacity="0.5" />
          <ellipse cx="120" cy="120" rx="80" ry="20" fill="#F4EFE6" stroke="#DDD4C5" strokeWidth="2" />
          <ellipse cx="120" cy="118" rx="66" ry="14" fill="#ECE4D4" />

          {/* Cake Slice Triangular Prism */}
          <path d="M75 110 L145 60 L170 100 L100 120 Z" fill="#587A47" />
          <path d="M145 60 L145 102 L170 100 Z" fill="#446135" />
          <path d="M75 110 L100 120 L100 125 L75 115 Z" fill="#3D5630" />

          {/* Cream Drip & Sugar Powder */}
          <path d="M145 60 Q130 75 118 70 Q105 85 92 82 L75 110 L145 60 Z" fill="#699254" />
          <path d="M138 65 Q130 80 128 88" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          <circle cx="128" cy="91" r="3" fill="#FFFFFF" opacity="0.9" />

          {/* Mint Leaves */}
          <path d="M150 56 C155 46, 168 50, 164 62 C158 60, 154 58, 150 56 Z" fill="#88C057" stroke="#466928" strokeWidth="1" />
          <path d="M148 54 C140 46, 142 36, 150 42 C152 48, 150 52, 148 54 Z" fill="#A4D974" stroke="#466928" strokeWidth="1" />

          {/* Powder Speckles */}
          <circle cx="110" cy="80" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="130" cy="74" r="1.2" fill="#FFFFFF" opacity="0.7" />
          <circle cx="100" cy="96" r="1.2" fill="#FFFFFF" opacity="0.75" />
          <circle cx="155" cy="116" r="1.5" fill="#FFFFFF" opacity="0.6" />
        </svg>

        <div className="absolute bottom-2.5 right-3 text-[11px] font-serif tracking-widest text-emerald-100/70 border border-emerald-200/20 px-2 py-0.5 rounded-sm">
          轻盈茶香
        </div>
      </div>
    );
  }

  if (type === 'pasta' || type?.includes('面') || type?.includes('虾') || type?.includes('西餐')) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#A86432] via-[#75411B] to-[#45220A] overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent" />
        
        <svg viewBox="0 0 240 180" className="w-4/5 h-4/5 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Plate */}
          <ellipse cx="120" cy="138" rx="84" ry="25" fill="#241105" opacity="0.5" />
          <ellipse cx="120" cy="116" rx="82" ry="24" fill="#FBF8F3" stroke="#E2D8C7" strokeWidth="2" />
          <ellipse cx="120" cy="114" rx="66" ry="18" fill="#F0E5D3" />

          {/* Twirled Tagliatelle ribbon spirals */}
          <path d="M78 116 Q100 86 124 104 Q148 122 165 106" stroke="#F5C672" strokeWidth="9" strokeLinecap="round" />
          <path d="M88 106 Q112 124 135 94 Q152 74 158 98" stroke="#E3B053" strokeWidth="8" strokeLinecap="round" />
          <path d="M96 95 Q118 78 138 90 Q150 102 144 118" stroke="#FCD78E" strokeWidth="7" strokeLinecap="round" />

          {/* Tiger Shrimp (Curved Coral Pink) */}
          <path d="M102 82 C92 70, 114 55, 130 64 C140 70, 142 85, 130 90 C124 92, 116 88, 116 82" stroke="#E85D43" strokeWidth="8" strokeLinecap="round" />
          <path d="M125 62 L132 54" stroke="#D1452B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M130 65 L138 59" stroke="#D1452B" strokeWidth="2.5" strokeLinecap="round" />

          {/* Second Shrimp */}
          <path d="M125 100 C138 90, 155 105, 142 118" stroke="#FF7E65" strokeWidth="7" strokeLinecap="round" />

          {/* Cherry Tomatoes (Red with shine) */}
          <circle cx="88" cy="90" r="9" fill="#D32F2F" />
          <circle cx="86" cy="88" r="2.5" fill="#FFA4A4" />
          <circle cx="152" cy="110" r="8" fill="#C62828" />

          {/* Fresh Basil leaf & Parsley flakes */}
          <path d="M110 74 C104 68, 108 60, 116 64 C120 70, 114 76, 110 74 Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1" />
          <circle cx="106" cy="102" r="1.5" fill="#2E7D32" />
          <circle cx="120" cy="85" r="1.5" fill="#2E7D32" />
          <circle cx="140" cy="100" r="1.5" fill="#2E7D32" />
        </svg>

        <div className="absolute bottom-2.5 right-3 text-[11px] font-serif tracking-widest text-amber-100/70 border border-amber-200/20 px-2 py-0.5 rounded-sm">
          鲜美意蕴
        </div>
      </div>
    );
  }

  // 4. Mango Pomelo Sago (港式甜品 / 杨枝甘露)
  if (type?.includes('甘露') || type?.includes('杨枝') || type?.includes('港式') || type?.includes('芒果') || type?.includes('糖水')) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#E67E22] via-[#B85814] to-[#7D3408] overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent" />
        <svg viewBox="0 0 240 180" className="w-4/5 h-4/5 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Glass Bowl */}
          <ellipse cx="120" cy="140" rx="80" ry="22" fill="#3D1A06" opacity="0.4" />
          <path d="M52 92 C52 135, 188 135, 188 92 Z" fill="#FFFBF0" stroke="#FFE4B5" strokeWidth="2" opacity="0.95" />
          <ellipse cx="120" cy="92" rx="68" ry="15" fill="#FFA500" />
          <ellipse cx="120" cy="92" rx="64" ry="13" fill="#FFB732" />
          {/* Coconut Milk Swirl */}
          <path d="M80 92 Q110 84 140 94 Q160 90 170 92" stroke="#FFF" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
          {/* Sago pearls */}
          <circle cx="85" cy="95" r="3.5" fill="#FFF" opacity="0.8" />
          <circle cx="95" cy="91" r="3" fill="#FFF" opacity="0.8" />
          <circle cx="106" cy="96" r="3" fill="#FFF" opacity="0.85" />
          <circle cx="118" cy="93" r="3" fill="#FFF" opacity="0.8" />
          <circle cx="145" cy="92" r="3.5" fill="#FFF" opacity="0.8" />
          {/* Mango Cubes */}
          <rect x="100" y="74" width="16" height="15" rx="3" fill="#FF9400" stroke="#E67300" strokeWidth="1" />
          <rect x="115" y="72" width="17" height="16" rx="3" fill="#FFAE19" stroke="#E67300" strokeWidth="1" />
          <rect x="128" y="76" width="15" height="14" rx="3" fill="#FF8800" />
          {/* Pomelo Sacs (Ruby pink) */}
          <circle cx="92" cy="85" r="4" fill="#E91E63" />
          <circle cx="98" cy="83" r="3.5" fill="#FF4081" />
          <circle cx="145" cy="82" r="4" fill="#E91E63" />
          <circle cx="152" cy="85" r="3.5" fill="#FF4081" />
          {/* Mint Leaf */}
          <path d="M120 70 C114 62, 122 55, 128 60 C130 65, 124 72, 120 70 Z" fill="#4CAF50" />
        </svg>
        <div className="absolute bottom-2.5 right-3 text-[11px] font-serif tracking-widest text-amber-100/90 border border-amber-200/30 px-2 py-0.5 rounded-sm bg-black/20 backdrop-blur-xs">
          港式清润
        </div>
      </div>
    );
  }

  // 5. Taro Balls & Grass Jelly (台式甜品 / 芋圆烧仙草)
  if (type?.includes('芋圆') || type?.includes('仙草') || type?.includes('台式') || type?.includes('豆花') || type?.includes('九份')) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#5D4037] via-[#3E2723] to-[#211512] overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent" />
        <svg viewBox="0 0 240 180" className="w-4/5 h-4/5 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Clay Bowl */}
          <ellipse cx="120" cy="140" rx="80" ry="22" fill="#150D0A" opacity="0.6" />
          <path d="M52 92 C52 135, 188 135, 188 92 Z" fill="#ECE0D1" stroke="#D7C4B0" strokeWidth="2" />
          <ellipse cx="120" cy="92" rx="68" ry="15" fill="#2E1C14" />
          {/* Grass Jelly Cubes (Glossy dark) */}
          <rect x="70" y="80" width="22" height="18" rx="3" fill="#1C1410" stroke="#3D291F" strokeWidth="1" />
          <rect x="88" y="84" width="20" height="16" rx="3" fill="#140E0B" />
          {/* Taro Balls (Purple) */}
          <circle cx="106" cy="80" r="9" fill="#9C7AA8" stroke="#7E588A" strokeWidth="1" />
          <circle cx="120" cy="74" r="8.5" fill="#886096" />
          {/* Sweet Potato Balls (Yellow / Orange) */}
          <circle cx="132" cy="78" r="9" fill="#F4A236" stroke="#D67C15" strokeWidth="1" />
          <circle cx="144" cy="84" r="8.5" fill="#E68A1E" />
          {/* Red Beans */}
          <circle cx="122" cy="92" r="4.5" fill="#78281F" />
          <circle cx="132" cy="94" r="4" fill="#6A2018" />
          <circle cx="114" cy="95" r="4" fill="#78281F" />
          {/* Milk Drizzle */}
          <path d="M90 92 Q115 88 140 93" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </svg>
        <div className="absolute bottom-2.5 right-3 text-[11px] font-serif tracking-widest text-amber-100/90 border border-amber-200/30 px-2 py-0.5 rounded-sm bg-black/20 backdrop-blur-xs">
          古早Q弹
        </div>
      </div>
    );
  }

  // 6. Chinese Pastry (中式糕点 / 桃酥酥饼)
  if (type?.includes('酥') || type?.includes('糕') || type?.includes('饼') || type?.includes('年糕') || type?.includes('青团')) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#8D6E63] via-[#5D4037] to-[#3E2723] overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent" />
        <svg viewBox="0 0 240 180" className="w-4/5 h-4/5 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Porcelain Plate */}
          <ellipse cx="120" cy="138" rx="84" ry="24" fill="#24140D" opacity="0.5" />
          <ellipse cx="120" cy="118" rx="82" ry="22" fill="#FBF9F5" stroke="#E6DFD5" strokeWidth="2" />
          {/* Golden Walnut Pastry with Natural Cracks */}
          <ellipse cx="120" cy="112" rx="42" ry="24" fill="#D48B38" stroke="#B86F20" strokeWidth="1.5" />
          <ellipse cx="120" cy="110" rx="38" ry="20" fill="#E8A24A" />
          {/* Golden Eggwash Center & Sesame */}
          <circle cx="120" cy="108" r="10" fill="#C0721B" opacity="0.8" />
          <circle cx="118" cy="107" r="1.5" fill="#222" />
          <circle cx="122" cy="106" r="1.5" fill="#222" />
          <circle cx="120" cy="110" r="1.5" fill="#222" />
          {/* Crack lines */}
          <path d="M98 108 Q108 112 114 108" stroke="#8E4808" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M126 108 Q134 105 142 110" stroke="#8E4808" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M116 114 Q120 120 125 122" stroke="#8E4808" strokeWidth="1.5" strokeLinecap="round" />
          {/* Flaky crumbs */}
          <circle cx="86" cy="120" r="2" fill="#E8A24A" />
          <circle cx="150" cy="122" r="2.5" fill="#D48B38" />
        </svg>
        <div className="absolute bottom-2.5 right-3 text-[11px] font-serif tracking-widest text-amber-100/90 border border-amber-200/30 px-2 py-0.5 rounded-sm bg-black/20 backdrop-blur-xs">
          酥香入骨
        </div>
      </div>
    );
  }

  // 7. Daifuku / Wagashi (日式和果子 / 草莓大福)
  if (type?.includes('大福') || type?.includes('果子') || type?.includes('草莓') || type?.includes('和菓子')) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#884D58] via-[#5C2E37] to-[#36151B] overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-200 via-transparent to-transparent" />
        <svg viewBox="0 0 240 180" className="w-4/5 h-4/5 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Black Lacquer Tray */}
          <ellipse cx="120" cy="138" rx="82" ry="24" fill="#1C090C" opacity="0.6" />
          <rect x="45" y="108" width="150" height="20" rx="10" fill="#211718" stroke="#4A3437" strokeWidth="1.5" />
          {/* Half Cut Daifuku showing red strawberry and matcha layer */}
          <ellipse cx="90" cy="108" rx="28" ry="18" fill="#FDFBF9" stroke="#E0D6D3" strokeWidth="1.5" />
          <ellipse cx="140" cy="106" rx="26" ry="16" fill="#FDFBF9" stroke="#E0D6D3" strokeWidth="1.5" />
          {/* Cut Daifuku Interior (Cross section) */}
          <circle cx="140" cy="104" r="20" fill="#4E683E" />
          <path d="M140 88 C132 88, 126 100, 140 114 C154 100, 148 88, 140 88 Z" fill="#D32F2F" />
          <circle cx="136" cy="98" r="1" fill="#FFEB3B" />
          <circle cx="143" cy="102" r="1" fill="#FFEB3B" />
        </svg>
        <div className="absolute bottom-2.5 right-3 text-[11px] font-serif tracking-widest text-rose-100/90 border border-rose-200/30 px-2 py-0.5 rounded-sm bg-black/20 backdrop-blur-xs">
          和风软糯
        </div>
      </div>
    );
  }

  // 8. Gelato / Ice Cream (清凉冰品)
  if (type?.includes('冰淇淋') || type?.includes('冰品') || type?.includes('雪葩') || type?.includes('刨冰') || type?.includes('冻饮')) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#006064] via-[#004D40] to-[#00251A] overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-200 via-transparent to-transparent" />
        <svg viewBox="0 0 240 180" className="w-4/5 h-4/5 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Glass Ice Cream Cup */}
          <ellipse cx="120" cy="145" rx="50" ry="14" fill="#001F1A" opacity="0.5" />
          <path d="M80 85 L108 135 L132 135 L160 85 Z" fill="#E0F7FA" stroke="#B2EBF2" strokeWidth="2" opacity="0.8" />
          {/* Ice Cream Scoops */}
          <circle cx="106" cy="80" r="22" fill="#FFF8E7" stroke="#FFE082" strokeWidth="1.5" />
          <circle cx="134" cy="78" r="22" fill="#D7CCC8" stroke="#BCAAA4" strokeWidth="1.5" />
          <circle cx="120" cy="62" r="20" fill="#FFFDE7" />
          {/* Caramel Drizzle Swirls */}
          <path d="M104 55 Q120 70 135 62" stroke="#B87333" strokeWidth="3" strokeLinecap="round" />
          <path d="M96 74 Q116 88 140 78" stroke="#B87333" strokeWidth="2.5" strokeLinecap="round" />
          {/* Coconut flake sprinkles */}
          <rect x="115" y="52" width="6" height="2" rx="1" fill="#FFF" transform="rotate(30 115 52)" />
          <rect x="125" y="58" width="5" height="2" rx="1" fill="#FFF" transform="rotate(-20 125 58)" />
        </svg>
        <div className="absolute bottom-2.5 right-3 text-[11px] font-serif tracking-widest text-cyan-100/90 border border-cyan-200/30 px-2 py-0.5 rounded-sm bg-black/20 backdrop-blur-xs">
          清凉沁甜
        </div>
      </div>
    );
  }
  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#685549] via-[#4A3B33] to-[#2E241F] overflow-hidden ${className}`}>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-100 via-transparent to-transparent" />
      
      <svg viewBox="0 0 240 180" className="w-4/5 h-4/5 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Wooden Board / Mat */}
        <ellipse cx="120" cy="142" rx="85" ry="22" fill="#1C1613" opacity="0.6" />
        <rect x="50" y="122" width="140" height="12" rx="6" fill="#A88265" stroke="#8A674D" strokeWidth="1.5" />

        {/* Earthenware Casserole Pot */}
        <path d="M60 88 C60 130, 180 130, 180 88 Z" fill="#3D3734" stroke="#2B2623" strokeWidth="2" />
        {/* Pot Rim */}
        <ellipse cx="120" cy="88" rx="60" ry="14" fill="#544C47" stroke="#695F59" strokeWidth="1.5" />
        {/* Pot Broth Surface */}
        <ellipse cx="120" cy="90" rx="54" ry="11" fill="#C49A58" />

        {/* Tofu Cubes */}
        <rect x="94" y="84" width="16" height="13" rx="2" fill="#FFFBF5" stroke="#E8DFD3" strokeWidth="1" />
        <rect x="115" y="85" width="16" height="13" rx="2" fill="#FFFBF5" stroke="#E8DFD3" strokeWidth="1" />

        {/* Shiitake Mushroom with Cross Score */}
        <circle cx="140" cy="88" r="11" fill="#4A3326" />
        <path d="M134 88 L146 88 M140 82 L140 94" stroke="#FFFBF5" strokeWidth="2" strokeLinecap="round" />

        {/* Bok Choy Greens */}
        <path d="M82 85 C76 80, 84 72, 94 78 C96 82, 90 87, 82 85 Z" fill="#669944" stroke="#44662E" strokeWidth="1" />

        {/* Steam */}
        <path d="M110 65 Q104 50 114 38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        <path d="M130 62 Q136 48 126 35" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </svg>

      <div className="absolute bottom-2.5 right-3 text-[11px] font-serif tracking-widest text-stone-200/70 border border-stone-200/20 px-2 py-0.5 rounded-sm">
        慢火温润
      </div>
    </div>
  );
};
