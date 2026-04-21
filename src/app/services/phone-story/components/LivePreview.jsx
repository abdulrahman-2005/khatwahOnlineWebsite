"use client";

import { useState, useRef, useMemo } from "react";
import { 
  Download, LayoutGrid, AlignJustify, List, Sparkles, Grid3X3, 
  Zap, Globe, Shuffle, Palette, Smartphone, Waves, Sparkle, 
  Layers, Megaphone, ScanLine 
} from "lucide-react";
import { CONDITION_GRADES, CURRENCIES, PHONE_BRANDS } from "../assets/brands";

const THEMES = {
  midnight: { name: 'Midnight', bg: '#050b18', grad: '#0a1632', c1: '#3b82f6', c2: '#8b5cf6', c3: '#60a5fa' },
  oled: { name: 'Pitch Black', bg: '#000000', grad: '#0a0a0a', c1: '#ffffff', c2: '#a3a3a3', c3: '#e5e5e5' },
  cyberpunk: { name: 'Cyberpunk', bg: '#090514', grad: '#1e0b36', c1: '#ec4899', c2: '#06b6d4', c3: '#fde047' },
  sunset: { name: 'Sunset', bg: '#170614', grad: '#2a0815', c1: '#f97316', c2: '#ec4899', c3: '#fbbf24' },
  emerald: { name: 'Emerald', bg: '#021c13', grad: '#022c22', c1: '#10b981', c2: '#059669', c3: '#34d399' },
  titanium: { name: 'Titanium', bg: '#1c1c1e', grad: '#2c2c2e', c1: '#d4d4d8', c2: '#a1a1aa', c3: '#f4f4f5' },
  crimson: { name: 'Crimson', bg: '#1a0404', grad: '#3f0909', c1: '#ef4444', c2: '#f59e0b', c3: '#dc2626' },
  royal: { name: 'Royal', bg: '#171717', grad: '#262626', c1: '#fbbf24', c2: '#d97706', c3: '#fcd34d' },
};

