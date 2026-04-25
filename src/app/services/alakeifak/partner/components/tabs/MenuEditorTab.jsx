"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { compressImage, uploadImage, fileToDataUrl } from "../../../lib/imageUtils";
import PrintableMenu from "../../PrintableMenu";
import { 
  X, Loader2, UploadCloud, Trash2, ToggleRight, ToggleLeft, 
  Save, QrCode, Printer, Copy, Plus, Edit3, Pizza 
} from "lucide-react";
import { IconButton, InputField, PrimaryBtn, LoadingSpinner, EmptyState } from "../ui/PartnerUI";

const EMOJI_OPTIONS = ["🍽️","🍔","🍕","🍗","🍝","🥗","🐟","🍰","🧇","🍨","☕","🥤","🧊","🍟","🌮","🥙","🍜","🍣","🥩","🍩","🧁","🫔","🥪","🍱","🔥"];

export default function MenuEditorTab({ restaurantId, restaurant, themeColor }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category state
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🔥");
  const [editingCat, setEditingCat] = useState(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatIcon, setEditCatIcon] = useState("🔥");

  // Subcategory state
  const [newSubNames, setNewSubNames] = useState({});
  const [editingSub, setEditingSub] = useState(null);
  const [editSubName, setEditSubName] = useState("");

  // Item form state
  const [showItemForm, setShowItemForm] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [itemFormSubId, setItemFormSubId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", ingredients: "", is_available: true, sizes: [{ name: "", price: "" }] });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (showQR) {
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  }, [showQR]);

  const fetchData = useCallback(async () => {
    const [catRes, subRes, itemRes] = await Promise.all([
      supabase.from("categories").select("*").eq("restaurant_id", restaurantId).order("sort_order"),
      supabase.from("subcategories").select("*, categories!inner(restaurant_id)").eq("categories.restaurant_id", restaurantId).order("sort_order"),
      supabase.from("items").select("*, item_sizes(*), subcategories!inner(categories!inner(restaurant_id))").eq("subcategories.categories.restaurant_id", restaurantId).order("sort_order"),
    ]);
    setCategories(catRes.data || []);
    setSubcategories(subRes.data || []);
    setItems(itemRes.data || []);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Category CRUD ──
  const addCategory = async () => {
    if (!newCatName.trim()) return;
    await supabase.from("categories").insert({ restaurant_id: restaurantId, name: newCatName.trim(), icon: newCatIcon, sort_order: categories.length });
    setNewCatName(""); setNewCatIcon("🔥"); fetchData();
  };
  const updateCategory = async (id) => {
    if (!editCatName.trim()) return;
    await supabase.from("categories").update({ name: editCatName.trim(), icon: editCatIcon }).eq("id", id);
    setEditingCat(null); fetchData();
  };
  const deleteCategory = async (id) => {
    if (!confirm("هل أنت متأكد من حذف القسم وكل التصنيفات والأصناف المرتبطة به نهائياً؟")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchData();
  };

  // ── Subcategory CRUD ──
  const addSubcategory = async (categoryId) => {
    const subName = newSubNames[categoryId];
    if (!subName || !subName.trim()) return;
    const catSubs = subcategories.filter(s => s.category_id === categoryId);
    await supabase.from("subcategories").insert({ category_id: categoryId, name: subName.trim(), sort_order: catSubs.length });
    setNewSubNames({ ...newSubNames, [categoryId]: "" }); fetchData();
  };
  const updateSubcategory = async (id) => {
    if (!editSubName.trim()) return;
    await supabase.from("subcategories").update({ name: editSubName.trim() }).eq("id", id);
    setEditingSub(null); fetchData();
  };
  const deleteSubcategory = async (id) => {
    if (!confirm("حذف هذا التصنيف وكل الأصناف المرتبطة به؟")) return;
    await supabase.from("subcategories").delete().eq("id", id);
    fetchData();
  };

  // ── Item CRUD ──
  const resetItemForm = () => {
    setFormData({ name: "", description: "", ingredients: "", is_available: true, sizes: [{ name: "", price: "" }] });
    setImageFile(null); setImagePreview(null); setEditingItem(null); setFormError(""); setShowItemForm(false); setItemFormSubId(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true); setFormError("");
    try { const compressed = await compressImage(file); setImageFile(compressed); setImagePreview(await fileToDataUrl(compressed)); }
    catch (err) { setFormError(err.message || "فشل معالجة الصورة."); }
    finally { setCompressing(false); }
  };

  const addSize = () => setFormData({ ...formData, sizes: [...formData.sizes, { name: "", price: "" }] });
  const removeSize = (idx) => {
    const sizes = formData.sizes.filter((_, i) => i !== idx);
    setFormData({ ...formData, sizes: sizes.length ? sizes : [{ name: "", price: "" }] });
  };
  const updateSize = (idx, field, value) => {
    const sizes = [...formData.sizes];
    sizes[idx] = { ...sizes[idx], [field]: value };
    setFormData({ ...formData, sizes });
  };

  const openAddItem = (subId) => { resetItemForm(); setItemFormSubId(subId); setShowItemForm(true); };
  const openEditItem = (item) => {
    setEditingItem(item); setItemFormSubId(item.subcategory_id);
    setFormData({ name: item.name, description: item.description || "", ingredients: item.ingredients || "", is_available: item.is_available,
      sizes: item.item_sizes?.length ? item.item_sizes.map(s => ({ name: s.name, price: String(s.price) })) : [{ name: "", price: "" }] });
    setImagePreview(item.image_url); setShowItemForm(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim() || !itemFormSubId) return setFormError("الاسم لابد من إضافته.");
    const validSizes = formData.sizes.filter(s => s.name.trim() && s.price);
    if (validSizes.length === 0) return setFormError("يجب توفير حجم واحد وسعر على الأقل.");
    setSaving(true); setFormError("");
    try {
      let imageUrl = editingItem?.image_url || null;
      if (imageFile) imageUrl = await uploadImage(imageFile, 'items');
      if (editingItem) {
        await supabase.from("items").update({ subcategory_id: itemFormSubId, name: formData.name.trim(), description: formData.description.trim(), ingredients: formData.ingredients.trim(), image_url: imageUrl, is_available: formData.is_available }).eq("id", editingItem.id);
        await supabase.from("item_sizes").delete().eq("item_id", editingItem.id);
        await supabase.from("item_sizes").insert(validSizes.map((s, idx) => ({ item_id: editingItem.id, name: s.name.trim(), price: Number(s.price), sort_order: idx })));
      } else {
        const subItems = items.filter(i => i.subcategory_id === itemFormSubId);
        const { data: newItem } = await supabase.from("items").insert({ subcategory_id: itemFormSubId, name: formData.name.trim(), description: formData.description.trim(), ingredients: formData.ingredients.trim(), image_url: imageUrl, is_available: formData.is_available, sort_order: subItems.length }).select().single();
        if (newItem) await supabase.from("item_sizes").insert(validSizes.map((s, idx) => ({ item_id: newItem.id, name: s.name.trim(), price: Number(s.price), sort_order: idx })));
      }
      resetItemForm(); fetchData();
    } catch (err) { setFormError(err.message || "حدث خطأ."); }
    finally { setSaving(false); }
  };

  const toggleAvailability = async (item) => { await supabase.from("items").update({ is_available: !item.is_available }).eq("id", item.id); fetchData(); };
  const deleteItem = async (id) => { if (!confirm("حذف هذا الصنف نهائياً؟")) return; await supabase.from("items").delete().eq("id", id); fetchData(); };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 print:animate-none">
      <div className="print:hidden">
      {/* Item Form Modal */}
      {showItemForm && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-4 sm:pt-10 px-4 overflow-y-auto pb-10 overscroll-none" 
          onClick={(e) => { if (e.target === e.currentTarget) resetItemForm(); }}
        >
          <div className="w-full max-w-2xl rounded-[36px] bg-white p-5 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-5">
              <h3 className="text-[18px] sm:text-[20px] font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>{editingItem ? "تعديل الصنف" : "صنف جديد"}</h3>
              <IconButton icon={X} onClick={resetItemForm} className="h-10 w-10 sm:h-11 sm:w-11" />
            </div>
            <div className="space-y-6">
              <InputField label="اسم الصنف" placeholder="مثلاً: برجر كلاسيك..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <InputField label="الوصف الترويجي" placeholder="وصف يجذب العميل..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="space-y-3">
                <label className="text-[14px] font-bold text-gray-500 px-1">صورة الصنف</label>
                <div className="flex items-center gap-4">
                  {compressing ? (<div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-[20px] bg-gray-50 border border-gray-100"><Loader2 size={24} className="animate-spin text-[var(--dynamic-color)]" /></div>)
                   : imagePreview ? (<div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-[20px] border-2 border-white shadow-md bg-gray-100"><img src={imagePreview} alt="" className="h-full w-full object-cover" /></div>)
                   : (<div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-[20px] bg-gray-50 border-2 border-dashed border-gray-200"><UploadCloud size={24} className="text-gray-300" /></div>)}
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[12px] sm:text-[13px] font-bold text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                    <span>رفع صورة</span><input type="file" accept="image/*" onChange={handleImageChange} disabled={compressing} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="rounded-[24px] bg-gray-50 p-4 sm:p-5 border border-gray-100">
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-[15px] sm:text-[16px] font-black text-gray-900">الأحجام والتسعير</label>
                  <button onClick={addSize} className="rounded-full bg-white px-3 py-1 text-[11px] sm:text-[12px] font-bold text-[var(--dynamic-color)] border border-gray-200 hover:shadow-sm">+ إضافة</button>
                </div>
                <div className="space-y-3">
                  {formData.sizes.map((size, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <div className="flex w-full gap-2 items-center min-w-0">
                        <input type="text" value={size.name} onChange={(e) => updateSize(idx, "name", e.target.value)} placeholder="الحجم (مثلاً: كبير)" className="flex-1 min-w-0 rounded-[16px] bg-white px-4 py-3 text-[14px] font-bold outline-none border border-gray-200 focus:border-[var(--dynamic-color)] text-gray-900" />
                        <input type="number" value={size.price} onChange={(e) => updateSize(idx, "price", e.target.value)} placeholder="السعر" dir="ltr" className="w-[90px] sm:w-[100px] rounded-[16px] bg-white px-4 py-3 text-[14px] font-bold outline-none border border-gray-200 focus:border-[var(--dynamic-color)] text-gray-900" />
                        {formData.sizes.length > 1 && <IconButton icon={Trash2} colorClass="text-red-400" borderClass="h-10 w-10 bg-red-50 border-red-100 !rounded-[12px]" onClick={() => removeSize(idx)} className="sm:hidden" />}
                      </div>
                      {formData.sizes.length > 1 && <IconButton icon={Trash2} colorClass="text-red-400" borderClass="h-10 w-10 bg-red-50 border-red-100 !rounded-[12px]" onClick={() => removeSize(idx)} className="hidden sm:flex" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-[20px] bg-[var(--dynamic-color)]/5 p-4 border border-[var(--dynamic-color)]/20">
                <span className="text-[14px] sm:text-[15px] font-black text-gray-900">إتاحة الصنف للطلب</span>
                <button onClick={() => setFormData({ ...formData, is_available: !formData.is_available })} className="hover:scale-105 transition-transform">
                  {formData.is_available ? <ToggleRight className="text-[var(--dynamic-color)] w-9 h-9 sm:w-10 sm:h-10" /> : <ToggleLeft className="text-gray-300 w-9 h-9 sm:w-10 sm:h-10" />}
                </button>
              </div>
              {formError && <div className="rounded-[16px] border border-red-100 bg-red-50 p-4 text-center text-[14px] font-bold text-red-600">{formError}</div>}
              <PrimaryBtn onClick={handleSaveItem} disabled={saving || compressing} className="w-full py-4 sm:py-5">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editingItem ? "حفظ التعديلات" : "إضافة الصنف"}
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Action Header (QR / Print) ═══ */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[28px] bg-[var(--dynamic-color)]/5 border border-[var(--dynamic-color)]/10 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <QrCode size={24} style={{ color: themeColor }} />
          </div>
          <div>
            <h3 className="text-[16px] font-black text-gray-900 leading-tight">معاينة وتصدير المنيو</h3>
            <p className="text-[12px] font-bold text-gray-500 mt-0.5">شارك رابط المنيو أو اطبعه للنسخة الورقية</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => setShowQR(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-bold text-gray-700 shadow-sm transition hover:shadow border border-gray-200">
            <QrCode size={18} /> رمز الـ QR
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14px] font-black text-white shadow-sm transition hover:scale-105" style={{ backgroundColor: themeColor }}>
            <Printer size={18} /> طباعة ورقية
          </button>
        </div>
      </div>


  // QR Code Modal 
  {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowQR(false)}>
          <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <IconButton icon={X} onClick={() => setShowQR(false)} borderClass="absolute top-4 right-4 bg-gray-100" />
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[20px] bg-[var(--dynamic-color)]/10 mb-6">
              <QrCode size={36} style={{ color: themeColor }} />
            </div>
            <h3 className="text-[20px] font-black text-gray-900 mb-2">رمز القائمة الخاص بك</h3>
            <p className="text-[13px] font-bold text-gray-500 mb-8 leading-relaxed">
              يمكنك طباعة هذا الرمز أو تحميله ووضعه على طاولات المطعم ليتمكن العملاء من التصفح مباشرة.
            </p>
            <div className="mx-auto w-48 h-48 rounded-[24px] border-4 border-gray-100 p-2 shadow-sm mb-6 bg-white overflow-hidden flex items-center justify-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://khatwah.com")}/services/alakeifak/${restaurant?.slug || ""}`} alt="QR Code" className="w-full h-full object-contain" />
            </div>
            <a 
              href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://khatwah.com")}/services/alakeifak/${restaurant?.slug || ""}`} 
              download={`qr-${restaurant?.slug}.png`}
              target="_blank" rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-black text-white transition hover:brightness-110" style={{ backgroundColor: themeColor }}>
              <Copy size={18} /> تحميل صورة الرمز عالية الدقة
            </a>
          </div>
        </div>
      )}

      {/* ═══ New Category Form ═══ */}
      <div className="mb-8 rounded-[28px] bg-white p-5 shadow-sm border border-gray-100">
        <h3 className="text-[15px] font-black text-gray-500 mb-4">➕ إضافة قسم رئيسي جديد</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <InputField placeholder="اسم القسم (مثال: الوجبات، المشروبات)" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()} className="flex-1 min-w-0" />
          <PrimaryBtn icon={Plus} onClick={addCategory} className="sm:w-44 shrink-0 py-3 h-max mt-auto">إنشاء قسم</PrimaryBtn>
        </div>
        <label className="text-[12px] font-bold text-gray-400 px-1 mb-2 block">اختر أيقونة للقسم:</label>
        <div className="flex flex-wrap gap-1.5">
          {EMOJI_OPTIONS.map((emoji) => (
            <button key={emoji} onClick={() => setNewCatIcon(emoji)} className={`flex h-9 w-9 items-center justify-center rounded-[12px] text-[18px] transition-all border-2 ${newCatIcon === emoji ? "border-[var(--dynamic-color)] bg-[var(--dynamic-color)]/10 scale-110 shadow-sm" : "border-transparent bg-gray-50 hover:bg-gray-100"}`}>{emoji}</button>
          ))}
        </div>
      </div>

      {/* ═══ Menu Tree ═══ */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const catSubs = subcategories.filter(s => s.category_id === cat.id);
          return (
            <div key={cat.id} className="rounded-[28px] overflow-hidden border border-gray-200 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]">
              {/* ── CATEGORY HEADER (Tier 1 — Bold colored band) ── */}
              {editingCat === cat.id ? (
                <div className="p-4 sm:p-5 space-y-3" style={{ backgroundColor: `${themeColor}08` }}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input type="text" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && updateCategory(cat.id)} className="flex-1 min-w-0 rounded-[16px] sm:rounded-[20px] bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-[15px] sm:text-[17px] font-black text-gray-900 outline-none border-2 border-[var(--dynamic-color)]" autoFocus />
                    <IconButton icon={Save} colorClass="text-green-600" borderClass="bg-green-50 border-green-200 h-9 w-9 sm:h-11 sm:w-11 !rounded-[12px]" onClick={() => updateCategory(cat.id)} />
                    <IconButton icon={X} borderClass="h-9 w-9 sm:h-11 sm:w-11 !rounded-[12px]" onClick={() => setEditingCat(null)} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_OPTIONS.map((emoji) => (<button key={emoji} onClick={() => setEditCatIcon(emoji)} className={`flex h-8 w-8 items-center justify-center rounded-[10px] text-[16px] border-2 ${editCatIcon === emoji ? "border-[var(--dynamic-color)] bg-[var(--dynamic-color)]/10" : "border-gray-100 bg-white"}`}>{emoji}</button>))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3 sm:py-4" style={{ background: `linear-gradient(135deg, ${themeColor}12 0%, ${themeColor}06 100%)` }}>
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-white shadow-sm border border-gray-100 text-[18px] sm:text-[22px] shrink-0 z-10">{cat.icon || "🔥"}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] sm:text-[18px] font-black text-gray-900 leading-tight truncate pr-1" style={{ fontFamily: "var(--font-display)" }}>{cat.name}</h3>
                      <span className="text-[11px] font-bold text-gray-400 block mt-0.5">{catSubs.length} تصنيف · {items.filter(i => catSubs.some(s => s.id === i.subcategory_id)).length} صنف</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => { setEditingCat(cat.id); setEditCatName(cat.name); setEditCatIcon(cat.icon || "🔥"); }} className="flex h-8 sm:h-9 items-center gap-1.5 rounded-full bg-white px-2.5 sm:px-3 text-[11px] sm:text-[12px] font-bold text-gray-500 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
                      <Edit3 size={12} className="sm:w-[13px]" /> <span className="hidden xs:inline">تعديل</span>
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white border border-red-100 text-red-400 shadow-sm hover:bg-red-50 transition-all">
                      <Trash2 size={13} className="sm:w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── SUBCATEGORIES BODY ── */}
              <div className="bg-white">
                {catSubs.map((sub, subIdx) => {
                  const subItems = items.filter(i => i.subcategory_id === sub.id);
                  const isLast = subIdx === catSubs.length - 1;

                  return (
                    <div key={sub.id} className={!isLast ? "border-b border-gray-100" : ""}>
                      {/* ── Subcategory header (Tier 2 — Subtle gray bar) ── */}
                      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50/80">
                        {editingSub === sub.id ? (
                          <div className="flex w-full items-center gap-2">
                            <input type="text" value={editSubName} onChange={(e) => setEditSubName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && updateSubcategory(sub.id)} className="flex-1 min-w-0 rounded-[12px] sm:rounded-[14px] bg-white px-3 py-2 text-[13px] sm:text-[14px] font-bold outline-none border border-[var(--dynamic-color)]" autoFocus />
                            <IconButton icon={Save} colorClass="text-green-600" borderClass="bg-green-50 border-green-200 h-8 w-8 sm:h-9 sm:w-9 !rounded-[10px]" onClick={() => updateSubcategory(sub.id)} />
                            <IconButton icon={X} onClick={() => setEditingSub(null)} borderClass="h-8 w-8 sm:h-9 sm:w-9 !rounded-[10px] bg-gray-200 border-transparent" />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                              <div className="w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] rounded-full shrink-0" style={{ backgroundColor: themeColor }} />
                              <span className="text-[13px] sm:text-[14px] font-black text-gray-700 truncate">{sub.name}</span>
                              <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">{subItems.length}</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              <div className="flex items-center gap-1 border-l border-gray-200 pl-2 sm:pl-3">
                                <button onClick={() => { setEditingSub(sub.id); setEditSubName(sub.name); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5"><Edit3 size={12} /></button>
                                <button onClick={() => deleteSubcategory(sub.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5"><Trash2 size={12} /></button>
                              </div>
                              <button onClick={() => openAddItem(sub.id)} className="flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 text-[10px] sm:text-[12px] font-black text-white transition-all active:scale-95 shadow-sm" style={{ backgroundColor: themeColor }}>
                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} /> <span className="hidden xs:inline">إضافة صنف</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* ── Items inside (Tier 3 — Clean white cards) ── */}
                      {subItems.length > 0 && (
                        <div className="px-4 py-3 space-y-2 bg-white">
                          {subItems.map((item) => (
                            <div key={item.id} className={`flex items-center gap-3 rounded-[16px] p-3 transition-all group ${item.is_available ? "bg-gray-50/70 hover:bg-gray-100/70 border border-transparent hover:border-gray-200" : "bg-red-50/30 border border-red-100/50 opacity-70"}`}>
                              {/* Thumbnail */}
                              {item.image_url ? (
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-gray-200 shadow-sm ring-2 ring-white">
                                  <img src={item.image_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                              ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-gray-100 ring-2 ring-white">
                                  <Pizza size={18} className="text-gray-300" />
                                </div>
                              )}
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <span className="text-[14px] font-black text-gray-900 block truncate leading-tight">{item.name}</span>
                                <span className="text-[12px] font-bold text-gray-400 mt-0.5 block">{item.item_sizes?.map(s => `${s.price} ج`).join("  ·  ")}</span>
                              </div>
                              {/* Tags */}
                              {!item.is_available && <span className="shrink-0 text-[10px] font-black text-red-500 bg-red-100 px-2 py-0.5 rounded-full">نفذت</span>}
                              {/* Actions — Separated with gap */}
                              <div className="shrink-0 flex items-center gap-0.5 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => toggleAvailability(item)} className="p-1 sm:p-1.5 rounded-lg hover:bg-white transition-colors" title={item.is_available ? "إيقاف" : "تفعيل"}>
                                  {item.is_available ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-300" />}
                                </button>
                                <button onClick={() => openEditItem(item)} className="p-1 sm:p-1.5 rounded-lg hover:bg-white transition-colors" title="تعديل">
                                  <Edit3 size={14} className="text-gray-400" />
                                </button>
                                <button onClick={() => deleteItem(item.id)} className="p-1 sm:p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="حذف">
                                  <Trash2 size={14} className="text-gray-300 hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {subItems.length === 0 && (
                        <div className="px-5 py-5 flex items-center justify-center">
                          <button onClick={() => openAddItem(sub.id)} className="text-[13px] font-bold text-gray-400 hover:text-[var(--dynamic-color)] transition-colors flex items-center gap-2">
                            <Plus size={16} className="opacity-50" /> أضف أول صنف في {sub.name}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {catSubs.length === 0 && (
                  <div className="px-5 py-6 text-center">
                    <p className="text-[13px] font-medium text-gray-400 mb-1">لا يوجد تصنيفات فرعية بعد</p>
                    <p className="text-[11px] text-gray-300">أضف تصنيفاً فرعياً أدناه لتبدأ بإضافة الأصناف</p>
                  </div>
                )}
              </div>

              {/* ── Add Subcategory Footer (Tier flush) ── */}
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                <input type="text" placeholder={`+ تصنيف فرعي جديد...`} value={newSubNames[cat.id] || ""} onChange={(e) => setNewSubNames({ ...newSubNames, [cat.id]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addSubcategory(cat.id)} className="flex-1 rounded-[14px] bg-white border border-gray-200 px-4 py-2.5 text-[13px] font-bold text-gray-700 outline-none placeholder:text-gray-400 focus:border-[var(--dynamic-color)] transition-colors" />
                <button onClick={() => addSubcategory(cat.id)} className="flex h-9 w-9 items-center justify-center rounded-[12px] text-white transition-all active:scale-90" style={{ backgroundColor: themeColor }}>
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && <EmptyState text="ابدأ بإنشاء قسم رئيسي أولاً." />}
        </div>
      </div>
        
      <PrintableMenu restaurant={restaurant} categories={categories} subcategories={subcategories} items={items} themeColor={themeColor} />
    </div>
  );
}
