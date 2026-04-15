import Hero from "@/components/sections/Hero";
import ProductsSection from "@/components/sections/ProductsSection";
import MissionStatement from "@/components/sections/MissionStatement";
import MarketSection from "@/components/sections/MarketSection";
import ProjectsTeaser from "@/components/sections/ProjectsTeaser";

export const metadata = {
  title: "خُطوة اونلاين — حلول تقنية للتجارة المحلية في العريش",
  description:
    "شركة تقنية من العريش، شمال سيناء. بنبني متاجر أونلاين، أنظمة حجوزات، إدارة مخزون، وحلول برمجية مخصصة للتجارة المحلية في مصر.",
  alternates: {
    canonical: "https://khatwah.vercel.app/",
  },
};

// Structured Data — Services
const servicesData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "خدمات خُطوة اونلاين",
  description: "حلول تقنية للتجارة المحلية",
  numberOfItems: 3,
  itemListElement: [
    {
      "@type": "Service",
      position: 1,
      name: "نظام الحجوزات الأونلاين",
      description: "حل متكامل للحجوزات الأونلاين للحلاقين والعيادات ومقدمي الخدمات.",
      serviceType: "Booking System",
      provider: {
        "@type": "Organization",
        name: "خُطوة اونلاين",
      },
      areaServed: {
        "@type": "City",
        name: "العريش",
      },
    },
    {
      "@type": "Service",
      position: 2,
      name: "نظام المخزون والـ POS",
      description: "إدارة مخزون، نقطة بيع، محاسبة أوتوماتيكية، وربط بمتجر أونلاين.",
      serviceType: "Inventory Management",
      provider: {
        "@type": "Organization",
        name: "خُطوة اونلاين",
      },
      areaServed: {
        "@type": "City",
        name: "العريش",
      },
    },
    {
      "@type": "Service",
      position: 3,
      name: "برمجة خاصة",
      description: "أي نظام أو موقع محتاجه — بنبنيه من الصفر حسب طلبك.",
      serviceType: "Custom Software Development",
      provider: {
        "@type": "Organization",
        name: "خُطوة اونلاين",
      },
      areaServed: {
        "@type": "City",
        name: "العريش",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesData),
        }}
      />
      <Hero />
      <ProductsSection />
      <MissionStatement />
      <MarketSection />
      <ProjectsTeaser />
    </>
  );
}
