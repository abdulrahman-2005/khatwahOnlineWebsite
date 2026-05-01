import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: "على كيفك — قوائم مطاعم العريش الرقمية | khatwah.online",
  description: "اطلب من مطعمك المفضل في العريش عبر منصة على كيفك من خطوة اونلاين (khatwah.online). تصفح المنيو الرقمي واطلب عبر واتساب بسهولة.",
  keywords: [
    "على كيفك",
    "مطاعم العريش",
    "كيو ار منيو العريش",
    "منيو ديجيتال",
    "طلب طعام واتساب",
    "alakeifak",
    "arish restaurants",
    "khatwah.online",
    "خطوة اونلاين",
  ].join(', '),
  openGraph: {
    title: "على كيفك — قوائم مطاعم العريش الرقمية | khatwah.online",
    description: "اطلب من مطعمك المفضل في العريش عبر منصة على كيفك من خطوة اونلاين. تصفح المنيو الرقمي واطلب عبر واتساب.",
    url: `${seoConfig.baseUrl}/services/alakeifak`,
    siteName: "خطوة اونلاين | khatwah.online",
    type: "website",
    locale: "ar_EG",
    images: [
      {
        url: `${seoConfig.baseUrl}/services/alakeifak/assets/banner.webp`,
        width: 1200,
        height: 630,
        alt: "على كيفك — قوائم مطاعم العريش الرقمية"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "على كيفك — قوائم مطاعم العريش الرقمية | khatwah.online",
    description: "اطلب من مطعمك المفضل في العريش عبر منصة على كيفك من خطوة اونلاين. تصفح المنيو الرقمي واطلب عبر واتساب.",
    images: [`${seoConfig.baseUrl}/services/alakeifak/assets/banner.webp`]
  },
  alternates: {
    canonical: `${seoConfig.baseUrl}/services/alakeifak`,
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

export default function alakeifakLayout({ children }) {
  return (
    <>
      {/* SoftwareApplication Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "على كيفك — alakeifak",
            "description": "منصة مجانية لإنشاء قوائم طعام رقمية تفاعلية لمطاعم العريش وطلب الطعام عبر واتساب",
            "applicationCategory": "FoodOrderingApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EGP",
              "availability": "https://schema.org/InStock"
            },
            "featureList": [
              "قوائم طعام رقمية تفاعلية",
              "طلب عبر واتساب",
              "بدون تسجيل حساب",
              "لوحة تحكم للمطاعم",
              "إدارة الأصناف والأحجام",
              "مناطق توصيل مخصصة"
            ],
            "provider": {
              "@type": "Organization",
              "name": "خطوة اونلاين | Khatwah Online",
              "url": seoConfig.baseUrl,
            },
            "url": `${seoConfig.baseUrl}/services/alakeifak`,
            "inLanguage": "ar",
            "areaServed": {
              "@type": "City",
              "name": "العريش",
              "containedInPlace": {
                "@type": "State",
                "name": "شمال سيناء"
              }
            }
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
                "name": "إزاي أطلب أكل من على كيفك؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ادخل على صفحة المطعم، اختار الأصناف والأحجام اللي عايزها، وأضفها للسلة. بعد كده اكتب بياناتك وهنوجهك لواتساب عشان تبعت الطلب مباشرة للمطعم."
                }
              },
              {
                "@type": "Question",
                "name": "هل لازم أسجل حساب عشان أطلب؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "لا، مش محتاج تسجل حساب. تقدر تطلب مباشرة بدون أي تسجيل. بياناتك بتتحفظ في المتصفح بتاعك عشان تسهّل عليك الطلب القادم."
                }
              },
              {
                "@type": "Question",
                "name": "أنا صاحب مطعم، إزاي أضيف مطعمي؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ادخل على صفحة الشركاء وسجّل بحساب جوجل. بعد كده هتقدر تضيف اسم مطعمك ورقم الواتساب وتبدأ تضيف الأصناف والأسعار فوراً."
                }
              },
              {
                "@type": "Question",
                "name": "هل الخدمة مجانية؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "نعم، الخدمة مجانية تماماً حالياً لأصحاب المطاعم والعملاء. الدفع يكون كاش عند الاستلام مباشرة للمطعم."
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
                "name": "الرئيسية",
                "item": seoConfig.baseUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "الخدمات",
                "item": `${seoConfig.baseUrl}/services`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "على كيفك",
                "item": `${seoConfig.baseUrl}/services/alakeifak`
              }
            ]
          })
        }}
      />

      <div className="alakeifak-active" dir="rtl" lang="ar" style={{ fontFamily: 'var(--font-body)' }}>
        {children}
      </div>
    </>
  );
}
