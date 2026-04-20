"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import PhoneCard from "./components/PhoneCard";
import LivePreview from "./components/LivePreview";
import { THEMES } from "./assets/themes";

export default function PhoneStoryPage() {
  // Brand settings
  const [brandName, setBrandName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#FF3B3B");
  
  // Theme
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  
  // Phones data - start with one empty phone
  const [phones, setPhones] = useState([{
    id: Date.now(),
    brand: "apple",
    model: "Iphone 16 Pro Max",
    storage: "256GB",
    batteryHealth: "89%",
    color: "DESERT TITANIUM",
    hasBox: true,
    taxPaid: false,
    simSlots: "2 SIM",
    region: "UAE",
    condition: "like-new",
    showPrice: false,
    price: "",
    currency: "EGP",
    negotiable: false,
    image: null,
    showImage: false
  },{
    id: Date.now()+1,
    brand: "samsung",
    model: "Samsung S25 Ultra",
    storage: "512GB",
    batteryHealth: "100%",
    color: "GRAY TITANIUM",
    hasBox: false,
    taxPaid: true,
    simSlots: "2 SIM",
    region: "UAE",
    condition: "like-new",
    showPrice: false,
    price: "",
    currency: "EGP",
    negotiable: false,
    image: null,
    showImage: false
  },]);
  
  // Load saved brand settings
  useEffect(() => {
    const saved = localStorage.getItem("phonestory_brand");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setBrandName(data.brandName || "");
        setPrimaryColor(data.primaryColor || "#FF3B3B");
      } catch (e) {
        console.error("Failed to load brand settings", e);
      }
    }
  }, []);
  
  // Save brand settings
  useEffect(() => {
    const data = { brandName, primaryColor };
    localStorage.setItem("phonestory_brand", JSON.stringify(data));
  }, [brandName, primaryColor]);
  
  const addPhone = () => {
    if (phones.length < 4) {
      setPhones([...phones, {
        id: Date.now(),
        brand: "apple",
        model: "",
        storage: "256GB",
        batteryHealth: "100%",
        color: "",
        hasBox: true,
        taxPaid: false,
        simSlots: "2 SIM",
        region: "",
        condition: "like-new",
        showPrice: false,
        price: "",
        currency: "EGP",
        negotiable: false,
        image: null,
        showImage: false
      }]);
    }
  };
  
  const removePhone = (id) => {
    if (phones.length > 1) {
      setPhones(phones.filter(p => p.id !== id));
    }
  };
  
  const updatePhone = (id, updates) => {
    setPhones(phones.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hide navbar with CSS */}
      <style jsx global>{`
        nav {
          display: none !important;
        }
        main {
          padding-top: 0 !important;
        }
      `}</style>
      
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/services"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
              style={{ color: "var(--color-primary)" }}
            >
              <ArrowRight size={16} className="rotate-180" />
              Back to Services
            </Link>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 
                  className="mb-2 text-3xl font-black sm:text-4xl" 
                  style={{ 
                    fontFamily: "var(--font-display)", 
                    color: "var(--color-text)"
                  }}
                >
                  PhoneStory - Story Card Generator
                </h1>
                <p 
                  className="text-base" 
                  style={{ 
                    fontFamily: "var(--font-body)", 
                    color: "var(--color-text-muted)" 
                  }}
                >
                  Create professional used phone cards in seconds
                </p>
              </div>
            </div>
          </div>

          {/* Brand Setup - Simplified */}
          <div 
            className="mb-6 rounded-2xl border p-6"
            style={{ 
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-background)"
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label 
                  className="mb-2 block text-sm font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  Store Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g., Khatwah Online Phones"
                  className="w-full rounded-lg border px-4 py-3 text-lg font-bold"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text)"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main Layout - Side by Side with Fixed Preview */}
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left: Phone Cards - Scrollable */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 
                  className="text-lg font-bold" 
                  style={{ color: "var(--color-text)" }}
                >
                  Phones ({phones.length}/4)
                </h3>
                {phones.length < 4 && (
                  <button
                    onClick={addPhone}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all hover:opacity-90"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "#FFFFFF"
                    }}
                  >
                    <Plus size={16} />
                    Add Phone
                  </button>
                )}
              </div>

              {phones.map((phone, index) => (
                <PhoneCard
                  key={phone.id}
                  phone={phone}
                  index={index}
                  updatePhone={updatePhone}
                  removePhone={removePhone}
                  canRemove={phones.length > 1}
                />
              ))}

              {phones.length >= 4 && (
                <p 
                  className="text-center text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Maximum 4 phones
                </p>
              )}
            </div>

            {/* Right: Live Preview - Sticky and Contained */}
            <div className="hidden lg:block">
              <div className="sticky top-8">
                <LivePreview
                  phones={phones}
                  brandName={brandName}
                  theme={selectedTheme}
                />
              </div>
            </div>
          </div>

          {/* Mobile Preview - Below forms */}
          <div className="mt-8 lg:hidden">
            <LivePreview
              phones={phones}
              brandName={brandName}
              theme={selectedTheme}
            />
          </div>
        </div>
      </div>
    </main>
  );
}