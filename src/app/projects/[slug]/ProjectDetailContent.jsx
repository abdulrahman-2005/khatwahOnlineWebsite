"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../../data/i18n.json";
import { Reveal } from "@/components/ui/Reveal";
import { useEffect, useRef } from "react";

/* --- Infinite Marquee Component --- */
function InfiniteMarquee({ images, basePath }) {
  const trackRef = useRef(null);
  const stateRef = useRef({
    cards: [],
    scroll: 0,
    paused: false,
    raf: null,
    nextDataIdx: 0,
    speed: 1.2,
  });

  useEffect(() => {
    if (!images || images.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const updateMarquee = () => {
      const viewportW = window.innerWidth;
      const CARD_W = viewportW < 640 ? 200 : 500;
      const GAP = viewportW < 640 ? 12 : 24;
      const SLOT = CARD_W + GAP;
      
      const numCards = Math.ceil((viewportW * 2) / SLOT) + 4;
      const totalWidth = numCards * SLOT;
      const s = stateRef.current;
      s.nextDataIdx = numCards;

      track.innerHTML = "";
      s.cards = [];
      s.scroll = 0;

      for (let i = 0; i < numCards; i++) {
        const imgSrc = images[i % images.length];
        const card = document.createElement("div");
        card.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: ${CARD_W}px;
          height: ${viewportW < 640 ? "140px" : "320px"};
          border-radius: ${viewportW < 640 ? "16px" : "32px"};
          overflow: hidden;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          cursor: pointer;
          transform: translate3d(${i * SLOT}px, 0, 0);
          transition: border-color 0.4s;
          flex-shrink: 0;
          will-change: transform;
        `;

        const img = document.createElement("img");
        img.src = `${basePath}/${imgSrc}`;
        img.alt = "Project preview";
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.95);
          transition: filter 0.6s ease, transform 0.6s ease;
        `;
        card.appendChild(img);
        track.appendChild(card);
        s.cards.push({ el: card, img, offset: i * SLOT, cardWidth: CARD_W, slot: SLOT, totalW: totalWidth });
      }
    };

    updateMarquee();
    window.addEventListener('resize', updateMarquee);

    let lastTs = null;
    function loop(ts) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      
      const s = stateRef.current;
      if (!s.paused) s.scroll += s.speed * (dt / 16.67);

      for (const card of s.cards) {
        let x = card.offset - s.scroll;
        if (x < -card.slot) {
          card.offset += card.totalW;
          x = card.offset - s.scroll;
          const nextImg = images[s.nextDataIdx % images.length];
          card.img.src = `${basePath}/${nextImg}`;
          s.nextDataIdx++;
        }
        card.el.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      s.raf = requestAnimationFrame(loop);
    }
    stateRef.current.raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', updateMarquee);
      cancelAnimationFrame(stateRef.current.raf);
    };
  }, [images, basePath]);

  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-surface-elevated)] border-y border-[var(--color-border)] py-6 sm:py-16">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 sm:w-48 bg-gradient-to-r from-[var(--color-surface-elevated)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 sm:w-48 bg-gradient-to-l from-[var(--color-surface-elevated)] to-transparent" />
      <div ref={trackRef} className="relative h-[140px] sm:h-[320px] w-full" />
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

      {/* 4. CTA */}
      <section className="px-6 py-20 sm:py-32 bg-[var(--color-background)]">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] sm:rounded-[3rem] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-10 sm:p-24 text-center relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 h-96 w-96 opacity-10 blur-[100px] bg-[var(--color-gold)] rounded-full" />
          
          <Reveal direction="up">
            <h3 className="mb-6 sm:mb-8 text-3xl sm:text-6xl font-black tracking-tighter text-[var(--color-text)]">
              {i18n[locale].common.like_what_you_see}
            </h3>
          </Reveal>
          
          <Reveal direction="up" delay={100}>
            <p className="mb-10 sm:mb-14 text-base sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed font-medium">
              {i18n[locale].common.can_build_better}
            </p>
          </Reveal>
          
          <Reveal direction="up" delay={200}>
            <Link 
              href="/contact" 
              className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-[var(--color-gold)] px-10 py-5 sm:px-12 sm:py-6 text-xs sm:text-sm font-black uppercase tracking-widest text-[var(--color-ink)] transition-all hover:pr-14 sm:hover:pr-16 active:scale-95"
            >
              <span className="relative z-10">{i18n[locale].common.contact_us}</span>
              <div className="absolute right-4 sm:right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}






