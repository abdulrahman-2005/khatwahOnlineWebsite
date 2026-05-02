import i18n from "../../data/i18n.json";
import contact from "../../data/contact.json";

/**
 * SEO Configuration and Metadata Generation
 * Centralized SEO management for consistent metadata across all pages
 */

// Base SEO configuration
export const seoConfig = {
  baseUrl: "https://www.khatwah.online",
  defaultLocale: "ar",
  supportedLocales: ["ar", "en"],

  // Core keywords for the business
  coreKeywords: {
    ar: [
      "خطوة اونلاين",
      "شركة برمجة مصرية",
      "أفضل شركات برمجة مواقع في مصر",
      "تصميم وتطوير المواقع الإلكترونية",
      "برمجة تطبيقات الجوال",
      "أفضل شركة تصميم مواقع",
      "شركات البرمجة في مصر",
      "حلول برمجية مخصصة",
      "دعم فني مستمر",
      "تصميم تطبيقات",
      "برمجة تطبيقات",
      "المواقع الإلكترونية",
      "لغات البرمجة",
      "مختلف القطاعات",
      "جودة عالية",
      "أكبر شركات البرمجيات",
      "العريش شمال سيناء",
      "التجارة المحلية مصر"
    ],
    en: [
      "khatwah online",
      "egyptian software company",
      "best web development companies egypt",
      "web design development",
      "mobile app development",
      "custom software solutions",
      "continuous technical support",
      "high quality programming",
      "arish north sinai",
      "local business egypt",
      "next.js react node.js",
      "programming languages",
      "various sectors"
    ]
  }
};

/**
 * Generate page metadata for Next.js
 */
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  path = "/",
  locale = "ar",
  images = [],
  type = "website",
  icons
}) {
  const baseKeywords = seoConfig.coreKeywords[locale] || seoConfig.coreKeywords.ar;
  const allKeywords = [...baseKeywords, ...keywords];
  const canonicalUrl = `${seoConfig.baseUrl}${path}`;

  // Default image
  const defaultImage = {
    url: `${seoConfig.baseUrl}/fvgen/opengraph-image.png?v=2`,
    width: 1200,
    height: 630,
    alt: locale === 'ar' ? 'خطوة اونلاين — Khatwah Online' : 'Khatwah Online'
  };

  const ogImages = images.length > 0 ? images : [defaultImage];

  return {
    title,
    description,
    keywords: allKeywords,
    authors: [{
      name: locale === 'ar' ? 'خطوة اونلاين' : 'Khatwah Online',
      url: seoConfig.baseUrl
    }],
    creator: locale === 'ar' ? 'خطوة اونلاين' : 'Khatwah Online',
    publisher: locale === 'ar' ? 'خطوة اونلاين' : 'Khatwah Online',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ar': `${seoConfig.baseUrl}${path}`,
        'en': `${seoConfig.baseUrl}/en${path}`,
        'x-default': canonicalUrl
      }
    },
    openGraph: {
      type,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_EG'],
      url: canonicalUrl,
      siteName: locale === 'ar' ? 'خطوة اونلاين | Khatwah Online' : 'Khatwah Online',
      title,
      description,
      images: ogImages
    },
    twitter: {
      card: "summary_large_image",
      site: "@khatwah_online",
      creator: "@khatwah_online",
      title,
      description,
      images: ogImages.map(img => img.url)
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
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      bing: process.env.BING_VERIFICATION,
    }
  };
}

/**
 * Generate homepage metadata
 */
export function generateHomeMetadata(locale = "ar") {
  const content = i18n[locale];

  return generatePageMetadata({
    title: locale === 'ar'
      ? "خطوة اونلاين — شركة برمجة مصرية | أفضل شركة تصميم مواقع في مصر"
      : "Khatwah Online — Egyptian Software Company | Best Web Development in Egypt",
    description: content.seo_content.hero_description,
    path: "/",
    locale,
    keywords: [
      ...(locale === 'ar' ? [
        "تصميم مواقع تعريفية",
        "أنظمة إدارة مخصصة",
        "التسويق الرقمي",
        "حلول تقنية للشركات"
      ] : [
        "company websites",
        "custom management systems",
        "digital marketing",
        "corporate tech solutions"
      ])
    ]
  });
}

