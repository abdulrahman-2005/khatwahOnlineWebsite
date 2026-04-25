"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { compressImage, uploadImage, fileToDataUrl } from "../../../lib/imageUtils";
import { Plus, X, Loader2, UploadCloud, UtensilsCrossed, Edit3, Trash2, ToggleRight, ToggleLeft, Save } from "lucide-react";
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
      
      <div className="mb-8 text-right">
        <PrimaryBtn icon={Plus} onClick={() => { resetForm(); setShowForm(true); }} className="w-full sm:w-max mx-auto sm:mx-0">إضافة جديدة</PrimaryBtn>
      </div>

      {/* ═══ Extras Form Modal ═══ */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={resetForm}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-500" />
          
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[36px] bg-white p-6 sm:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 scrollbar-hide"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2 -mx-2 px-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[var(--dynamic-color)]/10">
                  <UtensilsCrossed size={22} className="text-[var(--dynamic-color)]" />
                </div>
                <div>
                  <h3 className="text-[20px] sm:text-[24px] font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                    {editingExtra ? "تعديل الإضافة" : "إضافة جديدة للمنيو"}
                  </h3>
                  <p className="text-[12px] font-bold text-gray-400">ابتكر صنف جانبي أو إضافة ذكية لعملائك</p>
                </div>
              </div>
              <IconButton icon={X} onClick={resetForm} borderClass="h-11 w-11 bg-gray-50 border-gray-100 !rounded-[16px]" />
            </div>

            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <InputField label="اسم الصنف الجانبي" placeholder="مثلاً: صوص ثوم، بطاطس عائلية" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <InputField label="السعر الإضافي" type="number" placeholder="0" dir="ltr" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="text-right" />
              </div>

              {/* Smart Linking Section */}
              <div className="space-y-4 p-6 bg-gray-50 rounded-[30px] border border-gray-100">
                <div>
                  <h4 className="text-[16px] font-black text-gray-800">الربط الذكي (اقتراحات الأقسام)</h4>
                  <p className="text-[12px] font-bold text-gray-400 mt-1">سيظهر هذا الصنف كإضافة مقترحة عند اختيار أي صنف من هذه الأقسام:</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {subcategories.map(sub => (
                    <button 
                      key={sub.id} 
                      onClick={() => toggleSubcategory(sub.id)}
                      className={`px-4 py-2.5 rounded-[16px] text-[13px] font-black transition-all border-2 ${
                        selectedSubcategories.includes(sub.id) 
                          ? "bg-[var(--dynamic-color)] text-white border-transparent shadow-md scale-105" 
                          : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {selectedSubcategories.includes(sub.id) && "✓ "}
                      {sub.name}
                    </button>
                  ))}
                  {subcategories.length === 0 && (
                    <div className="py-4 text-center w-full">
                      <span className="text-[13px] font-bold text-orange-400">يرجى إضافة أقسام فرعية في "منظم المنيو" لتتمكن من الربط</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[30px] border-2 border-dashed border-gray-200 hover:border-[var(--dynamic-color)]/30 transition-colors">
                {compressing ? (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] bg-gray-50"><Loader2 size={32} className="animate-spin text-[var(--dynamic-color)]" /></div>
                ) : imagePreview ? (
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[24px] border-4 border-white shadow-md ring-1 ring-gray-100">
                    <img src={imagePreview} alt="الصورة" className="h-full w-full object-cover" />
                    <button onClick={(e) => { e.preventDefault(); setImagePreview(null); setImageFile(null); }} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Trash2 size={24} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] bg-gray-50 text-gray-300">
                    <UploadCloud size={40} strokeWidth={1.5} />
                  </div>
                )}
                
                <div className="flex-1 text-center sm:text-right">
                  <h5 className="text-[15px] font-black text-gray-800 mb-1">صورة الإضافة</h5>
                  <p className="text-[12px] font-bold text-gray-400 mb-4">اجعل الصنف أكثر جاذبية بإضافة صورة مشهية</p>
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-gray-200 text-[14px] font-black text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-95">
                    <UploadCloud size={18} />
                    <span>{imagePreview ? "تغيير الصورة" : "رفع صورة"}</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={compressing} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={resetForm}
                  className="flex-1 py-4 px-6 rounded-[24px] border border-gray-200 text-gray-500 text-[16px] font-black hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <PrimaryBtn 
                  onClick={saveExtra} 
                  disabled={saving || compressing || !newName || !newPrice} 
                  className="flex-[2] py-4 rounded-[24px] text-[18px]"
                >
                  {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                  {editingExtra ? "حفظ التغييرات" : "اعتماد الإضافة"}
                </PrimaryBtn>
              </div>
            </div>
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
