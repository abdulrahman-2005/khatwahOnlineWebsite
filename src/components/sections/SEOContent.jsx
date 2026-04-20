
'use client';
import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/contexts/LocaleContext";
import { ArrowRight, ArrowLeft } from "lucide-react";
import i18n from "../../../data/i18n.json";

export default function SEOContent() {
  const { locale } = useLocale();
  const content = i18n[locale].seo_content;
  const isRTL = locale === 'ar';

  return (
    <section
      className="relative w-full overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-border-dark" />

      <div className="mx-auto max-w-7xl px-6 lg:px-20 py-24 sm:py-32 lg:py-40">
        <Reveal direction="up" distance={16}>
          <div className="mb-20 lg:mb-28 grid lg:grid-cols-[1fr_auto] lg:items-end gap-8">
            <div>
              <h2
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
              >
                {content.title}
              </h2>
            </div>

            <p
              className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xs lg:max-w-[280px] lg:pb-2"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {isRTL
                ? 'حلول تقنية متطورة ومخصصة لكل قطاع'
                : 'Advanced technical solutions tailored to every sector'}
            </p>
          </div>
        </Reveal>

        <div className="divide-y divide-border-dark border-t border-border-dark">
          {content.sections.map((section, index) => (
            <Reveal key={index} direction="up" distance={12} delay={Math.min(index * 50, 200)}>
              <article className="group py-10 sm:py-12 lg:py-14 grid lg:grid-cols-[80px_1fr_auto] gap-6 lg:gap-10 items-start hover:bg-background/40 transition-colors duration-300 rounded-xl px-4 -mx-4">
                
                <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3 pt-1">
                  <span
                    className="text-xl font-mono font-bold tracking-widest tabular-nums"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div>
                  <h3
                    className="text-2xl sm:text-3xl font-black leading-tight mb-4 transition-colors duration-300"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
                  >
                    {section.heading}
                  </h3>
                  <p
                    className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {section.content}
                  </p>
                </div>

                <div className="flex lg:flex-col lg:items-end lg:justify-between lg:h-full pt-1">
                  <a
                    href="/contact"
                    className="group/link inline-flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-all duration-200 hover:gap-3"
                    style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-ui)' }}
                  >
                    <span>{isRTL ? 'اعرف المزيد' : 'Learn More'}</span>
                    {/* Replaced raw SVG with Lucide Icon based on direction */}
                    {isRTL ? (
                      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover/link:-translate-x-0.5" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                    )}
                  </a>
                </div>

              </article>
            </Reveal>
          ))}
        </div>
{/* ── Footer CTA ─────────────────────────────────────────── */}
        <Reveal direction="up" distance={16} delay={400}>
          <div className="mt-24 lg:mt-32 relative border border-border-dark rounded-2xl overflow-hidden">

            {/* Horizontal gold rule at top */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, var(--color-gold), transparent 80%)' }}
            />

            <div className="p-8 sm:p-12 lg:p-16 lg:grid lg:grid-cols-[1fr_auto] lg:items-center gap-12">
              <div>
                <p
                  className="text-xst font-bold tracking-[0.2em] uppercase mb-4"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {isRTL ? 'ابدأ الآن' : 'Get started'}
                </p>
                <h3
                  className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
                >
                  {isRTL ? 'جاهزون لبدء مشروعك؟' : 'Ready to Start Your Project?'}
                </h3>
                <p
                  className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {content.footer_text}
                </p>
              </div>

              <div className="mt-8 lg:mt-0 flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-3 px-7 py-3.5 font-bold text-sm uppercase tracking-[0.12em] rounded-full transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                  style={{
                    background: 'var(--color-gold)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {isRTL ? 'ابدأ مشروعك' : 'Start Your Project'}
                </a>
                <a
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-bold text-sm uppercase tracking-[0.12em] rounded-full border border-border-dark transition-all duration-300 hover:border-gold hover:text-gold"
                  style={{
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {isRTL ? 'شاهد أعمالنا' : 'View Our Work'}
                </a>
              </div>
            </div>

          </div>
        </Reveal>      </div>
    </section>
  );
}