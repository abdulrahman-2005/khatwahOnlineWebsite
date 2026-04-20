"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { getProjectWhatsAppLink } from "@/utils/whatsapp";
import i18n from "../../../../data/i18n.json";
import { Reveal } from "@/components/ui/Reveal";
import { InfiniteMarquee as OptimizedInfiniteMarquee } from "@/components/ui/OptimizedMarquee";

/* --- Wrapper for Infinite Marquee with gradients --- */
function InfiniteMarquee({ images, basePath }) {
  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-surface-elevated)] border-y border-[var(--color-border)] py-6 sm:py-16">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 sm:w-48 bg-gradient-to-r from-[var(--color-surface-elevated)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 sm:w-48 bg-gradient-to-l from-[var(--color-surface-elevated)] to-transparent" />
      <OptimizedInfiniteMarquee images={images} basePath={basePath} speed={1.2} />
    </section>
  );
}

/* --- Main Component --- */
export default function ProjectDetailContent({ project }) {
  const { locale } = useLocale();
  const t = i18n[locale].common;

  const currentTitle = locale === "ar" ? project.titleAr : project.titleEn;
  const currentDesc = locale === "ar" ? project.descriptionAr : project.descriptionEn;
  const detailedDesc = locale === "ar" ? project.detailedDescriptionAr : project.detailedDescriptionEn;

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24 pt-20" dir={locale === "ar" ? "rtl" : "ltr"}>

      {/* 1. HERO SECTION */}
      <section className="relative w-full px-6 py-12 sm:py-20 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          
          <Reveal direction="down">
            <Link
              href="/projects"
              className="group mb-12 sm:mb-20 inline-flex items-center gap-3 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[var(--color-border)] group-hover:border-[var(--color-gold)] transition-all">
                <svg className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${locale === "ar" ? "group-hover:translate-x-1" : "group-hover:-translate-x-1"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={locale === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                </svg>
              </div>
              <span>{i18n[locale].common.back_to_projects}</span>
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            
            <div className="lg:col-span-8">
              <Reveal direction="up" delay={100}>
                <h1 className="text-4xl sm:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.95] mb-8 sm:mb-12 text-[var(--color-text)]">
                  {currentTitle}
                </h1>
              </Reveal>

              <Reveal direction="up" delay={200}>
                <div className="flex flex-col gap-8 sm:gap-10 max-w-3xl">
                  <p className="text-xl sm:text-4xl font-bold text-[var(--color-gold)] leading-tight tracking-tight">
                    {currentDesc}
                  </p>
                  <p className="text-base sm:text-xl font-medium text-[var(--color-text-secondary)] leading-relaxed border-l-4 border-[var(--color-gold)] pl-6 sm:pl-8 py-2">
                    {detailedDesc}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-10 sm:gap-12 lg:pt-4">
              {project.url && (
                <Reveal direction="up" delay={300}>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex w-full items-center justify-between gap-4 sm:gap-6 overflow-hidden rounded-2xl bg-[var(--color-gold)] p-1 transition-all duration-500 hover:rounded-[2.5rem] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--color-ink)]/60 mb-1.5">
                          {t.visit_website}
                        </span>
                        <span className="text-xs sm:text-base font-black uppercase tracking-tight text-[var(--color-ink)]">
                          {project.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-[var(--color-ink)] text-[var(--color-gold)] transition-all duration-500 group-hover:scale-90 group-hover:rounded-full group-hover:rotate-45">
                      <svg className="h-5 w-5 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  </a>
                </Reveal>
              )}

              <Reveal direction="up" delay={400}>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-gold)]">{t.tech_stack}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--color-text)] border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-elevated)]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MARQUEE */}
      <InfiniteMarquee images={project.headerImages} basePath={project.basePath} />

      {/* 3. SECTIONS */}
      {project.sections.map((section, idx) => (
        <section 
          key={idx} 
          className={`px-6 py-32 sm:py-48 sm:px-12 lg:px-24 border-b border-[var(--color-border)] ${idx % 2 === 0 ? "bg-[var(--color-background)]" : "bg-[#f8f9fa] dark:bg-[var(--color-surface-elevated)]"}`}
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
              
              <div className="lg:col-span-5 lg:sticky lg:top-32">
                <Reveal direction="down">
                  <div className="mb-6 sm:mb-8 flex items-center gap-4">
                    <span className="h-0.5 w-12 bg-[var(--color-gold)]" />
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-[var(--color-gold)]">
                      {t.section_label} 0{idx + 1}
                    </span>
                  </div>
                </Reveal>
                <Reveal direction="up" delay={100}>
                  <h2 className="mb-6 sm:mb-10 text-3xl sm:text-6xl font-black tracking-tighter leading-tight text-[var(--color-text)]">
                    {locale === "ar" ? section.titleAr : section.titleEn}
                  </h2>
                </Reveal>
                <Reveal direction="up" delay={200}>
                  <p className="text-lg sm:text-xl leading-relaxed text-[var(--color-text-secondary)] font-medium border-l-4 border-[var(--color-gold)]/30 pl-6 sm:pl-8 py-1">
                    {locale === "ar" ? section.descriptionAr : section.descriptionEn}
                  </p>
                </Reveal>
              </div>

              <div className="lg:col-span-7 flex flex-col gap-10 sm:gap-24">
                {section.screenshots.map((ss, sIdx) => (
                  <Reveal key={sIdx} direction="up" delay={sIdx * 100} distance={40}>
                    <div className="group">
                      <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-500 group-hover:border-[var(--color-gold)]/50">
                        <Image 
                          src={`${project.basePath}/${ss.src}`} 
                          alt={locale === "ar" ? ss.labelAr : ss.labelEn} 
                          fill 
                          className="object-contain p-4 sm:p-8" 
                          sizes="(max-width: 1024px) 100vw, 50vw" 
                        />
                      </div>
                      <div className="mt-4 sm:mt-6 flex items-center justify-between px-2 sm:px-4">
                        <h4 className="text-base sm:text-xl font-black text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors">
                          {locale === "ar" ? ss.labelAr : ss.labelEn}
                        </h4>
                        <span className="text-[9px] sm:text-[10px] font-black text-[var(--color-gold)] opacity-40">0{idx+1}.0{sIdx+1}</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="px-6 py-32 sm:py-40 border-t border-border bg-surface-elevated">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal direction="up">
            <h2 className="mb-14 text-5xl sm:text-8xl font-black leading-none tracking-tighter text-(--color-text)" style={{ fontFamily: "var(--font-display)" }}>
              {i18n[locale].common.like_what_you_see}
              <br />
              <span className="text-gold" style={{fontFamily: "var(--font-ui)"}}>{i18n[locale].common.can_build_better}</span>
            </h2>
          </Reveal>


          <Reveal direction="up" delay={200}>
            <a
              href={getProjectWhatsAppLink(project, locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-6 overflow-hidden rounded-full bg-gold px-12 py-6 sm:px-16 sm:py-8 text-sm font-black uppercase tracking-[0.3em] text-ink transition-all hover:pr-20 active:scale-95"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <span className="relative z-10 text-4xl">{i18n[locale].common.contact_us}</span>
              <div className="absolute right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                 <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
              </div>
            </a>
          </Reveal>

          <Reveal direction="up" delay={300}>
            <div className="mt-16 pt-12 border-t border-border">
              <p className="text-sm text-text-muted mb-6">
                {i18n[locale].seo_content.browse_more}
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center gap-3 text-sm font-bold text-gold hover:text-primary transition-colors"
              >
                <span>{i18n[locale].seo_content.all_projects}</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={locale === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </Link>
              <span className="mx-4 text-text-muted">|</span>
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-sm font-bold text-gold hover:text-primary transition-colors"
              >
                <span>{i18n[locale].seo_content.home}</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={locale === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}






