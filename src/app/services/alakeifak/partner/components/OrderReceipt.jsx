"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";

/**
 * OrderReceipt — Thermal-receipt optimized print view (80mm width).
 * Uses CSS @media print to render a clean receipt format.
 */

const ORDER_TYPE_LABELS = {
  delivery: "🚚 توصيل",
  pickup: "🥡 استلام",
  in_house: "🍽️ داخلي",
};

export default function OrderReceipt({ order, restaurantName, onClose }) {
  const receiptRef = useRef(null);

  const cart = order.cart_snapshot || [];
  const createdAt = new Date(order.created_at);
  const timeStr = createdAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  const dateStr = createdAt.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });

  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=320,height=600");
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>Receipt ${order.tracking_id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            padding: 4mm;
            font-size: 12px;
            color: #000;
            background: #fff;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
          }
          .item-name { flex: 1; }
          .item-price { text-align: left; white-space: nowrap; padding-right: 8px; }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 14px;
            padding: 4px 0;
          }
          .header { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
          .small { font-size: 10px; color: #666; }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border: 1px solid #000;
            border-radius: 4px;
            font-size: 11px;
            margin: 4px 0;
          }
          @media print {
            body { width: 80mm; }
            @page { size: 80mm auto; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="header">${restaurantName || "على كيفك"}</div>
          <div class="small">khatwah.online/alakeifak</div>
          <div class="divider"></div>
        </div>

        <div class="row">
          <span class="bold">رقم الطلب:</span>
          <span class="bold">${order.tracking_id}</span>
        </div>
        <div class="row">
          <span>التاريخ:</span>
          <span>${dateStr} ${timeStr}</span>
        </div>
        <div class="row">
          <span>النوع:</span>
          <span class="badge">${ORDER_TYPE_LABELS[order.order_type] || ORDER_TYPE_LABELS.delivery}</span>
        </div>
        ${order.table_number ? `<div class="row"><span>طاولة:</span><span class="bold">${order.table_number}</span></div>` : ""}

        <div class="divider"></div>

        <div class="row">
          <span class="bold">العميل:</span>
          <span>${order.customer_name}</span>
        </div>
        <div class="row">
          <span>الهاتف:</span>
          <span dir="ltr">${order.customer_phone}</span>
        </div>
        ${order.delivery_address ? `<div class="row"><span>العنوان:</span><span>${order.delivery_address}</span></div>` : ""}

        <div class="divider"></div>
        <div class="center bold" style="padding: 4px 0;">تفاصيل الطلب</div>
        <div class="divider"></div>

        ${cart.map((item) => {
          const itemTotal = item.quantity * (Number(item.size?.price || 0) + (item.extras?.reduce((s, e) => s + Number(e.price), 0) || 0));
          return `
            <div class="row">
              <span class="item-name">×${item.quantity} ${item.itemName}${item.size?.name ? ` (${item.size.name})` : ""}</span>
              <span class="item-price">${itemTotal.toFixed(0)}</span>
            </div>
            ${item.extras?.length > 0 ? `<div class="small" style="padding-right: 12px;">+ ${item.extras.map(e => e.name).join("، ")}</div>` : ""}
          `;
        }).join("")}

        <div class="divider"></div>
        <div class="total-row">
          <span>الإجمالي</span>
          <span>${Number(order.total_amount).toFixed(0)} ج.م</span>
        </div>
        <div class="divider"></div>

        <div class="center small" style="padding-top: 8px;">
          شكراً لك — على كيفك 🧡
        </div>

        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        {/* Preview */}
        <div ref={receiptRef} className="p-6 space-y-3 text-center font-mono text-sm" dir="rtl">
          <h3 className="text-lg font-black">{restaurantName}</h3>
          <div className="border-t border-dashed border-gray-300 my-2" />
          <div className="flex justify-between text-xs">
            <span className="font-bold">رقم الطلب:</span>
            <span className="font-black">{order.tracking_id}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>
          <div className="border-t border-dashed border-gray-300 my-2" />
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <span>×{item.quantity} {item.itemName}</span>
              <span>{(item.quantity * (Number(item.size?.price || 0) + (item.extras?.reduce((s, e) => s + Number(e.price), 0) || 0))).toFixed(0)}</span>
            </div>
          ))}
          <div className="border-t border-dashed border-gray-300 my-2" />
          <div className="flex justify-between font-black text-base">
            <span>الإجمالي</span>
            <span>{Number(order.total_amount).toFixed(0)} ج.م</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-black text-white hover:bg-black transition-all active:scale-[0.98]"
          >
            <Printer size={16} />
            طباعة
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-black text-gray-600 hover:bg-gray-50 transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
