"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import Eyebrow from "@/components/ui/Eyebrow";

export default function AboutContent() {
  const { locale } = useLocale();
  const t = i18n[locale];
  const team = t.about_team.members;

  const teamStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "Organization",
      name: t.about_page.org_name,
      description: t.about_page.org_description,
      employees: team.map((m) => ({
        "@type": "Person",
        name: m.name,
        jobTitle: m.structured_data_job,
        description: m.structured_data_desc,
      })),
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(teamStructuredData),
        }}
      />
      {/* Page Hero */}
      <section className="relative flex min-h-screen w-full items-center overflow-hidden px-6 py-32 sm:px-12 lg:px-20" style={{ backgroundColor: "var(--color-background)" }}>
        {/* Vibrant background accents */}
        <div className="absolute -right-32 top-20 h-96 w-96 animate-pulse opacity-20 blur-3xl" style={{ backgroundColor: "var(--color-primary)", transform: "rotate(45deg)", animationDuration: "5s" }} />
        <div className="absolute -left-20 bottom-0 h-64 w-64 animate-pulse opacity-15 blur-3xl" style={{ backgroundColor: "var(--color-gold)", transform: "rotate(45deg)", animationDuration: "4s" }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8">
            <Eyebrow color="var(--color-gold)" size="lg">
              {i18n[locale].about_page.hero_eyebrow}
            </Eyebrow>
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] sm:text-7xl lg:text-[110px]" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", letterSpacing: "-2px" }}>
            {i18n[locale].about_page.hero_headline_1}
            <br />
            <span className="relative inline-block animate-gradient bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] bg-clip-text text-transparent" style={{ backgroundSize: "200% auto" }}>
              {i18n[locale].about_page.hero_headline_2}
            </span>
          </h1>
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator color="var(--color-primary)" />

        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-15px) scale(1.05); }
          }
          @keyframes expand {
            0%, 100% { width: 4rem; }
            50% { width: 5rem; }
          }
          @keyframes gradient {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          .animate-float-slow {
            animation: float-slow 4s ease-in-out infinite;
          }
          .animate-expand {
            animation: expand 2s ease-in-out infinite;
          }
          .animate-gradient {
            animation: gradient 3s linear infinite;
          }
        `}</style>
      </section>

      {/* Team Cards */}
      <section className="relative w-full px-8 py-16 sm:px-12 lg:px-20" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {team.map((member, index) => {
              const images = ["/abdelrahman-about-image.webp", "/ahmed-about-image.webp", "/mahmoud-about-image.webp"];
              const accents = [
                { accent: "var(--color-primary)", accentSoft: "var(--color-primary-soft)", accentGlow: "var(--color-primary-glow)" },
                { accent: "var(--color-gold)", accentSoft: "var(--color-gold-soft)", accentGlow: "var(--color-gold-glow)" },
                { accent: "var(--color-accent)", accentSoft: "var(--color-accent-soft)", accentGlow: "var(--color-accent-glow)" },
              ];
              const skews = [-2, 0, 2];
              const { accent, accentSoft, accentGlow } = accents[index];
              const skew = skews[index];
              return (
              <div
                key={index}
                className="group relative transition-all duration-700 hover:-translate-y-2"
                style={{
                  transform: `skewY(${skew}deg)`,
                }}
              >
                {/* Offset shadow — moves WITH the card */}
                <div
                  className="absolute inset-0 translate-x-2 translate-y-2"
                  style={{ backgroundColor: accentSoft, zIndex: 0 }}
                />

                {/* Card body */}
                <div
                  className="relative overflow-hidden border transition-all duration-500"
                  style={{
                    borderColor: "var(--color-border-strong)",
                    backgroundColor: "var(--color-surface)",
                    zIndex: 1,
                  }}
                >
                  {/* Accent top bar — inside skewed container so it moves with card */}
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accent }} />

                  {/* Image — tall, dominant */}
                  <div className="relative h-[75vh] min-h-[500px] w-full overflow-hidden">
                    <Image
                      src={images[index]}
                      alt={member.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index === 0}
                    />
                    {/* Gradient */}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--color-surface) 0%, transparent 50%)" }} />

                    {/* Sharp corner accent — inside card */}
                    <div className="absolute top-0 left-0 h-14 w-14 border-l-[3px] border-t-[3px]" style={{ borderColor: member.accent }} />

                    {/* Role badge — inside card */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center border backdrop-blur-md"
                        style={{
                          backgroundColor: "var(--color-surface)",
                          borderColor: member.accent,
                          color: member.accent,
                        }}
                      >
                        {index === 0 && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        {index === 1 && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>}
                        {index === 2 && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
                      </div>
                      <span className="block text-xs font-black tracking-wider uppercase" style={{ fontFamily: "var(--font-ui)", color: accent }}>
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="border-t p-6" style={{ borderColor: "var(--color-border)" }}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-2xl font-black" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", letterSpacing: "-0.5px" }}>
                        {member.name}
                      </h3>
                      <svg className="h-5 w-5 transition-transform duration-500 group-hover:-translate-x-2" style={{ color: accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <p className="text-sm leading-7" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story & Vision */}
      <section className="w-full px-6 py-20 sm:px-12 sm:py-32 lg:px-20" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">

            {/* Story */}
            <div>
              <div className="mb-10">
                <Eyebrow color="var(--color-gold)" size="lg">
                  {i18n[locale].about_page.story_eyebrow}
                </Eyebrow>
              </div>
              <div className="space-y-6 text-base leading-8" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                <p className="text-xl font-bold leading-9" style={{ color: "var(--color-text)" }}>
                  {i18n[locale].about_page.story_p1}
                </p>
                <div className="my-10 border-r-4 pr-6 py-6" style={{ borderColor: "var(--color-gold)", backgroundColor: "var(--color-gold-soft)" }}>
                  <p className="text-lg leading-9 font-bold" style={{ color: "var(--color-text)" }}>
                    {i18n[locale].about_page.story_quote}
                  </p>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div>
              <div className="mb-10">
                <Eyebrow color="var(--color-primary)" size="lg">
                  {i18n[locale].about_page.vision_eyebrow}
                </Eyebrow>
              </div>
              <div className="space-y-0">
                {[
                  { accent: "var(--color-primary)", accentSoft: "var(--color-primary-soft)", title: i18n[locale].about_page.vision_1_title, desc: i18n[locale].about_page.vision_1_desc, icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                  { accent: "var(--color-gold)", accentSoft: "var(--color-gold-soft)", title: i18n[locale].about_page.vision_2_title, desc: i18n[locale].about_page.vision_2_desc, icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                  { accent: "var(--color-accent)", accentSoft: "var(--color-accent-soft)", title: i18n[locale].about_page.vision_3_title, desc: i18n[locale].about_page.vision_3_desc, icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> },
                ].map((item, i) => (
                  <div key={i} className="group flex items-start gap-5 border-b py-8 first:pt-0 last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 transition-all duration-300 group-hover:scale-110" style={{ borderColor: item.accent, color: item.accent, backgroundColor: item.accentSoft }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="mb-1.5 text-base font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>{item.title}</h4>
                      <p className="text-sm leading-6" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="w-full px-6 py-20 sm:px-12 sm:py-24 lg:px-20" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <Eyebrow color="var(--color-accent)" size="lg">
              {i18n[locale].about_page.tech_eyebrow}
            </Eyebrow>
          </div>
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4" style={{ backgroundColor: "var(--color-border)" }}>
            {[
              { name: "Next.js", color: "var(--color-primary)" },
              { name: "React", color: "var(--color-accent)" },
              { name: "Tailwind CSS", color: "var(--color-primary)" },
              { name: "Supabase", color: "var(--color-accent)" },
              { name: "SvelteKit", color: "var(--color-gold)" },
              { name: "PostgreSQL", color: "var(--color-primary)" },
              { name: "Vercel", color: "var(--color-accent)" },
              { name: "Node.js", color: "var(--color-gold)" },
            ].map((tech) => (
              <div key={tech.name} className="group flex items-center justify-between px-6 py-5 transition-all duration-300" style={{ backgroundColor: "var(--color-surface)" }}>
                <span className="text-sm font-bold" style={{ fontFamily: "var(--font-ui)", color: "var(--color-text)" }}>{tech.name}</span>
                <div className="h-1 w-4 transition-all duration-300 group-hover:w-10" style={{ backgroundColor: tech.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
