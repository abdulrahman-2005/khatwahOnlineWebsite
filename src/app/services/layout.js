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
    url: "https://www.khatwah.online/services",
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
    canonical: "https://www.khatwah.online/services",
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
                "item": "https://www.khatwah.online"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Services",
                "item": "https://www.khatwah.online/services"
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
            "url": "https://www.khatwah.online/services",
            "provider": {
              "@type": "Organization",
              "name": "خطوة اونلاين | Khatwah Online",
              "url": "https://www.khatwah.online"
            },
            "hasPart": [
              {
                "@type": "SoftwareApplication",
                "name": "PhoneStory",
                "description": "Create professional story cards for used phones in 30 seconds",
                "url": "https://www.khatwah.online/services/phone-story",
                "applicationCategory": "WebApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "WebApplication",
                "name": "على كيفك — alakeifak",
                "description": "Free interactive digital menus for restaurants in Arish with WhatsApp ordering",
                "url": "https://www.khatwah.online/services/alakeifak",
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
