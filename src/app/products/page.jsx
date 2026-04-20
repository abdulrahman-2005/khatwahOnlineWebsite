"use client";

import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import productsData from "../../../data/products.json";
import i18n from "../../../data/i18n.json";

export default function ProductsPage() {
  const { locale } = useLocale();
  const products = productsData[locale] || productsData.ar;
  const t = i18n[locale];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero Section */}
      <section className="px-6 py-20 sm:px-12 sm:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" distance={20}>
            <div className="mb-20 text-center">
              <Eyebrow color="var(--color-gold)" size="base">
                {t.products_page.hero_eyebrow}
              </Eyebrow>
              <h1 
                className="mb-6 mt-4 text-4xl font-black sm:text-5xl lg:text-6xl" 
                style={{ 
                  fontFamily: "var(--font-display)", 
                  color: "var(--color-text)"
                }}
              >
                {t.products_page.hero_headline}
              </h1>
              <p 
                className="mx-auto max-w-2xl text-base leading-7 sm:text-lg" 
                style={{ 
                  fontFamily: "var(--font-body)", 
                  color: "var(--color-text-muted)" 
                }}
              >
                {t.products_page.hero_subtitle}
              </p>
            </div>
          </Reveal>

          {/* Products List */}
          <div className="space-y-8">
            {products.map((product, index) => {
              const accents = {
                0: "var(--color-primary)",
                1: "var(--color-accent)",
                2: "var(--color-gold)"
              };
              const accent = accents[index];

              return (
                <Reveal key={product.slug} direction="up" distance={20} delay={index * 100}>
                  <Link href={`/products/${product.slug}`} className="group block">
                    <div 
                      className="overflow-hidden rounded-2xl border transition-all duration-300 hover:border-opacity-100"
                      style={{ 
                        borderColor: `${accent}30`,
                        backgroundColor: "var(--color-background)"
                      }}
                    >
                      <div className="grid gap-8 p-8 lg:grid-cols-3 lg:gap-12 lg:p-10">
                        {/* Left: Info */}
                        <div className="lg:col-span-2">
                          <div 
                            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black"
                            style={{ 
                              backgroundColor: `${accent}15`,
                              color: accent
                            }}
                          >
                            {product.num}
                          </div>

                          <h2 
                            className="mb-3 text-2xl font-bold sm:text-3xl" 
                            style={{ 
                              fontFamily: "var(--font-heading)", 
                              color: "var(--color-text)"
                            }}
                          >
                            {product.title}
                          </h2>

                          <p 
                            className="mb-4 text-base font-medium" 
                            style={{ color: accent }}
                          >
                            {product.subtitle}
                          </p>

                          <p 
                            className="mb-6 leading-7" 
                            style={{ 
                              fontFamily: "var(--font-body)", 
                              color: "var(--color-text-muted)" 
                            }}
                          >
                            {product.longDescription}
                          </p>

                          <div className="mb-6">
                            <p 
                              className="mb-1 text-xl font-bold" 
                              style={{ color: accent }}
                            >
                              {product.pricing.starting}
                            </p>
                            <p 
                              className="text-sm" 
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {product.pricing.note}
                            </p>
                          </div>

                          <div 
                            className="inline-flex items-center gap-2 text-base font-bold transition-all duration-300 group-hover:gap-3" 
                            style={{ color: accent }}
                          >
                            <span>{t.products_page.view_details}</span>
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

                        {/* Right: Features */}
                        <div>
                          <h3 
                            className="mb-4 text-sm font-bold uppercase tracking-wider" 
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {locale === 'ar' ? 'المميزات الرئيسية' : 'Key Features'}
                          </h3>
                          <ul className="space-y-3">
                            {product.features.slice(0, 5).map((feature, idx) => (
                              <li 
                                key={idx}
                                className="flex items-start gap-2 text-sm"
                                style={{ color: "var(--color-text)" }}
                              >
                                <svg 
                                  className="mt-0.5 h-4 w-4 shrink-0" 
                                  style={{ color: accent }} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                            {product.features.length > 5 && (
                              <li 
                                className="text-sm font-medium" 
                                style={{ color: accent }}
                              >
                                + {product.features.length - 5} {locale === 'ar' ? 'مميزات إضافية' : 'more features'}
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {/* CTA */}
          <Reveal direction="up" distance={20} delay={400}>
            <div className="mt-16 text-center">
              <p 
                className="mb-6 text-lg" 
                style={{ color: "var(--color-text-muted)" }}
              >
                {locale === 'ar' ? 'مش لاقي اللي تدور عليه؟ تواصل معانا ونبني لك حل مخصص' : "Can't find what you're looking for? Contact us and we'll build a custom solution"}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-bold transition-all duration-300 hover:opacity-90"
                style={{ 
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-ink)"
                }}
              >
                {t.nav.contact}
                <svg className={`h-5 w-5 ${locale === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
