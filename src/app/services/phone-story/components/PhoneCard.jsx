"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { PHONE_BRANDS, STORAGE_OPTIONS, CONDITION_GRADES, CURRENCIES, SIM_OPTIONS } from "../assets/brands";
import BrandIcon from "./BrandIcon";

export default function PhoneCard({ phone, index, updatePhone, removePhone, canRemove }) {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First card expanded by default
  const brandData = PHONE_BRANDS.find(b => b.id === phone.brand) || PHONE_BRANDS[0];

  return (
    <div 
      className="overflow-hidden rounded-2xl border-2 transition-all"
      style={{ 
        borderColor: isExpanded ? "var(--color-primary)" : "var(--color-border)",
        backgroundColor: "var(--color-background)"
      }}
    >
      {/* Header - Always Visible */}
      <div className="flex items-center justify-between p-4 transition-all" style={{ backgroundColor: isExpanded ? "var(--color-primary)10" : "transparent" }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: "var(--color-primary)15" }}
          >
            <BrandIcon brandId={phone.brand} size={24} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
              {phone.model || `Phone ${index + 1}`}
            </div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {brandData.name} • {phone.storage} • {phone.batteryHealth}
            </div>
          </div>
        </button>
        
        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              onClick={() => removePhone(phone.id)}
              className="rounded-lg p-2 transition-all hover:bg-red-500/10"
            >
              <X size={18} style={{ color: "#FF3B3B" }} />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            {isExpanded ? (
              <ChevronUp size={20} style={{ color: "var(--color-text-muted)" }} />
            ) : (
              <ChevronDown size={20} style={{ color: "var(--color-text-muted)" }} />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Form */}
      {isExpanded && (
        <div className="space-y-4 border-t p-4" style={{ borderColor: "var(--color-border)" }}>
          {/* Brand & Model */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                Brand
              </label>
              <select
                value={phone.brand}
                onChange={(e) => updatePhone(phone.id, { brand: e.target.value })}
                className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all focus:border-opacity-100"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              >
                {PHONE_BRANDS.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                Model *
              </label>
              <input
                type="text"
                value={phone.model}
                onChange={(e) => updatePhone(phone.id, { model: e.target.value })}
                placeholder="e.g., iPhone 16 Pro Max"
                className="w-full rounded-lg border px-3 py-2.5 text-sm font-bold transition-all focus:border-opacity-100"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              />
            </div>
          </div>

          {/* Phone Image Upload */}
          <div 
            className="rounded-lg border p-3"
            style={{ 
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)"
            }}
          >
            <label 
              className="mb-3 flex items-center gap-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={phone.showImage}
                onChange={(e) => updatePhone(phone.id, { showImage: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Show Image/Icon
              </span>
            </label>

            {phone.showImage && (
              <div>
                <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                  Phone Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updatePhone(phone.id, { image: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="flex-1 rounded-lg border px-3 py-2 text-xs transition-all file:mr-3 file:rounded file:border-0 file:px-3 file:py-1 file:text-xs file:font-bold"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text)"
                    }}
                  />
                  {phone.image && (
                    <button
                      onClick={() => updatePhone(phone.id, { image: null })}
                      className="rounded-lg px-3 py-2 text-xs font-bold transition-all hover:opacity-80"
                      style={{
                        backgroundColor: "#FF3B3B",
                        color: "#FFFFFF"
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {phone.image && (
                  <div className="mt-2">
                    <img 
                      src={phone.image} 
                      alt="Phone preview" 
                      className="h-20 w-20 rounded-lg object-cover border"
                      style={{ borderColor: "var(--color-border)" }}
                    />
                  </div>
                )}
                {!phone.image && (
                  <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    No image uploaded. Brand logo will be shown.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Storage, Battery, Color */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                Storage
              </label>
              <select
                value={phone.storage}
                onChange={(e) => updatePhone(phone.id, { storage: e.target.value })}
                className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              >
                {STORAGE_OPTIONS.map(storage => (
                  <option key={storage} value={storage}>{storage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                Battery
              </label>
              <input
                type="text"
                value={phone.batteryHealth}
                onChange={(e) => updatePhone(phone.id, { batteryHealth: e.target.value })}
                placeholder="e.g., 89%, Replaced, 100%"
                className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                Color
              </label>
              <input
                type="text"
                value={phone.color}
                onChange={(e) => updatePhone(phone.id, { color: e.target.value })}
                placeholder="e.g., Desert Titanium"
                className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid gap-2 sm:grid-cols-2">
            <label 
              className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-all hover:border-opacity-100"
              style={{ borderColor: "var(--color-border)" }}
            >
              <input
                type="checkbox"
                checked={phone.hasBox}
                onChange={(e) => updatePhone(phone.id, { hasBox: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Original Box
              </span>
            </label>

            <label 
              className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-all hover:border-opacity-100"
              style={{ borderColor: "var(--color-border)" }}
            >
              <input
                type="checkbox"
                checked={phone.taxPaid}
                onChange={(e) => updatePhone(phone.id, { taxPaid: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Tax Paid
              </span>
            </label>
          </div>

          {/* SIM, Region, Condition */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                SIM Slots
              </label>
              <select
                value={phone.simSlots}
                onChange={(e) => updatePhone(phone.id, { simSlots: e.target.value })}
                className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              >
                {SIM_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                Region
              </label>
              <input
                type="text"
                value={phone.region}
                onChange={(e) => updatePhone(phone.id, { region: e.target.value })}
                placeholder="e.g., ZA, USA"
                className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                Condition
              </label>
              <select
                value={phone.condition}
                onChange={(e) => updatePhone(phone.id, { condition: e.target.value })}
                className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              >
                {CONDITION_GRADES.map(grade => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Section with Checkbox */}
          <div 
            className="rounded-lg border p-3"
            style={{ 
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)"
            }}
          >
            <label 
              className="mb-3 flex items-center gap-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={phone.showPrice}
                onChange={(e) => updatePhone(phone.id, { showPrice: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Show Price
              </span>
            </label>

            {phone.showPrice && (
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                    Price
                  </label>
                  <input
                    type="number"
                    value={phone.price}
                    onChange={(e) => updatePhone(phone.id, { price: e.target.value })}
                    placeholder="25000"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm font-bold transition-all"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text)"
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
                    Currency
                  </label>
                  <select
                    value={phone.currency}
                    onChange={(e) => updatePhone(phone.id, { currency: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text)"
                    }}
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.code}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label 
                    className="flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer whitespace-nowrap" 
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <input
                      type="checkbox"
                      checked={phone.negotiable}
                      onChange={(e) => updatePhone(phone.id, { negotiable: e.target.checked })}
                      className="h-4 w-4 rounded"
                    />
                    <span className="text-xs font-bold" style={{ color: "var(--color-text)" }}>
                      Negotiable
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
