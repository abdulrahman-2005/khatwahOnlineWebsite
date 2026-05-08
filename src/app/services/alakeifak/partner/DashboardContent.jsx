"use client";

import { useState } from "react";
import { Copy, ExternalLink, LayoutGrid, UtensilsCrossed, Truck, Settings, ClipboardList, Eye, Users } from "lucide-react";
import OrdersTab from "./components/tabs/OrdersTab";
import MenuEditorTab from "./components/tabs/MenuEditorTab";
import ExtrasTab from "./components/tabs/ExtrasTab";
import ZonesTab from "./components/tabs/ZonesTab";
import SettingsTab from "./components/tabs/SettingsTab";
import TeamTab from "./components/tabs/TeamTab";
import SessionRecoveryBanner from "../components/SessionRecoveryBanner";

const TABS = [
  { id: "orders", label: "الطلبات", icon: ClipboardList },
  { id: "menu", label: "القائمة", icon: LayoutGrid },
  { id: "extras", label: "الإضافات", icon: UtensilsCrossed },
  { id: "zones", label: "التوصيل", icon: Truck },
  { id: "team", label: "الفريق", icon: Users },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

export const getContrastYIQ = (hexcolor) => {
  if (!hexcolor) return "#ffffff";
  hexcolor = hexcolor.replace("#", "");
  if (hexcolor.length === 3) hexcolor = hexcolor.split("").map(c => c + c).join("");
  const r = parseInt(hexcolor.substr(0, 2), 16) || 0;
  const g = parseInt(hexcolor.substr(2, 2), 16) || 0;
  const b = parseInt(hexcolor.substr(4, 2), 16) || 0;
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 200 ? "#111827" : "#ffffff";
};

export default function DashboardContent({ restaurant, onRestaurantUpdate }) {
  const [activeTab, setActiveTab] = useState("orders");
  const themeColor = restaurant.theme_color || "#ee930c";
  const themeTextColor = getContrastYIQ(themeColor);

  // Track which tabs have been visited so we only mount them once they're first opened
  const [mountedTabs, setMountedTabs] = useState(new Set(["orders"]));

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMountedTabs(prev => {
      if (prev.has(tabId)) return prev;
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
  }

  return (
    <div className="min-h-screen text-gray-900 pb-32 overflow-x-hidden print:pb-0 print:bg-white relative" dir="rtl" style={{ '--dynamic-color': themeColor, '--dynamic-text': themeTextColor, fontFamily: "var(--font-body)" }}>
      {/* ═══ ARTISTIC BACKGROUND VIBE ═══ */}
      <div className="fixed inset-0 -z-20 bg-[#FBF7F0] print:hidden" />
      <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none print:hidden" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="absolute top-[-100px] left-[-200px] -z-10 h-[800px] w-[800px] rounded-full blur-[140px] opacity-[0.12] print:hidden" style={{ backgroundColor: themeColor }} />
      <div className="absolute top-[400px] right-[-200px] -z-10 h-[600px] w-[600px] rounded-full blur-[140px] opacity-[0.08] print:hidden" style={{ backgroundColor: themeColor }} />

      {/* Session Recovery Banner */}
      <SessionRecoveryBanner />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 relative z-10 print:mx-0 print:max-w-none print:px-0 print:py-0">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-right gap-6 print:hidden">
          <div>
            <div className="inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[var(--dynamic-color)] border border-[var(--dynamic-color)]/20 shadow-sm mb-3">
              لوحة تحكم على كيفك ⚡
            </div>
            <h1 className="text-3xl font-black tracking-tight text-stone-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
              مساحة العمل
            </h1>
            <p className="text-[15px] text-stone-500 font-medium">إدارة شاملة لمطعم ({restaurant.name}) بأسلوب عصري.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/services/alakeifak/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-[20px] bg-white px-5 text-[14px] font-bold text-stone-700 shadow-sm hover:shadow-md hover:bg-amber-50 active:scale-95 transition-all border border-amber-100"
            >
              <Eye size={18} className="text-[var(--dynamic-color)]" />
              معاينة المنيو
              <ExternalLink size={14} className="opacity-50 ml-1" />
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/services/alakeifak/${restaurant.slug}`)}
              className="inline-flex h-12 items-center gap-2 rounded-[20px] bg-[var(--dynamic-color)] px-5 text-[14px] font-bold shadow-[0_10px_20px_-5px_var(--dynamic-color)] active:scale-95 transition-transform"
              style={{ color: "var(--dynamic-text)" }}
            >
              <Copy size={16} />
              نسخ الرابط
            </button>
          </div>
        </div>

        {/* Floating Dynamic Island Tabs (Light Bento) */}
        <div className="mb-10 w-full overflow-x-auto scrollbar-hide pb-4 pt-2 print:hidden sticky top-0 sm:top-4 z-30">
          <div className="flex inline-flex p-1.5 rounded-[24px] bg-white/80 backdrop-blur-md shadow-sm border border-amber-100 min-w-max mx-auto md:mx-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center justify-center gap-2.5 rounded-[18px] px-6 py-3.5 text-[15px] font-bold transition-all duration-400 ease-out ${
                    isActive ? "text-stone-900" : "text-stone-400 hover:text-stone-700 hover:bg-amber-50"
                  }`}
                >
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-[18px] opacity-[0.15] -z-10" 
                      style={{ backgroundColor: themeColor }} 
                    />
                  )}
                  {isActive && (
                    <div 
                      className="absolute inset-x-4 -bottom-[6px] h-[4px] rounded-t-full" 
                      style={{ backgroundColor: themeColor }} 
                    />
                  )}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? themeColor : 'inherit' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 
          Content Area — PERSISTENT TABS (CSS visibility, not conditional rendering).
          Tabs are mounted on first visit and hidden via CSS when inactive.
          This preserves component state, realtime channels, and loaded data.
        */}
        <div className="w-full">
          {mountedTabs.has("orders") && (
            <div style={{ display: activeTab === "orders" ? "block" : "none" }}>
              <OrdersTab restaurantId={restaurant.id} themeColor={themeColor} />
            </div>
          )}
          {mountedTabs.has("menu") && (
            <div style={{ display: activeTab === "menu" ? "block" : "none" }}>
              <MenuEditorTab restaurantId={restaurant.id} restaurant={restaurant} themeColor={themeColor} />
            </div>
          )}
          {mountedTabs.has("extras") && (
            <div style={{ display: activeTab === "extras" ? "block" : "none" }}>
              <ExtrasTab restaurantId={restaurant.id} />
            </div>
          )}
          {mountedTabs.has("zones") && (
            <div style={{ display: activeTab === "zones" ? "block" : "none" }}>
              <ZonesTab restaurantId={restaurant.id} />
            </div>
          )}
          {mountedTabs.has("team") && (
            <div style={{ display: activeTab === "team" ? "block" : "none" }}>
              <TeamTab restaurantId={restaurant.id} />
            </div>
          )}
          {mountedTabs.has("settings") && (
            <div style={{ display: activeTab === "settings" ? "block" : "none" }}>
              <SettingsTab restaurant={restaurant} onUpdate={onRestaurantUpdate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
