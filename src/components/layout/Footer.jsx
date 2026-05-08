"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { useEffect, useRef, useState } from "react";
import i18n from "../../../data/i18n.json";
import contactData from "../../../data/contact.json";
import { Phone, Mail, ArrowUpRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";   

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}
/* ─────────────────────────────────────────────
   Magnetic social button
   ───────────────────────────────────────────── */
function MagneticBtn({ href, name, icon, color }) {
  const btnRef = useRef(null);
  const handleMove = (e) => {
    const el = btnRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) scale(1.12)`;
  };
  const handleLeave = () => { if (btnRef.current) btnRef.current.style.transform = ""; };
  return (
    <a
      ref={btnRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-label={name}
      className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition-[box-shadow,border-color,background-color] duration-300 will-change-transform ${color} hover:border-transparent hover:shadow-[0_0_24px_rgba(212,175,55,0.3)]`}
    >
      <span className="z-10 text-[var(--color-text-secondary)] transition-colors duration-200 group-hover:text-[var(--color-text)]">{icon}</span>
      {/* glow ring on hover */}
      <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 ring-1 ring-[var(--color-gold)]/40 transition-opacity duration-300" />
    </a>
  );
}

/* ─────────────────────────────────────────────
   Stagger-reveal wrapper
   ───────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Footer
   ───────────────────────────────────────────── */
