'use client';
import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { useLocale } from "@/contexts/LocaleContext";
import { House, Cpu,
Brain,
CircleDollarSign,
Rocket,
Handshake } from "lucide-react";
import i18n from "../../../data/i18n.json";

const iconMap = {
  0: House,
  1: Cpu,
  2: Brain,
  3: CircleDollarSign,
  4: Rocket,
  5: Handshake
};

`
Cpu,
Brain,
CircleDollarSign,
Rocket,
Handshake,

`

export default function WhyUsSection() {
  const { locale } = useLocale();
  const whyUsData = i18n[locale].why_us_section;

  return (
    <section 
      className="relative w-full overflow-hidden px-6 py-24 sm:px-12 sm:py-32 lg:px-20" 
      style={{ backgroundColor: "var(--color-surface)" }}
      aria-labelledby="why-us-heading"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-text) 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />
      
      {/* Gradient overlays */}
      <div className="absolute top-0 left-1/4 w-96 h-96 opacity-5 blur-3xl rounded-full" 
           style={{ backgroundColor: "var(--color-primary)" }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 opacity-5 blur-3xl rounded-full" 
           style={{ backgroundColor: "var(--color-gold)" }} />

      <div className="relative mx-auto max-w-7xl">
        {/* Header Section */}
        <Reveal direction="up" distance={30}>
          <header className="mb-20 text-center">
            <Eyebrow color="var(--color-primary)" size="base" className="mb-6">
              {whyUsData.eyebrow}
            </Eyebrow>
            
            <h2 
              id="why-us-heading"
              className="mb-8 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl xl:text-7xl" 
              style={{ 
                fontFamily: "var(--font-display)", 
                color: "var(--color-text)", 
                letterSpacing: "-0.02em" 
              }}
            >
              {whyUsData.headline_part1}
              <br />
              <span style={{ color: "var(--color-gold)" }}>
                {whyUsData.headline_part2}
              </span>
            </h2>
            
            
          </header>
        </Reveal>

        {/* Advantages Grid */}
        <div className="mb-24 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {whyUsData.advantages.map((advantage, i) => {
            const IconComponent = iconMap[i];
            
            return (
              <Reveal key={i} direction="up" distance={20} delay={i * 120}>
                <article 
                  className="group relative h-full overflow-hidden border transition-all duration-700 hover:-translate-y-1 hover:shadow-xl"
                  style={{ 
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface-elevated)",
                    borderRadius: "16px"
                  }}
                >
                  {/* Card Content */}
                  <div className="relative p-8 lg:p-10">
                    {/* Icon and Number */}
                    <div className="mb-8 flex items-start justify-between">
                      <div 
                        className="flex h-16 w-16 items-start justify-start rounded-2xl transition-transform duration-500 group-hover:scale-110"
                        style={{ 
                          color: advantage.iconColor
                        }}
                        aria-hidden="true"
                      >
                        <IconComponent size={55} strokeWidth={1.5} />
                      </div>
                      
                      <div 
                        className="text-6xl font-black opacity-20 transition-opacity duration-500 group-hover:opacity-30"
                        style={{ 
                          fontFamily: "var(--font-display)", 
                          color: "var(--color-text)",
                          lineHeight: "1"
                        }}
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      <h3 
                        className="text-2xl font-black leading-tight lg:text-3xl" 
                        style={{ 
                          fontFamily: "var(--font-display)", 
                          color: "var(--color-text)" 
                        }}
                      >
                        {advantage.title}
                      </h3>
                      
                      <p 
                        className="text-base leading-relaxed lg:text-lg" 
                        style={{ 
                          fontFamily: "var(--font-body)", 
                          color: "var(--color-text-muted)",
                          lineHeight: "1.7"
                        }}
                      >
                        {advantage.description}
                      </p>
                      
                      {/* Feature List */}
                      <ul className="space-y-3" role="list">
                        {advantage.points.map((point, j) => (
                          <li 
                            key={j} 
                            className="flex items-start gap-3 text-base"
                            style={{ color: "var(--color-text)" }}
                          >
                            <div 
                              className="mt-2 h-2 w-2 rounded-full shrink-0" 
                              style={{ backgroundColor: advantage.pointColor }}
                              aria-hidden="true"
                            />
                            <span style={{ lineHeight: "1.6" }}>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Hover accent line */}
                  <div 
                    className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-700 group-hover:w-full" 
                    style={{ backgroundColor: advantage.accentColor }}
                    aria-hidden="true"
                  />
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}