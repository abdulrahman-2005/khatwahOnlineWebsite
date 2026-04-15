import { Outfit, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://khatwah.vercel.app/"),
  title: {
    default: "خطوة اونلاين | Khatwah Online — حلول تقنية للتجارة المحلية",
    template: "%s | خطوة اونلاين",
  },
  description:
    "خطوة اونلاين — شركة تقنية من العريش، شمال سيناء. بنبني متاجر أونلاين، أنظمة حجوزات، إدارة مخزون، وحلول برمجية مخصصة للتجارة المحلية في مصر.",
  keywords: [
    "خطوة اونلاين",
    "كطوة اونلاين",
    "khatwah online",
    "متاجر اونلاين العريش",
    "تصميم مواقع العريش",
    "برمجة تطبيقات مصر",
    "نظام حجوزات اونلاين",
    "نظام مخزون مصر",
    "حلول رقمية للتجارة",
    "شركة تقنية شمال سيناء",
    "e-commerce arish",
    "web development egypt",
  ],
  authors: [{ name: "خطوة اونلاين", url: "https://khatwah.vercel.app/" }],
  creator: "خطوة اونلاين",
  publisher: "خطوة اونلاين",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    url: "https://khatwah.vercel.app/",
    siteName: "خطوة اونلاين | Khatwah Online",
    title: "خطوة اونلاين — حلول تقنية للتجارة المحلية",
    description:
      "شركة تقنية من العريش، شمال سيناء. بنبني متاجر أونلاين، أنظمة حجوزات، إدارة مخزون، وحلول برمجية مخصصة.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "خطوة اونلاين — Khatwah Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "خطوة اونلاين — حلول تقنية للتجارة المحلية",
    description:
      "شركة تقنية من العريش، شمال سيناء. بنبني متاجر أونلاين، أنظمة حجوزات، إدارة مخزون.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
  },
  category: "technology",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0D0B" },
    { media: "(prefers-color-scheme: light)", color: "#FFFEF9" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }) {
  return (
    <html className={`${outfit.variable} ${ibmPlexSansArabic.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                  if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="min-h-screen antialiased">
        {/* Google Analytics - Strategy afterInteractive is best for production */}
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
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}