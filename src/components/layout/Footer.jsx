"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";
import contactData from "../../../data/contact.json";

export default function Footer() {
  const { locale } = useLocale();

  const navLinks = [
    { label: i18n[locale].nav.products, href: "/#products" },
    { label: locale === 'ar' ? 'خدماتنا' : 'Services', href: "/services" },
    { label: i18n[locale].nav.projects, href: "/projects" },
    { label: i18n[locale].nav.about, href: "/about" },
    { label: i18n[locale].nav.contact, href: "/contact" },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      href: contactData.social.instagram.url,
      handle: contactData.social.instagram.handle,
    },
    {
      name: "TikTok",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      href: contactData.social.tiktok.url,
      handle: contactData.social.tiktok.handle,
    },
    {
      name: "Facebook",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: contactData.social.facebook.url,
      handle: contactData.social.facebook.handle,
    },
    {
      name: "Twitter",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: contactData.social.twitter.url,
      handle: contactData.social.twitter.handle,
    },
    {
      name: "YouTube",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      href: contactData.social.youtube.url,
      handle: contactData.social.youtube.handle,
    },
  ];

  return (
    <footer className="w-full px-6 pt-20 pb-8 sm:px-12 lg:px-20" style={{ backgroundColor: "var(--color-ink)" }}>
      <div className="mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 pb-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand & Description */}
          <div className="space-y-6 lg:col-span-5">
            <Link href="/" className="navbar-logo group" aria-label="Khatwah Online — Home">
              <span
                className="text-4xl font-bold tracking-tight"
                style={{
                  color: "var(--color-text)",
                  transition: "color 0.3s",
                  fontFamily: "terrabica",
                }}
              >
                خطوة
              </span>
              <span
                className="text-1xl font-bold tracking-[3px] uppercase"
                style={{
                  fontFamily: "terrabica",
                  color: "var(--color-gold)",
                  transition: "color 0.3s",
                }}
              >
                اونلاين
              </span>
            </Link>
            <p className="max-w-md text-sm sm:text-base leading-7" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-on-dark-muted)" }}>
              {contactData.company.tagline[locale]}
            </p>

            {/* Social Media Links */}
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-bold tracking-wider uppercase" style={{ fontFamily: "var(--font-ui)", color: "var(--color-gold)" }}>
                {locale === 'ar' ? 'تابعنا' : 'Follow Us'}
              </h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-10 w-10 items-center justify-center border transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    style={{
                      borderColor: "var(--color-border-dark)",
                      color: "var(--color-text-on-dark-muted)",
                      backgroundColor: "rgba(255, 255, 255, 0.05)"
                    }}
                    aria-label={social.name}
                  >
                    <span className="transition-colors duration-300 group-hover:text-[var(--color-gold)]">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5 lg:col-span-2">
            <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase" style={{ fontFamily: "var(--font-ui)", color: "var(--color-gold)" }}>
              {i18n[locale].footer.links_heading}
            </h3>
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group w-fit text-sm sm:text-base transition-all duration-200"
                  style={{ color: "var(--color-text-on-dark-muted)" }}
                >
                  <span className="relative">
                    {link.label}
                    <span
                      className="absolute bottom-0 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: "var(--color-gold)" }}
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-5 lg:col-span-5">
            <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase" style={{ fontFamily: "var(--font-ui)", color: "var(--color-gold)" }}>
              {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <div className="space-y-4">
              {/* Email */}
              <a
                href={`mailto:${contactData.email}`}
                className="group flex items-start gap-3 text-sm sm:text-base transition-colors duration-200"
                style={{ color: "var(--color-text-on-dark-muted)" }}
              >
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 transition-colors duration-200 group-hover:text-[var(--color-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="group-hover:text-[var(--color-text-on-dark)]" style={{ direction: "ltr" }}>
                  {contactData.email}
                </span>
              </a>

              {/* Primary Phone */}
              <a
                href={`tel:${contactData.phones[0].number.replace(/\s/g, "")}`}
                className="group flex items-start gap-3 text-sm sm:text-base transition-colors duration-200"
                style={{ color: "var(--color-text-on-dark-muted)" }}
              >
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 transition-colors duration-200 group-hover:text-[var(--color-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="group-hover:text-[var(--color-text-on-dark)]" style={{ direction: "ltr" }}>
                  {contactData.phones[0].number}
                </span>
              </a>

              {/* Location */}
              <div className="flex items-start gap-3 text-sm sm:text-base" style={{ color: "var(--color-text-on-dark-muted)" }}>
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{contactData.address[locale]}</span>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3 text-sm sm:text-base" style={{ color: "var(--color-text-on-dark-muted)" }}>
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{contactData.workingHours[locale]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ backgroundColor: "var(--color-border-dark)" }} />

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 pt-8 text-xs sm:text-sm sm:flex-row sm:items-center sm:justify-between">
          <p style={{ color: "var(--color-text-on-dark-muted)" }}>
            {i18n[locale].footer.rights}
          </p>
          <p className="flex items-center gap-2" style={{ color: "var(--color-text-on-dark-muted)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: "var(--color-primary-light)" }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--color-primary-light)" }}
              />
            </span>
            {i18n[locale].footer.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
