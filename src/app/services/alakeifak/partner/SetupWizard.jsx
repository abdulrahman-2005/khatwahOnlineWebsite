"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { safeMutation } from "../lib/safeQuery";
import { compressLogo, fileToDataUrl, uploadImage } from "../lib/imageUtils";
import { formatEgyptianPhone, isValidEgyptianPhone } from "../lib/whatsappUtils";
import {
  ArrowLeft,
  Loader2,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Store,
  MessageCircle,
  Image as ImageIcon,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";

const STEPS = [
  { id: 1, icon: Store, title: "هوية المطعم", desc: "اختر اسماً يعبر عنك ورابطاً لمنيوك الخاص." },
  { id: 2, icon: MessageCircle, title: "بيانات التواصل", desc: "أضف رقم مبيعات الواتساب لاستقبال الطلبات." },
  { id: 3, icon: ImageIcon, title: "الواجهة البصرية", desc: "قم بإدراج الشعار التجاري وأبهر عملائك." },
];

const ARABIC_MAP = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
  'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'ة': 'a', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ئ': 'e', 'ء': 'a', 'ؤ': 'o'
};

function transliterateArabic(str) {
  return str.split('').map(char => ARABIC_MAP[char] || char).join('');
}

function generateSlug(name) {
  let transliterated = transliterateArabic(name.trim().toLowerCase());
  let slug = transliterated
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
  
  if (!slug) {
    slug = "restaurant-" + Math.floor(Math.random() * 10000);
  }
  return slug;
}

