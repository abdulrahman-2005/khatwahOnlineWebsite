"use client";

import { useState } from "react";
import { PHONE_BRANDS, STORAGE_OPTIONS, CONDITION_GRADES, CURRENCIES, SIM_OPTIONS } from "../assets/brands";
import { ChevronDown, ChevronUp, X, Plus, Smartphone } from "lucide-react";

export default function PhoneForm({ phone, index, updatePhone, removePhone }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const addCustomField = () => {
    const customFields = phone.customFields || [];
    if (customFields.length < 5) {
      updatePhone(phone.id, {
        customFields: [...customFields, { label: "", value: "" }]
      });
    }
  };

  const updateCustomField = (idx, field, value) => {
    const customFields = [...phone.customFields];
    customFields[idx] = { ...customFields[idx], [field]: value };
    updatePhone(phone.id, { customFields });
  };

  const removeCustomField = (idx) => {
    const customFields = phone.customFields.filter((_, i) => i !== idx);
    updatePhone(phone.id, { customFields });
  };

  const brandData = PHONE_BRANDS.find(b => b.id === phone.brand) || PHONE_BRANDS[0];

  return (
    <div 
      className="rounded-xl border"
      style={{ 
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-background)"
      }}
    >
      {/* Header */}
      <div 
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{brandData.icon}</span>
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
              {phone.model || `Phone ${index + 1}`}
            </div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {brandData.name} • {phone.storage}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePhone(phone.id);
            }}
            className="rounded-lg p-2 transition-all hover:bg-red-500/10"
          >
            <X size={16} style={{ color: "#FF3B3B" }} />
          </button>
          {isExpanded ? (
            <ChevronUp size={20} style={{ color: "var(--color-text-muted)" }} />
          ) : (
            <ChevronDown size={20} style={{ color: "var(--color-text-muted)" }} />
          )}
        </div>
      </div>

      {/* Form Fields */}
      {isExpanded && (
        <div className="space-y-4 border-t p-4" style={{ borderColor: "var(--color-border)" }}>
          {/* Brand & Model */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Brand
              </label>
              <select
                value={phone.brand}
                onChange={(e) => updatePhone(phone.id, { brand: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              >
                {PHONE_BRANDS.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.icon} {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Model
              </label>
              <input
                type="text"
                value={phone.model}
                onChange={(e) => updatePhone(phone.id, { model: e.target.value })}
                placeholder="e.g., iPhone 16 Pro Max"
                className="w-full rounded-lg border px-4 py-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              />
            </div>
          </div>

          {/* Storage & Battery */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Storage
              </label>
              <select
                value={phone.storage}
                onChange={(e) => updatePhone(phone.id, { storage: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
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
              <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Battery Health (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={phone.batteryHealth}
                onChange={(e) => updatePhone(phone.id, { batteryHealth: parseInt(e.target.value) || 100 })}
                className="w-full rounded-lg border px-4 py-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
              Color
            </label>
            <input
              type="text"
              value={phone.color}
              onChange={(e) => updatePhone(phone.id, { color: e.target.value })}
              placeholder="e.g., Desert Titanium"
              className="w-full rounded-lg border px-4 py-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)"
              }}
            />
          </div>

          {/* Toggles */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={phone.hasBox}
                onChange={(e) => updatePhone(phone.id, { hasBox: e.target.checked })}
                className="h-5 w-5 rounded"
              />
              <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Original Box
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={phone.taxPaid}
                onChange={(e) => updatePhone(phone.id, { taxPaid: e.target.checked })}
                className="h-5 w-5 rounded"
              />
              <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Tax Paid
              </span>
            </label>
          </div>

          {/* SIM & Region */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
                SIM Slots
              </label>
              <select
                value={phone.simSlots}
                onChange={(e) => updatePhone(phone.id, { simSlots: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
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
              <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Region/Lock
              </label>
              <input
                type="text"
                value={phone.region}
                onChange={(e) => updatePhone(phone.id, { region: e.target.value })}
                placeholder="e.g., ZA, USA, Unlocked"
                className="w-full rounded-lg border px-4 py-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
              Condition
            </label>
            <select
              value={phone.condition}
              onChange={(e) => updatePhone(phone.id, { condition: e.target.value })}
              className="w-full rounded-lg border px-4 py-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)"
              }}
            >
              {CONDITION_GRADES.map(grade => (
                <option key={grade.value} value={grade.value}>{grade.label}</option>
              ))}
            </select>
          </div>

          {/* Warranty */}
          <div>
            <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
              Warranty
            </label>
            <input
              type="text"
              value={phone.warranty}
              onChange={(e) => updatePhone(phone.id, { warranty: e.target.value })}
              placeholder="e.g., 6 months warranty"
              className="w-full rounded-lg border px-4 py-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)"
              }}
            />
          </div>

          {/* Price */}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Price
              </label>
              <input
                type="number"
                value={phone.price}
                onChange={(e) => updatePhone(phone.id, { price: e.target.value })}
                placeholder="25000"
                className="w-full rounded-lg border px-4 py-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Currency
              </label>
              <select
                value={phone.currency}
                onChange={(e) => updatePhone(phone.id, { currency: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>{curr.code}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 rounded-lg border px-4 py-2" style={{ borderColor: "var(--color-border)" }}>
                <input
                  type="checkbox"
                  checked={phone.negotiable}
                  onChange={(e) => updatePhone(phone.id, { negotiable: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                  Negotiable
                </span>
              </label>
            </div>
          </div>

          {/* Custom Fields */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Custom Details
              </label>
              {(phone.customFields?.length || 0) < 5 && (
                <button
                  onClick={addCustomField}
                  className="flex items-center gap-1 text-xs font-bold"
                  style={{ color: "var(--color-primary)" }}
                >
                  <Plus size={14} />
                  Add
                </button>
              )}
            </div>

            {phone.customFields?.map((field, idx) => (
              <div key={idx} className="mb-2 grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateCustomField(idx, 'label', e.target.value)}
                  placeholder="Label"
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text)"
                  }}
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => updateCustomField(idx, 'value', e.target.value)}
                  placeholder="Value"
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text)"
                  }}
                />
                <button
                  onClick={() => removeCustomField(idx)}
                  className="rounded-lg p-2 transition-all hover:bg-red-500/10"
                >
                  <X size={16} style={{ color: "#FF3B3B" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
