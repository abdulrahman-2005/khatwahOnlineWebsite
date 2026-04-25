"use client";

import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";
import contactData from "../../../data/contact.json";
import Eyebrow from "@/components/ui/Eyebrow";

export default function ContactContent() {
  const { locale } = useLocale();
  const primaryPhone = contactData.phones[0];
  
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-screen w-full items-center overflow-hidden px-6 py-24 sm:px-12 sm:py-32 lg:px-20" style={{ backgroundColor: "var(--color-background)" }}>
        {/* Animated diagonal accents */}
        <div className="absolute -right-32 top-16 h-96 w-96 animate-pulse opacity-15 blur-3xl" style={{ backgroundColor: "var(--color-accent)", transform: "rotate(45deg)", animationDuration: "4s" }} />
        <div className="absolute -left-20 bottom-0 h-64 w-64 animate-pulse opacity-15 blur-3xl" style={{ backgroundColor: "var(--color-gold)", transform: "rotate(45deg)", animationDuration: "3s" }} />
        
        <div className="relative mx-auto max-w-6xl w-full">
          <div className="mb-6 sm:mb-8">
            <Eyebrow color="var(--color-accent)" size="lg">
              {i18n[locale].contact_page.hero_eyebrow}
            </Eyebrow>
          </div>
          <h1 className="max-w-5xl text-4xl sm:text-6xl lg:text-7xl xl:text-[100px] font-black leading-[0.95]" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", letterSpacing: "-2px" }}>
            <span className="relative inline-block animate-gradient bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] bg-clip-text text-transparent" style={{ backgroundSize: "200% auto" }}>
              {i18n[locale].contact_page.hero_headline_1}
            </span>
            <br />
            <span className="relative inline-block animate-gradient bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-accent)] to-[var(--color-gold)] bg-clip-text text-transparent" style={{ backgroundSize: "200% auto" }}>
              {i18n[locale].contact_page.hero_headline_2}
            </span>
          </h1>
          <p className="mt-6 sm:mt-8 max-w-lg text-base sm:text-lg leading-7" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
            {i18n[locale].contact_page.promise_sub}
          </p>
        </div>


        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          .animate-gradient {
            animation: gradient 3s linear infinite;
          }
        `}</style>
      </section>

      {/* Divider */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(to right, var(--color-accent), var(--color-gold), var(--color-primary))" }} />

      {/* Main Contact Section */}
      <section className="relative w-full overflow-hidden px-6 py-16 sm:py-24 lg:py-32 sm:px-12 lg:px-20" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="relative mx-auto max-w-6xl">
          
          {/* Primary Contact Card */}
          <div className="mb-16 sm:mb-20">
            <div className="mb-8 sm:mb-12">
              <Eyebrow color="var(--color-primary)" size="base">
                {i18n[locale].contact_page.direct_contact}
              </Eyebrow>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border-2 p-8 sm:p-12 lg:p-16 transition-all duration-500 hover:shadow-2xl" style={{ borderColor: "var(--color-primary-soft)", backgroundColor: "var(--color-background)" }}>
              {/* Animated background */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" style={{ background: `radial-gradient(circle at top right, var(--color-primary), transparent)` }} />
              
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Phone Section */}
                <div className="space-y-6">
                  <div>
                    <span className="text-xs sm:text-sm font-black tracking-wider uppercase opacity-60" style={{ fontFamily: "var(--font-ui)", color: "var(--color-primary)" }}>
                      {i18n[locale].contact_page.call_us}
                    </span>
                    <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)", direction: "ltr" }}>
                      {primaryPhone.number}
                    </p>
                    <p className="mt-2 text-sm sm:text-base" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                      {i18n[locale].contact_page.available_hours}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <a
                      href={`https://wa.me/${primaryPhone.number.replace(/\s/g, "").replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn flex items-center justify-center gap-3 border-2 py-4 px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{ borderColor: "var(--color-primary)", color: "var(--color-text-on-dark)", backgroundColor: "var(--color-primary)" }}
                    >
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover/btn:scale-110" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span className="text-sm sm:text-base font-black" style={{ fontFamily: "var(--font-ui)" }}>
                        {i18n[locale].contact_page.whatsapp}
                      </span>
                    </a>
                    <a
                      href={`tel:${primaryPhone.number.replace(/\s/g, "")}`}
                      className="group/btn flex items-center justify-center gap-3 border-2 py-4 px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)", backgroundColor: "var(--color-surface)" }}
                    >
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm sm:text-base font-black" style={{ fontFamily: "var(--font-ui)" }}>
                        {i18n[locale].contact_page.call}
                      </span>
                    </a>
                  </div>
                </div>

                {/* Email Section */}
                <div className="space-y-6 border-t lg:border-t-0 lg:border-l pt-8 lg:pt-0 lg:pl-12" style={{ borderColor: "var(--color-border)" }}>
                  <div>
                    <span className="text-xs sm:text-sm font-black tracking-wider uppercase opacity-60" style={{ fontFamily: "var(--font-ui)", color: "var(--color-gold)" }}>
                      {i18n[locale].contact_page.email}
                    </span>
                    <p className="mt-3 text-xl sm:text-2xl lg:text-3xl font-bold break-all" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)", direction: "ltr" }}>
                      {contactData.email}
                    </p>
                    <p className="mt-2 text-sm sm:text-base" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                      {i18n[locale].contact_page.email_description}
                    </p>
                  </div>

                  <a
                    href={`mailto:${contactData.email}`}
                    className="group/btn inline-flex items-center gap-3 border-2 py-4 px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ borderColor: "var(--color-gold)", color: "var(--color-text-on-dark)", backgroundColor: "var(--color-gold)" }}
                  >
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm sm:text-base font-black" style={{ fontFamily: "var(--font-ui)" }}>
                      {i18n[locale].contact_page.send_email}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Grid */}
          <div>
            <div className="mb-8 sm:mb-12">
              <Eyebrow color="var(--color-accent)" size="base">
                {i18n[locale].contact_page.social_eyebrow}
              </Eyebrow>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  name: "Instagram",
                  handle: contactData.social.instagram.handle,
                  href: contactData.social.instagram.url,
                  icon: <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
                  color: "var(--color-primary)"
                },
                {
                  name: "TikTok",
                  handle: contactData.social.tiktok.handle,
                  href: contactData.social.tiktok.url,
                  icon: <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>,
                  color: "var(--color-accent)"
                },
                {
                  name: "Facebook",
                  handle: contactData.social.facebook.handle,
                  href: contactData.social.facebook.url,
                  icon: <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
                  color: "var(--color-gold)"
                },
                {
                  name: "Twitter",
                  handle: contactData.social.twitter.handle,
                  href: contactData.social.twitter.url,
                  icon: <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
                  color: "var(--color-accent)"
                },
                {
                  name: "YouTube",
                  handle: contactData.social.youtube.handle,
                  href: contactData.social.youtube.url,
                  icon: <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
                  color: "var(--color-primary)"
                },
                {
                  name: "Messenger",
                  handle: i18n[locale].contact_page.messenger,
                  href: contactData.social.facebook.messenger,
                  icon: <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.304 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.291 14.194l-3.21-3.43-6.264 3.43 6.892-7.323 3.284 3.43 6.19-3.43-6.892 7.323z" /></svg>,
                  color: "var(--color-accent)"
                },
              ].map((social, i) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl border-2 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                >
                  <div className="relative flex flex-col items-center text-center gap-3">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110" style={{ color: social.color, backgroundColor: `${social.color}15` }}>
                      {social.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ fontFamily: "var(--font-ui)", color: "var(--color-text)" }}>
                        {social.name}
                      </p>
                      <p className="mt-1 text-xs opacity-60" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                        {social.handle}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
