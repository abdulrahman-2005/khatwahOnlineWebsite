import { NextResponse } from "next/server";
import { createServerSupabase } from "@/app/services/alakeifak/lib/supabaseServer";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const DEFAULT_ICONS = [
    { src: "/fvgen/android-chrome-192x192.png?v=2", sizes: "192x192", type: "image/png", purpose: "maskable any" },
    { src: "/fvgen/android-chrome-512x512.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable any" }
  ];

  if (!slug || slug === "main") {
    return NextResponse.json({
      name: "على كيفك",
      short_name: "على كيفك",
      description: "نظام إدارة المطاعم والطلب الإلكتروني على كيفك من خطوة",
      start_url: "/services/alakeifak",
      display: "standalone",
      background_color: "#18181b",
      theme_color: "#f97316",
      icons: DEFAULT_ICONS
    });
  }

  if (slug === "partner" || slug === "admin") {
    return NextResponse.json({
      name: "على كيفك — شركاء",
      short_name: "شركاء",
      description: "لوحة تحكم شركاء على كيفك",
      start_url: "/services/alakeifak/partner",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#f97316",
      icons: DEFAULT_ICONS
    });
  }

  const supabase = createServerSupabase({ useServiceRole: true });

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, theme_color")
    .eq("slug", slug)
    .single();

  if (!restaurant) {
    return new NextResponse("Restaurant not found", { status: 404 });
  }

  return NextResponse.json({
    name: restaurant.name,
    short_name: restaurant.name,
    description: `طلب طعام من ${restaurant.name} عبر على كيفك`,
    start_url: `/services/alakeifak/${slug}?utm_source=pwa`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: restaurant.theme_color || "#f97316",
    icons: DEFAULT_ICONS
  });
}
