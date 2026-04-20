"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { Battery, BatteryFull, BatteryMedium, BatteryLow, HardDrive, Smartphone, Palette, Package, Receipt, Globe, Star, ShieldCheck, Tag } from "lucide-react";
import { PHONE_BRANDS, CONDITION_GRADES, CURRENCIES } from "../assets/brands";

export default function StoryPreview({ phones, brandName, brandLogo, theme }) {
  const previewRef = useRef(null);

  const downloadImage = async () => {
    if (!previewRef.current || phones.length === 0) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: theme.bg,
        logging: false,
        width: 1080,
        height: 1920
      });

      const link = document.createElement('a');
      const modelName = phones[0]?.model || 'PhoneStory';
      const date = new Date().toISOString().split('T')[0];
      link.download = `PhoneStory_${modelName.replace(/\s+/g, '_')}_${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image');
    }
  };

  const getBatteryIcon = (health) => {
    if (health >= 90) return <BatteryFull size={16} />;
    if (health >= 70) return <BatteryMedium size={16} />;
    return <BatteryLow size={16} />;
  };

  const getBatteryColor = (health) => {
    if (health >= 90) return theme.badgePos;
    if (health >= 70) return theme.accent;
    return theme.badgeNeg;
  };

  const getConditionColor = (condition) => {
    const grade = CONDITION_GRADES.find(g => g.value === condition);
    return grade?.color || theme.accent;
  };

  const getGridLayout = (count) => {
    if (count === 1) return 'grid-rows-1';
    if (count === 2) return 'grid-rows-2';
    if (count === 3) return 'grid-rows-3';
    return 'grid-cols-2 grid-rows-2';
  };

  const getCurrency = (code) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  if (phones.length === 0) {
    return (
      <div 
        className="flex aspect-9/16 items-center justify-center rounded-2xl border-2 border-dashed"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p style={{ color: "var(--color-text-muted)" }}>
          Add a phone to see preview
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Card */}
      <div 
        ref={previewRef}
        className="aspect-9/16 overflow-hidden rounded-2xl shadow-2xl"
        style={{ 
          background: theme.bgGradient || theme.bg,
          maxWidth: '400px',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between border-b p-4"
          style={{ borderColor: theme.dividerColor }}
        >
          <div className="flex items-center gap-2">
            {brandLogo && (
              <img src={brandLogo} alt="Brand" className="h-8 w-8 rounded-full object-cover" />
            )}
            <span 
              className="text-lg font-bold"
              style={{ color: theme.text }}
            >
              {brandName || 'PhoneStory'}
            </span>
          </div>
          <span 
            className="text-xs"
            style={{ color: theme.textMuted }}
          >
            {new Date().toLocaleDateString('en-US')}
          </span>
        </div>

        {/* Phones Grid */}
        <div className={`grid h-[calc(100%-4rem)] gap-2 p-4 ${getGridLayout(phones.length)}`}>
          {phones.map((phone) => {
            const brand = PHONE_BRANDS.find(b => b.id === phone.brand);
            const condition = CONDITION_GRADES.find(c => c.value === phone.condition);
            
            return (
              <div
                key={phone.id}
                className="flex flex-col justify-between rounded-xl border p-4"
                style={{ 
                  borderColor: theme.borderColor,
                  backgroundColor: `${theme.bg}80`
                }}
              >
                {/* Title */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xl">{brand?.icon}</span>
                    <h3 
                      className="text-lg font-bold leading-tight"
                      style={{ color: theme.text }}
                    >
                      {phone.model}
                    </h3>
                  </div>

                  {/* Key Specs Row */}
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    {/* Battery */}
                    <div 
                      className="flex items-center gap-1 rounded-full px-2 py-1"
                      style={{ 
                        backgroundColor: `${getBatteryColor(phone.batteryHealth)}20`,
                        color: getBatteryColor(phone.batteryHealth)
                      }}
                    >
                      {getBatteryIcon(phone.batteryHealth)}
                      <span className="font-bold">{phone.batteryHealth}%</span>
                    </div>

                    {/* Storage */}
                    <div 
                      className="flex items-center gap-1 rounded-full px-2 py-1"
                      style={{ 
                        backgroundColor: `${theme.accent}20`,
                        color: theme.accent
                      }}
                    >
                      <HardDrive size={14} />
                      <span className="font-bold">{phone.storage}</span>
                    </div>

                    {/* SIM */}
                    <div 
                      className="flex items-center gap-1 rounded-full px-2 py-1"
                      style={{ 
                        backgroundColor: `${theme.accent}20`,
                        color: theme.accent
                      }}
                    >
                      <Smartphone size={14} />
                      <span className="font-bold">{phone.simSlots}</span>
                    </div>

                    {/* Region */}
                    {phone.region && (
                      <div 
                        className="flex items-center gap-1 rounded-full px-2 py-1"
                        style={{ 
                          backgroundColor: `${theme.accent}20`,
                          color: theme.accent
                        }}
                      >
                        <Globe size={14} />
                        <span className="font-bold">{phone.region}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges Row */}
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    {/* Box */}
                    <div 
                      className="rounded-full px-2 py-1 font-bold"
                      style={{ 
                        backgroundColor: phone.hasBox ? theme.badgePos : `${theme.badgeNeg}20`,
                        color: phone.hasBox ? theme.accentText : theme.badgeNeg
                      }}
                    >
                      {phone.hasBox ? 'BOX ✓' : 'NO BOX'}
                    </div>

                    {/* Tax */}
                    <div 
                      className="rounded-full px-2 py-1 font-bold"
                      style={{ 
                        backgroundColor: phone.taxPaid ? theme.badgePos : `${theme.badgeNeg}20`,
                        color: phone.taxPaid ? theme.accentText : theme.badgeNeg
                      }}
                    >
                      {phone.taxPaid ? 'TAX ✓' : 'NO TAX'}
                    </div>

                    {/* Condition */}
                    <div 
                      className="flex items-center gap-1 rounded-full px-2 py-1 font-bold"
                      style={{ 
                        backgroundColor: `${getConditionColor(phone.condition)}20`,
                        color: getConditionColor(phone.condition)
                      }}
                    >
                      <Star size={12} />
                      {condition?.label}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs">
                    {phone.color && (
                      <div className="flex items-center gap-2">
                        <Palette size={12} style={{ color: theme.textMuted }} />
                        <span style={{ color: theme.text }}>{phone.color}</span>
                      </div>
                    )}

                    {phone.warranty && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={12} style={{ color: theme.textMuted }} />
                        <span style={{ color: theme.text }}>{phone.warranty}</span>
                      </div>
                    )}

                    {/* Custom Fields */}
                    {phone.customFields?.map((field, idx) => (
                      field.label && field.value && (
                        <div key={idx} className="flex items-center gap-2">
                          <span style={{ color: theme.textMuted }}>•</span>
                          <span style={{ color: theme.text }}>
                            {field.label}: {field.value}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Price */}
                {phone.price && (
                  <div className="mt-3 border-t pt-3" style={{ borderColor: theme.dividerColor }}>
                    <div 
                      className="text-center text-2xl font-black"
                      style={{ color: theme.accent }}
                    >
                      {phone.price.toLocaleString()} {getCurrency(phone.currency)}
                    </div>
                    {phone.negotiable && (
                      <div 
                        className="text-center text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        (Negotiable)
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadImage}
        className="w-full rounded-xl py-4 text-base font-bold transition-all hover:opacity-90"
        style={{
          backgroundColor: theme.accent,
          color: theme.accentText
        }}
      >
        ⬇️ Download Story Card
      </button>

      {/* Info */}
      <p 
        className="text-center text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        Image is 1080×1920 perfect for Instagram and WhatsApp stories
      </p>
    </div>
  );
}
