'use client';
import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";

export default function MarketSection() {
  const { locale } = useLocale();
  const marketData = i18n[locale].market_section;

  return (
    <section className="relative w-full overflow-hidden px-6 py-20 sm:px-12 sm:py-32 lg:px-20 border-t-2" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border-strong)" }}>
      {/* Diagonal color accents */}
      <div className="absolute -right-32 -top-20 h-80 w-80 opacity-10 blur-3xl" style={{ backgroundColor: "var(--color-primary)", transform: "rotate(45deg)" }} />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 opacity-10 blur-3xl" style={{ backgroundColor: "var(--color-gold)", transform: "rotate(45deg)" }} />

      <div className="relative mx-auto max-w-6xl">

        {/* Header */}
        <Reveal direction="up" distance={20}>
          <div className="mb-16">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-1 w-16" style={{ backgroundColor: "var(--color-primary)" }} />
              <span className="text-sm font-black tracking-wider uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                {marketData.eyebrow}
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-black sm:text-6xl lg:text-7xl" style={{ color: "var(--color-text)", letterSpacing: "-2px" }}>
              {marketData.headline_part1}
              <br />
              <span style={{ color: "var(--color-gold)" }}>{marketData.headline_part2}</span>
            </h2>
            <p className="max-w-lg text-base leading-7" style={{ color: "var(--color-text-muted)" }}>
              {marketData.body}
            </p>
          </div>
        </Reveal>

        {/* Stats Grid — clean, sharp */}
        <div className="mb-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {marketData.stats.map((stat, i) => (
            <Reveal key={i} direction="up" distance={16} delay={i * 80}>
              <div className="group relative overflow-hidden border-2 p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: stat.accentSoft || "var(--color-primary-soft)", backgroundColor: "var(--color-surface-elevated)" }}>
                {/* Sharp corner accent */}
                <div className="absolute top-0 left-0 h-8 w-8 border-l-2 border-t-2" style={{ borderColor: stat.accent || "var(--color-primary)" }} />

                <div className="relative">
                  <span className="text-xs font-black tracking-wider uppercase" style={{ fontFamily: "var(--font-display)", color: stat.accent || "var(--color-primary)" }}>
                    {stat.label}
                  </span>
                  <div className="mt-3 text-5xl font-black sm:text-6xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", letterSpacing: "-2px", lineHeight: 1 }}>
                    {stat.num}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom narrative */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_auto]">
          <Reveal direction="right" distance={20} delay={200}>
            <div className="max-w-xl space-y-5 text-base leading-8" style={{ color: "var(--color-text-muted)" }}>
              <p className="text-lg font-bold leading-8" style={{ color: "var(--color-text)" }}>
                {marketData.narrative_headline}
              </p>
              <p>
                {marketData.narrative_body}
              </p>
            </div>
          </Reveal>

          <Reveal direction="left" distance={20} delay={300}>
            <div className="relative self-start overflow-hidden border-2" style={{ borderColor: "var(--color-gold)", backgroundColor: "var(--color-gold-soft)" }}>
              {/* Accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: "var(--color-gold)" }} />

              <div className="px-8 py-6">
                <span className="text-sm font-black tracking-wider uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }}>
                  {marketData.narrative_accent_label}
                </span>
                <p className="mt-2 max-w-[240px] text-sm leading-6" style={{ color: "var(--color-text-muted)" }}>
                  {marketData.narrative_accent_body}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
