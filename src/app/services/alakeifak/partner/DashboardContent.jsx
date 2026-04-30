"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, LayoutGrid, UtensilsCrossed, Truck, Settings, ClipboardList, Eye, Users } from "lucide-react";
import OrdersTab from "./components/tabs/OrdersTab";
import MenuEditorTab from "./components/tabs/MenuEditorTab";
import ExtrasTab from "./components/tabs/ExtrasTab";
import ZonesTab from "./components/tabs/ZonesTab";
import SettingsTab from "./components/tabs/SettingsTab";
import TeamTab from "./components/tabs/TeamTab";

const TABS = [
  { id: "orders", label: "الطلبات", icon: ClipboardList },
  { id: "menu", label: "القائمة", icon: LayoutGrid },
  { id: "extras", label: "الإضافات", icon: UtensilsCrossed },
  { id: "zones", label: "التوصيل", icon: Truck },
  { id: "team", label: "الفريق", icon: Users },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

export default function DashboardContent({ restaurant, onRestaurantUpdate }) {
  const [activeTab, setActiveTab] = useState("orders");
  const themeColor = restaurant.theme_color || "#ee930c";

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-gray-900 overflow-x-hidden print:pb-0 print:bg-white" dir="rtl" style={{ '--dynamic-color': themeColor, fontFamily: "var(--font-body)" }}>
      {/* Dynamic Glow Background */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full -translate-x-1/2 rounded-full opacity-10 blur-[120px] pointer-events-none print:hidden" style={{ backgroundColor: themeColor }} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 relative z-10 print:mx-0 print:max-w-none print:px-0 print:py-0">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-right gap-6 print:hidden">
          <div>
            <div className="inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[var(--dynamic-color)] border border-[var(--dynamic-color)]/20 shadow-sm mb-3">
              لوحة تحكم على كيفك ⚡
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
              مساحة العمل
            </h1>
            <p className="text-[15px] text-gray-500 font-medium">إدارة شاملة لمطعم ({restaurant.name}) بأسلوب عصري.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/services/alakeifak/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-[20px] bg-white px-5 text-[14px] font-bold text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-95 transition-all border border-gray-100"
            >
              <Eye size={18} className="text-[var(--dynamic-color)]" />
              معاينة المنيو
              <ExternalLink size={14} className="opacity-50 ml-1" />
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/services/alakeifak/${restaurant.slug}`)}
              className="inline-flex h-12 items-center gap-2 rounded-[20px] bg-[var(--dynamic-color)] px-5 text-[14px] font-bold text-white shadow-[0_10px_20px_-5px_var(--dynamic-color)] active:scale-95 transition-transform"
            >
              <Copy size={16} />
              نسخ الرابط
            </button>
          </div>
        </div>

        {/* Floating Dynamic Island Tabs (Light Bento) */}
        <div className="mb-10 w-full overflow-x-auto scrollbar-hide pb-4 pt-2 print:hidden sticky top-0 sm:top-4 z-30">
          <div className="flex inline-flex p-1.5 rounded-[24px] bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 min-w-max mx-auto md:mx-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2.5 rounded-[18px] px-6 py-3.5 text-[15px] font-bold transition-all duration-400 ease-out ${
                    isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
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

        {/* Content Area Rendering */}
        <div className="w-full">
          {activeTab === "orders" && <OrdersTab restaurantId={restaurant.id} themeColor={themeColor} />}
          {activeTab === "menu" && <MenuEditorTab restaurantId={restaurant.id} restaurant={restaurant} themeColor={themeColor} />}
          {activeTab === "extras" && <ExtrasTab restaurantId={restaurant.id} />}
          {activeTab === "zones" && <ZonesTab restaurantId={restaurant.id} />}
          {activeTab === "team" && <TeamTab restaurantId={restaurant.id} />}
          {activeTab === "settings" && <SettingsTab restaurant={restaurant} onUpdate={onRestaurantUpdate} />}
        </div>
      </div>
    </div>
  );
}
