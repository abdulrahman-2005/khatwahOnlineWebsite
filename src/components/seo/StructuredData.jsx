/**
 * Structured Data (JSON-LD) Components for SEO
 * These help search engines understand your content better
 * and enable rich snippets in search results
 */

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "خطوة اونلاين | Khatwah Online",
    alternateName: "Khatwah Online",
    url: "https://www.khatwah.online",
    logo: "https://www.khatwah.online/og-image.png",
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
      "https://www.instagram.com/khatwahonline",
      "https://www.tiktok.com/@khatwahonline",
      "https://www.facebook.com/khatwahonline",
      "https://twitter.com/khatwahonline",
      "https://www.linkedin.com/company/khatwahonline",
      "https://github.com/khatwahonline",
      "https://www.youtube.com/@khatwahonline",
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
    url: "https://www.khatwah.online",
    description: "حلول تقنية للتجارة المحلية — شركة تقنية من العريش، شمال سيناء",
    inLanguage: ["ar", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.khatwah.online/projects?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
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
    ? `https://www.khatwah.online${project.basePath}/${project.headerImages[0]}`
    : "https://www.khatwah.online/og-image.png";

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.titleAr,
    alternateName: project.titleEn,
    description: project.descriptionAr,
    url: `https://www.khatwah.online/projects/${project.slug}`,
    image: firstImage,
    creator: {
      "@type": "Organization",
      name: "خطوة اونلاين | Khatwah Online",
      url: "https://www.khatwah.online",
    },
    keywords: [
      project.titleAr,
      project.titleEn,
      ...project.techStack,
      "شركة برمجة مصرية",
      "تصميم وتطوير المواقع",
    ].join(", "),
    inLanguage: ["ar", "en"],
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
    "@id": "https://www.khatwah.online",
    name: "خطوة اونلاين | Khatwah Online",
    image: "https://www.khatwah.online/og-image.png",
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
    url: "https://www.khatwah.online",
    telephone: "+201000000000",
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
