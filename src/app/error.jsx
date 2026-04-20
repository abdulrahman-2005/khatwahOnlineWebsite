'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import Eyebrow from '@/components/ui/Eyebrow';

export default function Error({ error, reset }) {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="relative w-full overflow-x-hidden bg-background min-h-screen flex items-center">
      {/* Atmospheric Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 ${locale === 'ar' ? 'right-1/4' : 'left-1/4'} w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-accent-glow rounded-full blur-[80px] sm:blur-[120px] ${isLight ? 'opacity-30' : 'opacity-20'}`} />
        <div className={`absolute bottom-1/4 ${locale === 'ar' ? 'left-1/4' : 'right-1/4'} w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-primary-glow rounded-full blur-[80px] sm:blur-[120px] ${isLight ? 'opacity-25' : 'opacity-15'}`} />
      </div>

      <div className="relative w-full px-6 py-24 lg:px-20">
        <div className="mx-auto max-w-4xl text-center relative z-10">
          {/* Error Badge */}
          <div className="mb-8">
            <Eyebrow color="var(--color-accent)" size="base">
              {locale === 'ar' ? 'حدث خطأ' : 'Something went wrong'}
            </Eyebrow>
          </div>

          {/* Error Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <svg 
                className="w-24 h-24 text-accent animate-pulse" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
              <div className="absolute inset-0 w-24 h-24 border-2 border-accent rounded-full animate-ping opacity-20" />
            </div>
          </div>

          {/* Main Message */}
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" 
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            {locale === 'ar' ? 'عذراً، حدث خطأ' : 'Oops! Something Broke'}
          </h1>

          <p 
            className="text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-12" 
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
          >
            {locale === 'ar' 
              ? 'حدث خطأ غير متوقع. يمكنك المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.'
              : 'An unexpected error occurred. You can try again or return to the homepage.'
            }
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={reset}
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-bold uppercase tracking-wider rounded-full transition-all duration-300 hover:scale-105"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {locale === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 border-2 border-primary text-primary font-bold uppercase tracking-wider rounded-full transition-all duration-300 hover:bg-primary hover:text-white"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left max-w-2xl mx-auto">
              <summary 
                className="cursor-pointer text-sm font-bold uppercase tracking-wider mb-4"
                style={{ fontFamily: "var(--font-ui)", color: "var(--color-text-muted)" }}
              >
                {locale === 'ar' ? 'تفاصيل الخطأ (للمطورين)' : 'Error Details (Development)'}
              </summary>
              <pre 
                className="text-xs overflow-auto p-4 bg-surface rounded-[20px] border border-border-dark"
                style={{ fontFamily: "monospace", color: "var(--color-text-muted)" }}
              >
                {error?.message || 'Unknown error'}
                {error?.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </main>
  );
}