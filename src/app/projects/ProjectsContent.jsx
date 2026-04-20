"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";
import projects from "../../../data/projects.json";
import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import { VerticalMarquee } from "@/components/ui/OptimizedMarquee";

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
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-32 sm:px-12 lg:px-20">
        <div className="absolute -right-32 top-16 h-[600px] w-[600px] animate-pulse opacity-10 blur-[150px] bg-gold rounded-full" style={{ animationDuration: "6s" }} />
        <div className="absolute -left-20 bottom-0 h-[500px] w-[500px] animate-pulse opacity-10 blur-[120px] bg-primary rounded-full" style={{ animationDuration: "5s" }} />

        <div className="relative mx-auto max-w-7xl">
          <Reveal direction="down" distance={20}>
            <div className="mb-8">
              <Eyebrow color="var(--color-gold)" size="lg">
                {i18n[locale].projects_page.hero_eyebrow}
              </Eyebrow>
            </div>
          </Reveal>

          <Reveal direction="up" distance={30} delay={100}>
            <h1 className="max-w-5xl text-7xl font-black leading-[0.8] sm:text-9xl lg:text-[160px] tracking-tighter" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
              <span className="relative inline-block animate-gradient bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] bg-clip-text text-transparent" style={{ backgroundSize: "200% auto" }}>
                {i18n[locale].projects_page.hero_headline}
              </span>
            </h1>
          </Reveal>

          <Reveal direction="up" distance={20} delay={200}>
            <p className="mt-16 max-w-2xl text-xl sm:text-2xl leading-relaxed text-text-muted font-medium" style={{ fontFamily: "var(--font-body)" }}>
              {i18n[locale].projects_page.hero_subtitle}
            </p>
          </Reveal>

        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator color="var(--color-gold)" />

        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes expand {
            0%, 100% { width: 3rem; }
            50% { width: 4rem; }
          }
          @keyframes gradient {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          .animate-float-slow {
            animation: float-slow 5s ease-in-out infinite;
          }
          .animate-expand {
            animation: expand 2s ease-in-out infinite;
          }
          .animate-gradient {
            animation: gradient 3s linear infinite;
          }
        `}</style>
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
                      <VerticalMarquee images={project.headerImages} basePath={project.basePath} speed={0.6} />

                      {/* Content layer */}
                      <div className="absolute inset-0 z-10 p-8 sm:p-12">
                      {/* Index */}
                      <div className="top-8 left-8 opacity-30 group-hover:opacity-100 transition-opacity absolute">
                         <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]" style={{ fontFamily: "var(--font-ui)" }}>0{i + 1}</span>
                      </div>

                      {/* Status Badge */}
                      <div
                        className="bottom-6 right-6 rounded-full px-5 py-2 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md absolute"
                        style={{ fontFamily: "var(--font-ui)", backgroundColor: `var(${accent === 'var(--color-primary)' ? '--color-primary' : accent === 'var(--color-gold)' ? '--color-gold' : '--color-text-muted'})` }}
                      >
                        {statusLabels[project.status]}
                      </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 sm:p-10 border-t border-border grow flex flex-col">
                      <h3 className="mb-4 text-2xl sm:text-3xl font-black tracking-tight text-(--color-text) leading-tight group-hover:text-gold transition-colors" style={{ fontFamily: "var(--font-heading)" }}>    
                        {currentTitle}
                      </h3>
                      <p className="text-sm sm:text-base leading-relaxed text-text-muted line-clamp-3 mb-8 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                        {currentDesc}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2">
                         {project.techStack.slice(0, 3).map(t => (
                           <span key={t} className="text-[9px] font-black uppercase tracking-widest text-gold border border-gold/20 bg-gold/5 px-3 py-1 rounded-lg" style={{ fontFamily: "var(--font-ui)" }}>#{t}</span>
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
      <section className="px-6 py-32 sm:py-40 border-t border-border bg-surface-elevated">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal direction="up">
            <h2 className="mb-14 text-5xl sm:text-8xl font-black leading-none tracking-tighter text-(--color-text)" style={{ fontFamily: "var(--font-display)" }}>
              {i18n[locale].projects_page.cta_headline_1}
              <br />
              <span className="text-gold">{i18n[locale].projects_page.cta_headline_2}</span>
            </h2>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <Link
              href="/contact"
              className="group relative inline-flex items-center gap-6 overflow-hidden rounded-full bg-gold px-12 py-6 sm:px-16 sm:py-8 text-sm font-black uppercase tracking-[0.3em] text-ink transition-all hover:pr-20 active:scale-95"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <span className="relative z-10 text-4xl">{i18n[locale].common.contact_us}</span>
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

