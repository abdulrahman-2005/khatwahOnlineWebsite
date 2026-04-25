"use client";

import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import Image from "next/image";
import servicesData from "../../../data/services.json";
import i18n from "../../../data/i18n.json";
import { useLocale } from "@/contexts/LocaleContext";
import { ArrowUpRight, Check, Layers } from "lucide-react";

export default function ServicesPage() {
  const { locale } = useLocale();
  const t = i18n[locale].services_page;
  const services = servicesData[locale] || servicesData.en;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* ━━━ HERO ━━━ */}
      <section className="relative px-6 pt-40 pb-20 sm:pt-48 sm:pb-28 lg:pt-56 lg:pb-36 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[var(--color-gold)] opacity-[0.07] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <Reveal direction="up" distance={20}>
            <p className="mb-6 text-[12px] font-black tracking-[0.3em] uppercase" style={{ color: "var(--color-gold)" }}>
              {t.ecosystem}
            </p>
          </Reveal>
          <Reveal direction="up" distance={30} delay={100}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
              {t.hero_headline_1}{" "}
              <span className="text-[var(--color-gold)]">{t.hero_headline_2}</span>
            </h1>
          </Reveal>
          <Reveal direction="up" distance={20} delay={200}>
            <p className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto" style={{ color: "var(--color-text-muted)" }}>
              {t.hero_subtitle}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ━━━ SERVICES — each gets a full cinematic section ━━━ */}
      {services.map((service, index) => (
        <ServiceSection key={service.slug} service={service} index={index} t={t} />
      ))}

      {/* ━━━ COMING SOON ━━━ */}
      <section className="px-6 py-24 sm:py-32">
        <Reveal direction="up" distance={30}>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-6">
              <Layers size={28} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
              {t.coming_soon_title}
            </h3>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              {t.coming_soon_body}
            </p>
          </div>
        </Reveal>
      </section>

      <div className="h-24" />
    </div>
  );
}

function ServiceSection({ service, index, t }) {
  return (
    <section className="relative w-full overflow-hidden">
      {/* ── Cinematic banner background ── */}
      <div className="relative w-full h-[35vh] sm:h-[50vh] lg:h-[65vh]">
        <Image
          src={`/services/${service.slug}/assets/banner.webp`}
          alt={service.title}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority={index === 0}
        />
        {/* Floating title over image */}
        <div className="absolute inset-0 flex items-end px-6 sm:px-12 lg:px-20 pb-8 sm:pb-16 lg:pb-20">
          <div className="mx-auto max-w-6xl w-full">
            <Reveal direction="up" distance={30}>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <span className="text-2xl sm:text-4xl">{service.icon}</span>
                <span className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] uppercase px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/80 border border-white/10">
                  {service.category}
                </span>
              </div>
              <h2 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tight mb-2 sm:mb-3"
                style={{ fontFamily: "var(--font-display)" }}>
                {service.title}
              </h2>
              <p className="text-sm sm:text-lg text-white/70 font-medium max-w-xl line-clamp-2 sm:line-clamp-none">
                {service.subtitle}
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Content below banner ── */}
      <div className="relative px-6 sm:px-12 lg:px-20 -mt-1" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="mx-auto max-w-6xl py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

            {/* Left — description + CTA */}
            <div className="flex-1">
              <Reveal direction="up" distance={20}>
                <p className="text-base sm:text-lg leading-[1.9] mb-8"
                  style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}>
                  {service.description}
                </p>
              </Reveal>

              <Reveal direction="up" distance={15} delay={100}>
                <div className="flex flex-wrap gap-2.5 mb-10">
                  {service.tags.map((tag, i) => (
                    <span key={i} className="rounded-full px-4 py-1.5 text-[11px] font-bold tracking-wider bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                      {tag}
                    </span>
                  ))}
                  <span className="rounded-full px-4 py-1.5 text-[11px] font-black tracking-wider bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20">
                    {t.free_forever}
                  </span>
                </div>
              </Reveal>

              <Reveal direction="up" distance={15} delay={150}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group inline-flex items-center gap-3 bg-[var(--color-gold)] text-white px-8 py-4 rounded-full font-black text-sm tracking-wide transition-all duration-300 hover:shadow-[0_12px_32px_-8px_var(--color-gold)] hover:scale-[1.03] active:scale-[0.97]"
                >
                  {t.start_building}
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Reveal>
            </div>

            {/* Right — features list */}
            <div className="lg:w-[380px] shrink-0">
              <Reveal direction="up" distance={20} delay={100}>
                <h3 className="text-[11px] font-black tracking-[0.25em] uppercase mb-6"
                  style={{ color: "var(--color-text-muted)" }}>
                  {t.features_title}
                </h3>
              </Reveal>

              <div className="space-y-0">
                {service.features.map((feature, i) => (
                  <Reveal key={i} direction="up" distance={10} delay={150 + i * 50}>
                    <div className="flex items-start gap-4 py-4 border-b border-[var(--color-border)]">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--color-gold)]/10">
                        <Check size={12} strokeWidth={3} className="text-[var(--color-gold)]" />
                      </div>
                      <span className="text-[13px] sm:text-[14px] font-medium leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}>
                        {feature}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section divider */}
      <div className="h-[1px] mx-6 sm:mx-12 lg:mx-20 bg-[var(--color-border)]" />
    </section>
  );
}
