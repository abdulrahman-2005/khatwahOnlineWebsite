"use client";

import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Link from "next/link";
import Image from "next/image";
import servicesData from "../../../data/services.json";
import { ArrowRight, Star, Zap, Users, Clock3 } from "lucide-react";

export default function ServicesPage() {
  const services = servicesData.en;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 sm:px-12 sm:py-32 lg:px-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, var(--color-gold) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, var(--color-gold) 1px, transparent 1px)`,
            backgroundSize: '60px 60px, 40px 40px'
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <Reveal direction="up" distance={30}>
            <div className="mb-20 text-center">
              <h1 
                className="mb-6 mt-6 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl" 
                style={{ 
                  fontFamily: "var(--font-display)", 
                  color: "var(--color-gold)",
                }}
              >
                Free Business Tools
              </h1>
              <p 
                className="mx-auto max-w-3xl text-lg leading-8 sm:text-xl" 
                style={{ 
                  fontFamily: "var(--font-body)", 
                  color: "var(--color-text-muted)" 
                }}
              >
                Professional-grade tools designed to streamline your business operations. 
                No signup required, completely free to use.
              </p>
            </div>
          </Reveal>

          {/* Services Grid */}
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-2">
            {services.map((service, index) => (
              <Reveal key={service.slug} direction="up" distance={40} delay={index * 150}>
                <ServiceCard service={service} index={index} />
              </Reveal>
            ))}
          </div>

      

          {/* Coming Soon */}
          <Reveal direction="up" distance={30} delay={800}>
            <div 
              className="mt-20 overflow-hidden rounded-3xl border p-12 text-center"
              style={{ 
                borderColor: "var(--color-border)",
                background: `linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%)`
              }}
            >
              <div 
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "var(--color-gold)20" }}
              >
                <Clock3 size={32} style={{ color: "var(--color-gold)" }} />
              </div>
              <h3 
                className="mb-3 text-2xl font-bold" 
                style={{ color: "var(--color-text)" }}
              >
                More Tools Coming Soon
              </h3>
              <p 
                className="mx-auto max-w-md text-base" 
                style={{ color: "var(--color-text-muted)" }}
              >
                We're constantly developing new tools to help streamline your business processes
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({ service, index }) {
  return (
    <Link href={`/services/${service.slug}`} className="group block h-full">
      <article 
        className="relative h-full overflow-hidden rounded-3xl border transition-all duration-700 hover:border-opacity-100 hover:shadow-2xl hover:-translate-y-1"
        style={{ 
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-background)"
        }}
      >
        {/* Image Header */}
        <div className="relative h-70 overflow-hidden">
          <Image
            src={`/services/${service.slug}/assets/banner.png`}
            alt={`${service.title} - ${service.subtitle}`}
            fill
            className="object-fit transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay Gradient */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
          />
          
          {/* Tags */}
          <div className="absolute right-4 top-4 flex gap-2">
            {service.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-ink)"
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title & Subtitle */}
          <div className="mb-4">
            <h2 
              className="mb-2 text-2xl font-black leading-tight" 
              style={{ 
                fontFamily: "var(--font-display)", 
                color: "var(--color-text)"
              }}
            >
              {service.title}
            </h2>
            <p 
              className="text-base font-semibold" 
              style={{ color: "var(--color-gold)" }}
            >
              {service.subtitle}
            </p>
          </div>

          {/* Description */}
          <p 
            className="mb-6 leading-relaxed" 
            style={{ 
              fontFamily: "var(--font-body)", 
              color: "var(--color-text-muted)" 
            }}
          >
            {service.description}
          </p>

          {/* Features */}
          <ul className="mb-6 space-y-2">
            {service.features.slice(0, 3).map((feature, idx) => (
              <li 
                key={idx}
                className="flex items-start gap-3 text-sm"
                style={{ color: "var(--color-text)" }}
              >
                <div 
                  className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--color-gold)" }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <span className="font-medium">{feature}</span>
              </li>
            ))}
            {service.features.length > 3 && (
              <li 
                className="flex items-start gap-3 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                <div 
                  className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--color-border)" }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                </div>
                <span>+{service.features.length - 3} more features</span>
              </li>
            )}
          </ul>

          {/* CTA */}
          <div 
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-bold transition-all duration-300 group-hover:gap-4"
            style={{ 
              backgroundColor: "var(--color-gold)",
              color: "#FFFFFF"
            }}
          >
            <span>Launch Tool</span>
            <ArrowRight 
              size={20} 
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div 
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, var(--color-gold)05 0%, var(--color-gold)05 100%)`
          }}
        />
      </article>
    </Link>
  );
}
