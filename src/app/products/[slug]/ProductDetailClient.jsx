"use client";

import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { getProductWhatsAppLink } from "@/utils/whatsapp";
import { WebsiteIllustration, SystemIllustration, MarketingIllustration } from "@/components/ui/ProductIllustrations";
import { MonitorSmartphone, LayoutDashboard, Megaphone } from "lucide-react";
import i18n from "../../../../data/i18n.json";

export default function ProductDetailClient({ productAr, productEn, slug }) {
  const { locale } = useLocale();
  const t = i18n[locale];
  const product = locale === 'ar' ? productAr : (productEn || productAr);
  
  const accents = {
    "company-websites": { 
      color: "var(--color-primary)", 
      soft: "var(--color-primary-soft)",
      glow: "var(--color-primary-glow)"
    },
    "management-systems": { 
      color: "var(--color-accent)", 
      soft: "var(--color-accent-soft)",
      glow: "var(--color-accent-glow)"
    },
    "digital-marketing": { 
      color: "var(--color-gold)", 
      soft: "var(--color-gold-soft)",
      glow: "var(--color-gold-glow)"
    },
  };
  const accent = accents[slug] || accents["company-websites"];

  const renderIllustration = () => {
    switch (slug) {
      case 'company-websites':
        return <WebsiteIllustration accentColor={accent.color} />;
      case 'management-systems':
        return <SystemIllustration accentColor={accent.color} />;
      case 'digital-marketing':
        return <MarketingIllustration accentColor={accent.color} />;
      default:
        return <SystemIllustration accentColor={accent.color} />;
    }
  };

  const renderMobileIcon = () => {
    switch (slug) {
      case 'company-websites':
        return <MonitorSmartphone size={100} color={accent.color} strokeWidth={1.5} />;
      case 'management-systems':
        return <LayoutDashboard size={100} color={accent.color} strokeWidth={1.5} />;
      case 'digital-marketing':
        return <Megaphone size={100} color={accent.color} strokeWidth={1.5} />;
      default:
        return <LayoutDashboard size={100} color={accent.color} strokeWidth={1.5} />;
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Global Ambient Glow (Absolute Overlay so it scrolls with the page) */}
      <div className="absolute inset-0 z-[50] pointer-events-none" style={{ mixBlendMode: 'screen' }}>
        <div 
          className="absolute -right-1/4 top-0 h-[400px] w-[400px] sm:h-[800px] sm:w-[800px] animate-pulse opacity-[0.05] sm:opacity-20 blur-[80px] sm:blur-[120px] rounded-full" 
          style={{ backgroundColor: accent.color, animationDuration: "7s" }} 
        />
        <div 
          className="absolute -left-1/4 top-64 sm:top-[400px] h-[300px] w-[300px] sm:h-[600px] sm:w-[600px] animate-pulse opacity-[0.02] sm:opacity-10 blur-[60px] sm:blur-[100px] rounded-full" 
          style={{ backgroundColor: accent.color, animationDuration: "5s", animationDelay: "2s" }} 
        />
      </div>

      {/* Advanced Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ 
        backgroundImage: 'linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Hero Section */}
      <section className="relative flex min-h-screen w-full items-center px-6 py-24 sm:px-12 lg:px-20 z-10">

        <div className="relative mx-auto max-w-7xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 z-10">
            <Reveal direction="up" distance={30}>
              <Link 
                href="/products"
                className="group mb-12 inline-flex items-center gap-3 rounded-full border px-6 py-2 text-sm font-bold backdrop-blur-md transition-all duration-300 hover:scale-105"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                <svg className={`h-4 w-4 transition-transform duration-300 ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                {t.product_detail.back_to_products}
              </Link>
            </Reveal>

            <Reveal direction="up" distance={30} delay={100}>
              <div className="mb-6 flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-black" style={{ backgroundColor: accent.soft, color: accent.color }}>
                  {product.num}
                </span>
                
                {/* Mobile Icon Box */}
                <div 
                  className="md:hidden flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${accent.color}15`, border: `1px solid ${accent.color}30` }}
                >
                  {(() => {
                    const IconComponent = renderMobileIcon().type;
                    return <IconComponent size={24} color={accent.color} strokeWidth={2} />;
                  })()}
                </div>

                <h2 className="text-xl font-bold uppercase tracking-widest" style={{ color: accent.color }}>
                  {product.subtitle}
                </h2>
              </div>
            </Reveal>

            <Reveal direction="up" distance={30} delay={200}>
              <h1 
                className="mb-8 text-5xl font-black leading-[1.1] sm:text-7xl lg:text-[5rem] tracking-tight" 
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
              >
                {product.title}
              </h1>
            </Reveal>

            <Reveal direction="up" distance={30} delay={300}>
              <p 
                className="mb-10 max-w-2xl text-lg leading-relaxed sm:text-2xl" 
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
              >
                {product.description}
              </p>
            </Reveal>

            <Reveal direction="up" distance={30} delay={400}>
              <div className="flex items-center gap-6">
                <a
                  href={getProductWhatsAppLink(product, locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-full px-10 py-5 text-lg font-black shadow-2xl transition-transform hover:scale-105"
                  style={{ backgroundColor: accent.color, color: "var(--color-background)" }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="relative flex items-center gap-3">
                    {t.product_detail.get_started}
                    <svg className={`h-6 w-6 transition-transform group-hover:scale-125 ${locale === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                </a>
              </div>
            </Reveal>
          </div>

          {/* Visual Content (Hidden on Mobile) */}
          <div className="hidden md:block w-full lg:w-1/2 perspective-[1200px] mt-12 lg:mt-0">
            <Reveal direction="left" distance={60} delay={300}>
              <div 
                className="relative h-[250px] sm:h-[400px] lg:h-[600px] w-full rounded-[2rem] lg:rounded-[3rem] border backdrop-blur-sm transition-transform duration-[2s] hover:rotate-y-12 hover:rotate-x-12"
                style={{ 
                  borderColor: `${accent.color}30`,
                  backgroundColor: "var(--color-surface)",
                  boxShadow: `0 40px 80px -20px ${accent.color}20`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-6 lg:p-12">
                  {renderIllustration()}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <style jsx>{`
          @keyframes slide-right {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </section>

      {/* Divider */}
      <div className="relative z-10 w-full overflow-hidden">
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-12 sm:h-24" style={{ fill: "var(--color-surface)" }}>
          <path d="M0 10 L0 0 Q50 10 100 0 L100 10 Z" />
        </svg>
      </div>

      {/* Benefits Section - Bento Grid */}
      <section className="relative z-10 w-full px-6 py-20 sm:px-12 sm:py-32 lg:px-20" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto max-w-7xl">
          <Reveal direction="up" distance={30}>
            <div className="mb-16 text-center">
              <Eyebrow color={accent.color} size="lg">
                {t.product_detail.key_benefits}
              </Eyebrow>
              <h2 className="mt-4 text-4xl font-black sm:text-5xl" style={{ color: "var(--color-text)" }}>
                {locale === 'ar' ? 'إزاي هنغير شكل البيزنس بتاعك؟' : 'How will we transform your business?'}
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.benefits.map((benefit, index) => {
              // Create dynamic spans for the bento grid
              const isLarge = index === 0 || index === 3;
              
              return (
                <Reveal key={index} direction="up" distance={40} delay={index * 100}>
                  <div 
                    className={`group relative h-full overflow-hidden rounded-[2rem] border p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isLarge ? 'sm:col-span-2' : 'sm:col-span-1'}`}
                    style={{ 
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-background)"
                    }}
                  >
                    {/* Animated gradient background on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-10" 
                      style={{ background: `radial-gradient(circle at center, ${accent.color}, transparent 80%)` }} 
                    />

                    <div className="relative z-10 flex h-full flex-col">
                      <div 
                        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                        style={{ backgroundColor: accent.soft, color: accent.color }}
                      >
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>

                      <h3 className="mb-4 text-2xl font-black" style={{ color: "var(--color-text)" }}>
                        {benefit.title}
                      </h3>

                      <p className="mt-auto text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features & Use Cases Split */}
      <section className="w-full px-6 py-20 sm:px-12 sm:py-32 lg:px-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-background)" }}>
        {/* Background Blob */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 opacity-10 blur-3xl rounded-full mix-blend-multiply pointer-events-none" style={{ backgroundColor: accent.color }} />

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            
            {/* Features List */}
            <div>
              <Reveal direction="up" distance={30}>
                <Eyebrow color={accent.color} size="base">
                  {t.product_detail.features}
                </Eyebrow>
                <h2 className="mb-10 mt-4 text-4xl font-black" style={{ color: "var(--color-text)" }}>
                  {locale === 'ar' ? 'مميزات النظام' : 'System Features'}
                </h2>
              </Reveal>

              <div className="space-y-4">
                {product.features.map((feature, index) => (
                  <Reveal key={index} direction="left" distance={20} delay={index * 100}>
                    <div 
                      className="group flex items-center gap-6 rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02]"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 group-hover:bg-opacity-20" style={{ backgroundColor: accent.soft, color: accent.color }}>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                        {feature}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Use Cases Grid */}
            <div>
              <Reveal direction="up" distance={30}>
                <Eyebrow color={accent.color} size="base">
                  {locale === 'ar' ? 'مناسب لـ' : 'Perfect for'}
                </Eyebrow>
                <h2 className="mb-10 mt-4 text-4xl font-black" style={{ color: "var(--color-text)" }}>
                  {locale === 'ar' ? 'مين يقدر يستفيد؟' : 'Who can benefit?'}
                </h2>
              </Reveal>

              <div className="flex flex-wrap gap-4">
                {product.useCases.map((useCase, index) => (
                  <Reveal key={index} direction="up" distance={20} delay={index * 100}>
                    <div 
                      className="group relative overflow-hidden rounded-xl border-2 px-6 py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-transparent"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                    >
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundColor: accent.color }} />
                      <span className="relative text-lg font-bold transition-colors duration-300 group-hover:text-white" style={{ color: "var(--color-text)" }}>
                        {useCase}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing & CTA Section */}
      <section className="relative w-full px-6 pb-32 sm:px-12 lg:px-20" style={{ backgroundColor: "var(--color-background)" }}>
        <Reveal direction="up" distance={50}>
          <div className="mx-auto max-w-5xl">
            <div 
              className="relative overflow-hidden rounded-[3rem] border-2 p-12 text-center sm:p-24 transition-transform duration-700 hover:scale-[1.02] shadow-2xl"
              style={{ borderColor: accent.soft, backgroundColor: "var(--color-surface)" }}
            >
              {/* Dynamic Animated Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${accent.color}, transparent 70%)`, mixBlendMode: 'multiply' }} />
              
              <div className="relative z-10">
                <h3 className="mb-8 text-4xl font-black sm:text-5xl lg:text-6xl" style={{ color: "var(--color-text)" }}>
                  {product.cta}
                </h3>
                
                <div className="mb-12">
                  <p className="mb-4 text-5xl font-black sm:text-6xl" style={{ color: accent.color }}>
                    {product.pricing.starting}
                  </p>
                  <p className="text-xl font-medium" style={{ color: "var(--color-text-muted)" }}>
                    {product.pricing.note}
                  </p>
                </div>

                <a
                  href={getProductWhatsAppLink(product, locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-4 rounded-full border-2 px-12 py-6 text-xl font-black shadow-xl transition-all duration-300 hover:scale-110"
                  style={{ 
                    borderColor: accent.color,
                    color: "var(--color-background)",
                    backgroundColor: accent.color
                  }}
                >
                  <span>{t.product_detail.get_started}</span>
                  <svg className={`h-8 w-8 transition-transform duration-300 group-hover/btn:scale-125 ${locale === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}