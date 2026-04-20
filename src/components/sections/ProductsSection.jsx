'use client';
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";

export default function ProductsSection() {
  const { locale } = useLocale();
  const productsData = i18n[locale].products;
  const sectionData = i18n[locale].products_section;

  return (
    <section 
      id="products" 
      className="w-full px-6 py-20 sm:px-12 sm:py-32 lg:px-20" 
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <Reveal direction="up" distance={20}>
          <div className="mb-16 text-center">
            <div className="mb-4">
              <Eyebrow color="var(--color-gold)" size="base">
                {sectionData.eyebrow}
              </Eyebrow>
            </div>
            <h2 
              className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl" 
              style={{ 
                fontFamily: "var(--font-display)", 
                color: "var(--color-text)"
              }}
            >
              {sectionData.headline_part1}
            </h2>
            <p 
              className="mx-auto max-w-2xl text-base leading-7 sm:text-lg" 
              style={{ 
                fontFamily: "var(--font-body)", 
                color: "var(--color-text-muted)" 
              }}
            >
              {sectionData.body}
            </p>
          </div>
        </Reveal>

        {/* Product Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {productsData.map((product, index) => {
            const accents = ["var(--color-primary)", "var(--color-accent)", "var(--color-gold)"];
            const accent = accents[index % 3];

            return (
              <Reveal key={product.slug} direction="up" distance={20} delay={index * 100}>
                <Link 
                  href={`/products/${product.slug}`}
                  className="group block h-full"
                >
                  <div 
                    className="flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 hover:border-opacity-100 sm:p-8"
                    style={{ 
                      borderColor: `${accent}30`,
                      backgroundColor: "var(--color-background)"
                    }}
                  >
                    {/* Number Badge */}
                    <div 
                      className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black"
                      style={{ 
                        backgroundColor: `${accent}15`,
                        color: accent
                      }}
                    >
                      {product.num}
                    </div>

                    {/* Title */}
                    <h3 
                      className="mb-2 text-xl font-bold sm:text-2xl" 
                      style={{ 
                        fontFamily: "var(--font-heading)", 
                        color: "var(--color-text)" 
                      }}
                    >
                      {product.title}
                    </h3>

                    {/* Subtitle */}
                    <p 
                      className="mb-4 text-sm font-medium" 
                      style={{ color: accent }}
                    >
                      {product.subtitle}
                    </p>

                    {/* Description */}
                    <p 
                      className="mb-6 flex-1 text-sm leading-7" 
                      style={{ 
                        fontFamily: "var(--font-body)", 
                        color: "var(--color-text-muted)" 
                      }}
                    >
                      {product.description}
                    </p>

                    {/* CTA */}
                    <div 
                      className="flex items-center gap-2 text-sm font-bold transition-all duration-300 group-hover:gap-3" 
                      style={{ color: accent }}
                    >
                      <span>{locale === 'ar' ? 'اعرف أكتر' : 'Learn More'}</span>
                      <svg 
                        className={`h-4 w-4 transition-transform duration-300 ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* View All Link */}
        <Reveal direction="up" distance={20} delay={400}>
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-base font-bold transition-colors duration-300"
              style={{ color: "var(--color-gold)" }}
            >
              {locale === 'ar' ? 'عرض كل المنتجات' : 'View All Products'}
              <svg 
                className={`h-4 w-4 transition-transform duration-300 ${locale === 'ar' ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
