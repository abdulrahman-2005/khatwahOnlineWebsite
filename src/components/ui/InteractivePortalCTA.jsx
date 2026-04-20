"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export const InteractivePortalCTA = ({ locale, i18n }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBoing, setIsBoing] = useState(false);
  const [particles, setParticles] = useState({ right: [], left: [] });
  const timeoutRef = useRef(null);
  const { theme } = useTheme();

  const isRTL = locale === 'ar';

  useEffect(() => {
    if (isHovered) {
      timeoutRef.current = setTimeout(() => {
        generateParticles();
        setIsBoing(true);
        setTimeout(() => setIsBoing(false), 800);
      }, 1000);
    } else { 
      clearTimeout(timeoutRef.current);
      setIsBoing(false);
      setParticles({ right: [], left: [] });
    }
    return () => clearTimeout(timeoutRef.current);
  }, [isHovered]);

  const generateParticles = () => {
    const symbols = ["$", "€"];
    const rightParticles = [];
    const leftParticles = [];
    const countPerSide = 5;
    const randomBetween = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < countPerSide; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const delay = randomBetween(0, 120);
      const distance = randomBetween(80, 100) * (Math.random() < 0.7 ? 0.8 : 1.2);
      const rot = randomBetween(-120, 120);
      const angleR = randomBetween(-175, 100) * (Math.PI / 180);
      rightParticles.push({ id: `r-${i}`, symbol, tx: Math.cos(angleR) * distance, ty: Math.sin(angleR) * distance, rot, delay });
      const angleL = randomBetween(-380, -100) * (Math.PI / 180);
      leftParticles.push({ id: `l-${i}`, symbol, tx: Math.cos(angleL) * distance, ty: Math.sin(angleL) * distance, rot, delay });
    }
    setParticles({ right: rightParticles, left: leftParticles });
  };

  const isLight = theme === 'light';

  return (
    <div className="relative inline-flex items-center justify-center shrink-0 z-20" dir={isRTL ? "rtl" : "ltr"}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes boing-effect {
          0% { transform: scale(1); }
          40% { transform: scale(0.97); }
          70% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .animate-boing {
          animation: boing-effect 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes scatter-out {
          0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          75% { opacity: 0.9; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1.1) rotate(var(--rot)); opacity: 0; }
        }
        .particle-scatter {
          animation: scatter-out 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}} />

      <div className={`absolute top-1/2 ${isRTL ? 'right-[30px]' : 'left-[30px]'} z-0 pointer-events-none`}>
        {particles.right.map((p) => (
          <span key={p.id} className={`absolute top-1/2 right-1/2 -mt-3 -mr-2 text-[var(--color-gold)] font-bold text-2xl drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] ${isBoing ? 'particle-scatter' : 'opacity-0'}`} style={{ "--tx": `${isRTL ? p.tx : -p.tx}px`, "--ty": `${p.ty}px`, "--rot": `${p.rot}deg`, animationDelay: `${p.delay}ms` }}>{p.symbol}</span>
        ))}
      </div>

      <div className={`absolute top-1/2 ${isRTL ? 'left-[30px]' : 'right-[30px]'} z-0 pointer-events-none`}>
        {particles.left.map((p) => (
          <span key={p.id} className={`absolute top-1/2 left-1/2 -mt-3 -ml-2 text-[var(--color-gold)] font-bold text-2xl drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] ${isBoing ? 'particle-scatter' : 'opacity-0'}`} style={{ "--tx": `${isRTL ? p.tx : -p.tx}px`, "--ty": `${p.ty}px`, "--rot": `${p.rot}deg`, animationDelay: `${p.delay}ms` }}>{p.symbol}</span>
        ))}
      </div>

      <Link
        href="/contact"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] w-[260px] sm:w-[280px] hover:w-[280px] sm:hover:w-[480px] h-[64px] sm:h-[72px] ${isLight ? 'bg-white' : 'bg-[var(--color-ink)]'} border-[2px] border-[var(--color-gold)]/30 hover:border-[var(--color-gold)] hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] z-20 ${isBoing ? 'animate-boing' : ''}`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
          <span className={`text-base sm:text-xl font-black text-[var(--color-gold)] uppercase tracking-widest transition-transform duration-500 group-hover:scale-90`}>
            {i18n?.[locale]?.hero?.cta_primary || "Take Step"}
          </span>
        </div>

        <div className={`absolute inset-0 w-full h-full flex items-center justify-between px-4 sm:px-6 opacity-0 translate-y-4 transition-all duration-[600ms] delay-100 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="flex flex-col items-center justify-center w-10 sm:w-14 shrink-0 z-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-gold)] transition-transform duration-700 delay-200 group-hover:scale-110`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l1.5-4h15L21 8" className="fill-[var(--color-gold)]/10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8c0 1.5 1.5 2 3 2s3-.5 3-2 3 2 3 2 3-.5 3-2 3 2 3 2 1.5-.5 1.5-2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10v10h16V10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20v-6h4v6" className="fill-[var(--color-gold)]/20" />
            </svg>
          </div>

          <div className="relative flex-1 h-full flex flex-col items-center justify-center mx-2 sm:mx-4 overflow-hidden">
            <span className={`text-[10px] sm:text-base font-black ${isLight ? 'text-[var(--color-gold)]' : 'text-white'} tracking-widest whitespace-nowrap z-20 drop-shadow-md`}>
              {i18n?.[locale]?.interactive_portal?.from_local_to_online || "Local to Online"}
            </span>
            <div className="absolute top-[60%] left-0 w-full h-10 -translate-y-1/2 flex items-center justify-center z-10 hidden sm:flex">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <line x1={isRTL ? "100%" : "0%"} y1="50%" x2={isRTL ? "0%" : "100%"} y2="50%" stroke="var(--color-gold)" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="4 4" />
                <line x1={isRTL ? "100%" : "0%"} y1="50%" x2={isRTL ? "0%" : "100%"} y2="50%" stroke="var(--color-gold)" strokeWidth="2" pathLength="100" strokeDasharray="100" strokeDashoffset="100" className="transition-all duration-[1000ms] delay-100 ease-in-out group-hover:[stroke-dashoffset:0]" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-10 sm:w-14 shrink-0 z-20 relative">
            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-gold)] transition-all duration-500 delay-[900ms] group-hover:drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-3.5 0-6.5 2.5-7 6a6.5 6.5 0 001.5 12.5h11a5.5 5.5 0 001.5-10.5c-.5-4-3.5-8-7-8z" className={isLight ? 'fill-white' : 'fill-[var(--color-ink)]'} />    
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};