"use client";

import { Reveal } from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { notFound } from "next/navigation";
import productsData from "../../../../data/products.json";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import ProductDetailClient from "./ProductDetailClient";
import { useEffect, useState } from "react";

export default function ProductDetailPage({ params }) {
  const { locale } = useLocale();
  const [slug, setSlug] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      const foundProduct = productsData[locale]?.find((p) => p.slug === resolvedParams.slug);
      setProduct(foundProduct);
    }
    loadParams();
  }, [params, locale]);

  if (slug && !product) {
    notFound();
  }

  if (!product) {
    return null; // Loading state
  }

  return <ProductDetailClient product={product} slug={slug} />;
}
