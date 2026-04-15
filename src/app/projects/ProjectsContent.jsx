"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";
import projects from "../../../data/projects.json";
import { Reveal } from "@/components/ui/Reveal";
import { useEffect, useRef } from "react";

/* --- Card Marquee (vertical: stacked images scroll up) --- */
function CardMarquee({ images, basePath }) {
  const trackRef = useRef(null);
  const stateRef = useRef({
    columns: [],
    scroll: 0,
    paused: false,
    raf: null,
    nextImgIdx: 0,
    speed: 0.6,
  });

  useEffect(() => {
    if (!images || images.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const GAP = 12;
    const NUM_COLS = 2;
    const IMGS_PER_COL = 2;

    const updateMarquee = () => {
      const rect = track.getBoundingClientRect();
      if (!rect) return;
      const containerW = Math.round(rect.width);
      const containerH = Math.round(rect.height);
      const colH = containerH + GAP;
      const totalH = NUM_COLS * colH;
      const imgH = Math.round((containerH - GAP) / IMGS_PER_COL);
      const s = stateRef.current;
      s.nextImgIdx = NUM_COLS * IMGS_PER_COL;

      // Reset
      track.innerHTML = '';
      track.style.position = 'absolute';
      track.style.top = '0';
      track.style.left = '0';
      track.style.width = containerW + 'px';
      track.style.height = containerH + 'px';
      track.style.overflow = 'hidden';
      s.columns = [];
      s.scroll = 0;

      let imgIdx = 0;
      for (let col = 0; col < NUM_COLS; col++) {
        const card = document.createElement('div');
        card.style.position = 'absolute';
        card.style.top = '0';
        card.style.left = '0';
        card.style.width = containerW + 'px';
        card.style.height = containerH + 'px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = GAP + 'px';
        card.style.flexShrink = '0';
        card.style.overflow = 'hidden';
        card.style.willChange = 'transform';
        card.style.boxSizing = 'border-box';

        const imgs = [];
        for (let row = 0; row < IMGS_PER_COL; row++) {
          const img = document.createElement('img');
          img.src = `${basePath}/${images[imgIdx % images.length]}`;
          img.alt = '';
          img.style.width = containerW + 'px';
          img.style.height = imgH + 'px';
          img.style.objectFit = 'cover';
          img.style.display = 'block';
          img.style.flexShrink = '0';
          img.style.boxSizing = 'border-box';
          img.style.margin = '0';
          img.style.padding = '0';
          card.appendChild(img);
          imgs.push(img);
          imgIdx++;
        }
        track.appendChild(card);
        s.columns.push({ el: card, imgs, offset: col * colH, colH, totalH });
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

      for (const col of s.columns) {
        let y = col.offset - s.scroll;
        if (y < -col.colH) {
          col.offset += col.totalH;
          y = col.offset - s.scroll;
          for (const img of col.imgs) {
            img.src = `${basePath}/${images[s.nextImgIdx % images.length]}`;
            s.nextImgIdx++;
          }
        }
        col.el.style.transform = `translate3d(0, ${y}px, 0)`;
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
    <div ref={trackRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: '100%', height: '100%' }} />
  );
}

export default function ProjectsContent() {
  const { locale } = useLocale();
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  const statusLabels = {
    live: i18n[locale].common.live,
    wip: i18n[locale].common.wip,
    concept: i18n[locale].common.concept
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-40 pb-24 sm:px-12 sm:pt-60 sm:pb-40 lg:px-20">
        <div className="absolute -right-32 top-16 h-[600px] w-[600px] opacity-10 blur-[150px] bg-[var(--color-gold)] rounded-full" />
        <div className="absolute -left-20 bottom-0 h-[500px] w-[500px] opacity-10 blur-[120px] bg-[var(--color-primary)] rounded-full" />

        <div className="relative mx-auto max-w-7xl">
          <Reveal direction="down" distance={20}>
            <div className="mb-8 flex items-center gap-4">
              <span className="h-[1px] w-12 bg-[var(--color-gold)]" />
              <span className="text-xs font-black tracking-[0.4em] uppercase text-[var(--color-gold)]">
                {i18n[locale].projects_page.hero_eyebrow}
              </span>
            </div>
          </Reveal>

          <Reveal direction="up" distance={30} delay={100}>
            <h1 className="max-w-5xl text-7xl font-black leading-[0.8] sm:text-9xl lg:text-[160px] tracking-tighter" style={{ color: "var(--color-text)" }}>
              {i18n[locale].projects_page.hero_headline}
            </h1>
          </Reveal>

          <Reveal direction="up" distance={20} delay={200}>
            <p className="mt-16 max-w-2xl text-xl sm:text-2xl leading-relaxed text-[var(--color-text-muted)] font-medium">
              {i18n[locale].projects_page.hero_subtitle}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative px-6 py-32 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((project, i) => {
              const accent = project.status === "live" ? "var(--color-primary)" : project.status === "wip" ? "var(--color-gold)" : "var(--color-text-muted)";
              const currentTitle = locale === 'ar' ? project.titleAr : project.titleEn;
              const currentDesc = locale === 'ar' ? project.descriptionAr : project.descriptionEn;

              return (
                <Reveal key={project.slug} direction="up" distance={40} delay={i * 100}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group relative flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-[var(--color-gold)]/40 active:scale-[0.98]"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-surface-elevated)]">
                      {/* Marquee background (full bleed) */}
                      <CardMarquee images={project.headerImages} basePath={project.basePath} />

                      {/* Content layer */}
                      <div className="absolute inset-0 z-10 p-8 sm:p-12">
                      {/* Index */}
                      <div className="top-8 left-8 opacity-30 group-hover:opacity-100 transition-opacity absolute">
                         <span className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-[0.3em]">0{i + 1}</span>
                      </div>

                      {/* Status Badge */}
                      <div
                        className="bottom-6 right-6 rounded-full px-5 py-2 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md absolute"
                        style={{ backgroundColor: `var(${accent === 'var(--color-primary)' ? '--color-primary' : accent === 'var(--color-gold)' ? '--color-gold' : '--color-text-muted'})` }}
                      >
                        {statusLabels[project.status]}
                      </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 sm:p-10 border-t border-[var(--color-border)] flex-grow flex flex-col">
                      <h3 className="mb-4 text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text)] leading-tight group-hover:text-[var(--color-gold)] transition-colors">    
                        {currentTitle}
                      </h3>
                      <p className="text-sm sm:text-base leading-relaxed text-[var(--color-text-muted)] line-clamp-3 mb-8 font-medium">
                        {currentDesc}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2">
                         {project.techStack.slice(0, 3).map(t => (
                           <span key={t} className="text-[9px] font-black uppercase tracking-widest text-[var(--color-gold)] border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 px-3 py-1 rounded-lg">#{t}</span>
                         ))}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-32 sm:py-40 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal direction="up">
            <h2 className="mb-14 text-5xl sm:text-8xl font-black leading-none tracking-tighter text-[var(--color-text)]">
              {i18n[locale].projects_page.cta_headline_1}
              <br />
              <span className="text-[var(--color-gold)]">{i18n[locale].projects_page.cta_headline_2}</span>
            </h2>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <Link
              href="/contact"
              className="group relative inline-flex items-center gap-6 overflow-hidden rounded-full bg-[var(--color-gold)] px-12 py-6 sm:px-16 sm:py-8 text-sm font-black uppercase tracking-[0.3em] text-[var(--color-ink)] transition-all hover:pr-20 active:scale-95"
            >
              <span className="relative z-10">{i18n[locale].common.contact_us}</span>
              <div className="absolute right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                 <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