/**
 * Generate project metadata
 */
export function generateProjectMetadata(project, locale = "ar") {
  const title = locale === 'ar' ? project.titleAr : project.titleEn;
  const description = locale === 'ar' ? project.descriptionAr : project.descriptionEn;

  // Get first project image for OG
  const firstImage = project.headerImages?.[0]
    ? {
      url: `${seoConfig.baseUrl}${project.basePath}/${project.headerImages[0]}`,
      width: 1200,
      height: 630,
      alt: title
    }
    : null;

  return generatePageMetadata({
    title: `${title} — ${locale === 'ar' ? 'خطوة اونلاين' : 'Khatwah Online'}`,
    description,
    path: `/projects/${project.slug}`,
    locale,
    images: firstImage ? [firstImage] : [],
    keywords: [
      title,
      ...(project.techStack || []),
      ...(locale === 'ar' ? [
        "مشروع تقني",
        "حلول رقمية",
        "تطوير مخصص"
      ] : [
        "tech project",
        "digital solutions",
        "custom development"
      ])
    ]
  });
}

/**
 * Generate projects page metadata
 */
export function generateProjectsMetadata(locale = "ar") {
  const content = i18n[locale];

  return generatePageMetadata({
    title: locale === 'ar'
      ? "مشاريعنا — أعمال خطوة اونلاين | شركة برمجة مصرية"
      : "Our Projects — Khatwah Online Work | Egyptian Software Company",
    description: locale === 'ar'
      ? "استعرض كل مشاريع خطوة اونلاين — أنظمة حجوزات، إدارة مخزون، متاجر إلكترونية، والمزيد. كل مشروع من الفكرة للتنفيذ بأفضل التقنيات."
      : "Explore all Khatwah Online projects — booking systems, inventory management, e-commerce stores, and more. Every project from idea to execution with the best technologies.",
    path: "/projects",
    locale,
    keywords: [
      ...(locale === 'ar' ? [
        "مشاريع خطوة اونلاين",
        "أعمال شركة برمجة",
        "نماذج أعمال تقنية"
      ] : [
        "khatwah online projects",
        "software company portfolio",
        "tech work examples"
      ])
    ]
  });
}

/**
 * Generate about page metadata  
 */
export function generateAboutMetadata(locale = "ar") {
  const content = i18n[locale];

  return generatePageMetadata({
    title: locale === 'ar'
      ? "من نحن — فريق خطوة اونلاين | شركة برمجة مصرية من العريش"
      : "About Us — Khatwah Online Team | Egyptian Software Company from Arish",
    description: locale === 'ar'
      ? "تعرف على فريق خطوة اونلاين - ثلاثة مطورين من العريش، شمال سيناء. نبني حلول تقنية للتجارة المحلية في مصر بخبرة 7+ سنوات في البرمجة."
      : "Meet the Khatwah Online team - three developers from Arish, North Sinai. We build tech solutions for local businesses in Egypt with 7+ years of programming experience.",
    path: "/about",
    locale,
    keywords: [
      ...(locale === 'ar' ? [
        "فريق خطوة اونلاين",
        "مطورين العريش",
        "شركة برمجة شمال سيناء"
      ] : [
        "khatwah online team",
        "arish developers",
        "north sinai software company"
      ])
    ]
  });
}

/**
 * Generate contact page metadata
 */
export function generateContactMetadata(locale = "ar") {
  return generatePageMetadata({
    title: locale === 'ar'
      ? "تواصل معنا — خطوة اونلاين | شركة برمجة مصرية"
      : "Contact Us — Khatwah Online | Egyptian Software Company",
    description: locale === 'ar'
      ? "تواصل مع خطوة اونلاين لمشروعك التقني. متاحين على واتساب، مكالمات، بريد إلكتروني. خدمة عملاء من السبت للخميس 9ص-6م."
      : "Contact Khatwah Online for your tech project. Available on WhatsApp, calls, email. Customer service Saturday to Thursday 9AM-6PM.",
    path: "/contact",
    locale,
    keywords: [
      ...(locale === 'ar' ? [
        "تواصل خطوة اونلاين",
        "خدمة عملاء شركة برمجة",
        "استشارة تقنية مجانية"
      ] : [
        "contact khatwah online",
        "software company customer service",
        "free tech consultation"
      ])
    ]
  });
}


