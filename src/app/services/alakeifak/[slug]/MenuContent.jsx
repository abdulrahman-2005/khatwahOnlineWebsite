"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CategoryNav from "../components/CategoryNav";
import ItemCard from "../components/ItemCard";
import ItemModal from "../components/ItemModal";
import CartDrawer from "../components/CartDrawer";
import CheckoutModal from "../components/CheckoutModal";
import DigitalTicket from "../components/DigitalTicket";
import { useCartStore } from "../lib/cartStore";
import { ShoppingCart, Store, ChevronLeft, Info, ArrowRight, Clock, Sparkles } from "lucide-react";
import { track } from "@vercel/analytics";

export default function MenuContent({ restaurant, categories, groupedData, extras, deliveryZones, isPreview }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [preSelectedSizeId, setPreSelectedSizeId] = useState(null);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const { items: cartItems, getSubtotal, initCart, setShowDeliveryPricing } = useCartStore();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (restaurant?.slug) {
      initCart(restaurant.slug);
      setShowDeliveryPricing(restaurant.show_delivery_pricing ?? true);
    }
  }, [restaurant?.slug, restaurant?.show_delivery_pricing, initCart, setShowDeliveryPricing]);

  // Check for active digital ticket (in-house orders)
  useEffect(() => {
    const checkTicket = () => {
      try {
        const saved = localStorage.getItem("khatwah_active_ticket");
        if (saved) {
          const ticket = JSON.parse(saved);
          // Only show if it's for this restaurant and less than 2 hours old
          if (ticket.restaurantSlug === restaurant?.slug) {
            const age = Date.now() - new Date(ticket.createdAt).getTime();
            if (age < 2 * 60 * 60 * 1000) {
              setActiveTicket(ticket);
              setIsTicketOpen(true);
            } else {
              localStorage.removeItem("khatwah_active_ticket");
              setActiveTicket(null);
            }
          }
        }
      } catch { /* ignore */ }
    };

    checkTicket();
    
    // Listen for new tickets created without reloading
    const handleNewTicket = () => {
      checkTicket();
      setIsTicketOpen(true);
    };
    window.addEventListener("khatwah_ticket_created", handleNewTicket);
    return () => window.removeEventListener("khatwah_ticket_created", handleNewTicket);
  }, [restaurant?.slug]);

  const themeColor = restaurant.theme_color || "#ee930c";
  const isClosed = !restaurant.is_open;
  const heroBannerUrl = restaurant.banner_url || restaurant.logo_url || null;

  useEffect(() => {
    const handleScroll = () => {
      const categoryElements = categories.map((cat) => ({
        id: cat.id,
        element: document.getElementById(`category-${cat.id}`),
      }));
      const scrollPosition = window.scrollY + 200;
      for (let i = categoryElements.length - 1; i >= 0; i--) {
        const { id, element } = categoryElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveCategory(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const handleOpenItem = (item, sizeId = null) => {
    setPreSelectedSizeId(sizeId);
    setSelectedItem(item);
  };

  const handleCheckout = () => {
    track("alakeifak_checkout_started", { restaurant_id: restaurant.id, total: getSubtotal() });
    setIsCartOpen(false);
    setTimeout(() => setIsCheckoutOpen(true), 400);
  };

  /**
   * renderBentoGrid — Alternating layout for visual variety:
   *   1 full-width hero → up to 4 compact (2×2 grid) → repeat
   */
  const renderBentoGrid = (items, cols = 2) => {
    if (!items || items.length === 0) return null;
    const elements = [];
    let i = 0;

    while (i < items.length) {
      // Full-width hero
      elements.push(
        <ItemCard
          key={items[i].id}
          item={items[i]}
          variant="full"
          themeColor={themeColor}
          onClick={handleOpenItem}
          disabled={isClosed && !isPreview}
        />
      );
      i++;

      // Compact grid batch
      const batch = [];
      const end = Math.min(i + (cols * 2), items.length);
      while (i < end) {
        batch.push(items[i]);
        i++;
      }
      if (batch.length > 0) {
        elements.push(
          <div key={`grid-${batch[0].id}`} className={`grid gap-3 sm:gap-4 ${cols === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2"}`}>
            {batch.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                variant="compact"
                themeColor={themeColor}
                onClick={handleOpenItem}
                disabled={isClosed && !isPreview}
              />
            ))}
          </div>
        );
      }
    }
    return <div className="flex flex-col gap-3 sm:gap-4">{elements}</div>;
  };

  /** Build virtual items from extras */
  const extrasAsItems = extras.map((extra) => ({
    id: extra.id,
    name: extra.name,
    description: "إضافة جانبية مميزة",
    image_url: extra.image_url,
    is_available: extra.is_available,
    subcategory_id: "extra-sub",
    _isVirtualExtra: true,
    item_sizes: [{
      id: `size_extra_${extra.id}`,
      name: "إضافة / حصة",
      price: extra.price,
    }],
  }));

  /** Desktop sidebar category link handler */
  const scrollToCategory = (id) => {
    setActiveCategory(id);
    const el = document.getElementById(`category-${id}`);
    if (el) {
      const offset = isPreview ? 140 : 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen pb-32 overflow-x-hidden" dir="rtl" style={{ '--dynamic-color': themeColor }}>
      {/* ═══ ARTISTIC BACKGROUND VIBE ═══ */}
      <div className="fixed inset-0 -z-20 bg-[#050D1A]" />
      <div className="fixed inset-0 -z-10 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23FFFFFF\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="absolute top-0 right-0 -z-10 h-[800px] w-[800px] rounded-full blur-[140px] opacity-[0.1]" style={{ backgroundColor: themeColor }} />
      <div className="absolute top-[800px] left-[-200px] -z-10 h-[600px] w-[600px] rounded-full blur-[140px] opacity-[0.08]" style={{ backgroundColor: themeColor }} />
      {/* ═══ HERO HERO SECTION ═══ */}
      <div className="relative">
        <div className="relative w-full overflow-hidden bg-gray-900 shadow-xl group">
          {heroBannerUrl ? (
            <div className="relative w-full">
              <img 
                src={heroBannerUrl} 
                alt="Banner" 
                className="w-full h-auto max-h-[60vh] object-contain bg-gray-900 shadow-2xl" 
              />
              {/* Subtle Gradient Overlays */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="h-[200px] w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
               <div className="absolute inset-0 opacity-30 blur-3xl scale-150" style={{ backgroundColor: themeColor }} />
               <Store size={48} className="text-white/20" />
            </div>
          )}

          {/* Top nav buttons */}
          <div className={`no-print absolute top-6 left-6 right-6 z-40 flex items-center justify-between ${isPreview ? 'translate-y-10' : ''}`}>
            <Link
              href={isPreview ? "/services/alakeifak/partner" : "/services/alakeifak"}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 transition-all hover:bg-white/30 active:scale-95 shadow-2xl"
            >
              <ArrowRight size={24} className="text-white" />
            </Link>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 transition-all hover:bg-white/30 active:scale-95 shadow-2xl">
              <Info size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Floating Logo - OUTSIDE the overflow-hidden parent to prevent clipping */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-1/2 z-30">
          {restaurant.logo_url ? (
            <div className="h-[120px] w-[120px] lg:h-[150px] lg:w-[150px] overflow-hidden rounded-[40px] border-[8px] border-[#0F172A] bg-[#0F172A] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-500 transform-gpu will-change-transform [backface-visibility:hidden]">
              <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-[120px] w-[120px] lg:h-[150px] lg:w-[150px] items-center justify-center rounded-[40px] border-[8px] border-[#0F172A] bg-[#0F172A] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
              <Store size={50} className="text-gray-600" />
            </div>
          )}
        </div>
      </div>

      {/* ═══ BRAND NAME + STATUS ═══ */}
      <div className="pt-[80px] lg:pt-[100px] pb-3 flex flex-col items-center px-4 relative z-10">
        <h1 className="text-[32px] sm:text-[38px] lg:text-[48px] font-black tracking-tight text-white mb-2 text-center drop-shadow-lg" style={{ fontFamily: "var(--font-display)" }}>
          {restaurant.name}
        </h1>
        {isClosed ? (
          <div className="flex items-center gap-1.5 rounded-full bg-[#131B2B] border border-red-900/30 shadow-xl px-3.5 py-1.5">
            <Clock size={14} className="text-red-500" />
            <span className="text-[13px] font-black text-red-500">مغلق حالياً</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-[#131B2B] border border-green-900/30 shadow-xl px-3.5 py-1.5">
            <Sparkles size={14} className="text-green-500" />
            <span className="text-[13px] font-black text-green-500">جاهزون لاستقبال طلبك</span>
          </div>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="mb-4 rounded-[24px] bg-[#131B2B] p-6 shadow-md border-2 border-[#1E293B]">
            <Info size={36} className="text-gray-500" />
          </div>
          <h2 className="text-[18px] font-black text-white mb-2">القائمة قيد التجهيز</h2>
          <p className="text-[14px] font-bold text-gray-400 max-w-sm">
            نعمل على تحضير أشهى الأصناف حالياً. يرجى زيارتنا في وقت لاحق.
          </p>
        </div>
      ) : (
        <>
          {/* ═══ MOBILE: Sticky horizontal Category Nav ═══ */}
          <div className={`no-print lg:hidden sticky ${isPreview ? 'top-[44px]' : 'top-0'} z-40 w-full`}>
            <div className="absolute inset-0 bg-[#050D1A]/90 backdrop-blur-xl border-b-2 border-[#1E293B] shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
            <div className="relative py-1.5">
              <CategoryNav
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={scrollToCategory}
                themeColor={themeColor}
              />
            </div>
          </div>

          {/* ═══ LAYOUT SPLIT: Desktop (sidebar + grid) · Mobile (feed) ═══ */}
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-6 lg:py-10">
            <div className="flex gap-8">
              
              {/* ── DESKTOP SIDEBAR ── */}
              <aside className={`no-print hidden lg:block w-[220px] shrink-0 sticky ${isPreview ? 'top-[60px]' : 'top-[16px]'} self-start`}>
                <nav className="rounded-[28px] bg-[#131B2B] border-2 border-[#1E293B] shadow-xl p-4 space-y-1">
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => scrollToCategory(cat.id)}
                        className={`w-full flex items-center gap-2.5 rounded-[16px] px-4 py-3 text-[15px] font-bold transition-all text-right ${
                          isActive
                            ? "bg-[var(--dynamic-color)]/15 text-[var(--dynamic-color)] font-black shadow-inner"
                            : "text-gray-400 hover:bg-[#1E293B] hover:text-white"
                        }`}
                      >
                        {cat.icon && <span className="text-[18px]">{cat.icon}</span>}
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                  {/* Extras sidebar link */}
                  {extras.length > 0 && (
                    <button
                      onClick={() => {
                        const el = document.getElementById("category-extras");
                        if (el) {
                          const offset = isPreview ? 140 : 100;
                          const top = el.getBoundingClientRect().top + window.scrollY - offset;
                          window.scrollTo({ top, behavior: "smooth" });
                        }
                      }}
                      className="w-full flex items-center gap-2.5 rounded-[16px] px-4 py-3 text-[15px] font-bold text-gray-400 hover:bg-[#1E293B] hover:text-white transition-all text-right"
                    >
                      <span className="text-[18px]">🍟</span>
                      <span>الأطباق الجانبية</span>
                    </button>
                  )}
                </nav>
              </aside>

              {/* ── MAIN CONTENT AREA ── */}
              <div className="flex-1 min-w-0">
                {categories.map((category) => {
                  const subcategories = groupedData[category.id] || [];
                  if (subcategories.length === 0) return null;

                  return (
                    <div
                      key={category.id}
                      id={`category-${category.id}`}
                      className="mb-10 scroll-mt-[120px] lg:scroll-mt-[30px]"
                    >
                      {/* Category Header */}
                      <div className="mb-4 px-1 flex items-center gap-3">
                        {category.icon && <span className="text-[28px] lg:text-[32px]">{category.icon}</span>}
                        <h2 className="text-[22px] sm:text-[24px] lg:text-[28px] font-black tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
                          {category.name}
                        </h2>
                      </div>

                      {/* Subcategories with Bento layout */}
                      <div className="flex flex-col gap-8">
                        {subcategories.map((sub) => (
                          <div key={sub.id}>
                            {/* Subcategory Label */}
                            <div className="mb-3 flex items-center gap-2.5 px-1">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: themeColor }} />
                              <h3 className="text-[16px] sm:text-[17px] font-black tracking-tight text-[#5D4037]">
                                {sub.name}
                              </h3>
                              <div className="flex-1 h-[2px] bg-[#D7CCC8]" />
                            </div>

                            {/* Bento Grid: desktop uses 3-col compact, mobile uses 2-col */}
                            {renderBentoGrid(sub.items, 3)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Extras */}
                {extrasAsItems.length > 0 && (
                  <div id="category-extras" className="mb-10 scroll-mt-[120px] lg:scroll-mt-[30px]">
                    <div className="mb-4 px-1 flex items-center gap-3">
                      <span className="text-[28px] lg:text-[32px]">🍟</span>
                      <h2 className="text-[22px] sm:text-[24px] lg:text-[28px] font-black tracking-tight text-[#3E2723]" style={{ fontFamily: "var(--font-display)" }}>
                        الأطباق الجانبية
                      </h2>
                    </div>
                    {renderBentoGrid(extrasAsItems, 3)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ FLOATING CART FAB ═══ */}
      {!isClosed && itemCount > 0 && (
        <div className="no-print fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex w-full max-w-[420px] items-center justify-between overflow-hidden rounded-[24px] p-2 pr-5 shadow-[0_16px_40px_-6px_var(--dynamic-color)] transition-transform active:scale-[0.98]"
            style={{ backgroundColor: "var(--dynamic-color)" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <ShoppingCart size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[13px] font-bold text-white/80">عرض السلّة ({itemCount})</span>
                <span className="text-[16px] font-black text-white leading-none mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
                  إتمام الشراء
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 bg-white/10 rounded-full pl-1 pr-3.5 py-1 border border-white/10">
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-white/70">الإجمالي</span>
                <span className="text-[15px] font-black text-white leading-none">
                  {getSubtotal().toFixed(0)} <span className="text-[12px]">ج</span>
                </span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <ChevronLeft size={18} className="text-black" strokeWidth={3} />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ═══ MODALS ═══ */}
      <ItemModal
        item={selectedItem}
        extras={extras}
        themeColor={themeColor}
        isOpen={!!selectedItem}
        preSelectedSizeId={preSelectedSizeId}
        onClose={() => { setSelectedItem(null); setPreSelectedSizeId(null); }}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
        deliveryZones={deliveryZones}
        themeColor={themeColor}
      />
      <CheckoutModal
        restaurant={restaurant}
        deliveryZones={deliveryZones}
        themeColor={themeColor}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onBack={() => { setIsCheckoutOpen(false); setTimeout(() => setIsCartOpen(true), 400); }}
      />

      {/* ═══ FLOATING TICKET BUTTON (when ticket exists but is hidden) ═══ */}
      {activeTicket && !isTicketOpen && (
        <div className={`no-print fixed ${!isClosed && itemCount > 0 ? "bottom-24" : "bottom-6"} left-0 right-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-10 fade-in duration-500`}>
          <button
            onClick={() => setIsTicketOpen(true)}
            className="flex w-full max-w-[420px] items-center justify-between overflow-hidden rounded-[24px] bg-white border border-gray-200 p-2 pr-5 shadow-2xl transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
                <Clock size={20} className="text-blue-500" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[13px] font-bold text-gray-500">طلبك قيد التجهيز</span>
                <span className="text-[16px] font-black text-gray-900 leading-none mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
                  عرض حالة الطلب
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 rounded-full pl-1 pr-3.5 py-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                <ChevronLeft size={18} className="text-gray-500" strokeWidth={3} />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ═══ DIGITAL TICKET (in-house) ═══ */}
      {activeTicket && isTicketOpen && (
        <DigitalTicket
          ticket={activeTicket}
          onHide={() => setIsTicketOpen(false)}
          onDismiss={() => {
            setActiveTicket(null);
            setIsTicketOpen(false);
          }}
        />
      )}
    </main>
  );
}
