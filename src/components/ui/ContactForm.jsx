"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import i18n from "../../../data/i18n.json";

export default function ContactForm() {
  const { locale } = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="relative overflow-hidden border-2 p-12 text-center" style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--color-surface)" }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "var(--color-primary)" }} />
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)", backgroundColor: "var(--color-primary-soft)" }}>
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="mb-2 text-2xl font-black" style={{ color: "var(--color-text)" }}>{i18n[locale].contact_page.form_success_title}</h3>
        <p style={{ color: "var(--color-text-muted)" }}>{i18n[locale].contact_page.form_success_sub}</p>
      </div>
    );
  }

  const baseInput = "w-full border-2 bg-transparent px-5 py-4 text-sm font-bold transition-all duration-300 focus:outline-none";
  const focusGold = { borderColor: "var(--color-gold)", boxShadow: "0 0 0 3px var(--color-gold-soft)" };
  const blurDefault = { borderColor: "var(--color-border)", boxShadow: "none" };

  return (
    <form onSubmit={handleSubmit} className="relative overflow-hidden border-2" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "var(--color-gold)" }} />

      <div className="p-8 sm:p-10">
        <div className="mb-8 space-y-6">
          <div>
            <label htmlFor="name" className="mb-2 block text-xs font-black tracking-wider uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }}>{i18n[locale].contact_page.form_name}</label>
            <input id="name" type="text" required className={baseInput} style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusGold)} onBlur={(e) => Object.assign(e.currentTarget.style, blurDefault)} placeholder={i18n[locale].contact_page.form_name_placeholder} />
          </div>
          <div>
            <label htmlFor="contact" className="mb-2 block text-xs font-black tracking-wider uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }}>{i18n[locale].contact_page.form_contact}</label>
            <input id="contact" type="text" required className={baseInput} style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusGold)} onBlur={(e) => Object.assign(e.currentTarget.style, blurDefault)} placeholder={i18n[locale].contact_page.form_contact_placeholder} />
          </div>
          <div>
            <label htmlFor="message" className="mb-2 block text-xs font-black tracking-wider uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }}>{i18n[locale].contact_page.form_message}</label>
            <textarea id="message" rows={5} required className={`${baseInput} resize-none`} style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusGold)} onBlur={(e) => Object.assign(e.currentTarget.style, blurDefault)} placeholder={i18n[locale].contact_page.form_message_placeholder} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-full px-6 py-5 text-sm font-bold transition-all duration-500 hover:shadow-[0_0_30px_var(--color-gold-soft)] disabled:opacity-50" style={{ fontFamily: "var(--font-display)", background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))", color: "var(--color-ink)", letterSpacing: "2px", fontSize: "16px", fontWeight: 700 }}>
          {loading ? i18n[locale].contact_page.form_sending : i18n[locale].contact_page.form_send}
        </button>
      </div>
    </form>
  );
}