/**
 * Generate products page metadata
 */
export function generateProductsMetadata(locale = "ar") {
  return generatePageMetadata({
    title: locale === 'ar'
      ? "منتجاتنا — حلول خطوة اونلاين | نظام حجوزات، مخزون، برمجة خاصة"
      : "Our Products — Khatwah Online Solutions | Booking, Inventory, Custom Development",
    description: locale === 'ar'
      ? "اكتشف حلول خطوة اونلاين: نظام حجوزات أونلاين، إدارة مخزون وPOS، وبرمجة خاصة. حلول مصممة لسوق العريش وشمال سيناء لزيادة أرباحك."
      : "Discover Khatwah Online solutions: online booking system, inventory & POS management, and custom development. Solutions designed for Arish and North Sinai market to increase your profits.",
    path: "/products",
    locale,
    keywords: [
      ...(locale === 'ar' ? [
        "مواقع تعريفية للشركات",
        "أنظمة إدارة مخصصة",
        "التسويق الرقمي وإدارة الهوية",
        "حلول رقمية متكاملة"
      ] : [
        "company websites design",
        "custom management systems",
        "digital marketing arish",
        "integrated digital solutions"
      ])
    ]
  });
}

/**
 * Generate product detail page metadata
 */
export function generateProductDetailMetadata(product, locale = "ar") {
  return generatePageMetadata({
    title: locale === 'ar'
      ? `${product.title} — خطوة اونلاين | ${product.subtitle}`
      : `${product.title} — Khatwah Online | ${product.subtitle}`,
    description: product.description,
    path: `/products/${product.slug}`,
    locale,
    keywords: [
      product.title,
      ...(product.features || []),
      ...(locale === 'ar' ? [
        "حلول تقنية العريش",
        "خدمات رقمية شمال سيناء"
      ] : [
        "tech solutions arish",
        "digital services north sinai"
      ])
    ]
  });
}

/**
 * Generate Alakeifak main page metadata
 */
export function generateAlakeifakMetadata(locale = "ar") {
  return generatePageMetadata({
    title: "على كيفك — قوائم مطاعم العريش الرقمية | khatwah.online",
    description: "اطلب من مطعمك المفضل في العريش عبر منصة على كيفك من خطوة اونلاين (khatwah.online). تصفح المنيو الرقمي واطلب عبر واتساب بسهولة.",
    path: "/services/alakeifak",
    locale,
    images: [
      {
        url: `${seoConfig.baseUrl}/services/alakeifak/assets/banner.webp`,
        width: 1200,
        height: 630,
        alt: "على كيفك — قوائم مطاعم العريش الرقمية من خطوة اونلاين"
      }
    ],
    keywords: [
      "على كيفك",
      "كيو ار منيو العريش",
      "مطاعم العريش",
      "منيو ديجيتال",
      "أكل العريش",
      "طلب طعام واتساب",
      "khatwah.online",
      "alakeifak",
      "arish restaurants"
    ]
  });
}

/**
 * Generate Restaurant specific metadata for Alakeifak
 */
export function generateRestaurantMetadata(restaurant, locale = "ar") {
  const title = `${restaurant.name} — منيو دليفري العريش | على كيفك عبر khatwah.online`;
  const description = `تصفح منيو ${restaurant.name} أونلاين على منصة على كيفك من خطوة اونلاين (khatwah.online). اطلب الآن مباشرة عبر واتساب واستمتع بأفضل تجربة طلب طعام في العريش.`;

  // Use restaurant banner, then logo, then default alakeifak banner
  const restaurantImage = restaurant.banner_url || restaurant.logo_url || `${seoConfig.baseUrl}/services/alakeifak/assets/banner.webp`;

  return generatePageMetadata({
    title,
    description,
    path: `/services/alakeifak/${restaurant.slug}`,
    locale,
    images: [
      {
        url: restaurantImage,
        width: 1200,
        height: 630,
        alt: `${restaurant.name} - على كيفك`
      }
    ],
    keywords: [
      restaurant.name,
      "منيو",
      "دليفري",
      "العريش",
      "على كيفك",
      "خطوة اونلاين",
      "khatwah.online",
      ...(restaurant.cuisine_type ? [restaurant.cuisine_type] : [])
    ]
  });
}
