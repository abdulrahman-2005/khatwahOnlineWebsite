"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Truck, Trash2, Plus } from "lucide-react";
import { LoadingSpinner, EmptyState, InputField, PrimaryBtn, NeoRow, IconButton } from "../ui/PartnerUI";

export default function ZonesTab({ restaurantId }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState("");

  const fetchZones = useCallback(async () => {
    const { data } = await supabase.from("delivery_zones").select("*").eq("restaurant_id", restaurantId).order("region_name");
    setZones(data || []); setLoading(false);
  }, [restaurantId]);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  const addZone = async () => {
    if (!newName.trim() || !newFee) return;
    await supabase.from("delivery_zones").insert({ restaurant_id: restaurantId, region_name: newName.trim(), fee: Number(newFee) });
    setNewName(""); setNewFee(""); fetchZones();
  };

  const deleteZone = async (id) => {
    if(!confirm("حذف منطقة التوصيل؟")) return;
    await supabase.from("delivery_zones").delete().eq("id", id);
    fetchZones();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 flex flex-col sm:flex-row gap-4 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
        <InputField placeholder="اسم المنطقة أو الحي المستهدف" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <InputField type="number" placeholder="قيمة التوصيل (ج)" dir="ltr" value={newFee} onChange={(e) => setNewFee(e.target.value)} className="sm:w-48 text-right bg-blue-50/50" />
        <PrimaryBtn icon={Plus} onClick={addZone} className="sm:w-48 shrink-0 py-4 h-max mt-auto shadow-[0_10px_20px_-5px_rgba(59,130,246,0.5)] bg-blue-500">حفظ النطاق</PrimaryBtn>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {zones.map((zone) => (
          <NeoRow key={zone.id}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-50 border border-blue-100 text-blue-500">
                <Truck size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-black text-gray-900">{zone.region_name}</span>
                <span className="text-[14px] font-bold text-gray-500">{Number(zone.fee) === 0 ? "توصيل مجاني" : `${zone.fee} ج.م فقط`}</span>
              </div>
            </div>
            <IconButton icon={Trash2} colorClass="text-red-500" borderClass="bg-red-50 hover:bg-red-100 border-red-100 h-11 w-11 !rounded-[16px]" onClick={() => deleteZone(zone.id)} />
          </NeoRow>
        ))}
      </div>
      {zones.length === 0 && <EmptyState text="قم بتحديد النطاق الجغرافي لخدمة التوصيل الخاصة بك" icon={Truck} />}
    </div>
  );
}
