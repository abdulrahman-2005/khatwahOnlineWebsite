'use client';
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { useLocale } from "@/contexts/LocaleContext";
import { WebsiteIllustration, SystemIllustration, MarketingIllustration } from "@/components/ui/ProductIllustrations";
import i18n from "../../../data/i18n.json";

export default function ProductsSection() {
  const { locale } = useLocale();
  const productsData = i18n[locale].products;
  const sectionData = i18n[locale].products_section;

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
    <section 
      id="products" 
      className="relative w-full overflow-hidden px-6 py-24 sm:px-12 sm:py-32 lg:px-20" 
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-text) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <Reveal direction="up" distance={30}>
          <div className="mb-20 text-center lg:mb-24">
            <div className="mb-4">
              <Eyebrow color="var(--color-gold)" size="lg">
                {sectionData.eyebrow}
              </Eyebrow>
            </div>
            <h2 
              className="mb-8 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl" 
              style={{ 
                fontFamily: "var(--font-display)", 
                color: "var(--color-text)"
              }}
            >
              <span className="block">{sectionData.headline_part1}</span>
              {sectionData.headline_part2 && (
                <span 
                  className="block mt-2 bg-gradient-to-r bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-gold))" }}
                >
                  {sectionData.headline_part2}
                </span>
              )}
            </h2>
            <p 
              className="mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl" 
              style={{ 
                fontFamily: "var(--font-body)", 
                color: "var(--color-text-muted)" 
              }}
            >
              {sectionData.body}
            </p>
          </div>
        </Reveal>

        {/* Product Cards Layout */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          {productsData.map((product, index) => {
            const accents = ["var(--color-primary)", "var(--color-accent)", "var(--color-gold)"];
            const accent = accents[index % 3];

            return (
              <Reveal key={product.slug} direction="up" distance={40} delay={index * 150}>
                <Link 
                  href={`/products/${product.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  style={{ 
                    borderColor: `${accent}20`,
                    backgroundColor: "var(--color-background)"
                  }}
                >
                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" 
                    style={{ 
                      background: `radial-gradient(circle at 50% 0%, ${accent}15, transparent 70%)` 
                    }} 
                  />

                  {/* Illustration Area */}
                  <div className="relative h-[240px] sm:h-[280px] lg:h-[350px] w-full overflow-hidden border-b transition-colors duration-500 group-hover:bg-opacity-50"
                       style={{ borderColor: `${accent}10`, backgroundColor: "var(--color-surface)" }}>
                    <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-8 transition-transform duration-700 group-hover:scale-105">
                      {renderIllustration(product.slug, accent)}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="relative flex flex-1 flex-col p-8 sm:p-10">
                    <h3 
                      className="mb-3 text-2xl font-black tracking-tight sm:text-3xl" 
                      style={{ 
                        fontFamily: "var(--font-heading)", 
                        color: "var(--color-text)" 
                      }}
                    >
                      {product.title}
                    </h3>

                    <p 
                      className="mb-5 text-sm font-bold uppercase tracking-wider" 
                      style={{ color: accent }}
                    >
                      {product.subtitle}
                    </p>

                    <p 
                      className="mb-8 flex-1 text-base leading-relaxed" 
                      style={{ 
                        fontFamily: "var(--font-body)", 
                        color: "var(--color-text-muted)" 
                      }}
                    >
                      {product.description}
                    </p>

                    {/* Features preview */}
                    <ul className="mb-8 space-y-3">
                      {product.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                          <svg className="h-5 w-5 shrink-0" style={{ color: accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {feat}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div 
                      className="mt-auto flex items-center gap-3 text-base font-black transition-all duration-300 group-hover:gap-4" 
                      style={{ color: accent }}
                    >
                      <span>{locale === 'ar' ? 'اكتشف المزيد' : 'Discover More'}</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 group-hover:bg-opacity-10" style={{ borderColor: accent, backgroundColor: `${accent}00` }}>
                        <svg 
                          className={`h-5 w-5 transition-transform duration-300 ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* View All Link */}
        <Reveal direction="up" distance={20} delay={500}>
          <div className="mt-20 text-center">
            <Link
              href="/products"
              className="group inline-flex items-center gap-4 rounded-full border-2 px-8 py-4 text-lg font-black transition-all duration-300 hover:scale-105"
              style={{ 
                borderColor: "var(--color-gold)",
                color: "var(--color-gold)",
              }}
            >
              {locale === 'ar' ? 'عرض كل الخدمات' : 'View All Solutions'}
              <svg 
                className={`h-6 w-6 transition-transform duration-300 ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
