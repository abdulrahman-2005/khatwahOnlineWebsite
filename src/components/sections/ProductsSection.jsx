'use client';
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";

export default function ProductsSection() {
  const { locale } = useLocale();
  const productsData = i18n[locale].products;

  return (
    <section id="products" className="w-full px-6 py-20 sm:px-12 sm:py-32 lg:px-20" style={{ backgroundColor: "var(--color-surface)" }}>
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <Reveal direction="up" distance={20}>
          <div className="mb-20">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-1 w-16" style={{ backgroundColor: "var(--color-gold)" }} />
              <span className="text-sm font-black tracking-wider uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }}>
                {i18n[locale].products_section.eyebrow}
              </span>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="text-4xl font-black sm:text-6xl lg:text-7xl" style={{ color: "var(--color-text)", letterSpacing: "-2px" }}>
                {i18n[locale].products_section.headline_part1}
                <br />
                <span style={{ color: "var(--color-text-muted)" }}>{i18n[locale].products_section.headline_part2}</span>
              </h2>
              <p className="max-w-sm text-base leading-7 lg:text-right" style={{ color: "var(--color-text-muted)" }}>
                {i18n[locale].products_section.body}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Feature rows — clean list layout */}
        <div className="divide-y border-t border-b" style={{ borderColor: "var(--color-border)" }}>
          {productsData.map((product, index) => {
            const accents = ["var(--color-primary)", "var(--color-accent)", "var(--color-gold)"];
            const accent = accents[index % 3];
            const accentSoft = accent.replace(")", "-soft)");

            return (
              <Link 
                key={product.num} 
                href="/contact" 
                className="group relative block overflow-hidden px-4 transition-all duration-500 hover:bg-[var(--color-primary-soft)]"
              >
                <div className="flex flex-col gap-6 py-12 lg:flex-row lg:items-center lg:gap-16">
                  {/* Number */}
                  <div className="flex shrink-0 items-center">
                    <span className="text-6xl font-black sm:text-7xl" style={{ fontFamily: "var(--font-display)", color: accent, fontVariantNumeric: "tabular-nums" }}>
                      {product.num}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold sm:text-2xl lg:text-3xl" style={{ color: "var(--color-text)" }}>
                      {product.title}
                    </h3>
                    <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ fontFamily: "var(--font-display)", color: accent }}>
                      {product.subtitle}
                    </p>
                    <p className="mb-6 max-w-xl text-sm leading-7" style={{ color: "var(--color-text-muted)" }}>
                      {product.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((f) => (
                        <span key={f} className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: accentSoft, color: accent, border: `1px solid ${accent}20` }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow CTA */}
                  <div className="flex shrink-0 items-center justify-start lg:justify-center">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 group-hover:scale-110 group-hover:border-[var(--color-gold)] group-hover:bg-[var(--color-gold)]"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                    >
                      <svg className="h-4 w-4 transition-all duration-500 group-hover:text-[var(--color-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={locale === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}