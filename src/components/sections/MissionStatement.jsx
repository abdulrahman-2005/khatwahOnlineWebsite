'use client';
import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";

export default function MissionStatement() {
  const { locale } = useLocale();

  return (
    <section className="relative w-full px-6 py-20 sm:px-12 sm:py-32 lg:px-20 border-y-2" style={{ backgroundColor: "var(--color-ink)", borderColor: "var(--color-border-strong)" }}>
      {/* Decorative Geometric Corner */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: "linear-gradient(135deg, transparent 50%, var(--color-gold) 50%)" }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10" style={{ background: "linear-gradient(-45deg, transparent 50%, var(--color-primary) 50%)" }} />
      
      <div className="relative mx-auto max-w-5xl text-center z-10">
        <Reveal direction="up" distance={20}>
          <h2 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-on-dark)", letterSpacing: "-1px" }}>
            {i18n[locale].mission_statement.headline}
          </h2>
        </Reveal>
        <Reveal direction="up" distance={20} delay={150}>
          <p className="mt-8 text-xl leading-relaxed sm:text-2xl font-medium" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text-on-dark-muted)" }}>
            {i18n[locale].mission_statement.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
