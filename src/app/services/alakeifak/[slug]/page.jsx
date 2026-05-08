import { createServerSupabase } from "../lib/supabaseServer";
import { notFound } from "next/navigation";
import { cache } from "react";
import MenuContent from "./MenuContent";
import { generateRestaurantMetadata } from "@/lib/seo";

// Enable ISR: Cache the menu page for 2 minutes. This protects the database during traffic spikes.
export const revalidate = 120;

export async function generateStaticParams() {
  const supabase = createServerSupabase();
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("is_active", true);

  return (restaurants || []).map((restaurant) => ({
    slug: restaurant.slug,
  }));
}

// Wrap the initial restaurant fetch in React cache() to dedupe between metadata and page render
const getRestaurant = cache(async (slug) => {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();
  
  if (error) return null;
  return data;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) return {};

  return {
    ...generateRestaurantMetadata(restaurant),
    manifest: `/api/alakeifak/manifest?slug=${slug}`,
  };
}

export default async function RestaurantMenuPage({ params }) {
  const { slug } = await params;

  if (slug === "partner" || slug === "migrations" || slug === "admin") {
    notFound();
  }

  const supabase = createServerSupabase();

  // ── Step 1: Fetch restaurant ONLY — check is_active BEFORE any further queries
  const restaurant = await getRestaurant(slug);
  if (!restaurant) {
    notFound();
  }

  // ── Step 2: Kill switch — if not active, return unavailable page IMMEDIATELY.
  // No menu data is fetched. is_active controls the menu link; is_verified controls
  // whether the restaurant appears in the public listing (/alakeifak).
  if (restaurant.is_active === false) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gray-100 border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">هذا المنيو غير متاح حالياً</h1>
          <p className="text-gray-500 font-bold mb-8">
            عذراً، {restaurant.name} غير متاح للطلب في الوقت الحالي. يُرجى المحاولة لاحقاً أو التواصل مع المطعم مباشرة.
          </p>
          <a
            href="/services/alakeifak"
            className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-black text-white hover:bg-black transition-all"
          >
            العودة لقائمة المطاعم
          </a>
        </div>
      </main>
    );
  }

  // ── Step 3: Restaurant is active — fetch menu data with proper error handling
  let categories = [];
  let subcategories = [];
  let items = [];
  let extras = [];
  let deliveryZones = [];

  try {
    // Fetch categories — select only needed columns
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("id,restaurant_id,name,icon,sort_order")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order");

    if (catError) throw catError;
    categories = catData || [];

    const categoryIds = categories.map((c) => c.id);

    if (categoryIds.length > 0) {
      // Fetch subcategories
      const { data: subData, error: subError } = await supabase
        .from("subcategories")
        .select("id,category_id,name,sort_order")
        .in("category_id", categoryIds)
        .order("sort_order");

      if (subError) throw subError;
      subcategories = subData || [];

      const subcategoryIds = subcategories.map((s) => s.id);

      if (subcategoryIds.length > 0) {
        // Fetch items with sizes
        const { data: itemData, error: itemError } = await supabase
          .from("items")
          .select("id,subcategory_id,name,description,ingredients,image_url,is_available,sort_order,item_sizes(id,item_id,name,price,sort_order)")
          .in("subcategory_id", subcategoryIds)
          .order("sort_order");

        if (itemError) throw itemError;
        items = itemData || [];
      }
    }

    // Fetch extras and delivery zones in parallel
    const [extrasResult, zonesResult] = await Promise.all([
      supabase
        .from("extras")
        .select("id,restaurant_id,name,price,is_available,image_url,suggested_subcategories")
        .eq("restaurant_id", restaurant.id)
        .eq("is_available", true),
      supabase
        .from("delivery_zones")
        .select("id,restaurant_id,region_name,fee")
        .eq("restaurant_id", restaurant.id)
        .order("region_name"),
    ]);

    if (!extrasResult.error) extras = extrasResult.data || [];
    if (!zonesResult.error) deliveryZones = zonesResult.data || [];
  } catch (err) {
    console.error("[RestaurantMenuPage] Failed to fetch menu data:", err);
    // Render the page with whatever data we managed to get — don't crash
  }

  // ── Step 4: Build grouped data structure
  // categorizedItems[categoryId] = [ { subcategory, items: [] } ]
  const groupedData = {};
  categories.forEach((cat) => {
    const catSubs = subcategories.filter((sub) => sub.category_id === cat.id);
    const subWithItems = catSubs
      .map((sub) => ({
        ...sub,
        items: items.filter((item) => item.subcategory_id === sub.id),
      }))
      .filter((sub) => sub.items.length > 0);
    groupedData[cat.id] = subWithItems;
  });

  // ── Step 5: Build JSON-LD structured data (richer schema)
  const restaurantUrl = `https://www.khatwah.online/services/alakeifak/${restaurant.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurant.name,
    "description": `${restaurant.name} - مطعم في العريش، متاح للطلب أونلاين عبر منصة على كيفك وموقع khatwah.online`,
    "image": restaurant.banner_url || restaurant.logo_url,
    "url": restaurantUrl,
    "servesCuisine": restaurant.cuisine_type || "Egyptian",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Arish",
      "addressRegion": "North Sinai",
      "addressCountry": "EG",
    },
    "telephone": restaurant.whatsapp_number,
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "00:00",
        "closes": "23:59",
      },
    ],
    "menu": restaurantUrl,
    "hasMenu": {
      "@type": "Menu",
      "name": `قائمة ${restaurant.name}`,
      "url": restaurantUrl,
      ...(items.length > 0 && {
        "hasMenuSection": categories.slice(0, 5).map((cat) => ({
          "@type": "MenuSection",
          "name": cat.name,
          "hasMenuItem": (groupedData[cat.id] || [])
            .flatMap((sub) => sub.items)
            .slice(0, 5)
            .map((item) => ({
              "@type": "MenuItem",
              "name": item.name,
              "description": item.description || undefined,
              "offers": {
                "@type": "Offer",
                "price": item.item_sizes?.[0]?.price ?? 0,
                "priceCurrency": "EGP",
              },
            })),
        })),
      }),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MenuContent
        restaurant={restaurant}
        categories={categories}
        groupedData={groupedData}
        extras={extras}
        deliveryZones={deliveryZones}
      />
    </>
  );
}
