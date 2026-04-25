"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { compressImage, uploadImage, fileToDataUrl } from "../../../lib/imageUtils";
import { Plus, X, Loader2, UploadCloud, UtensilsCrossed, Edit3, Trash2, ToggleRight, ToggleLeft } from "lucide-react";
import { LoadingSpinner, EmptyState, PrimaryBtn, InputField, IconButton } from "../ui/PartnerUI";

export default function ExtrasTab({ restaurantId }) {
  const [extras, setExtras] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingExtra, setEditingExtra] = useState(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingExtra(null);
    setNewName("");
    setNewPrice("");
    setSelectedSubcategories([]);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (showForm) {
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  }, [showForm]);

  const fetchData = useCallback(async () => {
    // Fetch extras
    const { data: exData } = await supabase.from("extras").select("*").eq("restaurant_id", restaurantId).order("created_at", { ascending: false });
    // Fetch available subcategories logic seamlessly
    const { data: catData } = await supabase.from("categories").select("*").eq("restaurant_id", restaurantId);
    let allSubcats = [];
    if (catData && catData.length > 0) {
      const catIds = catData.map(c => c.id);
      const { data: subData } = await supabase.from("subcategories").select("*").in("category_id", catIds);
      allSubcats = subData || [];
    }
    setSubcategories(allSubcats);
    setExtras(exData || []);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);
      setImagePreview(await fileToDataUrl(compressed));
    } catch { /* ignore */ }
    setCompressing(false);
  };

  const toggleSubcategory = (id) => {
    if (selectedSubcategories.includes(id)) {
      setSelectedSubcategories(selectedSubcategories.filter(s => s !== id));
    } else {
      setSelectedSubcategories([...selectedSubcategories, id]);
    }
  };

  const saveExtra = async () => {
    if (!newName.trim() || !newPrice) return;
    setSaving(true);
    try {
      let imageUrl = editingExtra ? editingExtra.image_url : null;
      if (imageFile) imageUrl = await uploadImage(imageFile, 'items');

      const payload = {
        restaurant_id: restaurantId, 
        name: newName.trim(), 
        price: Number(newPrice),
        image_url: imageUrl,
        suggested_subcategories: selectedSubcategories
      };

      if (editingExtra) {
        await supabase.from("extras").update(payload).eq("id", editingExtra.id);
      } else {
        await supabase.from("extras").insert(payload);
      }
      resetForm(); fetchData();
    } catch { }
    setSaving(false);
  };

  const openEditExtra = (extra) => {
    setEditingExtra(extra);
    setNewName(extra.name);
    setNewPrice(String(extra.price));
    setSelectedSubcategories(extra.suggested_subcategories || []);
    setImagePreview(extra.image_url);
    setShowForm(true);
  };

  const deleteExtra = async (id) => {
    if(!confirm("إلغاء الإضافة نهائياً؟")) return;
    await supabase.from("extras").delete().eq("id", id);
    fetchData();
  };

  const toggleAvailability = async (extra) => {
    await supabase.from("extras").update({ is_available: !extra.is_available }).eq("id", extra.id);
    fetchData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {!showForm ? (
        <div className="mb-8 text-right">
          <PrimaryBtn icon={Plus} onClick={() => { resetForm(); setShowForm(true); }} className="w-full sm:w-max mx-auto sm:mx-0">إضافة جديدة</PrimaryBtn>
        </div>
      ) : (
        <div className="mb-10 p-6 bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[20px] font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
              {editingExtra ? "تعديل الإضافة" : "ابتكار صنف جانبي (إضافة)"}
            </h3>
            <IconButton icon={X} onClick={resetForm} />
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField placeholder="الاسم (هالبينو، بطاطس، ببسي)" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <InputField type="number" placeholder="القيمة ج.م" dir="ltr" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="sm:w-48 text-right bg-orange-50/30" />
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-[24px] border border-gray-100">
              <h4 className="text-[15px] font-bold text-gray-700">اقترح هذا الصنف عند اختيار العميل لأصناف من الأقسام التالية:</h4>
              <div className="flex flex-wrap gap-2">
                {subcategories.map(sub => (
                  <button 
                    key={sub.id} 
                    onClick={() => toggleSubcategory(sub.id)}
                    className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${selectedSubcategories.includes(sub.id) ? "bg-[var(--dynamic-color)] text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
                  >
                    {sub.name}
                  </button>
                ))}
                {subcategories.length === 0 && <span className="text-[13px] text-gray-500">يرجى إضافة أقسام فرعية أولاً</span>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-[24px] border border-gray-100">
              {compressing ? (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] bg-white border border-gray-200"><Loader2 size={24} className="animate-spin text-[var(--dynamic-color)]" /></div>
              ) : imagePreview ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] border-2 border-white shadow-sm bg-white">
                  <img src={imagePreview} alt="الصورة" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] bg-white border border-dashed border-gray-200">
                  <UploadCloud size={24} className="text-gray-300" />
                </div>
              )}
              
              <div className="flex-1">
                <label className="inline-flex cursor-pointer text-center w-full sm:w-auto items-center justify-center bg-white px-5 py-3 rounded-xl border border-gray-200 text-[14px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50">
                  <span>رفع صورة (اختياري)</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} disabled={compressing} className="hidden" />
                </label>
              </div>
            </div>

            <PrimaryBtn onClick={saveExtra} disabled={saving || compressing || !newName || !newPrice} className="w-full">
              {saving ? <Loader2 size={20} className="animate-spin text-white" /> : (editingExtra ? "حفظ التعديلات" : "حفظ الصنف الجانبي")}
            </PrimaryBtn>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {extras.map((extra) => (
          <div key={extra.id} className="flex items-start justify-between gap-4 rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start gap-4 flex-1">
              {extra.image_url ? (
                <div className="flex h-[56px] w-[56px] overflow-hidden rounded-[16px] border border-gray-100 bg-gray-50 shrink-0 mt-1">
                  <img src={extra.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[16px] bg-gray-50 border border-gray-100 mt-1">
                  <UtensilsCrossed size={20} className="text-gray-300" />
                </div>
              )}
              <div className="flex flex-col flex-1">
                <span className="text-[17px] font-black text-gray-900">{extra.name}</span>
                <span className="text-[14px] font-bold text-[var(--dynamic-color)]">+{extra.price} ج.م</span>
                
                {/* Visual indicator of smart linking */}
                {extra.suggested_subcategories && extra.suggested_subcategories.length > 0 ? (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">مقترح لـ {extra.suggested_subcategories.length} أقسام</span>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] font-bold text-orange-400">صنف مستقل فقط (غير مقترح لأقسام مبطنة)</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => toggleAvailability(extra)} className="hover:scale-105 transition-transform bg-gray-50 p-1 rounded-full border border-gray-100">
                {extra.is_available ? <ToggleRight size={32} className="text-[var(--dynamic-color)]" /> : <ToggleLeft size={32} className="text-gray-300" />}
              </button>
              <IconButton icon={Edit3} onClick={() => openEditExtra(extra)} borderClass="h-10 w-10 !rounded-[12px]" colorClass="text-gray-600" />
              <IconButton icon={Trash2} colorClass="text-red-500" borderClass="bg-red-50 hover:bg-red-100 border-red-100 h-10 w-10 !rounded-[12px]" onClick={() => deleteExtra(extra.id)} />
            </div>
          </div>
        ))}
      </div>
      {extras.length === 0 && <EmptyState text="لا يوجد أية أطباق جانبية أو إضافات مقترحة." icon={UtensilsCrossed} />}
    </div>
  );
}
