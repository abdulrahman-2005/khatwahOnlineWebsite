"use client";

import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Link from "next/link";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import { useLocale } from "@/contexts/LocaleContext";
import { getProductWhatsAppLink } from "@/utils/whatsapp";
import i18n from "../../../../data/i18n.json";

export default function ProductDetailClient({ productAr, productEn, slug }) {
  const { locale } = useLocale();
  const t = i18n[locale];
  const product = locale === 'ar' ? productAr : (productEn || productAr);
  
  const accents = {
    "booking-system": { 
      color: "var(--color-primary)", 
      soft: "var(--color-primary-soft)",
      glow: "var(--color-primary-glow)"
    },
    "inventory-pos": { 
      color: "var(--color-accent)", 
      soft: "var(--color-accent-soft)",
      glow: "var(--color-accent-glow)"
    },
    "custom-development": { 
      color: "var(--color-gold)", 
      soft: "var(--color-gold-soft)",
      glow: "var(--color-gold-glow)"
    },
  };
  const accent = accents[slug];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Hero Section */}
      <section className="relative flex min-h-screen w-full items-center overflow-hidden px-6 py-24 sm:px-12 sm:py-32 lg:px-20">
        {/* Animated background accents */}
        <div 
          className="absolute -right-32 top-20 h-96 w-96 animate-pulse opacity-20 blur-3xl" 
          style={{ 
            backgroundColor: accent.color, 
            transform: "rotate(45deg)", 
            animationDuration: "5s" 
          }} 
        />
        <div 
          className="absolute -left-20 bottom-0 h-64 w-64 animate-pulse opacity-15 blur-3xl" 
          style={{ 
            backgroundColor: accent.color, 
            transform: "rotate(45deg)", 
            animationDuration: "4s" 
          }} 
        />

        <div className="relative mx-auto max-w-6xl w-full">
          {/* Back Link */}
          <Link 
            href="/products"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium transition-all duration-300"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg className={`h-4 w-4 transition-transform duration-300 ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {t.product_detail.back_to_products}
          </Link>

          <div className="mb-8">
            <Eyebrow color={accent.color} size="lg">
              {product.num}
            </Eyebrow>
          </div>

          <h1 
            className="max-w-4xl text-5xl font-black leading-[0.95] sm:text-7xl lg:text-[110px]" 
            style={{ 
              fontFamily: "var(--font-display)", 
              color: "var(--color-text)", 
              letterSpacing: "-2px" 
            }}
          >
            <span 
              className="relative inline-block animate-gradient bg-gradient-to-r bg-clip-text text-transparent" 
              style={{ 
                backgroundImage: `linear-gradient(to right, ${accent.color}, var(--color-accent), ${accent.color})`,
                backgroundSize: "200% auto" 
              }}
            >
              {product.title}
            </span>
          </h1>

          <p 
            className="mt-6 max-w-2xl text-xl font-medium sm:text-2xl" 
            style={{ color: accent.color }}
          >
            {product.subtitle}
          </p>

          <p 
            className="mt-6 max-w-3xl text-base leading-8 sm:text-lg" 
            style={{ 
              fontFamily: "var(--font-body)", 
              color: "var(--color-text-muted)" 
            }}
          >
            {product.longDescription}
          </p>
        </div>

        <ScrollIndicator color={accent.color} />

        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          .animate-gradient {
            animation: gradient 3s linear infinite;
          }
        `}</style>
      </section>

      {/* Divider */}
      <div 
        className="h-1 w-full" 
        style={{ 
          background: `linear-gradient(to right, ${accent.color}, var(--color-accent), ${accent.color})` 
        }} 
      />

      {/* Benefits Section */}
      <section className="w-full px-6 py-20 sm:px-12 sm:py-32 lg:px-20" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <Eyebrow color={accent.color} size="base">
              {t.product_detail.key_benefits}
            </Eyebrow>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
            {product.benefits.map((benefit, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden border-2 p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                style={{ 
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-background)"
                }}
              >
                {/* Accent top bar */}
                <div 
                  className="absolute left-0 right-0 top-0 h-1" 
                  style={{ backgroundColor: accent.color }} 
                />

                {/* Animated background on hover */}
                <div 
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" 
                  style={{ 
                    background: `radial-gradient(circle at top right, ${accent.color}, transparent)` 
                  }} 
                />

                <div className="relative">
                  {/* Icon */}
                  <div 
                    className="mb-5 flex h-12 w-12 items-center justify-center border-2 transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      borderColor: accent.color,
                      color: accent.color,
                      backgroundColor: accent.soft
                    }}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  {/* Title */}
                  <h3 
                    className="mb-3 text-xl font-bold" 
                    style={{ 
                      fontFamily: "var(--font-heading)", 
                      color: "var(--color-text)" 
                    }}
                  >
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p 
                    className="text-sm leading-7" 
                    style={{ 
                      fontFamily: "var(--font-body)", 
                      color: "var(--color-text-secondary)" 
                    }}
                  >
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-6 py-20 sm:px-12 sm:py-32 lg:px-20" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <Eyebrow color="var(--color-accent)" size="base">
              {t.product_detail.features}
            </Eyebrow>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.features.map((feature, index) => (
              <div 
                key={index}
                className="group flex items-start gap-4 p-6 transition-all duration-300"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <div 
                  className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: accent.soft }}
                >
                  <div 
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: accent.color }}
                  />
                </div>
                <p 
                  className="text-sm font-medium leading-relaxed" 
                  style={{ color: "var(--color-text)" }}
                >
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="w-full px-6 py-20 sm:px-12 sm:py-32 lg:px-20" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <Eyebrow color={accent.color} size="base">
              {locale === 'ar' ? 'مناسب لـ' : 'Perfect for'}
            </Eyebrow>
          </div>

          <div className="flex flex-wrap gap-4">
            {product.useCases.map((useCase, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden border-2 px-6 py-3 transition-all duration-300 hover:scale-105"
                style={{ 
                  borderColor: accent.color,
                  backgroundColor: "var(--color-background)"
                }}
              >
                <span 
                  className="relative text-sm font-bold" 
                  style={{ color: "var(--color-text)" }}
                >
                  {useCase}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & CTA Section */}
      <section className="relative w-full overflow-hidden px-6 py-20 sm:px-12 sm:py-32 lg:px-20" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="mx-auto max-w-4xl">
          <div 
            className="group relative overflow-hidden rounded-3xl border-2 p-10 text-center transition-all duration-500 hover:shadow-2xl sm:p-16"
            style={{ 
              borderColor: accent.soft,
              backgroundColor: "var(--color-surface)"
            }}
          >
            {/* Animated background */}
            <div 
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" 
              style={{ 
                background: `radial-gradient(circle at top right, ${accent.color}, transparent)` 
              }} 
            />

            <div className="relative">
              <h3 
                className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl" 
                style={{ 
                  fontFamily: "var(--font-heading)", 
                  color: "var(--color-text)" 
                }}
              >
                {product.cta}
              </h3>
              
              <div className="mb-10">
                <p 
                  className="mb-2 text-4xl font-black sm:text-5xl" 
                  style={{ color: accent.color }}
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

              <a
                href={getProductWhatsAppLink(product, locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn inline-flex items-center gap-3 border-2 px-10 py-5 text-lg font-black transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ 
                  borderColor: accent.color,
                  color: "var(--color-text-on-dark)",
                  backgroundColor: accent.color
                }}
              >
                <span style={{ fontFamily: "var(--font-ui)" }}>{t.product_detail.get_started}</span>
                <svg className={`h-6 w-6 transition-transform duration-300 ${locale === 'ar' ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}