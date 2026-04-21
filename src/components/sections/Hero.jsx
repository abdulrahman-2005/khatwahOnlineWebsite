"use client";

import dynamic from "next/dynamic";
import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/contexts/LocaleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getConsultationWhatsAppLink } from "@/utils/whatsapp";
import i18n from "../../../data/i18n.json";

// Lazy load the heavy Three.js globe only when needed
const ArishGlobe = dynamic(() => import("@/components/ui/GlobeAnimation").then(mod => ({ default: mod.ArishGlobe })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-transparent">
      <div className="animate-pulse rounded-full border border-gold/20 p-8">
        <span className="text-gold/50 text-sm" style={{ fontFamily: "var(--font-body)" }}>
          Loading 3D Experience...
        </span>
      </div>
    </div>
  )
});

export default function Hero() {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const brandName = locale === 'ar' ? i18n[locale].hero.brand_name : i18n[locale].hero.brand_name_en;
  const brandSubtitle = locale === 'ar' ? i18n[locale].hero.brand_subtitle : i18n[locale].hero.brand_subtitle_en;

  return (
    <section className="relative flex min-h-screen w-full overflow-hidden bg-[var(--color-background)] transition-colors duration-500">

      {/* Background Globe: Mobile version */}
      <div 
        className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none lg:hidden"
        style={{
          opacity: 0,
          transform: locale === 'en' 
            ? 'translateX(100vw) translateY(20px) scale(1.6)'
            : 'translateX(-100vw) translateY(20px) scale(1.6)',
          animation: locale === 'en' 
            ? 'globeSlideMobileRight 1.2s ease-out 0.5s forwards'
            : 'globeSlideMobileLeft 1.2s ease-out 0.5s forwards'
        }}
      >
         <ArishGlobe mobile />
      </div>

      {/* Background Globe: Desktop version */}
      <div className="hidden lg:block absolute inset-0 z-5 pointer-events-none bg-transparent overflow-hidden">
        <div 
          className={`absolute top-1/2 w-[250vh] h-[250vh] ${
            locale === 'ar' 
              ? 'left-0' 
              : 'right-0'
          }`}
          style={{
            opacity: 0,
            transform: locale === 'ar' 
              ? 'translateX(-100%) translateY(-50%)' 
              : 'translateX(100%) translateY(-50%)',
            animation: locale === 'ar' 
              ? 'globeSlideLeft 1.2s ease-out 0.5s forwards'
              : 'globeSlideRight 1.2s ease-out 0.5s forwards'
          }}
        >
          <ArishGlobe mobile={false} />
        </div>
      </div>

      {/* Atmospheric Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 ${locale === 'ar' ? 'right-1/4' : 'left-1/4'} w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[var(--color-primary-glow)] rounded-full blur-[100px] sm:blur-[140px] ${isLight ? 'opacity-30' : 'opacity-25'}`} />
        <div className={`absolute bottom-1/4 ${locale === 'ar' ? 'left-1/4' : 'right-1/4'} w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[var(--color-gold-glow)] rounded-full blur-[100px] sm:blur-[140px] ${isLight ? 'opacity-25' : 'opacity-20'}`} />
      </div>

      {/* MAIN CONTAINER - with top padding to clear navbar */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 xl:px-20 py-16 lg:py-0 pt-[100px] lg:pt-0">
        
        {/* Mobile/Tablet: Single Column */}
        <div className="w-full max-w-7xl mx-auto lg:hidden flex flex-col items-center text-center space-y-8">
          
          {/* Brand Name - Mobile */}
          <Reveal direction="up" distance={30} duration={800}>
            <div className="flex flex-col items-center gap-4">
              <div 
                className={`font-black uppercase transition-all duration-700 ${
                  locale === 'ar' 
                    ? 'text-[32vw] sm:text-[18vw] leading-[0.85]' 
                    : 'text-[18vw] sm:text-[14vw] leading-[0.8] tracking-tighter'
                }`}
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text)"
                }}
              >
                {brandName}
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className={`h-px w-10 sm:w-16 bg-gold `} />
                <span 
                  className={`text-2xl sm:text-3xl font-black tracking-[0.25em] uppercase text-gold `} 
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {brandSubtitle}
                </span>
                <span className={`h-px w-10 sm:w-16 bg-gold`} />
              </div>
            </div>
          </Reveal>

          {/* Headline - Mobile */}
          <Reveal direction="up" distance={20} delay={150} duration={700}>
            <h1 className={`text-3xl sm:text-4xl font-black leading-tight max-w-2xl`} style={{ fontFamily: "var(--font-body)", textShadow: isLight ? 'none' : '0 4px 12px rgba(0,0,0,0.3)' }}>
              {locale === 'ar' ? i18n[locale].hero.headline_ar : i18n[locale].hero.headline_en}
            </h1>
          </Reveal>

          {/* Description - Mobile */}
          <Reveal direction="up" distance={20} delay={250} duration={700}>
            <p className={`text-base sm:text-lg leading-relaxed max-w-xl`} style={{ fontFamily: "var(--font-body)" }}>
              {i18n[locale].hero.body}
            </p>
          </Reveal>

          {/* Buttons - Mobile */}
          <Reveal direction="up" distance={20} delay={350} duration={700}>
            <div className="flex flex-col w-screen max-w-sm gap-4 pt-4 px-5">
              {/* Primary CTA - Free Consultation via WhatsApp */}
              <a 
                href={getConsultationWhatsAppLink(locale)}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative px-8 py-5 rounded-4xl font-bold text-lg transition-all duration-300 bg-gold overflow-hidden hover:-translate-y-0.5 active:translate-y-0 border border-transparent hover:border-white/20`}
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                  {locale === 'ar' ? 'احجز استشارة مجانية' : 'Get Free Consultation'}
                </span>
                <div className={`absolute inset-0 bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </a>

              {/* Secondary CTA - View Projects */}
              <a 
                href="/projects"
                className={`group relative px-8 py-5 rounded-4xl font-bold text-lg transition-all duration-300 border-2 ${
                  isLight 
                    ? 'border-text/20 text-text bg-white hover:bg-text hover:text-white hover:border-text shadow-md hover:shadow-lg' 
                    : 'border-white/30 text-white bg-white/10 hover:bg-white hover:text-background hover:border-white shadow-md shadow-white/10 hover:shadow-lg hover:shadow-white/20 backdrop-blur-sm'
                } hover:-translate-y-0.5 active:translate-y-0`}
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                  {i18n[locale].hero.cta_secondary}
                  <span className="text-base transition-transform duration-300 group-hover:translate-x-1">{locale === 'ar' ? '←' : '→'}</span>
                </span>
              </a>
            </div>
          </Reveal>

        </div>

        {/* Desktop: Two Column Layout */}
        <div className="hidden lg:grid w-full max-w-7xl mx-auto grid-cols-2 gap-16 xl:gap-[5rem] items-center">
          
          {/* LEFT COLUMN - Brand Name */}
          <div className="flex flex-col items-start justify-center">
            <Reveal direction="up" distance={40} duration={900}>
              <div className="flex flex-col items-start gap-6">
                <div 
                  className={`font-black uppercase transition-all duration-700 ${
                    locale === 'ar' 
                      ? 'text-[240px] xl:text-[280px] leading-[0.85]' 
                      : 'text-[110px] xl:text-[140px] leading-[0.75] tracking-tighter'
                  }`}
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-text)",
                    textShadow: isLight ? 'none' : '0 8px 32px rgba(0,0,0,0.4)'
                  }}
                >
                  {brandName}
                </div>
                <div className="flex items-center gap-6 w-full">
                  <span className={`h-[2px] w-16 bg-gold ${isLight ? 'opacity-60' : 'opacity-50'}`} />
                  <span 
                    className={`text-4xl xl:text-5xl 2xl:text-6xl font-black tracking-[0.3em] uppercase text-gold ${!isLight ? 'drop-shadow-[0_0_30px_var(--color-gold-glow)]' : ''}`} 
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {brandSubtitle}
                  </span>
                  <span className={`h-[2px] flex-1 bg-gold ${isLight ? 'opacity-60' : 'opacity-50'}`} />
                </div>
              </div>
            </Reveal>
          </div>

          {/* RIGHT COLUMN - Content & CTAs */}
          <div className="flex flex-col items-start justify-center space-y-8 bg-black/10 backdrop-blur-lg rounded-4xl p-8">
            
            {/* Headline */}
            <Reveal direction="up" distance={30} delay={200} duration={800}>
              <h1 className={`text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight`} style={{ fontFamily: "var(--font-body)"}}>
                {locale === 'ar' ? i18n[locale].hero.headline_ar : i18n[locale].hero.headline_en}
              </h1>
            </Reveal>

            {/* Description */}
            <Reveal direction="up" distance={30} delay={300} duration={800}>
              <p className={`text-lg xl:text-2xl 2xl:text-3xl leading-relaxed`} style={{ fontFamily: "var(--font-body)" }}>
                {i18n[locale].hero.body}
              </p>
            </Reveal>

            {/* CTA Buttons */}
            <Reveal direction="up" distance={30} delay={400} duration={800}>
              <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full">
                {/* Primary CTA - Free Consultation via WhatsApp */}
                <a 
                  href={getConsultationWhatsAppLink(locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative px-10 py-6 rounded-4xl font-bold text-xl transition-all duration-300 overflow-hidden bg-gold hover:-translate-y-1 active:translate-y-0 border border-transparent hover:border-white/20`}
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                    {locale === 'ar' ? 'احجز استشارة مجانية' : 'Get Free Consultation'}
                  </span>
                  <div className={`absolute inset-0 bg-gradient-to-r ${
                    isLight 
                      ? 'from-gold-dark to-gold' 
                      : 'from-gold-light to-gold-dark'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </a>

                {/* Secondary CTA - View Projects */}
                <a 
                  href="/projects"
                  className={`group relative px-10 py-6 rounded-4xl font-bold text-xl transition-all duration-300 border-2 ${
                    isLight 
                      ? 'border-text/20 text-text bg-white hover:bg-text hover:text-white hover:border-text' 
                      : 'border-white/30 text-white bg-white/10 hover:bg-white hover:text-background hover:border-white backdrop-blur-sm'
                  } hover:-translate-y-1 active:translate-y-0`}
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                    {i18n[locale].hero.cta_secondary}
                    <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">{locale === 'ar' ? '←' : '→'}</span>
                  </span>
                </a>
              </div>
            </Reveal>

          </div>

        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes globeSlideMobileLeft {
          0% { 
            transform: translateX(-100vw) translateY(20px) scale(1.6);
            opacity: 0;
          }
          100% { 
            transform: translateX(0) translateY(20px) scale(1.6);
            opacity: 0.3;
          }
        }
        
        @keyframes globeSlideMobileRight {
          0% { 
            transform: translateX(100vw) translateY(20px) scale(1.6);
            opacity: 0;
          }
          100% { 
            transform: translateX(0) translateY(20px) scale(1.6);
            opacity: 0.3;
          }
        }
        
        @keyframes globeSlideLeft {
          0% { 
            transform: translateX(-100%) translateY(-50%);
            opacity: 0;
          }
          100% { 
            transform: translateX(-30%) translateY(-50%);
            opacity: 0.25;
          }
        }
        
        @keyframes globeSlideRight {
          0% { 
            transform: translateX(100%) translateY(-50%);
            opacity: 0;
          }
          100% { 
            transform: translateX(35%) translateY(-50%);
            opacity: 0.25;
          }
        }
      `}</style>
    </section>
  );
}