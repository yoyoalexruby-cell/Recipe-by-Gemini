import React, { useRef, useState } from 'react';
import { Recipe } from '../types/recipe';
import { FoodArtFallback } from './IllustrationPresets';
import { X, Download, Copy, Printer, Check, Sparkles, Star, Calendar } from 'lucide-react';

interface ShareCardModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ recipe, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Copy structured text / Markdown for social sharing
  const handleCopyText = () => {
    const text = `📖【食味手记 · ${recipe.title}】
“${recipe.subtitle || '私房手作，人间烟火气最抚凡人心'}”

🥢 风格：${recipe.cuisine || recipe.category} | 难度：${'★'.repeat(recipe.difficulty || 3)} | 耗时：${recipe.prepTimeMinutes + recipe.cookTimeMinutes}分钟
📅 记录日期：${recipe.review?.cookDate || recipe.createdAt}

🛒 食材清单：
${recipe.ingredients.map(i => `· ${i.name}：${i.amount}${i.unit}${i.note ? ` (${i.note})` : ''}`).join('\n')}

🍳 关键步骤：
${recipe.steps.map((s, idx) => `${idx + 1}. ${s.title}：${s.description.slice(0, 45)}...`).join('\n')}

✨ 烹饪心得：
${recipe.review?.tastingNotes || '风味极佳，火候掌握是关键！'}
${recipe.review?.pitfallsAndLessons ? `💡 避坑要点：${recipe.review.pitfallsAndLessons}` : ''}
${recipe.review?.stickers ? `🏷️ 手帐印章：${recipe.review.stickers.join(' ')}` : ''}

—— 来自我的私房烹饪手帐`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Export card as PNG using HTML Canvas 2D
  const handleExportImage = async () => {
    try {
      setIsExporting(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 800;
      const height = 1100;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Cream Paper
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, width, height);

      // Subtle Grid Dots
      ctx.fillStyle = '#E8DEC8';
      for (let x = 30; x < width; x += 25) {
        for (let y = 30; y < height; y += 25) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Outer Paper Border
      ctx.strokeStyle = '#E2D3C0';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Inner Deckle Line
      ctx.strokeStyle = '#EADBCE';
      ctx.lineWidth = 1;
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // 2. Washi Tape at Top
      ctx.fillStyle = 'rgba(200, 90, 50, 0.85)';
      ctx.fillRect(width / 2 - 90, 15, 180, 24);
      ctx.fillStyle = '#FFFDF9';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RECIPE SCRAPBOOK', width / 2, 31);

      // 3. Title & Subtitle
      ctx.fillStyle = '#2C2723';
      ctx.font = 'bold 30px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.fillText(recipe.title, width / 2, 85);

      ctx.fillStyle = '#7A7268';
      ctx.font = 'italic 14px "Noto Serif SC", serif';
      const sub = recipe.subtitle ? `“${recipe.subtitle}”` : '“人间烟火气，最抚凡人心”';
      ctx.fillText(sub.length > 36 ? sub.slice(0, 36) + '...' : sub, width / 2, 115);

      // 4. Polaroid Photo Area
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 6;
      ctx.fillRect(150, 140, 500, 320);
      ctx.shadowColor = 'transparent';

      // Draw photo or fallback
      if (recipe.coverImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 170, 155, 460, 250);
            resolve(true);
          };
          img.onerror = () => resolve(false);
          img.src = recipe.coverImage!;
        });
      } else {
        // Fallback photo box
        ctx.fillStyle = '#8C3A27';
        ctx.fillRect(170, 155, 460, 250);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🍲 ' + recipe.title, width / 2, 285);
      }

      // Polaroid Caption & Date
      ctx.fillStyle = '#7A7268';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `【${recipe.category} · ${recipe.cuisine}】 记录日期：${recipe.review?.cookDate || recipe.createdAt}`,
        width / 2,
        438
      );

      // 5. Cooking Metrics Strip
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(60, 480, 680, 50);
      ctx.strokeStyle = '#EADBCE';
      ctx.strokeRect(60, 480, 680, 50);

      ctx.fillStyle = '#2C2723';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `备料：${recipe.prepTimeMinutes}分钟   |   烹饪：${recipe.cookTimeMinutes}分钟   |   难度：${'★'.repeat(recipe.difficulty || 3)}   |   分量：${recipe.baseServings}人份`,
        width / 2,
        510
      );

      // 6. Ingredients Section (Left Column)
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 16px "Noto Serif SC", serif';
      ctx.textAlign = 'left';
      ctx.fillText('食材清单 (Ingredients)', 65, 565);

      ctx.fillStyle = '#3A332C';
      ctx.font = '13px sans-serif';
      const maxIngredients = Math.min(recipe.ingredients.length, 9);
      for (let i = 0; i < maxIngredients; i++) {
        const ing = recipe.ingredients[i];
        const y = 595 + i * 26;
        ctx.fillText(`· ${ing.name}：${ing.amount}${ing.unit}`, 65, y);
      }
      if (recipe.ingredients.length > 9) {
        ctx.fillStyle = '#9A9085';
        ctx.fillText(`(等共 ${recipe.ingredients.length} 样食材)`, 65, 595 + 9 * 26);
      }

      // 7. Cooking Notes / Reflections (Right Column)
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 16px "Noto Serif SC", serif';
      ctx.fillText('烹饪心得与手记 (Notes)', 420, 565);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(415, 580, 325, 230);
      ctx.strokeStyle = '#EADBCE';
      ctx.strokeRect(415, 580, 325, 230);

      // Tasting note text
      ctx.fillStyle = '#3A332C';
      ctx.font = '12px sans-serif';
      const notes = recipe.review?.tastingNotes || '慢工出细活，味道醇厚，全家好评。';
      
      // Multi-line wrap
      const words = notes.split('');
      let line = '';
      let lineY = 610;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 290 && n > 0) {
          ctx.fillText(line, 430, lineY);
          line = words[n];
          lineY += 20;
          if (lineY > 710) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 430, lineY);

      // Pitfall tip in notes box
      if (recipe.review?.pitfallsAndLessons) {
        ctx.fillStyle = '#8C5D1E';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('💡 避坑建议：', 430, 745);
        ctx.fillStyle = '#5A5248';
        ctx.font = '11px sans-serif';
        const pit = recipe.review.pitfallsAndLessons;
        ctx.fillText(pit.length > 22 ? pit.slice(0, 22) + '...' : pit, 430, 765);
      }

      // 8. Seal Stamp at bottom right
      ctx.save();
      ctx.translate(650, 930);
      ctx.rotate(-0.1);
      ctx.strokeStyle = '#C85A32';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 13px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.fillText('私房手作', 0, -6);
      ctx.fillText('★★★★★', 0, 14);
      ctx.restore();

      // 9. Scrapbook Footer Bar
      ctx.fillStyle = '#7A7268';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('食味手记 · 私房烹饪手帐本', width / 2, 1050);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `手帐卡_${recipe.title}.png`;
      a.click();
    } catch (err) {
      console.error('Failed to export card image', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] shadow-2xl max-w-2xl w-full my-8 overflow-hidden relative">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 border-b border-[#EADBCE] bg-white no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-sm font-bold text-[#2C2723] font-journal-title">
              做菜手帐分享卡
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportImage}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#C85A32] hover:bg-[#B34C26] rounded-md transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '生成中...' : '下载高清海报图'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2723] bg-[#FAF7F2] border border-[#EADBCE] hover:bg-[#F0E6DC] rounded-md transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? '已复制！' : '复制图文文本'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#7A7268] hover:text-[#2C2723] border border-[#EADBCE] rounded-md transition-colors"
              title="打印手帐活页"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#9A9085] hover:text-[#2C2723] rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable/Preview Scrapbook Card */}
        <div ref={cardRef} className="p-6 sm:p-10 bg-[#FAF7F2] bg-notebook-dots relative print-page">
          
          {/* Top Washi Tape */}
          <div className="flex justify-center -mt-3 mb-6">
            <div className="washi-tape px-6 py-1 bg-[#C85A32] text-amber-50 text-xs font-mono tracking-widest uppercase">
              CULINARY SCRAPBOOK · 私房手作
            </div>
          </div>

          {/* Dish Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2C2723] font-journal-title mb-2">
              {recipe.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7268] italic font-serif max-w-lg mx-auto">
              “{recipe.subtitle || '在慢火微沸间，品味独属厨房的温柔'}”
            </p>
          </div>

          {/* Polaroid Photo Frame */}
          <div className="bg-white p-3 rounded-xl border border-[#EADBCE] polaroid-shadow max-w-md mx-auto mb-6 transform -rotate-1">
            <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#EADBCE]">
              {recipe.coverImage ? (
                <img 
                  src={recipe.coverImage} 
                  alt={recipe.title}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <FoodArtFallback type={recipe.title} className="w-full h-full" />
              )}
            </div>
            <div className="pt-2 text-center text-xs text-[#7A7268] flex items-center justify-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>{recipe.review?.cookDate || recipe.createdAt}</span>
              <span>·</span>
              <span>{recipe.cuisine || recipe.category}</span>
            </div>
          </div>

          {/* Grid: Ingredients & Reflections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/90 p-5 rounded-xl border border-[#EADBCE] mb-6">
            <div>
              <h3 className="text-xs font-bold text-[#C85A32] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-[#F0E6DC] pb-1">
                <span>食材备料</span>
                <span className="text-[10px] text-[#9A9085]">({recipe.baseServings}人份)</span>
              </h3>
              <ul className="text-xs text-[#3A332C] space-y-1.5">
                {recipe.ingredients.slice(0, 8).map((ing) => (
                  <li key={ing.id} className="flex justify-between">
                    <span>· {ing.name}</span>
                    <span className="font-mono font-medium">{ing.amount}{ing.unit}</span>
                  </li>
                ))}
                {recipe.ingredients.length > 8 && (
                  <li className="text-[11px] text-[#9A9085] italic pt-1">
                    ...共 {recipe.ingredients.length} 样食材
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#C85A32] uppercase tracking-wider mb-2 border-b border-[#F0E6DC] pb-1">
                烹饪心得与评价
              </h3>
              <p className="text-xs text-[#5A5248] leading-relaxed mb-3">
                {recipe.review?.tastingNotes || '这道菜火候是灵魂，出锅香气浓郁，家宴极受欢迎。'}
              </p>

              {recipe.review?.pitfallsAndLessons && (
                <div className="text-[11px] text-[#8C5D1E] bg-[#FFFBF0] p-2 rounded border border-[#E8DCC4] mb-2">
                  <strong>💡 避坑建议：</strong>{recipe.review.pitfallsAndLessons}
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-[#C08A3E] font-medium">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>味道评分: {recipe.review?.ratings?.taste || 5}.0</span>
                <span className="text-[#9A9085] ml-2">翻牌率: {recipe.review?.ratings?.reproducibility || 5}.0</span>
              </div>
            </div>
          </div>

          {/* Footer & Seal Stamp */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-[#7A7268]">
              {recipe.review?.stickers?.map((stk, idx) => (
                <span key={idx} className="mr-1.5 inline-block bg-white px-2 py-0.5 rounded border border-[#EADBCE]">
                  {stk}
                </span>
              ))}
            </div>

            <div className="seal-stamp text-xs text-[#C85A32]">
              私房手作 · 认证美味
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
