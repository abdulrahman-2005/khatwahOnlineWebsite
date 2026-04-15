"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";

export default function Footer() {
  const { locale } = useLocale();

  const links = [
    { label: i18n[locale].nav.products, href: "/#products" },
    { label: i18n[locale].nav.projects, href: "/projects" },
    { label: i18n[locale].nav.about, href: "/about" },
    { label: i18n[locale].nav.contact, href: "/contact" },
  ];

  return (
    <footer className="w-full px-8 pt-24 pb-10 sm:px-12 lg:px-20" style={{ backgroundColor: "var(--color-ink)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 pb-14 md:grid-cols-3">
          <div className="space-y-5 md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold" style={{ color: "var(--color-text-on-dark)" }}>{locale === 'en' ? 'Khatwah' : 'خُطوة'}</span>
              <span className="h-6 w-px" style={{ backgroundColor: "var(--color-gold)" }} />
              <span className="text-sm font-bold tracking-[3px] uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }}>ONLINE</span>
            </div>
            <p className="max-w-md text-sm leading-7" style={{ color: "var(--color-text-on-dark-muted)" }}>
              {i18n[locale].footer.description}
            </p>
          </div>
          <div className="space-y-5">
            <h3 className="text-sm font-bold tracking-[3px] uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }}>{i18n[locale].footer.links_heading}</h3>
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="w-fit text-sm text-[var(--color-text-on-dark-muted)] transition-colors duration-200 hover:text-[var(--color-text-on-dark)]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px w-full" style={{ backgroundColor: "var(--color-border-dark)" }} />

        <div className="flex items-center justify-between pt-7 text-xs">
          <p style={{ color: "var(--color-text-on-dark-muted)" }}>{i18n[locale].footer.rights}</p>
          <p className="flex items-center gap-2" style={{ color: "var(--color-text-on-dark-muted)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: "var(--color-primary-light)" }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-primary-light)" }} />
            </span>
            {i18n[locale].footer.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