export default function SetupWizard({ userId, userEmail, onComplete }) {
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
    // Only allow Arabic letters, English letters, Numbers, and Spaces. No punctuation or special chars.
    const sanitized = value.replace(/[^a-zA-Z0-9\s\u0621-\u064A\u0660-\u0669]/g, "");
    setName(sanitized);
    if (!slugEdited) {
      setSlug(generateSlug(sanitized));
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

    const formattedPhone = formatEgyptianPhone(whatsappNumber);
    if (!isValidEgyptianPhone(formattedPhone)) {
      setError("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو +201...)");
      return;
    }

    if (slug === "partner" || slug === "migrations" || slug === "admin") {
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

      const { data: restaurant, error: createError, ok: createOk } = await safeMutation(
        () => supabase
          .from("restaurants")
          .insert({
            owner_id: userId,
            name: name.trim(),
            slug: slug.trim(),
            whatsapp_number: formattedPhone,
            logo_url: logoUrl,
            theme_color: "#f97316", // Default orange
            is_verified: false,
            is_open: true,
          })
          .select()
          .single()
      );

      if (!createOk) throw createError || new Error("Failed to create restaurant.");

      if (createError) throw createError;

      const { error: seedError } = await safeMutation(() => supabase.rpc(
        "seed_default_delivery_zones",
        { p_restaurant_id: restaurant.id }
      ));
      if (seedError) console.warn("Failed to seed delivery zones:", seedError);

      const { error: memberError, ok: memberOk } = await safeMutation(() => supabase
        .from("restaurant_members")
        .insert({
          restaurant_id: restaurant.id,
          email: userEmail,
          user_id: userId,
          role: "owner",
        }));

      if (!memberOk || memberError) {
        console.warn("Failed to insert restaurant_member:", memberError);
        // ROLLBACK: Delete the orphaned restaurant so the user can try again
        await supabase.from("restaurants").delete().eq("id", restaurant.id);
        throw new Error("فشل إسناد صلاحية المالك للمطعم. تم التراجع، يرجى المحاولة مرة أخرى.");
      }

      onComplete(restaurant);
    } catch (err) {
      console.warn("Setup error:", err);
      setError(err.message || "عذراً، حدث خطأ غير طبيعي.");
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = async () => {
    setError("");
    if (step === 1) {
      if (!name.trim()) return setError("اسم المطعم مطلوب للإستمرار");
      if (!slug.trim()) return setError("رابط المنيو الفريد مطلوب");
      if (slug === "partner" || slug === "migrations" || slug === "admin") {
        return setError("عنوان الصفحة محجوز، يرجى اختيار رابط مختلف.");
      }
      
      setSubmitting(true);
      const { data: existing } = await supabase
        .from("restaurants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      setSubmitting(false);

      if (existing) {
        return setError("عنوان الصفحة مأخوذ مسبقاً، جرب إضافة رقم مميز له.");
      }
    }
    if (step === 2) {
      if (!whatsappNumber || whatsappNumber.length < 8) return setError("رقم موبايل حقيقي مطلوب");
      const formattedPhone = formatEgyptianPhone(whatsappNumber);
      if (!isValidEgyptianPhone(formattedPhone)) {
        return setError("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو +201...)");
      }
    }
    setStep(step + 1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      
      {/* Immersive Setup Container */}
      <div className="w-full">
        
        {/* Header Glow Elements */}
        <div className="relative mb-8 sm:mb-10 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-5 py-2.5 border border-orange-200/60 shadow-sm">
            <Sparkles size={16} className="text-orange-500 animate-pulse" />
            <span className="text-[13px] font-black tracking-widest text-orange-700">تجهيز مساحة العمل</span>
          </div>
        </div>
        
        {/* Progress Stepper */}
        <div className="mb-10 px-2 sm:px-8">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-gray-200 z-0" />
            
            {/* Active Line */}
            <div 
              className="absolute top-1/2 right-0 h-[2px] -translate-y-1/2 bg-orange-500 z-0 transition-all duration-700 ease-out" 
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} 
            />
            
            {STEPS.map((s, idx) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              const Icon = s.icon;
              
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <div 
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 border-[3px] bg-white ${
                      isActive 
                        ? "border-orange-500 text-orange-500 scale-110 shadow-lg shadow-orange-500/20" 
                        : isCompleted 
                          ? "border-orange-500 bg-orange-500 text-white" 
                          : "border-gray-200 text-gray-300"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-12 border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          
          {/* Header */}
          <div className="mb-8 sm:mb-10 text-center">
            <h2 className="mb-3 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {STEPS[step - 1].title}
            </h2>
            <p className="text-[14px] sm:text-[15px] font-bold text-gray-500 max-w-sm mx-auto leading-relaxed px-2">
              {STEPS[step - 1].desc}
            </p>
          </div>

          {/* Form Error Handling - Moved to top of form area for immediate visibility */}
          {error && (
            <div className="mb-6 rounded-[20px] bg-red-50 border border-red-100 p-4 flex items-start sm:items-center gap-3 animate-in fade-in zoom-in duration-300">
              <div className="shrink-0 mt-0.5 sm:mt-0"><AlertTriangle size={18} className="text-red-500" /></div>
              <p className="text-[14px] font-black text-red-600 leading-tight text-right flex-1">{error}</p>
            </div>
          )}

          {/* Dynamic Form Area */}
          <div className="min-h-[200px] sm:min-h-[220px]">
            
            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2.5">
                  <label className="text-[14px] font-bold text-gray-600 px-1 block">الاسم التجاري للمطعم</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="مثال: مطعم شاورما الريم..."
                    className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200 bg-gray-50 px-5 sm:px-6 py-4 sm:py-5 text-[16px] sm:text-[18px] font-black text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5 pt-2">
                  <label className="text-[14px] font-bold text-gray-600 px-1 block">الرابط الفريد (المنيو)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-[20px] sm:rounded-[24px] bg-gray-50 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 transition-all shadow-sm overflow-hidden" dir="ltr">
                    <div className="bg-gray-100/50 px-4 sm:px-5 py-3 sm:py-5 border-b sm:border-b-0 sm:border-r border-gray-200 flex items-center justify-center">
                      <span className="text-[13px] sm:text-[14px] text-gray-500 font-bold whitespace-nowrap">alakeifak/</span>
                    </div>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                        setSlugEdited(true);
                      }}
                      className="w-full sm:flex-1 bg-transparent px-4 sm:px-5 py-4 text-[16px] sm:text-[18px] font-black text-gray-900 outline-none placeholder:text-gray-300"
                      placeholder="restaurant-name"
                    />
                  </div>
                  <p className="text-[12px] font-bold text-gray-400 px-2 mt-2">
                    يجب أن يكون باللغة الإنجليزية وبدون مسافات.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: WhatsApp */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <label className="text-[14px] font-bold text-gray-600 px-1 block">رقم المبيعات (واتساب)</label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    onBlur={() => setWhatsappNumber(formatEgyptianPhone(whatsappNumber))}
                    dir="ltr"
                    className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200 bg-gray-50 px-5 sm:px-6 py-5 sm:py-6 text-[20px] sm:text-[22px] font-black text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm "
                    placeholder="+201xxxxxxxxx"
                  />
                  <p className="text-[13px] sm:text-[14px] text-gray-500 font-medium px-2 pt-2 leading-relaxed text-right">
                    نرجو توفير <strong>مفتاح الدولة الدولي</strong> (كمثال: +20 لمصر) لإتمام الربط وتمرير رسائل الطلبات بنجاح.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Logo */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <label
                  htmlFor="logo-upload"
                  className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[40px] border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-orange-50/50 hover:border-orange-300 transition-all shadow-sm"
                  style={{ width: "200px", height: "200px" }}
                >
                  {compressing ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={36} className="animate-spin text-orange-500" />
                      <span className="text-[14px] font-black text-orange-600">تجهيز الشعار...</span>
                    </div>
                  ) : logoPreview ? (
                    <>
                      <Image src={logoPreview} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-gray-900/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-[15px] font-black text-white">تغيير الصورة</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-gray-400 group-hover:text-orange-500 transition-colors">
                      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                        <UploadCloud size={28} />
                      </div>
                      <span className="text-[15px] font-black">إدراج صورة</span>
                    </div>
                  )}
                </label>
                <p className="mt-4 text-center text-[13px] font-bold text-gray-400 max-w-xs">
                  يمكن للملفات العالية الدقة أن يبلغ حجمها 5MB كحد أقصى. سيتم ضغطها تلقائياً لتسريع المنيو.
                </p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 sm:mt-10 flex gap-3 sm:gap-4 pt-6 border-t border-gray-100">
            <button
              onClick={() => { setError(""); setStep(step - 1); }}
              disabled={step === 1 || submitting}
              className={`flex h-14 w-14 sm:w-auto sm:px-8 items-center justify-center rounded-[20px] transition-all border font-black text-[16px] ${
                step === 1 
                  ? "opacity-0 pointer-events-none hidden sm:hidden border-transparent" 
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:scale-95 shadow-sm shrink-0"
              }`}
            >
              <ArrowRight size={20} className="sm:hidden" />
              <span className="hidden sm:block">السابق</span>
            </button>

            {step < STEPS.length ? (
              <button
                onClick={goNext}
                className="flex h-14 flex-1 items-center justify-center rounded-[20px] bg-orange-500 text-[16px] sm:text-[18px] font-black text-white transition-all hover:bg-orange-600 active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)]"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || compressing}
                className="flex h-14 flex-1 items-center justify-center gap-3 rounded-[20px] bg-gray-900 text-[16px] sm:text-[18px] font-black text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-[0_10px_30px_-10px_rgba(17,24,39,0.5)]"
              >
                {submitting ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>جاري التجهيز...</span>
                  </>
                ) : (
                  "كله تمام"
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
