"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { compressLogo, fileToDataUrl, uploadImage } from "../lib/imageUtils";
import {
  ArrowLeft,
  ChevronLeft,
  Loader2,
  UtensilsCrossed,
  UploadCloud,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import Image from "next/image";

const STEPS = [
  { id: 1, title: "هوية المطعم", desc: "اختر اسماً يعبر عنك ورابطاً لمنيوك الخاص." },
  { id: 2, title: "بيانات التواصل", desc: "أضف رقم مبيعات الواتساب لاستقبال الطلبات." },
  { id: 3, title: "الواجهة البصرية", desc: "قم بإدراج الشعار التجاري وأبهر عملائك." },
];

function generateSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 40);
}

export default function SetupWizard({ userId, onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("+20");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (value) => {
    setName(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setError("");
    try {
      const compressed = await compressLogo(file);
      setLogoFile(compressed);
      const preview = await fileToDataUrl(compressed);
      setLogoPreview(preview);
    } catch (err) {
      setError(err.message || "فشل ضغط الصورة. حاول مرة أخرى.");
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim() || !whatsappNumber || whatsappNumber.length < 8) {
      setError("نرجو إكمال جميع الحقول بدقة.");
      return;
    }

    if (slug === "partner" || slug === "migrations") {
      setError("عنوان الصفحة محجوز، يرجى اختيار رابط مختلف.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data: existing, error: slugError } = await supabase
        .from("restaurants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (slugError && slugError.code !== 'PGRST116') {
        if (slugError.code === 'PGRST204' || slugError.message?.includes('406') || slugError.code === '42P01') {
          throw new Error("قاعدة البيانات غير مهيأة.");
        }
      }

      if (existing) {
        setError("عنوان الصفحة مأخوذ مسبقاً، جرب إضافة رقم مميز له.");
        setSubmitting(false);
        return;
      }

      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'logos');
      }

      const { data: restaurant, error: createError } = await supabase
        .from("restaurants")
        .insert({
          owner_id: userId,
          name: name.trim(),
          slug: slug.trim(),
          whatsapp_number: whatsappNumber.trim(),
          logo_url: logoUrl,
          theme_color: "#ee930c",
          is_verified: false,
          is_open: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      const { error: seedError } = await supabase.rpc(
        "seed_default_delivery_zones",
        { p_restaurant_id: restaurant.id }
      );
      if (seedError) console.warn("Failed to seed delivery zones:", seedError);

      onComplete(restaurant);
    } catch (err) {
      console.error("Setup error:", err);
      setError(err.message || "عذراً، حدث خطأ غير طبيعي.");
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    setError("");
    if (step === 1) {
      if (!name.trim()) return setError("اسم المطعم مطلوب للإستمرار");
      if (!slug.trim()) return setError("رابط المنيو الفريد مطلوب");
    }
    if (step === 2) {
      if (!whatsappNumber || whatsappNumber.length < 8) return setError("رقم موبايل حقيقي مطلوب");
    }
    setStep(step + 1);
  };

  const color = "#ee930c";

  return (
    <div className="min-h-screen bg-[#070908] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ee930c]/[0.05] via-transparent to-transparent flex items-center justify-center p-4 sm:p-8" dir="rtl">
      
      {/* Immersive Setup Container */}
      <div className="w-full max-w-xl">
        
        {/* Glow Element */}
        <div className="relative mb-12 flex justify-center">
          <div className="absolute top-1/2 left-1/2 -z-10 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[60px]" style={{ backgroundColor: color }} />
          <div className="flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 backdrop-blur-md">
            <Sparkles size={18} style={{ color }} />
            <span className="text-[13px] font-black tracking-widest text-white">إعداد أولي للمتجر</span>
          </div>
        </div>
        
        {/* Progress Bar (Neo style) */}
        <div className="mb-12 relative px-4">
          <div className="absolute top-1/2 left-4 right-4 -z-10 h-0.5 -translate-y-1/2 rounded-full bg-white/10" />
          <div 
            className="absolute top-1/2 right-4 -z-10 h-0.5 -translate-y-1/2 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_var(--dynamic-color)]" 
            style={{ 
              width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 2rem)`,
              backgroundColor: color,
              '--dynamic-color': color
            }} 
          />
          
          <div className="flex items-center justify-between relative z-10 w-full">
            {STEPS.map((s) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className="relative flex flex-col items-center">
                  <div 
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 ${
                      isActive ? "scale-110 shadow-[0_0_20px_-5px_var(--dynamic-color)] border-[3px]" : "border-[2px]"
                    }`}
                    style={{ 
                      borderColor: isCompleted || isActive ? color : "rgba(255,255,255,0.1)",
                      backgroundColor: isCompleted ? color : "#070908",
                      color: isCompleted ? "#000" : (isActive ? "#FFF" : "rgba(255,255,255,0.3)"),
                      '--dynamic-color': color
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={24} strokeWidth={3} /> : <span className="text-[15px] font-black">{s.id}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Component */}
        <div className="relative overflow-hidden rounded-[40px] bg-[#0A0C0B]/80 p-8 sm:p-12 border border-white/5 shadow-2xl backdrop-blur-2xl">
          
          {/* Subtle top glare */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Header */}
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
              {STEPS[step - 1].title}
            </h2>
            <p className="text-[16px] font-medium text-white/50">
              {STEPS[step - 1].desc}
            </p>
          </div>

          {/* Form Content Wrapper (Min-height to prevent jumping) */}
          <div className="min-h-[220px]">
            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-white/50 px-1">الاسم التجاري للمطعم</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="مطعم أكلات البحر..."
                    className="w-full rounded-[20px] border border-white/10 bg-white/5 px-6 py-5 text-[18px] font-black text-white outline-none transition-all placeholder:text-white/20 focus:bg-white/10 focus:border-[var(--dynamic-color)] focus:shadow-[0_0_20px_-5px_var(--dynamic-color)]"
                    style={{ '--dynamic-color': color }}
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[14px] font-bold text-white/50 px-1">الرابط الفريد (المنيو)</label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center rounded-[20px] bg-white/5 px-6 py-5 border border-white/10 focus-within:border-[var(--dynamic-color)] focus-within:bg-white/10 focus-within:shadow-[0_0_20px_-5px_var(--dynamic-color)] transition-all" style={{ '--dynamic-color': color, direction: 'ltr' }}>
                    <span className="text-[15px] text-white/30 font-black">khatwah.online/services/alakeifak/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                        setSlugEdited(true);
                      }}
                      className="w-full sm:flex-1 bg-transparent text-[18px] font-black text-white outline-none placeholder:text-white/10"
                      placeholder="restaurant-name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: WhatsApp */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-3">
                  <label className="text-[14px] font-bold text-white/50 px-1">رقم المبيعات (واتساب)</label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    dir="ltr"
                    className=" w-full rounded-[24px] border border-white/10 bg-white/5 px-6 py-6 text-[22px] font-black text-white outline-none transition-all placeholder:text-white/20 focus:bg-white/10 focus:border-[var(--dynamic-color)] focus:shadow-[0_0_20px_-5px_var(--dynamic-color)]"
                    style={{ '--dynamic-color': color}}
                    placeholder="+201xxxxxxxxx"
                  />
                  <p className="text-[14px] text-white/40 font-medium px-2 mt-2 leading-relaxed text-center sm:text-right">
                    نرجو توفير مفتاح الدولة الدولي (كمثال: +20) لإتمام الربط وتمرير رسائل الطلبات بنجاح.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Logo */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[40px] border-2 border-dashed border-white/10 bg-white/[0.02] transition-all hover:border-[var(--dynamic-color)] hover:bg-white/[0.05]"
                    style={{ width: "200px", height: "200px", '--dynamic-color': color }}
                  >
                    {compressing ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 size={36} className="animate-spin text-[var(--dynamic-color)]" style={{ color }} />
                        <span className="text-[14px] font-black text-white/60">تجهيز المعروضات...</span>
                      </div>
                    ) : logoPreview ? (
                      <>
                        <Image src={logoPreview} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-[15px] font-black text-white">تعديل الصورة</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-white/30 transition-colors group-hover:text-white/70">
                        <UploadCloud size={48} strokeWidth={1.5} />
                        <span className="text-[15px] font-black">إدراج صورة</span>
                      </div>
                    )}
                  </label>
                  <p className="mt-6 text-center text-[14px] font-medium text-white/40">
                    يمكن للملفات العالية الدقة أن يبلغ حجمها 5MB كحد أقصى.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Error Handling */}
          {error && (
            <div className="mt-6 rounded-[20px] bg-red-500/10 border border-red-500/20 p-5 text-center px-4 animate-in fade-in zoom-in duration-300">
              <p className="text-[15px] font-black text-red-400">{error}</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-12 flex gap-4 border-t border-white/10 pt-8">
            <button
              onClick={() => { setError(""); setStep(step - 1); }}
              disabled={step === 1 || submitting}
              className={`flex h-14 w-14 sm:w-auto sm:px-8 items-center justify-center rounded-[20px] transition-all border ${
                step === 1 
                  ? "opacity-0 pointer-events-none" 
                  : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ArrowLeft size={24} className="sm:hidden" />
              <span className="hidden sm:block text-[16px] font-black">السابق</span>
            </button>

            {step < STEPS.length ? (
              <button
                onClick={goNext}
                className="flex h-14 flex-1 items-center justify-center rounded-[20px] text-[18px] font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_-10px_var(--dynamic-color)]"
                style={{ backgroundColor: color, '--dynamic-color': color }}
              >
                المرحلة التالية
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || compressing}
                className="flex h-14 flex-1 items-center justify-center gap-3 rounded-[20px] text-[18px] font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_30px_-10px_var(--dynamic-color)]"
                style={{ backgroundColor: color, '--dynamic-color': color }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={24} className="animate-spin text-black" />
                    <span>يتم المعالجة...</span>
                  </>
                ) : (
                  "إنهاء المعالج وتدشين النظام"
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
