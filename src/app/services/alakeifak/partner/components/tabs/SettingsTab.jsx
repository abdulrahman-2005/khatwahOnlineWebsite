"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { safeMutation } from "../../../lib/safeQuery";
import { compressImage, uploadImage, fileToDataUrl } from "../../../lib/imageUtils";
import { formatEgyptianPhone, isValidEgyptianPhone } from "../../../lib/whatsappUtils";
import { ToggleRight, ToggleLeft, UploadCloud, Loader2, CheckCircle2, Save } from "lucide-react";
import { InputField, PrimaryBtn } from "../ui/PartnerUI";

export default function SettingsTab({ restaurant, onUpdate }) {
  const [name, setName] = useState(restaurant.name);
  const [whatsapp, setWhatsapp] = useState(restaurant.whatsapp_number);
  const [themeColor, setThemeColor] = useState(restaurant.theme_color || "#ee930c");
  const [isOpen, setIsOpen] = useState(restaurant.is_open);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const handleNameChange = (value) => {
    // Only allow Arabic letters, English letters, Numbers, and Spaces. No punctuation or special chars.
    const sanitized = value.replace(/[^a-zA-Z0-9\s\u0621-\u064A\u0660-\u0669]/g, "");
    setName(sanitized);
  };

  // Logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(restaurant.logo_url || null);
  const [compressingLogo, setCompressingLogo] = useState(false);

  // Banner
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(restaurant.banner_url || null);
  const [compressingBanner, setCompressingBanner] = useState(false);

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingLogo(true);
    try {
      const compressed = await compressImage(file);
      setLogoFile(compressed);
      setLogoPreview(await fileToDataUrl(compressed));
    } catch { /* ignore */ }
    setCompressingLogo(false);
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingBanner(true);
    try {
      const compressed = await compressImage(file);
      setBannerFile(compressed);
      setBannerPreview(await fileToDataUrl(compressed));
    } catch { /* ignore */ }
    setCompressingBanner(false);
  };

  const handleSave = async () => {
    setSaving(true); setSaveStatus("");
    
    const formattedPhone = formatEgyptianPhone(whatsapp);
    if (!isValidEgyptianPhone(formattedPhone)) {
      alert("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو +201...)");
      setSaving(false);
      return;
    }
    setWhatsapp(formattedPhone);

    try {
      let logoUrl = restaurant.logo_url;
      let bannerUrl = restaurant.banner_url;
      if (logoFile) logoUrl = await uploadImage(logoFile, 'logos');
      if (bannerFile) bannerUrl = await uploadImage(bannerFile, 'banners');

      const { data, error, ok } = await safeMutation(
        () => supabase.from("restaurants").update({ 
          name: name.trim(), 
          whatsapp_number: formattedPhone, 
          theme_color: themeColor, 
          is_open: isOpen,
          logo_url: logoUrl,
          banner_url: bannerUrl,
        }).eq("id", restaurant.id).select().single()
      );
      if (!ok || error) setSaveStatus("error");
      else if (data) { onUpdate(data); setSaveStatus("success"); setTimeout(() => setSaveStatus(""), 3000); }
    } catch (err) { setSaveStatus("error"); }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Profile Section */}
      <div className="rounded-[40px] bg-white p-8 border border-gray-100 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] space-y-6">
        <div className="mb-2">
          <h3 className="text-[22px] font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>الملف التعريفي</h3>
          <p className="text-[14px] text-gray-500 mt-1 font-medium">المعلومات التي ستظهر لعملائك وتشكل هويتك.</p>
        </div>
        
        <InputField label="الاسم التجاري للمطعم" value={name} onChange={(e) => handleNameChange(e.target.value)} />
        <InputField label="رقم المبيعات (واتساب)" type="tel" dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} onBlur={() => setWhatsapp(formatEgyptianPhone(whatsapp))} className="text-right" />
        
        <div className="space-y-3 w-full pt-2">
          <label className="text-[14px] font-bold text-gray-500 px-1">الهوية البصرية السائدة (لون الأزرار والمتجر)</label>
          <div className="flex items-center gap-4 rounded-[24px] bg-gray-50 p-2 pr-5 border border-gray-200">
            <span className="text-[16px] font-black text-gray-900 flex-1 uppercase" dir="ltr">{themeColor.toUpperCase()}</span>
            <div className="relative h-[48px] w-[56px] overflow-hidden rounded-[18px] border-4 border-white shadow-sm">
              <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="absolute -inset-4 h-24 w-24 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Logo + Banner Upload Section */}
      <div className="rounded-[40px] bg-white p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="mb-2">
          <h3 className="text-[22px] font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>الشعار والبانر 🖼️</h3>
          <p className="text-[14px] text-gray-500 mt-1 font-medium">الشعار هو الأيقونة المربعة الصغيرة. البانر هو الخلفية العريضة في أعلى المنيو.</p>
        </div>

        {/* Logo Upload */}
        <div className="space-y-3">
          <label className="text-[14px] font-bold text-gray-500 px-1">شعار المطعم (مربع)</label>
          <div className="flex items-center gap-4">
            <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[24px] border-2 border-gray-200 bg-gray-50 shadow-sm">
              {compressingLogo ? (
                <div className="flex h-full w-full items-center justify-center"><Loader2 size={24} className="animate-spin text-[var(--dynamic-color)]" /></div>
              ) : logoPreview ? (
                <img src={logoPreview} alt="الشعار" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><UploadCloud size={28} className="text-gray-300" /></div>
              )}
            </div>
            <label className="cursor-pointer bg-white px-5 py-3 rounded-xl border border-gray-200 text-[14px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50">
              <span>{logoPreview ? "تغيير الشعار" : "رفع شعار"}</span>
              <input type="file" accept="image/*" onChange={handleLogoChange} disabled={compressingLogo} className="hidden" />
            </label>
          </div>
        </div>

        {/* Banner Upload */}
        <div className="space-y-3">
          <label className="text-[14px] font-bold text-gray-500 px-1">بانر المنيو (عرض كامل)</label>
          <div className="relative w-full aspect-[16/6] overflow-hidden rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50 shadow-sm">
            {compressingBanner ? (
              <div className="flex h-full w-full items-center justify-center"><Loader2 size={32} className="animate-spin text-[var(--dynamic-color)]" /></div>
            ) : bannerPreview ? (
              <img src={bannerPreview} alt="البانر" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                <UploadCloud size={36} className="text-gray-300" />
                <span className="text-[13px] font-bold text-gray-400">اختر صورة بانر عريضة</span>
              </div>
            )}
          </div>
          <label className="inline-flex cursor-pointer bg-white px-5 py-3 rounded-xl border border-gray-200 text-[14px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50">
            <span>{bannerPreview ? "تغيير البانر" : "رفع بانر"}</span>
            <input type="file" accept="image/*" onChange={handleBannerChange} disabled={compressingBanner} className="hidden" />
          </label>
        </div>
      </div>

      {/* Open/Closed Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-[36px] bg-white border border-gray-100 p-8 shadow-sm">
        <div className="flex-1">
          <span className="text-[18px] font-black text-gray-900 leading-tight block">حالة استقبال الطلبات (المنيو) 🏪</span>
          <p className="text-[14px] font-bold text-gray-500 mt-2 leading-relaxed">
            {isOpen 
              ? "المنيو مفعل! عملاؤك يستطيعون الآن التصفح وبناء طلب وإرساله لواتساب." 
              : "المتجر مغلق حالياً، سيتم إخفاء زر الإضافة للسلة تماماً من القائمة."}
          </p>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="shrink-0 hover:scale-105 transition-transform bg-gray-50 p-1 rounded-full border border-gray-100">
          {isOpen ? <ToggleRight size={64} className="text-[var(--dynamic-color)]" /> : <ToggleLeft size={64} className="text-gray-300" />}
        </button>
      </div>

      {/* Subscription Status */}
      <div className="rounded-[36px] bg-white border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1">
            <span className="text-[18px] font-black text-gray-900 leading-tight block">حالة الاشتراك 💳</span>
            <p className="text-[14px] font-bold text-gray-500 mt-2 leading-relaxed">
              توضيح لحالة اشتراك المطعم في المنصة وعدد الأيام المتبقية. لتجديد الاشتراك، يرجى التواصل مع فريق الدعم.
            </p>
          </div>
          <div className={`shrink-0 px-6 py-3 rounded-[20px] border shadow-sm font-black text-[15px] flex items-center justify-center text-center
            ${(function() {
              if (!restaurant.subscription_end_date) return 'bg-gray-50 text-gray-600 border-gray-200';
              const daysLeft = Math.ceil((new Date(restaurant.subscription_end_date) - new Date()) / (1000 * 60 * 60 * 24));
              return daysLeft > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100';
            })()}`}>
            {(function() {
              if (!restaurant.subscription_end_date) return "نسخة مجانية / غير مشترك";
              const daysLeft = Math.ceil((new Date(restaurant.subscription_end_date) - new Date()) / (1000 * 60 * 60 * 24));
              if (daysLeft < 0) return "الاشتراك منتهي";
              if (daysLeft === 0) return "ينتهي اليوم";
              return `متبقي ${daysLeft} يوم`;
            })()}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <PrimaryBtn onClick={handleSave} disabled={saving} className="w-full text-[18px] py-5">
          {saving ? <Loader2 size={24} className="animate-spin text-white" /> : saveStatus === "success" ? <CheckCircle2 size={24} className="text-white" /> : <Save size={24} />}
          {saveStatus === "success" ? "تم الحفظ بنجاح وتحديث المتجر!" : saveStatus === "error" ? "فشل الحفظ. تأكد من إتصالك" : "حفظ واعتماد التغييرات"}
        </PrimaryBtn>
      </div>
    </div>
  );
}
