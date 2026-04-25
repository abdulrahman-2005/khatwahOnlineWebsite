"use client";

import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { WebsiteIllustration, SystemIllustration, MarketingIllustration } from "@/components/ui/ProductIllustrations";
import i18n from "../../../data/i18n.json";

export default function ProductsClient({ productsAr, productsEn }) {
  const { locale } = useLocale();
  const products = locale === 'ar' ? productsAr : (productsEn || productsAr);
  const t = i18n[locale];

  const renderIllustration = (slug, accent) => {
    switch (slug) {
      case 'company-websites':
        return <WebsiteIllustration accentColor={accent} />;
      case 'management-systems':
        return <SystemIllustration accentColor={accent} />;
      case 'digital-marketing':
        return <MarketingIllustration accentColor={accent} />;
      default:
        return <SystemIllustration accentColor={accent} />;
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }} />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center px-6 pt-32 pb-20 sm:px-12 sm:pt-40 sm:pb-32 lg:px-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] opacity-20 pointer-events-none blur-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-gold)] rounded-full mix-blend-multiply animate-pulse-glow" style={{ animationDuration: '8s' }} />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <Reveal direction="up" distance={30}>
            <div className="mb-6 inline-block rounded-full border px-6 py-2 backdrop-blur-md" style={{ borderColor: 'var(--color-gold)40', backgroundColor: 'var(--color-gold)10' }}>
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--color-gold)' }}>
                {t.products_page.hero_eyebrow}
              </span>
            </div>

            <h1
              className="mb-8 text-5xl font-black tracking-tight sm:text-7xl lg:text-[5.5rem] leading-[1.1]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text)"
              }}
            >
              {t.products_page.hero_headline}
            </h1>
            <p
              className="mx-auto max-w-2xl text-lg leading-relaxed sm:text-2xl"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-muted)"
              }}
            >
              {t.products_page.hero_subtitle}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Products Showcase */}
      <section className="relative px-6 pb-32 sm:px-12 lg:px-20 z-10">
        <div className="mx-auto max-w-7xl space-y-32">
          {products.map((product, index) => {
            const accents = {
              0: "var(--color-primary)",
              1: "var(--color-accent)",
              2: "var(--color-gold)"
            };
            const accent = accents[index % 3];
            const isEven = index % 2 === 0;

            return (
              <div key={product.slug} className={`flex flex-col gap-12 lg:gap-24 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center`}>

                {/* Visual Side (Hidden on Mobile) */}
                <div className="hidden md:block w-full lg:w-1/2 relative group perspective-[1000px]">
                  <Reveal direction={isEven ? "right" : "left"} distance={50} delay={100}>
                    <div
                      className="relative h-[250px] sm:h-[400px] lg:h-[500px] w-full rounded-[2rem] lg:rounded-[3rem] border transition-transform duration-700 overflow-hidden"
                      style={{
                        borderColor: `${accent}20`,
                        backgroundColor: "var(--color-surface)",
                        boxShadow: `0 30px 60px -15px ${accent}15`
                      }}
                    >
                      <div className="absolute inset-0 z-10 flex items-center justify-center p-6 lg:p-10 transition-transform duration-700 group-hover:scale-105">
                        {renderIllustration(product.slug, accent)}
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2">
                  <Reveal direction="up" distance={40} delay={200}>
                    <div className="flex flex-col">

                      <h2
                        className="mb-4 mt-6 text-4xl font-black sm:text-5xl"
                        style={{
                          fontFamily: "var(--font-heading)",
                          color: "var(--color-text)"
                        }}
                      >
                        {product.title}
                      </h2>

                      <p
                        className="mb-6 text-xl font-bold uppercase tracking-wider"
                        style={{ color: accent }}
                      >
                        {product.subtitle}
                      </p>

                      <p
                        className="mb-10 text-lg leading-relaxed"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-muted)"
                        }}
                      >
                        {product.longDescription}
                      </p>

                      {/* Feature Grid */}
                      <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {product.features.slice(0, 4).map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 rounded-xl p-4 transition-colors"
                            style={{ backgroundColor: "var(--color-surface)", border: `1px solid var(--color-border)` }}
                          >
                            <svg className="mt-1 h-5 w-5 shrink-0" style={{ color: accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Area */}
                      <div className="flex flex-wrap items-center gap-6">
                        <Link
                          href={`/products/${product.slug}`}
                          className="group/btn relative overflow-hidden rounded-full px-10 py-5 font-black text-lg shadow-xl transition-transform hover:scale-105"
                          style={{ backgroundColor: accent, color: "var(--color-background)" }}
                        >
                          <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover/btn:translate-y-0" />
                          <span className="relative flex items-center gap-3">
                            {t.products_page.view_details}
                            <svg
                              className={`h-6 w-6 transition-transform duration-300 ${locale === 'ar' ? 'rotate-180 group-hover/btn:-translate-x-2' : 'group-hover/btn:translate-x-2'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                        </Link>

                        <div>
                          <p className="text-2xl font-black" style={{ color: "var(--color-text)" }}>{product.pricing.starting}</p>
                          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{product.pricing.note}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Modern CTA */}
      <section className="px-6 pb-32 sm:px-12 lg:px-20 relative z-10">
        <Reveal direction="up" distance={40}>
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[3rem] border-2 relative" style={{ borderColor: "var(--color-gold)30", backgroundColor: "var(--color-surface)" }}>
            <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at top right, var(--color-gold), transparent 50%)" }} />

            <div className="relative p-12 text-center sm:p-20">
              <h2 className="mb-6 text-4xl font-black sm:text-5xl" style={{ color: "var(--color-text)" }}>
                {locale === 'ar' ? 'مش لاقي اللي بتدور عليه؟' : "Can't find what you're looking for?"}
              </h2>
              <p className="mb-10 text-xl" style={{ color: "var(--color-text-muted)" }}>
                {locale === 'ar' ? 'تواصل معانا وهنبني لك حل مخصص يناسب احتياجاتك بالظبط' : "Contact us and we'll build a custom solution tailored to your exact needs"}
              </p>

              <Link
                href="/contact"
                className="group inline-flex items-center gap-4 rounded-full px-12 py-5 text-xl font-black transition-all hover:scale-105 shadow-2xl"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-background)"
                }}
              >
                {t.nav.contact}
                <svg className={`h-6 w-6 transition-transform group-hover:scale-125 ${locale === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
