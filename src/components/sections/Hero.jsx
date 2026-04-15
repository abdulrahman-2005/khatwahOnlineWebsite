"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { InteractivePortalCTA } from "@/components/ui/InteractivePortalCTA";
import { ArishGlobe } from "@/components/ui/GlobeAnimation";
import dynamic from "next/dynamic";
import { useLocale } from "@/contexts/LocaleContext";
import { useTheme } from "@/contexts/ThemeContext";
import i18n from "../../../data/i18n.json";

const ParticleField = dynamic(() => import("@/components/three/ParticleField"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[var(--color-background)]" />
  ),
});

export default function Hero() {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const brandName = locale === 'ar' ? i18n[locale].hero.brand_name : i18n[locale].hero.brand_name_en;
  const brandSubtitle = locale === 'ar' ? i18n[locale].hero.brand_subtitle : i18n[locale].hero.brand_subtitle_en;

  return (
    <section className="relative flex h-[100svh] w-full overflow-hidden bg-[var(--color-background)] transition-colors duration-500">

      {/* Background Layer: 3D Particles on ALL screens */}
      <div className={`absolute inset-0 z-0 ${isLight ? 'opacity-40' : 'opacity-40'}`}>
        <ParticleField />
      </div>

      {/* Background Globe: Visible only on Mobile, tucked behind text */}
      <div className="absolute inset-0 z-0 flex sm:hidden opacity-30 pointer-events-none scale-[1.6] translate-y-20">
         <ArishGlobe mobile />
      </div>

      {/* Atmospheric Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[var(--color-primary-glow)] rounded-full blur-[80px] sm:blur-[120px] ${isLight ? 'opacity-30' : 'opacity-20'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[var(--color-gold-glow)] rounded-full blur-[80px] sm:blur-[120px] ${isLight ? 'opacity-25' : 'opacity-15'}`} />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center">
        
        {/* TEXT COLUMN - THE ENTIRE SCREEN ON MOBILE */}
        <div className="flex w-full h-full flex-col items-center justify-center text-center px-4 sm:px-10 lg:w-[55%] lg:items-start lg:text-start lg:pl-20 max-w-[1600px] mx-auto">

          <Reveal direction="up" distance={30} duration={800}>
            <div className="flex flex-col items-center lg:items-start gap-0 mb-8">
              <h1 
                className={`font-black uppercase transition-all duration-700 ${
                  isLight ? 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : 'drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)]'
                } ${
                  locale === 'ar' 
                    ? 'text-[25vw] sm:text-[18vw] lg:text-[160px] xl:text-[200px] leading-[0.85]' 
                    : 'text-[15vw] sm:text-[12vw] lg:text-[110px] xl:text-[140px] leading-[0.8] tracking-tighter'
                }`}
                style={{
                  color: "var(--color-text)",
                  fontFamily: locale === 'ar' ? "var(--font-body)" : "var(--font-display)"
                }}
              >
                {brandName}
              </h1>
              <div className="flex items-center gap-4 sm:gap-6 w-full justify-center lg:justify-start mt-4">
                <span className={`h-px w-10 sm:w-16 bg-[var(--color-gold)] ${isLight ? 'opacity-60' : 'opacity-40'}`} />
                <span 
                  className={`text-xl sm:text-3xl lg:text-4xl font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase text-[var(--color-gold)] ${!isLight ? 'drop-shadow-[0_0_20px_var(--color-gold-glow)]' : ''}`} 
                  style={{ fontFamily: locale === 'ar' ? "var(--font-body)" : "var(--font-display)" }}
                >
                  {brandSubtitle}
                </span>
                <span className={`h-px w-10 sm:w-16 bg-[var(--color-gold)] ${isLight ? 'opacity-60' : 'opacity-40'}`} />
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" distance={20} delay={150} duration={700}>
            <p className={`mt-6 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight sm:leading-tight max-w-[15ch] sm:max-w-none ${isLight ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`} style={{ textShadow: isLight ? 'none' : '0 4px 12px rgba(0,0,0,0.3)' }}>
              {locale === 'ar' ? i18n[locale].hero.headline_ar : i18n[locale].hero.headline_en}
            </p>
          </Reveal>

          <Reveal direction="up" distance={20} delay={300} duration={700}>
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center lg:justify-start w-full sm:w-auto">
              <div className={`transition-all duration-700 scale-100 sm:scale-110 lg:scale-125 origin-center ${locale === 'ar' ? 'lg:origin-right' : 'lg:origin-left'}`}>
                <InteractivePortalCTA locale={locale} i18n={i18n} />
              </div>
            </div>
          </Reveal>
        </div>

        {/* DESKTOP ANIMATION COLUMN */}
        <div className="hidden lg:flex lg:w-[45%] h-full items-center justify-center lg:pr-16">
           <ArishGlobe />
        </div>

      </div>
    </section>
  );
}