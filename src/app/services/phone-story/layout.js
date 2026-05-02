import servicesData from '../../../../data/services.json';
import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: "PhoneStory - Story Card Generator | خطوة اونلاين",
  description: "Create professional story cards for used phones in 30 seconds. Perfect for phone sellers on WhatsApp and Instagram. Free tool with no signup required.",
  keywords: [
    "PhoneStory",
    "phone story cards",
    "used phone cards",
    "phone seller tools",
    "WhatsApp phone cards",
    "Instagram phone cards",
    "phone marketing",
    "mobile phone cards",
    "خطوة اونلاين",
    "Khatwah Online",
    "أدوات مجانية",
    "free tools"
  ].join(', '),
  openGraph: {
    title: "PhoneStory - Story Card Generator",
    description: "Create professional story cards for used phones in 30 seconds. Perfect for phone sellers on WhatsApp and Instagram.",
    url: `${seoConfig.baseUrl}/services/phone-story`,
    siteName: "خطوة اونلاين | Khatwah Online",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${seoConfig.baseUrl}/services/phone-story/assets/banner.webp`,
        width: 1200,
        height: 630,
        alt: "PhoneStory - Create professional phone story cards"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PhoneStory - Story Card Generator",
    description: "Create professional story cards for used phones in 30 seconds. Perfect for phone sellers on WhatsApp and Instagram.",
    images: [`${seoConfig.baseUrl}/services/phone-story/assets/banner.webp`]
  },
  alternates: {
    canonical: `${seoConfig.baseUrl}/services/phone-story`,
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

export default function PhoneStoryLayout({ children }) {
  const service = servicesData.en.find(s => s.slug === 'phone-story');

  return (
    <>
      {/* Service-specific structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PhoneStory",
            "description": service?.description || "Create professional story cards for used phones in 30 seconds",
            "applicationCategory": "WebApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "featureList": service?.features || [
              "Add up to 4 phones in one card",
              "Ready templates for quick start",
              "High-quality export (1080×1920)",
              "Live preview while editing",
              "English interface"
            ],
            "provider": {
              "@type": "Organization",
              "name": "خطوة اونلاين | Khatwah Online",
              "url": seoConfig.baseUrl,
              "logo": `${seoConfig.baseUrl}/logo.png`
            },
            "url": `${seoConfig.baseUrl}/services/phone-story`,
            "screenshot": `${seoConfig.baseUrl}/images/services/phone-story-screenshot.jpg`,
            "author": {
              "@type": "Organization",
              "name": "خطوة اونلاين | Khatwah Online"
            },
            "datePublished": "2024-01-15",
            "dateModified": "2024-04-20"
          })
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I create a phone story card?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply enter your store name, add phone details like brand, model, storage, and condition. The tool will generate a professional story card instantly."
                }
              },
              {
                "@type": "Question",
                "name": "How many phones can I add to one card?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can add up to 4 phones in a single story card, perfect for showcasing multiple devices to your customers."
                }
              },
              {
                "@type": "Question",
                "name": "Is PhoneStory free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, PhoneStory is completely free to use with no signup required. You can create and export cards instantly."
                }
              },
              {
                "@type": "Question",
                "name": "What export quality do I get?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "All cards are exported in high quality 1080×1920 resolution, perfect for WhatsApp and Instagram stories."
                }
              }
            ]
          })
        }}
      />

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
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "PhoneStory",
                "item": `${seoConfig.baseUrl}/services/phone-story`
              }
            ]
          })
        }}
      />

      {children}
    </>
  );
}