"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";
import projects from "../../../data/projects.json";
import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { HorizontalMarquee } from "@/components/ui/OptimizedMarquee";

export default function ProjectsTeaser() {
  const { locale } = useLocale();
  const featured = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order).slice(0, 3);

  return (
    <section className="relative w-full px-6 py-24 sm:py-32 lg:py-48 lg:px-20 bg-[var(--color-background)] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -left-20 top-0 h-96 w-96 bg-[var(--color-primary)] opacity-[0.03] blur-[100px] rounded-full" />
      
      <div className="mx-auto max-w-7xl relative">
        {/* Header */}
        <div className="mb-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
          <div className="max-w-4xl">
            <Reveal direction="down">
              <div className="mb-8">
                <Eyebrow color="var(--color-gold)" size="base">
                  {i18n[locale].projects_teaser.eyebrow}
                </Eyebrow>
              </div>
            </Reveal>
            <Reveal direction="up" delay={100}>
              <h2 className="text-6xl sm:text-8xl lg:text-[120px] font-black leading-[0.85] tracking-tighter" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
                {i18n[locale].projects_teaser.headline}
              </h2>
            </Reveal>
          </div>
          <Reveal direction="up" delay={200}>
            <Link href="/projects" className="group inline-flex items-center gap-6 text-sm font-black uppercase tracking-[0.2em] text-gold" style={{ fontFamily: "var(--font-ui)" }}>
              <span className="border-b border-gold pb-1 transition-all duration-300 group-hover:border-transparent">
                {i18n[locale].projects_teaser.all_projects_link}
              </span>
              <div className="h-12 w-12 rounded-full border border-gold flex items-center justify-center transition-all duration-500 group-hover:bg-gold group-hover:text-ink group-hover:-translate-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>
          </Reveal>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {featured.map((project, i) => {
            const currentTitle = locale === 'ar' ? project.titleAr : project.titleEn;
            const currentDesc = locale === 'ar' ? project.descriptionAr : project.descriptionEn;

            return (
              <Reveal key={project.slug} direction="up" delay={Math.min(i * 100, 200)} distance={32}>
                <Link href={"/projects/" + project.slug} className="group relative block aspect-[8/6] w-full overflow-hidden rounded-[40px] border border-[var(--color-border-dark)] bg-[var(--color-ink)] transition-all duration-700 hover:-translate-y-4 ">
                  {/* Marquee background */}
                  <HorizontalMarquee images={project.headerImages} basePath={project.basePath} speed={3.6} />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 sm:p-8 lg:p-10 flex flex-col transition-all duration-500 justify-end hover:bg-gold/80">
                    <h3 className="mb-1 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight text-white transition-transform duration-500 group-hover:-translate-y-2 mix-blend-difference" style={{ fontFamily: "var(--font-heading)" }}>
                      {currentTitle}
                    </h3>
                    
                    <div className="h-0 overflow-hidden transition-all duration-500 group-hover:h-24">
                      <p className="text-xs sm:text-sm leading-relaxed text-white/70 line-clamp-3" style={{ fontFamily: "var(--font-body)" }}>
                        {currentDesc}
                      </p>
                    </div>

                    <div className="mt-6 sm:mt-8 h-px w-12 bg-gold transition-all duration-700 group-hover:w-full" ></div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