export default function Footer() {
  const { locale } = useLocale();
  const { theme } = useTheme();

  const navLinks = [
    { label: i18n[locale].nav.products, href: "/#products" },
    { label: i18n[locale].nav.services, href: "/services" },
    { label: i18n[locale].nav.projects, href: "/projects" },
    { label: i18n[locale].nav.about, href: "/about" },
    { label: i18n[locale].nav.contact, href: "/contact" },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
      href: contactData.social.instagram.url,
      color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500",
    },
    {
      name: "TikTok",
      icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>,
      href: contactData.social.tiktok.url,
      color: "hover:bg-neutral-800",
    },
    {
      name: "Facebook",
      icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
      href: contactData.social.facebook.url,
      color: "hover:bg-blue-600",
    },
    {
      name: "YouTube",
      icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
      href: contactData.social.youtube.url,
      color: "hover:bg-red-600",
    },
  ];

  return (
    <footer
      className="relative w-full overflow-hidden pb-6 pt-16 font-body text-[var(--color-text)]"
      style={{ backgroundColor: "var(--color-ink)" }}
    >
      {/* ── Layered Background ── */}

      {/* 2. Fine grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px,transparent 1px),linear-gradient(90deg,var(--color-border) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />

      {/* 3. Ambient orbs — GPU-composited via will-change */}
      <div className="pointer-events-none absolute -top-24 left-1/3 h-[480px] w-[480px] rounded-full bg-[var(--color-gold)]/8 blur-[140px] will-change-transform" style={{ animation: "drift 12s ease-in-out infinite alternate" }} />
      <div className="pointer-events-none absolute bottom-0 -right-20 h-[360px] w-[360px] rounded-full bg-[var(--color-primary)]/5 blur-[120px] will-change-transform" style={{ animation: "drift 16s ease-in-out infinite alternate-reverse" }} />

      {/* 4. Top edge glow line */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/30 to-transparent" />

      {/* ─────────────────────────────── CONTENT ─────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* ══ BENTO GRID ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

          {/* ── Card 1: Brand + Social (4 cols) ── */}
          <Reveal delay={80} className="lg:col-span-4">
            <div className="h-full flex flex-col justify-between gap-8 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-colors duration-300 hover:border-[var(--color-border-strong)]">

              {/* Logo */}
              <Link href="/" className="group inline-block w-40" aria-label="Home">
                <img
                  src={theme === "dark" ? "/darkmode-khatwah-hero.png" : "/lightmode-khatwah-hero.png"}
                  alt="Khatwah Online Logo"
                  className="h-20 w-auto object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-105 origin-left"
                />
              </Link>

              {/* Tagline */}
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] -mt-2">
                {contactData.company.tagline[locale]}
              </p>

              {/* Social */}
              <div className="mt-auto pt-5 border-t border-[var(--color-border)] space-y-4">
                <span className="block text-xl font-bold tracking-[0.22em] uppercase text-[var(--color-gold)]">
                  {locale === "ar" ? "تابعنا" : "Follow Us"}
                </span>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((s) => (
                    <MagneticBtn key={s.name} {...s} color={s.color.replace('hover:bg-', 'hover:bg-[var(--color-primary)]').replace('bg-white/5', 'bg-[var(--color-surface-elevated)]')} />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>


          {/* ── Card 2: Quick Links (3 cols) ── */}
          <Reveal delay={160} className="lg:col-span-3">
            <div className="h-full flex flex-col gap-6 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-colors duration-300 hover:border-[var(--color-border-strong)]">
              <h3 className="flex items-center gap-2 text-xl font-bold tracking-[0.22em] uppercase text-[var(--color-gold)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)] shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                {i18n[locale].footer.links_heading}
              </h3>

              <nav>
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <li key={link.href} style={{ animationDelay: `${i * 60}ms` }}>
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-muted)] transition-all duration-200 hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)] hover:px-4"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                          {link.label}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="text-[var(--color-gold)] opacity-0 -translate-y-0.5 translate-x-0.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </Reveal>


          {/* ── Card 3: Contact Info (5 cols) ── */}
          <Reveal delay={240} className="lg:col-span-5">
            <div className="h-full flex flex-col gap-5 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-colors duration-300 hover:border-[var(--color-border-strong)]">
              <h3 className="flex items-center gap-2 text-xl font-bold tracking-[0.22em] uppercase text-[var(--color-gold)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)] shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                {locale === "ar" ? "معلومات التواصل" : "Contact Info"}
              </h3>

              <ul className="flex flex-col gap-3">

                {/* Email */}
                <li>
                  <a
                    href={`mailto:${contactData.email}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 transition-all duration-300 hover:border-[var(--color-gold)] hover:shadow-[0_4px_24px_rgba(212,175,55,0.1)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-gold)]/15 text-[var(--color-gold)] transition-all duration-300 group-hover:bg-[var(--color-gold)]/25 group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(212,175,55,0.3)]">
                      <Mail size={19} />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">{locale === "ar" ? "البريد الإلكتروني" : "Email"}</span>
                      <span style={{ direction: "ltr" }} className="truncate text-sm font-medium text-[var(--color-text)] transition-colors">{contactData.email}</span>
                    </div>
                  </a>
                </li>

                {/* Phone */}
                <li>
                  <a
                    href={`tel:${contactData.phones[0].number.replace(/\s/g, "")}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 transition-all duration-300 hover:border-[var(--color-gold)] hover:shadow-[0_4px_24px_rgba(212,175,55,0.1)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-gold)]/15 text-[var(--color-gold)] transition-all duration-300 group-hover:bg-[var(--color-gold)]/25 group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(212,175,55,0.3)]">
                      <Phone size={19} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">{locale === "ar" ? "الهاتف" : "Phone"}</span>
                      <span style={{ direction: "ltr" }} className="text-sm font-medium text-[var(--color-text)] transition-colors">{contactData.phones[0].number}</span>
                    </div>
                  </a>
                </li>


              </ul>
            </div>
          </Reveal>

        </div>


        {/* ══ BOTTOM BAR ══ */}
        <Reveal delay={320}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">

            <p className="text-xs text-[var(--color-text-muted)] text-center sm:text-start order-2 sm:order-1">
              {i18n[locale].footer.rights}
            </p>

            {/* Live status pill */}
            <div className="order-1 sm:order-2 flex items-center gap-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 transition-colors hover:border-[var(--color-gold)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-gold)] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-gold)] shadow-[0_0_8px_rgba(212,175,55,0.9)]" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-[var(--color-text-secondary)]">
                {i18n[locale].footer.tagline}
              </span>
            </div>

          </div>
        </Reveal>

      </div>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes shimmer  { to   { transform: translateX(200%); } }
        @keyframes drift    { from { transform: translateY(0px) rotate(0deg); }
                              to   { transform: translateY(-30px) rotate(3deg); } }
        @keyframes spin     { to   { transform: rotate(360deg); } }
      `}</style>
    </footer>
  );
}