import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Check, RotateCw, FlipHorizontal, Sparkles, 
  Type, Sliders, Stamp, Trash2, Eye, Move, Undo2
} from 'lucide-react';

interface TextAnnotation {
  id: string;
  text: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  style: 'badge-white' | 'badge-accent' | 'badge-dark' | 'polaroid';
  fontSize: 'sm' | 'md' | 'lg';
}

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  title?: string;
}

const FILTER_PRESETS = [
  { id: 'vibrant', name: '✨ 炫彩浓郁', brightness: 106, contrast: 112, saturate: 145, warmth: 5 },
  { id: 'natural', name: '🌿 原图自然', brightness: 100, contrast: 100, saturate: 100, warmth: 0 },
  { id: 'warm', name: '☀️ 暖阳日系', brightness: 105, contrast: 102, saturate: 120, warmth: 22 },
  { id: 'crisp', name: '🍳 鲜亮诱人', brightness: 108, contrast: 118, saturate: 135, warmth: 8 },
  { id: 'vintage', name: '🎞️ 怀旧胶片', brightness: 102, contrast: 95, saturate: 90, warmth: 35 },
  { id: 'bw', name: '🖤 纯粹黑白', brightness: 102, contrast: 125, saturate: 0, warmth: 0 },
];

const PRESET_STAMP_TEXTS = [
  '✨ 满分出锅',
  '🔥 镬气十足',
  '🎯 零失败秘方',
  '🤤 亲友直夸',
  '🌿 灵魂提鲜',
  '🍚 米饭杀手',
  '⏱️ 关键火候',
  '💛 私房绝密'
];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  title = '手帐图片编辑与批注'
}) => {
  if (!isOpen) return null;

  // Active toolbar tab
  const [activeTab, setActiveTab] = useState<'filter' | 'text' | 'adjust' | 'stamps'>('filter');

  // Filter & Adjust parameters
  const [brightness, setBrightness] = useState<number>(106);
  const [contrast, setContrast] = useState<number>(112);
  const [saturate, setSaturate] = useState<number>(145);
  const [warmth, setWarmth] = useState<number>(5);

  // Geometry
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);

  // Text Annotations
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([
    {
      id: 'ann-1',
      text: '关键火候·大火收汁',
      xPercent: 15,
      yPercent: 78,
      style: 'badge-accent',
      fontSize: 'md'
    }
  ]);
  const [selectedAnnId, setSelectedAnnId] = useState<string>('ann-1');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Hidden canvas for exporting
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedAnnotation = annotations.find(a => a.id === selectedAnnId);

  // Handle Preset Selection
  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturate(preset.saturate);
    setWarmth(preset.warmth);
  };

  // Add a new text annotation box
  const handleAddAnnotation = (textValue: string = '在此输入美味批注') => {
    const newAnn: TextAnnotation = {
      id: `ann-${Date.now()}`,
      text: textValue,
      xPercent: 20 + (annotations.length * 5) % 40,
      yPercent: 20 + (annotations.length * 10) % 50,
      style: 'badge-white',
      fontSize: 'md'
    };
    setAnnotations([...annotations, newAnn]);
    setSelectedAnnId(newAnn.id);
    setActiveTab('text');
  };

  const handleUpdateSelectedAnn = (patch: Partial<TextAnnotation>) => {
    if (!selectedAnnId) return;
    setAnnotations(annotations.map(a => a.id === selectedAnnId ? { ...a, ...patch } : a));
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
    if (selectedAnnId === id) {
      setSelectedAnnId(annotations.length > 1 ? annotations[0].id : '');
    }
  };

  // Dragging annotations on preview
  const handleMouseDown = (e: React.MouseEvent, annId: string) => {
    e.stopPropagation();
    setSelectedAnnId(annId);
    setDraggedId(annId);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setAnnotations(prev => prev.map(a => a.id === draggedId ? { ...a, xPercent: Math.round(x), yPercent: Math.round(y) } : a));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedId(null);
  };

  // Compute CSS filter string for live preview
  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${warmth}%)`;

  // Bake everything onto an offscreen canvas and export high-res image
  const handleSaveAndExport = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use original image dimensions or capped at 1200px max
    const naturalWidth = img.naturalWidth || 800;
    const naturalHeight = img.naturalHeight || 600;
    
    // Check rotation
    const isSideways = rotation % 180 !== 0;
    canvas.width = isSideways ? naturalHeight : naturalWidth;
    canvas.height = isSideways ? naturalWidth : naturalHeight;

    // Apply transformation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (isFlippedH) {
      ctx.scale(-1, 1);
    }

    // Apply color filters
    ctx.filter = filterStyle;
    ctx.drawImage(
      img,
      -naturalWidth / 2,
      -naturalHeight / 2,
      naturalWidth,
      naturalHeight
    );
    ctx.restore();

    // Reset filter for text overlay rendering
    ctx.filter = 'none';

    // Render Text Annotations onto the canvas
    annotations.forEach((ann) => {
      const x = (ann.xPercent / 100) * canvas.width;
      const y = (ann.yPercent / 100) * canvas.height;

      const sizeMap = { sm: 16, md: 22, lg: 30 };
      const fontSize = Math.round(sizeMap[ann.fontSize] * (canvas.width / 600));
      ctx.font = `bold ${fontSize}px sans-serif, "Noto Serif SC", serif`;

      const textMetrics = ctx.measureText(ann.text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize * 1.2;
      const padX = fontSize * 0.6;
      const padY = fontSize * 0.35;
      const boxWidth = textWidth + padX * 2;
      const boxHeight = textHeight + padY * 2;

      // Draw background tag badge
      ctx.save();
      ctx.translate(x, y);

      if (ann.style === 'badge-accent') {
        ctx.fillStyle = '#C85A32';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.beginPath();
        ctx.roundRect(-padX, -textHeight - padY + 6, boxWidth, boxHeight, 8);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'transparent';
        ctx.fillText(ann.text, 0, 0);
      } else if (ann.style === 'badge-white') {
        ctx.fillStyle = '#FAF7F2';
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.beginPath();
        ctx.roundRect(-padX, -textHeight - padY + 6, boxWidth, boxHeight, 8);
        ctx.fill();

        ctx.strokeStyle = '#C85A32';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#2C2723';
        ctx.shadowColor = 'transparent';
        ctx.fillText(ann.text, 0, 0);
      } else if (ann.style === 'badge-dark') {
        ctx.fillStyle = 'rgba(30, 24, 20, 0.85)';
        ctx.beginPath();
        ctx.roundRect(-padX, -textHeight - padY + 6, boxWidth, boxHeight, 6);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(ann.text, 0, 0);
      } else {
        // Polaroid serif tag
        ctx.fillStyle = '#FFFDF9';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.beginPath();
        ctx.roundRect(-padX, -textHeight - padY + 6, boxWidth, boxHeight, 4);
        ctx.fill();

        ctx.fillStyle = '#45220A';
        ctx.shadowColor = 'transparent';
        ctx.fillText(ann.text, 0, 0);
      }

      ctx.restore();
    });

    const outputDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onSave(outputDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-white border-b border-[#EADBCE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF3EC] border border-[#EADBCE] flex items-center justify-center text-[#C85A32]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#2C2723] font-serif">
                {title}
              </h3>
              <p className="text-[11px] text-[#7A7268]">
                炫彩美食滤镜 · 自由文字批注框 · 手帐印章
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-[#7A7268] hover:text-[#2C2723] hover:bg-[#FAF7F2] rounded-md transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveAndExport}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34C26] active:scale-[0.98] rounded-md transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>应用并保存</span>
            </button>
          </div>
        </div>

        {/* Center: Image Canvas Workspace */}
        <div className="flex-1 bg-[#1C1613] p-4 flex items-center justify-center overflow-hidden relative select-none">
          <div 
            ref={containerRef}
            className="relative max-w-full max-h-[50vh] sm:max-h-[55vh] rounded-lg overflow-hidden shadow-2xl flex items-center justify-center"
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="编辑预览"
              className="max-h-[50vh] sm:max-h-[55vh] max-w-full object-contain pointer-events-none transition-all duration-150"
              style={{
                filter: filterStyle,
                transform: `rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1})`
              }}
              crossOrigin="anonymous"
            />

            {/* Overlaid Draggable Annotations */}
            {annotations.map((ann) => {
              const isSelected = ann.id === selectedAnnId;

              const styleClasses = {
                'badge-accent': 'bg-[#C85A32] text-white border-transparent shadow-md',
                'badge-white': 'bg-[#FAF7F2] text-[#2C2723] border border-[#C85A32] shadow-md',
                'badge-dark': 'bg-black/80 text-white border-transparent backdrop-blur-xs',
                'polaroid': 'bg-[#FFFDF9] text-[#45220A] border border-[#EADBCE] shadow-lg font-serif'
              }[ann.style];

              const sizeClasses = {
                sm: 'text-xs px-2 py-0.5',
                md: 'text-sm px-3 py-1 font-semibold',
                lg: 'text-base px-3.5 py-1.5 font-bold'
              }[ann.fontSize];

              return (
                <div
                  key={ann.id}
                  onMouseDown={(e) => handleMouseDown(e, ann.id)}
                  style={{
                    left: `${ann.xPercent}%`,
                    top: `${ann.yPercent}%`
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing rounded-lg whitespace-nowrap transition-transform duration-75 flex items-center gap-1 ${styleClasses} ${sizeClasses} ${
                    isSelected ? 'ring-2 ring-[#C85A32] ring-offset-2 ring-offset-black/50 scale-105' : 'hover:scale-102'
                  }`}
                >
                  <Move className="w-3 h-3 opacity-60 shrink-0" />
                  <span>{ann.text}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Rotation Toolbar over preview */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 text-white">
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="顺时针旋转90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFlippedH((f) => !f)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="水平翻转"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Editing Control Panel */}
        <div className="bg-white border-t border-[#EADBCE]">
          
          {/* Tool Tab Bar */}
          <div className="flex items-center px-4 pt-2 border-b border-[#EADBCE] gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('filter')}
              className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'filter'
                  ? 'border-[#C85A32] text-[#C85A32]'
                  : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>炫彩滤镜</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'border-[#C85A32] text-[#C85A32]'
                  : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>文字批注 ({annotations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stamps')}
              className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'stamps'
                  ? 'border-[#C85A32] text-[#C85A32]'
                  : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>美味印章</span>
            </button>

            <button
              onClick={() => setActiveTab('adjust')}
              className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'adjust'
                  ? 'border-[#C85A32] text-[#C85A32]'
                  : 'border-transparent text-[#7A7268] hover:text-[#2C2723]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>色彩微调</span>
            </button>
          </div>

          {/* Sub-Panel Content */}
          <div className="p-4 max-h-48 overflow-y-auto">
            
            {/* 1. Filter Presets */}
            {activeTab === 'filter' && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#7A7268]">
                  推荐选择「✨ 炫彩浓郁」为美食提鲜，突出诱人的金色焦香与红润色泽：
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {FILTER_PRESETS.map((p) => {
                    const isCurrent =
                      brightness === p.brightness &&
                      contrast === p.contrast &&
                      saturate === p.saturate &&
                      warmth === p.warmth;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? 'border-[#C85A32] bg-[#FAF3EC] text-[#C85A32] font-bold shadow-2xs'
                            : 'border-[#EADBCE] bg-[#FAF7F2] hover:bg-white text-[#2C2723]'
                        }`}
                      >
                        <div className="text-xs">{p.name}</div>
                        <div className="text-[10px] text-[#7A7268] mt-0.5">
                          饱和度 {p.saturate}%
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Text Annotations */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#7A7268]">
                    可按住图片上的文字框拖拽移动位置
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddAnnotation('关键步骤笔记')}
                    className="px-2.5 py-1 text-xs font-semibold text-[#C85A32] bg-[#FAF3EC] hover:bg-[#C85A32] hover:text-white rounded-md transition-colors flex items-center gap-1"
                  >
                    <span>+ 新增文字批注</span>
                  </button>
                </div>

                {selectedAnnotation ? (
                  <div className="p-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedAnnotation.text}
                        onChange={(e) => handleUpdateSelectedAnn({ text: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-white border border-[#EADBCE] rounded-lg focus:outline-hidden focus:border-[#C85A32] text-[#2C2723] font-medium"
                        placeholder="输入文字批注..."
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnotation(selectedAnnotation.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="删除此文本框"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Style */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#7A7268] text-[11px]">样式：</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateSelectedAnn({ style: 'badge-accent' })}
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              selectedAnnotation.style === 'badge-accent' ? 'bg-[#C85A32] text-white font-bold' : 'bg-white border'
                            }`}
                          >
                            橘红高光
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSelectedAnn({ style: 'badge-white' })}
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              selectedAnnotation.style === 'badge-white' ? 'bg-[#C85A32] text-white font-bold' : 'bg-white border'
                            }`}
                          >
                            温润白卡
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSelectedAnn({ style: 'badge-dark' })}
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              selectedAnnotation.style === 'badge-dark' ? 'bg-[#C85A32] text-white font-bold' : 'bg-white border'
                            }`}
                          >
                            深色质感
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSelectedAnn({ style: 'polaroid' })}
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              selectedAnnotation.style === 'polaroid' ? 'bg-[#C85A32] text-white font-bold' : 'bg-white border'
                            }`}
                          >
                            拍立得
                          </button>
                        </div>
                      </div>

                      {/* Font Size */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#7A7268] text-[11px]">字号：</span>
                        <div className="flex items-center gap-1">
                          {(['sm', 'md', 'lg'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleUpdateSelectedAnn({ fontSize: s })}
                              className={`px-2 py-0.5 rounded text-[11px] uppercase ${
                                selectedAnnotation.fontSize === s ? 'bg-[#C85A32] text-white font-bold' : 'bg-white border'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-[#7A7268]">
                    暂无选中文本框，点击上方「新增文字批注」创建
                  </div>
                )}
              </div>
            )}

            {/* 3. Fast Stamp Stickers */}
            {activeTab === 'stamps' && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#7A7268]">
                  点击下方快捷印章，将心仪的手账标签直接盖在图片上：
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_STAMP_TEXTS.map((stampText) => (
                    <button
                      key={stampText}
                      type="button"
                      onClick={() => handleAddAnnotation(stampText)}
                      className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#FAF3EC] border border-[#EADBCE] hover:border-[#C85A32] text-[#2C2723] rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <span>{stampText}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Fine Color Sliders */}
            {activeTab === 'adjust' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#7A7268]">炫彩饱和度 (Saturation)</span>
                    <span className="font-mono font-bold">{saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="220"
                    value={saturate}
                    onChange={(e) => setSaturate(Number(e.target.value))}
                    className="w-full accent-[#C85A32]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#7A7268]">对比度 (Contrast)</span>
                    <span className="font-mono font-bold">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-[#C85A32]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#7A7268]">亮度 (Brightness)</span>
                    <span className="font-mono font-bold">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-[#C85A32]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#7A7268]">暖调氛围 (Warmth)</span>
                    <span className="font-mono font-bold">{warmth}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={warmth}
                    onChange={(e) => setWarmth(Number(e.target.value))}
                    className="w-full accent-[#C85A32]"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
