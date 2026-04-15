"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";

const statusColors = { 
  live: "var(--color-primary)", 
  wip: "var(--color-gold)", 
  concept: "var(--color-text-muted)" 
};

export default function ProjectCard({ project, variant = "full" }) {
  const { locale } = useLocale();
  const currentTitle = locale === 'ar' ? project.titleAr : project.titleEn;
  const currentDescription = locale === 'ar' ? project.descriptionAr : project.descriptionEn;

  const statusLabels = {
    live: i18n[locale].common.live,
    wip: i18n[locale].common.wip,
    concept: i18n[locale].common.concept
  };

  const accentColor = statusColors[project.status] || "var(--color-primary)";

  return (
    <Link
      href={/projects/\}
      className="group relative flex flex-col overflow-hidden rounded-[32px] border border-[var(--color-border-dark)] bg-[var(--color-surface)] transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-ink)]">
        <Image
          src={project.thumbnail}
          alt={currentTitle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        {/* Status Badge */}
        <div 
          className="absolute top-4 right-4 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md" 
          style={{ backgroundColor: accentColor + 'cc' }}
        >
          {statusLabels[project.status]}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-8">
        <span className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-gold)]">
           {project.techStack[0]}
        </span>
        <h3 className="mb-4 text-2xl font-black tracking-tight group-hover:text-[var(--color-gold)] transition-colors duration-300" style={{ color: "var(--color-text)" }}>
          {currentTitle}
        </h3>

        {variant === "full" && (
          <>
            <p className="mb-8 text-sm leading-relaxed text-[var(--color-text-muted)] line-clamp-3">
              {currentDescription}
            </p>
            <div className="mt-auto flex items-center justify-between pt-6 border-t border-[var(--color-border)]">
              <div className="flex gap-2">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-[9px] font-bold uppercase tracking-tighter text-[var(--color-text-muted)]">
                    #{tech}
                  </span>
                ))}
              </div>
              <div className="h-8 w-8 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--color-gold)] group-hover:border-[var(--color-gold)] group-hover:text-[var(--color-ink)] transition-all duration-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
