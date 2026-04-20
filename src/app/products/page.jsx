import productsData from "../../../data/products.json";
import { generateProductsMetadata } from "@/lib/seo";
import ProductsClient from "./ProductsClient";

// Generate metadata for SEO
export const metadata = generateProductsMetadata("ar");

export default function ProductsPage() {
  const productsAr = productsData.ar || [];
  const productsEn = productsData.en || [];

  return <ProductsClient productsAr={productsAr} productsEn={productsEn} />;
}
