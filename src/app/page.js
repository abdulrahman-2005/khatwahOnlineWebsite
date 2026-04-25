import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import { FAQSchema } from "@/components/seo/StructuredData";
import i18n from "../../data/i18n.json";

// Lazy load below-fold sections for better performance
const ProductsSection = dynamic(() => import("@/components/sections/ProductsSection"));
const MissionStatement = dynamic(() => import("@/components/sections/MissionStatement"));
const WhyUsSection = dynamic(() => import("@/components/sections/WhyUsSection"));
const ProjectsTeaser = dynamic(() => import("@/components/sections/ProjectsTeaser"));
const SEOContent = dynamic(() => import("@/components/sections/SEOContent"));
const FAQ = dynamic(() => import("@/components/sections/FAQ"));

import { generateHomeMetadata } from "@/lib/seo";

export const metadata = generateHomeMetadata("ar");

// Structured Data — Services with enhanced Product schema
const servicesData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "خدمات خطوة اونلاين",
  description: "حلول تقنية للتجارة المحلية في العريش وشمال سيناء",
  numberOfItems: 3,
  itemListElement: [
    {
      "@type": "Product",
      position: 1,
      name: "نظام الحجوزات الأونلاين",
      description: "نظام حجوزات أونلاين سهل وبسيط للحلاقين، العيادات، الصالونات والخدمات في العريش وشمال سيناء. حجز فوري، تذكيرات أوتوماتيكية، تقويم ذكي، ونقاط ولاء.",
      url: "https://www.khatwah.online/products/booking-system",
      brand: {
        "@type": "Brand",
        name: "خطوة اونلاين"
      },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        url: "https://www.khatwah.online/products/booking-system",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "EGP",
          price: "0",
          valueAddedTaxIncluded: "false"
        }
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "12"
      },
      provider: {
        "@type": "Organization",
        name: "خطوة اونلاين",
        url: "https://www.khatwah.online"
      },
      areaServed: {
        "@type": "City",
        name: "العريش",
        containedIn: {
          "@type": "AdministrativeArea",
          name: "شمال سيناء"
        }
      }
    },
    {
      "@type": "Product",
      position: 2,
      name: "نظام المخزون ونقطة البيع",
      description: "إدارة مخزون ذكية + نقطة بيع احترافية + ربط بالمتجر الأونلاين. تتبع لحظي، محاسبة أوتوماتيكية، وتقارير مفصلة للتجار في العريش وشمال سيناء.",
      url: "https://www.khatwah.online/products/inventory-pos",
      brand: {
        "@type": "Brand",
        name: "خطوة اونلاين"
      },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        url: "https://www.khatwah.online/products/inventory-pos",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "EGP",
          price: "0",
          valueAddedTaxIncluded: "false"
        }
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "18"
      },
      provider: {
        "@type": "Organization",
        name: "خطوة اونلاين",
        url: "https://www.khatwah.online"
      },
      areaServed: {
        "@type": "City",
        name: "العريش",
        containedIn: {
          "@type": "AdministrativeArea",
          name: "شمال سيناء"
        }
      }
    },
    {
      "@type": "Product",
      position: 3,
      name: "برمجة خاصة حسب الطلب",
      description: "حلول برمجية مخصصة 100% حسب احتياجك. مواقع إلكترونية، تطبيقات موبايل، أنظمة إدارة، وأي حل تقني تحتاجه. فريق محلي من العريش.",
      url: "https://www.khatwah.online/products/custom-development",
      brand: {
        "@type": "Brand",
        name: "خطوة اونلاين"
      },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        url: "https://www.khatwah.online/products/custom-development",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "EGP",
          price: "0",
          valueAddedTaxIncluded: "false"
        }
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "25"
      },
      provider: {
        "@type": "Organization",
        name: "خطوة اونلاين",
        url: "https://www.khatwah.online"
      },
      areaServed: {
        "@type": "City",
        name: "العريش",
        containedIn: {
          "@type": "AdministrativeArea",
          name: "شمال سيناء"
        }
      }
    }
  ]
};

export default function Home() {
  const faqData = i18n.ar.faq.questions;

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesData),
        }}
      />
      <FAQSchema faqs={faqData} />
      <Hero />
      <ProductsSection />
      <MissionStatement />
      <WhyUsSection />
      <ProjectsTeaser />
      <SEOContent />
      <FAQ />
    </>
  );
}
