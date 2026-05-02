import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: "Free Business Tools & Services | خطوة اونلاين",
  description: "Professional-grade free tools designed to streamline your business operations. Create phone story cards, manage inventory, and more. No signup required.",
  keywords: [
    "free business tools",
    "business services",
    "phone story cards",
    "free tools",
    "business automation",
    "خطوة اونلاين",
    "Khatwah Online",
    "أدوات مجانية",
    "خدمات مجانية"
  ].join(', '),
  openGraph: {
    title: "Free Business Tools & Services",
    description: "Professional-grade free tools designed to streamline your business operations. No signup required.",
    url: `${seoConfig.baseUrl}/services`,
    siteName: "خطوة اونلاين | Khatwah Online",
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_EG"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Business Tools & Services",
    description: "Professional-grade free tools designed to streamline your business operations. No signup required.",
  },
  alternates: {
    canonical: `${seoConfig.baseUrl}/services`,
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
};

export default function ServicesLayout({ children }) {
  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": seoConfig.baseUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Services",
                "item": `${seoConfig.baseUrl}/services`
              }
            ]
          })
        }}
      />

      {/* CollectionPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Free Business Tools & Services",
            "description": "Professional-grade free tools designed to streamline your business operations",
            "url": `${seoConfig.baseUrl}/services`,
            "provider": {
              "@type": "Organization",
              "name": "خطوة اونلاين | Khatwah Online",
              "url": seoConfig.baseUrl
            },
            "hasPart": [
              {
                "@type": "SoftwareApplication",
                "name": "PhoneStory",
                "description": "Create professional story cards for used phones in 30 seconds",
                "url": `${seoConfig.baseUrl}/services/phone-story`,
                "applicationCategory": "WebApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EGP"
                }
              },
              {
                "@type": "WebApplication",
                "name": "على كيفك — alakeifak",
                "description": "Free interactive digital menus for restaurants in Arish with WhatsApp ordering",
                "url": `${seoConfig.baseUrl}/services/alakeifak`,
                "applicationCategory": "FoodOrderingApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EGP"
                }
              }
            ]
          })
        }}
      />

      {children}
    </>
  );
}
