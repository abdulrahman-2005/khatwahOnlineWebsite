
'use client';
import { useState } from 'react';
import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";

export default function FAQ() {
  const { locale } = useLocale();
  const faqData = i18n[locale].faq;
  const [openIndex, setOpenIndex] = useState(null);
  const isRTL = locale === 'ar';

  return (
    <section
      className="relative w-full bg-surface overflow-hidden"
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
                {faqData.title}
              </h2>
            </div>
            <p
              className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xs lg:max-w-[260px] lg:pb-2"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {isRTL
                ? 'إجابات على أكثر الأسئلة شيوعاً حول خدماتنا'
                : 'Answers to the most common questions about our services'}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {faqData.questions.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <Reveal key={index} direction="up" distance={16} delay={Math.min(index * 40, 200)}>
                <article className="group relative h-full">
                  <div className="relative h-full border border-border-dark overflow-hidden transition-all duration-500">
                    {/* Top accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 transition-all duration-500"
                      style={{
                        height: isOpen ? '3px' : '2px',
                        background: isOpen
                          ? 'linear-gradient(90deg, var(--color-gold), transparent 70%)'
                          : 'linear-gradient(90deg, var(--color-border-dark), transparent)',
                      }}
                    />

                    {/* Left accent bar */}
                    <div
                      className="absolute top-0 bottom-0 left-0 transition-all duration-500"
                      style={{
                        width: isOpen ? '3px' : '0px',
                        background: 'linear-gradient(180deg, var(--color-gold), transparent 85%)',
                      }}
                    />

                    {/* Question trigger */}
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full text-left px-8 pt-9 pb-8 flex items-start gap-5 group/btn"
                      aria-expanded={isOpen}
                    >
                      <span
                        className="shrink-0 text-xs font-mono font-bold tracking-widest tabular-nums mt-1.5 transition-colors duration-300"
                        style={{ color: isOpen ? 'var(--color-gold)' : 'var(--color-text-muted)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="flex-1 flex items-start justify-between gap-4">
                        <h3
                          className="text-xl sm:text-2xl font-black leading-snug transition-colors duration-300 text-start"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            color: isOpen ? 'var(--color-gold)' : 'var(--color-text)',
                          }}
                        >
                          {faq.question}
                        </h3>

                        <div
                          className="shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 mt-0.5 group-hover/btn:scale-110"
                          style={{
                            borderColor: isOpen ? 'var(--color-gold)' : 'var(--color-border-dark)',
                            backgroundColor: isOpen ? 'var(--color-gold)' : 'transparent',
                          }}
                        >
                          <svg
                            className="w-3.5 h-3.5 transition-transform duration-300"
                            style={{
                              color: isOpen ? 'var(--color-ink)' : 'var(--color-text-muted)',
                              transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                            }}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12M6 12h12" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Answer (Optimized using CSS Grid) */}
                    <div
                      className="grid transition-all duration-500 ease-in-out"
                      style={{
                        gridTemplateRows: isOpen ? '1fr' : '0fr',
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <div
                          className="pb-9 pt-0"
                          style={{ paddingLeft: isRTL ? '2rem' : '4.25rem', paddingRight: isRTL ? '4.25rem' : '2rem' }}
                        >
                          <div
                            className="mb-5 h-px"
                            style={{ background: 'linear-gradient(90deg, var(--color-gold), transparent 60%)' }}
                          />
                          <p
                            className="text-base sm:text-lg leading-relaxed text-start"
                            style={{
                              fontFamily: 'var(--font-body)',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        {/* ── Footer CTA — matches SEOContent ───────────────────── */}
        <Reveal direction="up" distance={16} delay={400}>
          <div className="mt-20 lg:mt-28 relative border border-border-dark rounded-2xl overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, var(--color-gold), transparent 80%)' }}
            />
            <div className="p-8 sm:p-12 lg:p-16 lg:grid lg:grid-cols-[1fr_auto] lg:items-center gap-12">
              <div>
                <p
                  className="text-xs font-mono font-bold tracking-[0.2em] uppercase mb-4"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {isRTL ? 'تواصل معنا' : 'Still curious?'}
                </p>
                <h3
                  className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
                >
                  {isRTL ? 'لديك سؤال آخر؟' : 'Have another question?'}
                </h3>
                <p
                  className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {isRTL
                    ? 'فريقنا جاهز للإجابة على جميع استفساراتك'
                    : 'Our team is ready to answer all your questions directly.'}
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
                  {isRTL ? 'تواصل معنا' : 'Contact Us'}
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