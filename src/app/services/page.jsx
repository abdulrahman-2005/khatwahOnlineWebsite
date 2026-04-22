"use client";

import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import Image from "next/image";
import servicesData from "../../../data/services.json";
import i18n from "../../../data/i18n.json";
import { useLocale } from "@/contexts/LocaleContext";
import { ArrowUpRight, Sparkles, Zap, Layers } from "lucide-react";

export default function ServicesPage() {
  const { locale } = useLocale();
  const t = i18n[locale].services_page;
  const services = servicesData[locale] || servicesData.en;

  return (
    <main className="min-h-screen bg-[var(--color-surface)] selection:bg-[var(--color-gold)] selection:text-white pb-32">
      {/* 🌟 ULTRA HIGH-END HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        {/* Dynamic Abstract Background Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full sm:h-[800px] sm:w-[800px] bg-[var(--color-gold-glow)] blur-[150px] opacity-[0.15]" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full sm:h-[800px] sm:w-[800px] bg-blue-500/20 blur-[150px] opacity-[0.1]" />
          
          {/* Subtle Grid Netting */}
          <div className="absolute inset-0 bg-[length:40px_40px] opacity-[0.03] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <Reveal direction="up" distance={40}>
            <div className="flex flex-col items-center text-center">
              {/* Premium Floating Badge */}
              <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-[var(--color-background)] px-5 py-2.5 border border-[var(--color-border)] shadow-sm animate-fade-in">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-gold)] text-white shadow-md">
                  <Sparkles size={14} fill="currentColor" />
                </span>
                <span className="text-[14px] font-bold tracking-wider uppercase text-[var(--color-text)] mx-2">
                  {t.ecosystem}
                </span>
              </div>

              {/* Massive Modern Headline */}
              <h1 className="mb-8 text-[50px] md:text-[80px] lg:text-[100px] font-black leading-[0.95] tracking-[-0.04em]" 
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
                {t.hero_headline_1} <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--color-gold) 0%, #ff8c00 100%)" }}>
                  {t.hero_headline_2}
                </span>
              </h1>

              {/* Sophisticated Subheadline */}
              <p className="mx-auto max-w-2xl text-[18px] md:text-[22px] font-medium leading-relaxed" 
                style={{ color: "var(--color-text-muted)" }}>
                {t.hero_subtitle}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 🚀 BENTO GRID MARKETPLACE */}
      <section className="px-4 sm:px-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
            {services.map((service, index) => (
              <Reveal key={service.slug} direction="up" distance={40} delay={index * 150}>
                <ServiceCard service={service} index={index} t={t} />
              </Reveal>
            ))}
          </div>

          {/* Coming Soon Premium Card */}
          <Reveal direction="up" distance={40} delay={400}>
            <div className="mt-12 lg:mt-16 w-full rounded-[40px] border border-dashed border-[var(--color-border)] bg-[var(--color-background)] opacity-80 backdrop-blur-sm p-12 lg:p-20 flex flex-col items-center justify-center text-center transition-all duration-500 hover:opacity-100 hover:border-solid hover:shadow-2xl group">
               <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-[var(--color-surface)] shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:bg-[var(--color-gold)] group-hover:text-white">
                  <Layers size={40} className="text-[var(--color-text-muted)] group-hover:text-white transition-colors duration-500" />
               </div>
               <h3 className="mb-4 text-[32px] font-black tracking-tight" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}>
                 {t.coming_soon_title}
               </h3>
               <p className="text-[18px] font-medium max-w-lg" style={{ color: "var(--color-text-muted)" }}>
                 {t.coming_soon_body}
               </p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({ service, index, t }) {
  return (
    <Link href={`/services/${service.slug}`} className="group block h-full outline-none">
      <article className="flex flex-col h-full overflow-hidden rounded-[48px] bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-4 relative">
        
        {/* Visual Showcase (70% of height) */}
        <div className="relative h-[420px] w-full overflow-hidden p-4">
          <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-[var(--color-surface)]">
            {/* Mesh Glow Background */}
            <div className="absolute inset-0 opacity-[0.05]" />
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--color-gold)] opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-700" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500 opacity-5 blur-3xl group-hover:opacity-10 transition-opacity duration-700" />
            
            <Image
              src={`/services/${service.slug}/assets/banner.png`}
              alt={service.title}
              fill
              className="object-fit transition-transform duration-[2s] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
           
            {/* Bottom Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <p className="mb-2 text-[12px] font-black text-[var(--color-gold)] uppercase tracking-[0.3em]">{service.category}</p>
              <h2 className="mb-3 text-[36px] md:text-[44px] font-black leading-[0.9] tracking-tight text-white" 
                 style={{ fontFamily: "var(--font-display)" }}>
                {service.title}
              </h2>
              <p className="text-[16px] font-bold text-white/70 line-clamp-2 max-w-sm">
                {service.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar (Simplified) */}
        <div className="flex items-center justify-between px-10 pb-10 pt-2">
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors">{t.start_building}</span>
            <span className="text-[11px] font-black text-[var(--color-gold)] uppercase tracking-wider">{t.free_forever}</span>
          </div>
          
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--color-surface)] border border-[var(--color-border)] group-hover:bg-[var(--color-gold)] group-hover:border-transparent transition-all duration-500 shadow-sm group-hover:shadow-[0_10px_30px_-10px_var(--color-gold)] group-hover:-rotate-12">
            <ArrowUpRight size={28} className="text-[var(--color-text)] group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Hover Hover Overlay Detail */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-700">
           <Zap size={300} fill="currentColor" className="text-[var(--color-gold)]" />
        </div>
      </article>
    </Link>
  );
}
