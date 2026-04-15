"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";
import projects from "../../../data/projects.json";
import { Reveal } from "@/components/ui/Reveal";
import { useEffect, useRef } from "react";

/* --- Mini Marquee for card background --- */
function CardMarquee({ images, basePath }) {
  const trackRef = useRef(null);
  const stateRef = useRef({
    cards: [],
    scroll: 0,
    paused: false,
    raf: null,
    nextDataIdx: 0,
    speed: 3.6,
  });

  useEffect(() => {
    if (!images || images.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const updateMarquee = () => {
      const rect = track.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const containerW = rect.width;
      const containerH = rect.height;
      const GAP = 20;
      const CARD_W = containerW + GAP;
      const SLOT = CARD_W;

      const numCards = 3;
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
          width: ${containerW}px;
          height: ${containerH}px;
          overflow: hidden;
          flex-shrink: 0;
          will-change: transform;
        `;

        const img = document.createElement("img");
        img.src = `${basePath}/${imgSrc}`;
        img.alt = "";
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.6);
        `;
        card.appendChild(img);
        track.appendChild(card);
        s.cards.push({ el: card, img, offset: i * SLOT, cardWidth: containerW, slot: SLOT, totalW: totalWidth });
      }
    };

    updateMarquee();
    window.addEventListener('resize', updateMarquee);

    const handlePause = () => { stateRef.current.paused = true; };
    const handleResume = () => { stateRef.current.paused = false; };
    track.addEventListener('mouseenter', handlePause);
    track.addEventListener('mouseleave', handleResume);

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
      track.removeEventListener('mouseenter', handlePause);
      track.removeEventListener('mouseleave', handleResume);
    };
  }, [images, basePath]);

  return (
    <div ref={trackRef} className="absolute inset-0 w-full h-full overflow-hidden" />
  );
}

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
              <div className="mb-8 flex items-center gap-4">
                <span className="h-[1px] w-12 bg-[var(--color-gold)]" />
                <span className="text-xs font-black uppercase tracking-[0.4em] text-[var(--color-gold)]" style={{ fontFamily: "var(--font-display)" }}>
                  {i18n[locale].projects_teaser.eyebrow}
                </span>
              </div>
            </Reveal>
            <Reveal direction="up" delay={100}>
              <h2 className="text-6xl sm:text-8xl lg:text-[120px] font-black leading-[0.85] tracking-tighter" style={{ color: "var(--color-text)" }}>
                {i18n[locale].projects_teaser.headline}
              </h2>
            </Reveal>
          </div>
          <Reveal direction="up" delay={200}>
            <Link href="/projects" className="group inline-flex items-center gap-6 text-sm font-black uppercase tracking-[0.2em] text-[var(--color-gold)]">
              <span className="border-b border-[var(--color-gold)] pb-1 transition-all duration-300 group-hover:border-transparent">
                {i18n[locale].projects_teaser.all_projects_link}
              </span>
              <div className="h-12 w-12 rounded-full border border-[var(--color-gold)] flex items-center justify-center transition-all duration-500 group-hover:bg-[var(--color-gold)] group-hover:text-[var(--color-ink)] group-hover:-translate-x-2">
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
              <Reveal key={project.slug} direction="up" delay={i * 150} distance={40}>
                <Link href={"/projects/" + project.slug} className="group relative block aspect-[8/6] w-full overflow-hidden rounded-[40px] border border-[var(--color-border-dark)] bg-[var(--color-ink)] transition-all duration-700 hover:-translate-y-4 ">
                  {/* Marquee background */}
                  <CardMarquee images={project.headerImages} basePath={project.basePath} />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-10 flex flex-col transition-all duration-500 justify-end hover:bg-[var(--color-gold)]">
                    <span className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-gold)]">
                      0{i + 1} // {project.techStack[0]}
                    </span>
                    <h3 className="mb-6 text-3xl font-black leading-tight tracking-tight text-white transition-transform duration-500 group-hover:-translate-y-2 mix-blend-difference">
                      {currentTitle}
                    </h3>
                    
                    <div className="h-0 overflow-hidden transition-all duration-500 group-hover:h-24 ">
                      <p className="text-sm leading-relaxed text-[var(--color-text-on-dark-muted)] line-clamp-3">
                        {currentDesc}
                      </p>
                    </div>

                    <div className="mt-8 h-[1px] w-12 bg-[var(--color-gold)] transition-all duration-700 group-hover:w-full" ></div>
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
