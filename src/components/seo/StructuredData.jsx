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

export function ProductSchema({ product, url }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.titleAr || product.title,
    description: product.descriptionAr || product.description,
    url: url || `${seoConfig.baseUrl}/products/${product.slug}`,
    image: product.headerImages?.[0] ? `${seoConfig.baseUrl}${product.basePath}/${product.headerImages[0]}` : `${seoConfig.baseUrl}/og-image.png`,
    brand: {
      "@type": "Organization",
      name: "خطوة اونلاين | Khatwah Online"
    },
    offers: {
      "@type": "Offer",
      price: product.price || "0",
      priceCurrency: "EGP",
      availability: "https://schema.org/InStock",
      url: url || `${seoConfig.baseUrl}/products/${product.slug}`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareApplicationSchema({ appName, description, url }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: appName,
    description: description,
    url: url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "WebBrowser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EGP"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleSchema({ article, url }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    image: article.mainImage ? `${seoConfig.baseUrl}${article.mainImage}` : `${seoConfig.baseUrl}/og-image.png`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: article.authorName || "خطوة اونلاين",
      url: article.authorUrl || `${seoConfig.baseUrl}/about`
    },
    publisher: {
      "@type": "Organization",
      name: "خطوة اونلاين | Khatwah Online",
      logo: {
        "@type": "ImageObject",
        url: `${seoConfig.baseUrl}/schema-logo.png`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url || `${seoConfig.baseUrl}/blog/${article.slug}`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function AboutPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "Organization",
      name: "خطوة اونلاين | Khatwah Online",
      url: seoConfig.baseUrl,
      foundingDate: "2020-01-01"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
