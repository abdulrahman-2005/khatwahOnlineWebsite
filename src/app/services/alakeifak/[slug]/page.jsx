import { createServerSupabase } from "../lib/supabaseServer";
import { notFound } from "next/navigation";
import MenuContent from "./MenuContent";
import { generateRestaurantMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = createServerSupabase({ useServiceRole: true });

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!restaurant) return {};

  return generateRestaurantMetadata(restaurant);
}

export default async function RestaurantMenuPage({ params }) {
  const { slug } = await params;
  
  if (slug === "partner" || slug === "migrations") {
    notFound();
  }

  // Use service role to bypass RLS so we can fetch unverified restaurants.
  // The client component (MenuContent) will handle the actual owner verification securely!
  const supabase = createServerSupabase({ useServiceRole: true });

  // Fetch restaurant with all related data
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (restaurantError || !restaurant) {
    notFound();
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order");

  const categoryIds = (categories || []).map((c) => c.id);

  // Fetch subcategories
  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("*")
    .in("category_id", categoryIds.length > 0 ? categoryIds : [null])
    .order("sort_order");

  const subcategoryIds = (subcategories || []).map((s) => s.id);

  // Fetch items with sizes
  const { data: items } = await supabase
    .from("items")
    .select(`*, item_sizes (*)`)
    .in("subcategory_id", subcategoryIds.length > 0 ? subcategoryIds : [null])
    .order("sort_order");

  // Fetch extras
  const { data: extras } = await supabase
    .from("extras")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("is_available", true);

  // Fetch delivery zones
  const { data: deliveryZones } = await supabase
    .from("delivery_zones")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("region_name");

  // Group structure: categorizedItems[categoryId] = [ { subcategory, items: [] } ]
  const groupedData = {};
  (categories || []).forEach((cat) => {
    const catSubs = (subcategories || []).filter((sub) => sub.category_id === cat.id);
    
    const subWithItems = catSubs.map(sub => {
      return {
        ...sub,
        items: (items || []).filter(item => item.subcategory_id === sub.id)
      };
    }).filter(sub => sub.items.length > 0); // Only include subcategories that have items

    groupedData[cat.id] = subWithItems;
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": restaurant.name,
            "description": `${restaurant.name} - مطعم في العريش، متاح للطلب أونلاين عبر منصة على كيفك وموقع khatwah.online`,
            "image": restaurant.banner_url || restaurant.logo_url,
            "url": `https://www.khatwah.online/services/alakeifak/${restaurant.slug}`,
            "servesCuisine": restaurant.cuisine_type || "Egyptian",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Arish",
              "addressRegion": "North Sinai",
              "addressCountry": "EG"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "00:00",
                "closes": "23:59"
              }
            ],
            "menu": `https://www.khatwah.online/services/alakeifak/${restaurant.slug}`,
            "telephone": restaurant.whatsapp_number
          })
        }}
      />
      <MenuContent
        restaurant={restaurant}
        categories={categories || []}
        groupedData={groupedData}
        extras={extras || []}
        deliveryZones={deliveryZones || []}
      />
    </>
  );
}
