import { Outfit, IBM_Plex_Sans_Arabic } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema } from "@/components/seo/StructuredData";
import { seoConfig } from "@/lib/seo";
import contact from "../../data/contact.json";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTagManager } from '@next/third-parties/google';

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
        url: '/fvgen/opengraph-image.png?v=2',
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
    images: ['/fvgen/twitter-image.png?v=2'],
  },
  icons: {
    icon: [
      { url: '/fvgen/favicon.ico?v=2', sizes: '48x48' },
      { url: '/fvgen/icon.svg?v=2', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/fvgen/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest?v=2',
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
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
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
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <GoogleTagManager gtmId="G-2G26Q35GPF" />

        <ThemeProvider>
          <LocaleProvider>
              <div className="khatwah-chrome no-print print:hidden">
                <NavBar />
              </div>
              <main>{children}</main>
              <div className="no-print print:hidden">
                <Footer />
              </div>
              <Analytics />
              <SpeedInsights />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}