export default function LivePreview({ phones, brandName }) {
  const previewRef = useRef(null);
  const [layoutMode, setLayoutMode] = useState('standard');
  const [bgEffect, setBgEffect] = useState('mesh');
  const [themeKey, setThemeKey] = useState('midnight');
  const [useGlass, setUseGlass] = useState(true);
  const [showNoise, setShowNoise] = useState(true);
  const [showPromo, setShowPromo] = useState(true);

  // Lazy load html2canvas only when first needed (cached after first import)
  let html2canvasModule = null;
  const getHtml2Canvas = async () => {
    if (!html2canvasModule) {
      html2canvasModule = (await import('html2canvas-pro')).default;
    }
    return html2canvasModule;
  };
  const [seed, setSeed] = useState(1);
  
  const displayPhones = phones ? phones.slice(0, 4) : [];
  const hasPhones = displayPhones.length > 0;
  const count = displayPhones.length;
  const activeTheme = THEMES[themeKey];

  // Procedural VFX Generation Engine
  const vfxData = useMemo(() => {
    // Lightning
    const branches = [];
    let currentX = 20 + Math.random() * 60;
    const mainPath = [[currentX, 0]];
    for (let y = 10; y <= 100; y += 10 + Math.random() * 10) {
      currentX += (Math.random() - 0.5) * 40;
      mainPath.push([currentX, y]);
      if (Math.random() > 0.6) {
        let forkX = currentX;
        const forkPath = [[forkX, y]];
        for(let fy = y + 10; fy <= y + 30; fy += 10) {
          forkX += (Math.random() - 0.5) * 50;
          forkPath.push([forkX, fy]);
        }
        branches.push(forkPath);
      }
    }
    branches.unshift(mainPath);
    const lightningPaths = branches.map(b => "M " + b.map(p => `${p[0]} ${p[1]}`).join(" L "));

    // Fluid Waves
    const waves = Array.from({ length: 4 }).map(() => {
      const y1 = 20 + Math.random() * 60;
      const y2 = 20 + Math.random() * 60;
      return `M 0 ${y1} C 30 ${y1 + (Math.random() * 80 - 40)}, 70 ${y2 + (Math.random() * 80 - 40)}, 100 ${y2}`;
    });

    // Orbits / Rings
    const orbits = Array.from({ length: 3 }).map((_, i) => ({
      id: i, cx: Math.random() * 100, cy: Math.random() * 100, 
      r: 20 + Math.random() * 40, width: 0.5 + Math.random() * 2
    }));

    // Particles
    const particles = Array.from({ length: 30 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      r: Math.random() * 2.5 + 0.5, op: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.5 ? activeTheme.c1 : activeTheme.c3
    }));

    // Mesh Gradients (Blobs)
    const meshBlobs = Array.from({ length: 3 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: 150 + Math.random() * 200,
      color: i === 0 ? activeTheme.c1 : i === 1 ? activeTheme.c2 : activeTheme.c3
    }));

    return { lightningPaths, waves, orbits, particles, meshBlobs, gridScale: 25 + Math.random() * 15 };
  }, [seed, activeTheme]);

  const downloadImage = async () => {
    if (!previewRef.current) return;
    try {
      // Get cached html2canvas module (only downloads once)
      const html2canvas = await getHtml2Canvas();
      
      const canvas = await html2canvas(previewRef.current, {
        scale: 3, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
      });
      const link = document.createElement('a');
      link.download = `Story_${brandName || 'Promo'}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Capture Error:', error);
      alert("Something went wrong capturing the image. Try disabling some effects.");
    }
  };

  const getCurrency = (code) => CURRENCIES.find(c => c.code === code)?.symbol || code;

  // --- SMART TYPOGRAPHY ENGINE ---
  // Relies on Flexbox constraints rather than fixed sizes, ensuring massive text when there's space.
  const getTypography = () => {
    if (layoutMode === 'grid') {
      return { title: 'text-sm sm:text-base', price: 'text-lg', label: 'text-[9px]', spec: 'text-[10px]', padding: 'p-3' };
    }
    if (layoutMode === 'compact') {
      return { title: count >= 3 ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl', price: count >= 3 ? 'text-lg' : 'text-2xl', label: 'text-[10px]', spec: 'text-[10px]', padding: 'p-3 sm:p-4' };
    }
    // Standard (Hero Stacking)
    if (count >= 4) return { title: 'text-base sm:text-lg', price: 'text-xl', label: 'text-[10px]', spec: 'text-[10px]', padding: 'p-3' };
    if (count === 3) return { title: 'text-xl sm:text-2xl', price: 'text-3xl', label: 'text-xs', spec: 'text-[11px]', padding: 'p-4' };
    if (count === 2) return { title: 'text-3xl sm:text-4xl', price: 'text-4xl sm:text-5xl', label: 'text-sm', spec: 'text-xs', padding: 'p-5' };
    return { title: 'text-5xl sm:text-6xl', price: 'text-6xl sm:text-7xl', label: 'text-base', spec: 'text-sm', padding: 'p-6' };
  };

  if (!hasPhones) return (
    <div className="flex aspect-[9/16] w-full max-w-[380px] mx-auto items-center justify-center rounded-[2.5rem] border-2 border-dashed border-gray-700 bg-[#050b18]">
      <div className="text-center space-y-2">
        <Sparkles className="mx-auto text-gray-500" size={32} />
        <p className="text-gray-500 font-medium tracking-tight">Add inventory to preview story</p>
      </div>
    </div>
  );

  const typo = getTypography();

  return (
    <div className="space-y-4">
      {/* --- CONTROL PANEL --- */}
      <div className="bg-gray-100 p-3 rounded-2xl space-y-3 shadow-inner border border-gray-200">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <div className="flex flex-1 items-center bg-white rounded-lg p-1 shadow-sm shrink-0">
            {[
              { id: 'standard', icon: AlignJustify, label: 'Hero' },
              { id: 'compact', icon: List, label: 'List' },
              { id: 'grid', icon: LayoutGrid, label: 'Grid' }
            ].map(mode => (
              <button
                key={mode.id} onClick={() => setLayoutMode(mode.id)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${layoutMode === mode.id ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
              >
                <mode.icon size={14} /> {mode.label}
              </button>
            ))}
          </div>
          <button onClick={() => setSeed(s => s + 1)} className="shrink-0 flex items-center justify-center gap-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all">
            <Shuffle size={14} /> Mix
          </button>
        </div>

        {/* Features & FX Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button onClick={() => setUseGlass(!useGlass)} className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${useGlass ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}>
            <Layers size={14} /> Glass
          </button>
          <button onClick={() => setShowNoise(!showNoise)} className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${showNoise ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-500'}`}>
            <ScanLine size={14} /> Noise
          </button>
          <button onClick={() => setShowPromo(!showPromo)} className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${showPromo ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-500'}`}>
            <Megaphone size={14} /> Badge
          </button>
        </div>

        {/* VFX Patterns */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'mesh', icon: Sparkles, label: 'Mesh' },
            { id: 'orbit', icon: Globe, label: 'Orbit' },
            { id: 'waves', icon: Waves, label: 'Fluid' },
            { id: 'grid', icon: Grid3X3, label: 'Grid' },
            { id: 'particles', icon: Sparkle, label: 'Dust' },
            { id: 'lightning', icon: Zap, label: 'Volt' }
          ].map(effect => (
            <button
              key={effect.id} onClick={() => setBgEffect(effect.id)}
              className={`flex-1 min-w-[55px] flex flex-col items-center justify-center gap-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all ${bgEffect === effect.id ? 'bg-white border-gray-400 text-black shadow-sm' : 'border-transparent text-gray-500 hover:bg-white/60'}`}
            >
              <effect.icon size={14} /> {effect.label}
            </button>
          ))}
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar px-1 bg-white p-2 rounded-xl border border-gray-100">
          <Palette size={14} className="text-gray-400 shrink-0" />
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key} onClick={() => setThemeKey(key)}
              className={`w-7 h-7 shrink-0 rounded-full border-2 transition-transform ${themeKey === key ? 'scale-110 border-gray-800 shadow-md' : 'border-transparent hover:scale-105'}`}
              style={{ background: `linear-gradient(135deg, ${theme.c1}, ${theme.c2})` }}
              title={theme.name}
            />
          ))}
        </div>
      </div>

      {/* --- PREVIEW CONTAINER --- */}
      <div
        ref={previewRef}
        className="relative mx-auto w-full max-w-[380px] aspect-[9/16] overflow-hidden rounded-[2.5rem] flex flex-col shadow-2xl ring-1 ring-black/5"
        style={{ 
          backgroundColor: activeTheme.bg, 
          color: "#ffffff", 
          fontFamily: '"Inter", "Space Grotesk", system-ui, -apple-system, sans-serif' 
        }}
      >
        {/* TEXTURE & BACKGROUND EFFECTS LAYER (z-0) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Base Gradient */}
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(165deg, ${activeTheme.bg} 0%, ${activeTheme.grad} 100%)` }} />

          {/* Premium Noise Overlay */}
          {showNoise && (
            <div 
              className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
          )}

          {bgEffect === 'mesh' && (
            <div className="absolute inset-0 opacity-40 blur-[60px]">
              {vfxData.meshBlobs.map(blob => (
                <div key={blob.id} className="absolute rounded-full" style={{ left: `${blob.x}%`, top: `${blob.y}%`, width: `${blob.size}px`, height: `${blob.size}px`, backgroundColor: blob.color, transform: 'translate(-50%, -50%)' }} />
              ))}
            </div>
          )}

          {bgEffect === 'orbit' && (
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              {vfxData.orbits.map(orbit => (
                <circle key={orbit.id} cx={orbit.cx} cy={orbit.cy} r={orbit.r} fill="none" stroke={`url(#grad-${orbit.id})`} strokeWidth={orbit.width} />
              ))}
              <defs>
                {vfxData.orbits.map(orbit => (
                  <linearGradient key={`grad-${orbit.id}`} id={`grad-${orbit.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={activeTheme.c1} />
                    <stop offset="100%" stopColor={activeTheme.c2} stopOpacity="0" />
                  </linearGradient>
                ))}
              </defs>
            </svg>
          )}

          {bgEffect === 'grid' && (
            <>
              <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${activeTheme.c1} 1px, transparent 1px), linear-gradient(90deg, ${activeTheme.c1} 1px, transparent 1px)`, backgroundSize: `${vfxData.gridScale}px ${vfxData.gridScale}px`, opacity: 0.15, transform: 'perspective(500px) rotateX(30deg) scale(1.5)', transformOrigin: 'top center' }} />
              <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at center, transparent 0%, ${activeTheme.bg} 90%)` }} />
            </>
          )}

          {bgEffect === 'waves' && (
            <svg className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="none" viewBox="0 0 100 100">
              {vfxData.waves.map((path, i) => (
                <g key={i}>
                  <path d={path} stroke={i % 2 === 0 ? activeTheme.c1 : activeTheme.c2} strokeWidth="0.5" fill="none" style={{ filter: 'blur(1px)' }} />
                  <path d={path} stroke={i % 2 === 0 ? activeTheme.c1 : activeTheme.c2} strokeWidth="3" fill="none" style={{ filter: 'blur(10px)', opacity: 0.6 }} />
                </g>
              ))}
            </svg>
          )}

          {bgEffect === 'particles' && (
            vfxData.particles.map(p => (
              <div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.r}px`, height: `${p.r}px`, backgroundColor: p.color, opacity: p.op, boxShadow: `0 0 ${p.r * 4}px ${p.color}` }} />
            ))
          )}

          {bgEffect === 'lightning' && (
            <svg className="absolute inset-0 w-full h-full opacity-80" preserveAspectRatio="none" viewBox="0 0 100 100">
              {vfxData.lightningPaths.map((path, i) => (
                <g key={i}>
                  <path d={path} stroke={activeTheme.c1} strokeWidth="4" fill="none" style={{ filter: 'blur(4px)', opacity: 0.8 }} />
                  <path d={path} stroke="#ffffff" strokeWidth={i === 0 ? "1.5" : "0.5"} fill="none" />
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* Contrast Shield / Vignette */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 30%, transparent 40%, ${activeTheme.bg}e6 120%)` }} />

        {/* FOREGROUND CONTENT LAYER (z-10) */}
        <div className="relative z-10 flex flex-col h-full p-5 pb-3">
          
          {/* Header & Promo Badge */}
          <div className="shrink-0 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full flex items-center justify-center" style={{ backgroundColor: activeTheme.c1, boxShadow: `0 0 15px ${activeTheme.c1}` }}>
                <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase drop-shadow-lg" style={{ opacity: 0.95 }}>
                {brandName || 'Khatwah'}
              </span>
            </div>
            {showPromo && (
              <div className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg border" style={{ backgroundColor: `${activeTheme.c1}33`, borderColor: activeTheme.c1, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                🔥 Exclusive
              </div>
            )}
          </div>

          {/* Dynamic Phones Engine - Now strictly Flexbox driven for perfect fitting */}
          <div className={`flex-1 min-h-0 w-full ${layoutMode === 'grid' ? (count <= 2 ? 'grid grid-cols-2 items-stretch gap-3' : 'grid grid-cols-2 grid-rows-2 gap-3') : `flex flex-col justify-center ${count >= 3 ? 'gap-2' : 'gap-4'}`}`}>
            {displayPhones.map((phone, idx) => {
              const condition = CONDITION_GRADES.find(c => c.value === phone.condition);
              const hasValidPrice = phone.showPrice && phone.price && String(phone.price).trim() !== "";
              const brandData = PHONE_BRANDS.find(b => b.id === phone.brand);
              const phoneImageSrc = phone.image || brandData?.logo;
              const hasImg = phone.showImage && phoneImageSrc;
              
              const layoutClasses = layoutMode === 'grid' 
                ? 'flex flex-col text-center' 
                : layoutMode === 'compact' 
                  ? 'flex flex-row items-center gap-4' 
                  : 'flex flex-col items-center text-center'; // standard hero centers text

              const glassStyles = useGlass ? {
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderTopColor: "rgba(255, 255, 255, 0.2)", // Light reflection
                borderLeftColor: "rgba(255, 255, 255, 0.2)",
                boxShadow: `0 20px 40px -10px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)`
              } : {};

              return (
                <div key={phone.id || idx} className={`relative w-full h-full flex overflow-hidden ${layoutClasses} ${typo.padding} ${useGlass ? 'rounded-[1.5rem]' : ''}`} style={glassStyles}>
                  
                  {/* Image Block: flex-1 min-h-0 lets it shrink perfectly to fit available space */}
                  {hasImg && (
                    <div className={`flex justify-center items-center ${layoutMode === 'compact' ? 'w-1/3 shrink-0 h-full' : 'w-full flex-1 min-h-0 mb-2'}`}>
                      <img
                        src={phoneImageSrc} alt={`${phone.brand} ${phone.model}`}
                        className={`object-contain w-full h-full drop-shadow-2xl transition-transform hover:scale-105`}
                        style={{ filter: phone.image ? 'none' : 'brightness(0) invert(1) opacity(0.8)' }}
                      />
                    </div>
                  )}

                  {/* Content Block: shrink-0 guarantees text is never compressed */}
                  <div className={`flex flex-col shrink-0 min-w-0 w-full ${layoutMode === 'grid' ? 'items-center' : layoutMode === 'compact' ? 'items-start flex-1' : 'items-center'}`}>
                    
                    <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                      <span className={`rounded-md font-black uppercase tracking-widest px-2 py-0.5 ${typo.label}`} style={{ backgroundColor: phone.taxPaid ? "#16a34a" : "#dc2626", textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {phone.taxPaid ? 'NO TAX' : 'TAX'}
                      </span>
                      <span className={`rounded-md font-black uppercase tracking-widest border border-white/20 px-2 py-0.5 ${typo.label}`} style={{ color: phone.hasBox ? "#4ade80" : "#f87171", backgroundColor: "rgba(0,0,0,0.5)" }}>
                        {phone.hasBox ? 'BOX' : 'NO BOX'}
                      </span>
                    </div>

                    <h2 className={`font-black uppercase tracking-tight leading-none mb-2 break-words w-full ${typo.title}`} style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                      {phone.model}
                    </h2>

                    <div className={`flex flex-wrap gap-1.5 mb-2 ${layoutMode !== 'compact' ? 'justify-center' : ''}`}>
                      {[
                        { icon: "🔋", val: phone.batteryHealth, bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80", border: "rgba(34, 197, 94, 0.3)" },
                        { icon: "💾", val: phone.storage, bg: `${activeTheme.c1}22`, text: "#fff", border: `${activeTheme.c1}55` },
                        ...((layoutMode !== 'grid' || count <= 2) ? [{ icon: "📶", val: `${phone.simSlots} ${phone.region || ''}`, bg: "rgba(255,255,255,0.05)", text: "#cbd5e1", border: "rgba(255,255,255,0.15)" }] : [])
                      ].map((spec, i) => (
                        <div key={i} className={`rounded-lg px-2 py-1 flex items-center gap-1 border ${typo.spec}`} style={{ backgroundColor: spec.bg, borderColor: spec.border }}>
                          <span className="opacity-80">{spec.icon}</span>
                          <span className="font-bold whitespace-nowrap tracking-wide" style={{ color: spec.text }}>{spec.val}</span>
                        </div>
                      ))}
                    </div>

                    <p style={{ color: "#9ca3af" }} className={`${typo.label} font-semibold uppercase tracking-wider mb-2 break-words w-full ${layoutMode !== 'compact' ? 'text-center' : ''}`}>
                      {phone.color} {phone.color && condition && '•'} <span className="text-white">{condition?.label}</span>
                    </p>

                    {hasValidPrice && (
                      <div className={`w-full mt-auto pt-2 border-t border-white/10 ${layoutMode === 'grid' ? 'text-center' : layoutMode === 'compact' ? 'text-left' : 'text-center'}`}>
                        <div className={`flex items-baseline gap-1.5 ${layoutMode !== 'compact' ? 'justify-center' : ''}`}>
                          <span className={`font-black tracking-tighter leading-none ${typo.price}`} style={{ background: `linear-gradient(to bottom right, #ffffff, ${activeTheme.c3})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 4px 8px ${activeTheme.c1}40)` }}>
                            {Number(phone.price).toLocaleString()}
                          </span>
                          <span className={`font-bold uppercase tracking-widest ${typo.label}`} style={{ color: activeTheme.c1 }}>
                            {getCurrency(phone.currency)}
                          </span>
                        </div>
                        {phone.negotiable && layoutMode !== 'grid' && (
                          <span className="text-[9px] uppercase tracking-[0.2em] font-bold block mt-1 opacity-50">Negotiable</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Media Footer (Swipe Up / Link In Bio style) */}
          <div className="mt-4 pt-3 border-t border-white/10 shrink-0 flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black tracking-[0.2em] uppercase text-gray-400">Powered By</span>
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-white/10 backdrop-blur-sm">
                  <Globe size={10} style={{ color: activeTheme.c3 }} />
                </div>
                <span className="text-[11px] font-black tracking-wider text-white">
                  khatwah.online<span style={{ color: activeTheme.c1 }}>/services</span>
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center animate-bounce opacity-70">
              <span className="text-[7px] font-bold tracking-widest uppercase mb-0.5">Link in bio</span>
              <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center">
                <Smartphone size={10} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- EXPORT BUTTON --- */}
      <button
        onClick={downloadImage}
        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-xl relative overflow-hidden group"
        style={{ background: "#ffffff", color: "#000000" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <Download size={18} strokeWidth={2.5} />
        Export Story
      </button>
    </div>
  );
}