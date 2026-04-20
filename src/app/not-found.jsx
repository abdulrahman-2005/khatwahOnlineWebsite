'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import Eyebrow from '@/components/ui/Eyebrow';

export default function NotFound() {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <main className="relative w-full overflow-x-hidden bg-background min-h-screen flex items-center">
      {/* Atmospheric Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 ${locale === 'ar' ? 'right-1/4' : 'left-1/4'} w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-primary-glow rounded-full blur-[80px] sm:blur-[120px] ${isLight ? 'opacity-30' : 'opacity-20'}`} />
        <div className={`absolute bottom-1/4 ${locale === 'ar' ? 'left-1/4' : 'right-1/4'} w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gold-glow rounded-full blur-[80px] sm:blur-[120px] ${isLight ? 'opacity-25' : 'opacity-15'}`} />
      </div>

      <div className="relative w-full px-6 py-24 lg:px-20">
        <div className="mx-auto max-w-4xl text-center relative z-10">
          {/* Error Code */}
          <div className="mb-8">
            <Eyebrow color="var(--color-accent)" size="base">
              {locale === 'ar' ? 'خطأ 404' : 'Error 404'}
            </Eyebrow>
          </div>

          {/* Giant 404 */}
          <div 
            className="text-[120px] sm:text-[200px] lg:text-[280px] font-black leading-none mb-8 opacity-20"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            404
          </div>

          {/* Main Message */}
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" 
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            {locale === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>

          <p 
            className="text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-12" 
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
          >
            {locale === 'ar' 
              ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.'
              : 'Sorry, the page you are looking for does not exist or has been moved to another location.'
            }
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold uppercase tracking-wider rounded-full transition-all duration-300 hover:scale-105 hover:bg-primary-light"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>

            <Link
              href="/blog"
              className="inline-flex items-center gap-3 px-8 py-4 border-2 border-gold text-gold font-bold uppercase tracking-wider rounded-full transition-all duration-300 hover:bg-gold hover:text-ink"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              {locale === 'ar' ? 'تصفح المدونة' : 'Browse Blog'}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}