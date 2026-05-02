import { notFound } from "next/navigation";
import productsData from "../../../../data/products.json";
import { seoConfig } from "@/lib/seo";
import { ProductSchema } from "@/components/seo/StructuredData";
import ProductDetailClient from "./ProductDetailClient";

// Generate static params for all products
export function generateStaticParams() {
  const arProducts = productsData.ar || [];
  return arProducts.map((product) => ({
    slug: product.slug,
  }));
}

// Generate metadata for SEO and OpenGraph
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  // Try to find product in Arabic first (default)
  const productAr = productsData.ar?.find((p) => p.slug === slug);
  
  if (!productAr) {
    return {
      title: "المنتج غير موجود | خطوة اونلاين",
      description: "المنتج الذي تبحث عنه غير متوفر.",
    };
  }

  // Use Arabic product data for metadata
  const ogImageUrl = `${seoConfig.baseUrl}/og-image.png`; // Fallback to default OG image
  const title = `${productAr.title} | منتجات خطوة اونلاين`;
  const description = productAr.longDescription || productAr.description;

  return {
    title,
    description,
    keywords: [
      productAr.title,
      ...(productAr.features || []),
      "خطوة اونلاين",
      "حلول برمجية",
      "العريش",
      "شمال سيناء",
    ],
    openGraph: {
      title: productAr.title,
      description,
      url: `${seoConfig.baseUrl}/products/${slug}`,
      type: "website",
      siteName: "خطوة اونلاين | Khatwah Online",
      locale: "ar_EG",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: productAr.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: productAr.title,
      description,
      images: [ogImageUrl],
      site: "@khatwah_online",
      creator: "@khatwah_online",
    },
    alternates: {
      canonical: `${seoConfig.baseUrl}/products/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  
  // Find product in both languages
  const productAr = productsData.ar?.find((p) => p.slug === slug);
  const productEn = productsData.en?.find((p) => p.slug === slug);

  if (!productAr) {
    notFound();
  }

  return (
    <>
      <ProductSchema product={productAr} />
      <ProductDetailClient productAr={productAr} productEn={productEn} slug={slug} />
    </>
  );
}
