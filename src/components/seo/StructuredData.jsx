/**
 * Structured Data (JSON-LD) Components for SEO
 * These help search engines understand your content better
 * and enable rich snippets in search results
 */

import { seoConfig } from "@/lib/seo";
import contact from "../../../data/contact.json";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "خطوة اونلاين | Khatwah Online",
    alternateName: "Khatwah Online",
    url: seoConfig.baseUrl,
    logo: `${seoConfig.baseUrl}/og-image.png`,
    description: "شركة برمجة مصرية متخصصة في تصميم وتطوير المواقع الإلكترونية وبرمجة تطبيقات الجوال. نقدم حلول برمجية مخصصة للتجارة المحلية في مصر مع دعم فني مستمر.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "العريش",
      addressRegion: "شمال سيناء",
      addressCountry: "EG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      telephone: contact.phones[0].number,
      availableLanguage: ["Arabic", "English"],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    sameAs: [
      contact.social.instagram.url,
      contact.social.tiktok.url,
      contact.social.facebook.url,
      contact.social.twitter.url,
      contact.social.youtube.url,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "خطوة اونلاين | Khatwah Online",
    url: seoConfig.baseUrl,
    description: "حلول تقنية للتجارة المحلية — شركة تقنية من العريش، شمال سيناء",
    inLanguage: "ar_EG",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProjectSchema({ project }) {
  const firstImage = project.headerImages?.[0] 
    ? `${seoConfig.baseUrl}${project.basePath}/${project.headerImages[0]}`
    : `${seoConfig.baseUrl}/og-image.png`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.titleAr,
    alternateName: project.titleEn,
    description: project.descriptionAr,
    url: `${seoConfig.baseUrl}/projects/${project.slug}`,
    image: firstImage,
    creator: {
      "@type": "Organization",
      name: "خطوة اونلاين | Khatwah Online",
      url: seoConfig.baseUrl,
    },
    keywords: [
      project.titleAr,
      project.titleEn,
      ...project.techStack,
      "شركة برمجة مصرية",
      "تصميم وتطوير المواقع",
    ].join(", "),
    inLanguage: "ar_EG",
    datePublished: "2024-01-01",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  };

  if (project.url) {
    schema.mainEntityOfPage = project.url;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": seoConfig.baseUrl,
    name: "خطوة اونلاين | Khatwah Online",
    image: `${seoConfig.baseUrl}/og-image.png`,
    description: "شركة برمجة مصرية متخصصة في تصميم وتطوير المواقع الإلكترونية وبرمجة تطبيقات الجوال. نقدم حلول برمجية مخصصة للتجارة المحلية في مصر مع دعم فني مستمر.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "العريش",
      addressRegion: "شمال سيناء",
      addressCountry: "EG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.13,
      longitude: 33.80,
    },
    url: seoConfig.baseUrl,
    telephone: contact.phones[0].number,
    email: contact.email,
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "21:00",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    sameAs: [
      contact.social.instagram.url,
      contact.social.tiktok.url,
      contact.social.facebook.url,
      contact.social.twitter.url,
      contact.social.youtube.url,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
