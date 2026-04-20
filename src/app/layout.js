import { Outfit, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Script from "next/script";
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema } from "@/components/seo/StructuredData";
import { seoConfig } from "@/lib/seo";
import contact from "../../data/contact.json";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-body",
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

export const metadata = {
  metadataBase: new URL(seoConfig.baseUrl),
  title: {
    default: "خطوة اونلاين | Khatwah Online — شركة برمجة مصرية | أفضل شركة تصميم مواقع في مصر",
    template: "%s | خطوة اونلاين",
  },
  description:
    "شركة برمجة مصرية متخصصة في تصميم وتطوير المواقع الإلكترونية وبرمجة تطبيقات الجوال. نقدم حلول برمجية مخصصة للتجارة المحلية في مصر مع دعم فني مستمر وجودة عالية.",  
  keywords: seoConfig.coreKeywords.ar,
  authors: [{ name: "خطوة اونلاين", url: seoConfig.baseUrl }],
  creator: "خطوة اونلاين",
  publisher: "خطوة اونلاين",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: seoConfig.baseUrl,
    siteName: "خطوة اونلاين | Khatwah Online",
    title: "خطوة اونلاين — شركة برمجة مصرية | أفضل شركة تصميم مواقع في مصر",
    description:
      "شركة برمجة مصرية متخصصة في تصميم وتطوير المواقع الإلكترونية وبرمجة تطبيقات الجوال. نقدم حلول برمجية مخصصة للتجارة المحلية في مصر.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'خطوة اونلاين — Khatwah Online',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: contact.social.twitter.handle,
    creator: contact.social.twitter.handle,
    title: "خطوة اونلاين — شركة برمجة مصرية | أفضل شركة تصميم مواقع في مصر",
    description:
      "شركة برمجة مصرية متخصصة في تصميم وتطوير المواقع الإلكترونية وبرمجة تطبيقات الجوال. نقدم حلول برمجية مخصصة للتجارة المحلية في مصر.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: seoConfig.baseUrl,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    bing: process.env.BING_VERIFICATION,
  }
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0D0B",
};

export default function RootLayout({ children }) {
  return (
      <html lang="ar" dir="rtl" className={`${outfit.variable} ${ibmPlexSansArabic.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('khatwah-theme');
                  var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                  if (savedTheme === 'dark' || (!savedTheme && !prefersLight)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }

                  var savedLocale = localStorage.getItem('khatwah-locale');
                  var browserLang = navigator.language;
                  if (savedLocale === 'en' || (!savedLocale && browserLang && !browserLang.startsWith('ar'))) {
                    document.documentElement.dir = 'ltr';
                    document.documentElement.lang = 'en';
                  } else {
                    document.documentElement.dir = 'rtl';
                    document.documentElement.lang = 'ar';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        <link 
          rel="preload" 
          href="/fonts/terrabica.otf" 
          as="font" 
          type="font/otf" 
          crossOrigin="anonymous"
        />
        
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        
        <OrganizationSchema />
        <WebsiteSchema />
        <LocalBusinessSchema />
      </head>
      <body className="min-h-screen antialiased">
        {/* Changed from lazyOnload to afterInteractive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2G26Q35GPF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2G26Q35GPF');
          `}
        </Script>

        <ThemeProvider>
          <LocaleProvider>
              <NavBar />
              <main>{children}</main>
              <Footer />
              <Analytics />
              <SpeedInsights />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}