"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";
import { useTheme } from "@/contexts/ThemeContext";
import i18n from "../../../data/i18n.json";

/* ─────────────────────────────────────────────
   SVG Icon Components — crisp, scalable, no emoji
   ───────────────────────────────────────────── */

function SunIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function GlobeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="4" ry="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function ChevronIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   NavBar Component
   ───────────────────────────────────────────── */

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [langDropdown, setLangDropdown] = useState(false);
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const langDropdownRef = useRef(null);

  // ── Scroll detection ──
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Close mobile menu on route change ──
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // ── Close mobile menu on scroll (floating panel should dismiss) ──
  useEffect(() => {
    if (!menuOpen) return;
    const handleScroll = () => setMenuOpen(false);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // ── Escape key handler ──
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setLangDropdown(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ── Close language dropdown on outside click ──
  useEffect(() => {
    const handleClick = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Check active route ──
  const isActive = useCallback((href) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  }, [pathname]);

  const links = [
    { label: i18n[locale].nav.products, href: "/#products" },
    { label: i18n[locale].nav.projects, href: "/projects" },
    { label: i18n[locale].nav.about, href: "/about" },
    { label: i18n[locale].nav.contact, href: "/contact" },
  ];

  const t = i18n[locale].nav;
  const currentLangLabel = locale === "ar" ? t.lang_ar : t.lang_en;
  const altLang = locale === "ar" ? "en" : "ar";
  const altLangLabel = locale === "ar" ? t.lang_en : t.lang_ar;

  return (
    <>
      {/* ── Floating NavBar ── */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out"
        style={{
          padding: scrolled ? "6px 16px" : "12px 16px",
          transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div
          className="navbar-glass mx-auto max-w-5xl flex items-center justify-between"
          style={{
            borderRadius: scrolled ? "16px" : "20px",
            padding: scrolled ? "10px 20px" : "14px 24px",
            backgroundColor: scrolled
              ? "var(--navbar-bg-scrolled)"
              : "var(--navbar-bg-top)",
            backdropFilter: "blur(20px) saturate(1.6)",
            WebkitBackdropFilter: "blur(20px) saturate(1.6)",
            border: "1px solid var(--navbar-border)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 var(--navbar-highlight)"
              : "0 4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 var(--navbar-highlight)",
            transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* ── Logo ── */}
          <Link href="/" className="navbar-logo flex items-center gap-2.5 group" aria-label="Khatwah Online — Home">
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                color: "var(--color-text)",
                transition: "color 0.3s",
              }}
            >
              {locale === 'en' ? 'Khatwah' : 'خُطوة'}
            </span>
            <span
              className="h-4 w-px"
              style={{
                backgroundColor: "var(--color-gold)",
                opacity: 0.5,
              }}
            />
            <span
              className="text-[10px] font-bold tracking-[3px] uppercase"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-gold)",
                transition: "color 0.3s",
              }}
            >
              {t.logo_online}
            </span>
          </Link>

          {/* ── Desktop Links ── */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="navbar-link relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-250"
                  style={{
                    color: active ? "var(--color-text)" : "var(--color-text-muted)",
                    backgroundColor: active ? "var(--navbar-link-active-bg)" : "transparent",
                  }}
                >
                  {link.label}
                  {active && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--color-gold)",
                        opacity: 0.8,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Desktop Actions ── */}
          <div className="hidden items-center gap-1.5 md:flex">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="navbar-action-btn flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-250"
              style={{
                color: "var(--color-text-muted)",
              }}
              aria-label={theme === "light" ? t.switch_to_dark : t.switch_to_light}
            >
              <span className="navbar-icon-rotate" key={theme}>
                {theme === "light" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              </span>
            </button>

            {/* Divider */}
            <span
              className="w-px h-4 mx-1"
              style={{ backgroundColor: "var(--navbar-divider)" }}
            />

            {/* Language dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="navbar-action-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-250"
                style={{
                  color: "var(--color-text-muted)",
                }}
                aria-label={t.change_language}
                aria-expanded={langDropdown}
              >
                <GlobeIcon size={14} />
                <span>{currentLangLabel}</span>
                <span
                  className="transition-transform duration-200"
                  style={{
                    transform: langDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronIcon size={10} />
                </span>
              </button>

              {/* Dropdown */}
              <div
                className="absolute top-full mt-2 right-0 min-w-[120px] rounded-xl overflow-hidden"
                style={{
                  opacity: langDropdown ? 1 : 0,
                  transform: langDropdown ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.95)",
                  pointerEvents: langDropdown ? "auto" : "none",
                  transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                  backgroundColor: "var(--navbar-dropdown-bg)",
                  backdropFilter: "blur(20px) saturate(1.5)",
                  WebkitBackdropFilter: "blur(20px) saturate(1.5)",
                  border: "1px solid var(--navbar-border)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <button
                  onClick={() => { setLocale("ar"); setLangDropdown(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-150"
                  style={{
                    color: locale === "ar" ? "var(--color-gold)" : "var(--color-text-muted)",
                    backgroundColor: locale === "ar" ? "var(--navbar-link-active-bg)" : "transparent",
                  }}
                >
                  <span className="text-base">🇪🇬</span>
                  <span>{t.lang_ar}</span>
                  {locale === "ar" && <span className="mr-auto text-[10px]">✓</span>}
                </button>
                <span className="block h-px mx-2" style={{ backgroundColor: "var(--navbar-divider)" }} />
                <button
                  onClick={() => { setLocale("en"); setLangDropdown(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-150"
                  style={{
                    color: locale === "en" ? "var(--color-gold)" : "var(--color-text-muted)",
                    backgroundColor: locale === "en" ? "var(--navbar-link-active-bg)" : "transparent",
                  }}
                >
                  <span className="text-base">🇬🇧</span>
                  <span>{t.lang_en}</span>
                  {locale === "en" && <span className="ml-auto text-[10px]">✓</span>}
                </button>
              </div>
            </div>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-lg md:hidden transition-colors duration-200"
            style={{
              backgroundColor: menuOpen ? "var(--navbar-link-active-bg)" : "transparent",
            }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? t.close_menu : t.open_menu}
            aria-expanded={menuOpen}
          >
            <div className="flex flex-col items-center justify-center w-5 h-5 relative">
              <span
                className="absolute block h-[1.5px] w-4 rounded-full transition-all duration-350"
                style={{
                  backgroundColor: "var(--color-text)",
                  transform: menuOpen
                    ? "rotate(45deg) translateY(0)"
                    : "rotate(0deg) translateY(-3.5px)",
                }}
              />
              <span
                className="absolute block h-[1.5px] w-4 rounded-full transition-all duration-350"
                style={{
                  backgroundColor: "var(--color-text)",
                  opacity: menuOpen ? 0 : 1,
                  transform: menuOpen ? "scaleX(0)" : "scaleX(1)",
                }}
              />
              <span
                className="absolute block h-[1.5px] w-4 rounded-full transition-all duration-350"
                style={{
                  backgroundColor: "var(--color-text)",
                  transform: menuOpen
                    ? "rotate(-45deg) translateY(0)"
                    : "rotate(0deg) translateY(3.5px)",
                }}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Backdrop (light overlay) ── */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          backdropFilter: menuOpen ? "blur(2px)" : "blur(0px)",
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile Floating Menu Panel ── */}
      <div
        ref={mobileMenuRef}
        className="fixed left-0 right-0 z-50 md:hidden"
        style={{
          top: scrolled ? "54px" : "66px",
          padding: "0 16px",
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "top 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div
          className="mx-auto max-w-5xl flex flex-col overflow-hidden"
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.97)",
            transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
            borderRadius: "16px",
            backgroundColor: "var(--navbar-drawer-bg)",
            backdropFilter: "blur(24px) saturate(1.8)",
            WebkitBackdropFilter: "blur(24px) saturate(1.8)",
            border: "1px solid var(--navbar-border)",
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 var(--navbar-highlight)",
          }}
        >
          {/* ── Nav Links ── */}
          <div className="flex flex-col gap-0.5 px-3 pt-3 pb-2">
            {links.map((link, idx) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="navbar-link flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-300"
                  style={{
                    color: active ? "var(--color-text)" : "var(--color-text-muted)",
                    backgroundColor: active ? "var(--navbar-link-active-bg)" : "transparent",
                    transitionDelay: menuOpen ? `${idx * 60 + 80}ms` : "0ms",
                    transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
                    opacity: menuOpen ? 1 : 0,
                  }}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--color-gold)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Divider ── */}
          <div className="mx-4">
            <span
              className="block h-px w-full"
              style={{ backgroundColor: "var(--navbar-divider)" }}
            />
          </div>

          {/* ── Actions Row ── */}
          <div className="flex items-center gap-2 px-3 py-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="navbar-action-btn flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300"
              style={{
                color: "var(--color-text-muted)",
                backgroundColor: "var(--navbar-link-active-bg)",
                transitionDelay: menuOpen ? `${links.length * 60 + 100}ms` : "0ms",
                transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
                opacity: menuOpen ? 1 : 0,
              }}
            >
              <span className="navbar-icon-rotate" key={theme}>
                {theme === "light" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              </span>
              <span>
                {theme === "light"
                  ? (locale === "ar" ? t.theme_dark : t.theme_dark)
                  : (locale === "ar" ? t.theme_light : t.theme_light)}
              </span>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => { setLocale(altLang); setMenuOpen(false); }}
              className="navbar-action-btn flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300"
              style={{
                color: "var(--color-text-muted)",
                backgroundColor: "var(--navbar-link-active-bg)",
                transitionDelay: menuOpen ? `${links.length * 60 + 160}ms` : "0ms",
                transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
                opacity: menuOpen ? 1 : 0,
              }}
            >
              <GlobeIcon size={16} />
              <span>{altLangLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


