/**
 * WhatsApp Order Formatting Utilities
 * Generates URL-encoded WhatsApp messages from cart data
 */

export function formatEgyptianPhone(phone) {
  if (!phone) return "";
  let p = String(phone).trim().replace(/[\s\-\(\)]/g, "");
  if (p.startsWith("01")) p = "+20" + p.substring(1);
  else if (p.startsWith("10") || p.startsWith("11") || p.startsWith("12") || p.startsWith("15")) p = "+20" + p;
  else if (p.startsWith("201")) p = "+" + p;
  return p;
}

export function isValidEgyptianPhone(phone) {
  const p = formatEgyptianPhone(phone);
  return /^\+201[0125][0-9]{8}$/.test(p);
}

/**
 * Format cart items into a structured Arabic WhatsApp message
 * 
 * @param {Object} params
 * @param {string} params.trackingId - Order tracking ID (e.g., #ORD-9A2F)
 * @param {Array} params.items - Cart items array from Zustand store
 * @param {Object} params.deliveryZone - { region_name, fee }
 * @param {number} params.subtotal - Items subtotal
 * @param {number} params.total - Grand total
 * @param {string} params.customerName
 * @param {string} params.customerPhone
 * @param {string} params.deliveryAddress
 * @param {string} params.restaurantName
 * @returns {string} Formatted message string
 */
 export function formatOrderMessage({
  trackingId,
  orderCount,
  items,
  deliveryZone,
  subtotal,
  total,
  customerName,
  customerPhone,
  deliveryAddress,
  restaurantName,
  orderType,
  tableNumber,
  showDeliveryPricing = true,
}) {
  const typeLabels = { delivery: ' توصيل', pickup: ' استلام', in_house: ' داخلي' };
  
  // Format the header elegantly depending on what info is available
  const headerText = trackingId ? `رقم ${trackingId}` : (orderCount ? `رقم ${orderCount}` : `جديد`);
  let msg = `*طلب ${headerText} - بواسطة خدمة خطوة اونلاين*\n\n`;
  
  msg += `نوع الاستلام:  ${typeLabels[orderType] || typeLabels.delivery}\n`;
  msg += `\n`;
  
  msg += `*الطلب:*\n`;
  items.forEach((item, idx) => {
    const itemTotal = item.quantity * (item.size.price + item.extras.reduce((s, e) => s + (e.price * (e.quantity || 1)), 0));
    let itemLine = `عدد [${item.quantity}] ${item.itemName} (${item.size.name})`;
    if (item.extras && item.extras.length > 0) {
      item.extras.forEach(e => {
        itemLine += `\n  + ${e.name} ${Number(e.quantity || 1) > 1 ? `(x${e.quantity})` : ''}`;
      });
    }
    msg += `${itemLine}\n السعر: ${itemTotal.toFixed(0)}ج\n`;
    
    // Add separator line between items, but not after the last one
    if (idx < items.length - 1) {
      msg += `--------------------------\n`;
    }
  });
  
  msg += `\n*الحساب:*\n`;
  msg += `الطلب: ${subtotal.toFixed(0)}ج\n`;
  if (orderType === 'delivery' && deliveryZone && showDeliveryPricing) {
    msg += `توصيل (${deliveryZone.region_name}): ${deliveryZone.fee.toFixed(0)}ج\n`;
  }
  msg += `*الإجمالي: ${total.toFixed(0)} جنيه*\n\n`;
  
  msg += `*العميل:*\n${customerName} - ${customerPhone}\n`;
  if (orderType === 'delivery' && deliveryAddress) {
    msg += `${deliveryAddress}\n`;
  }
  
  return msg;
}

/**
 * Generate a robust WhatsApp URL.
 *
 * FIX 1: Use wa.me instead of api.whatsapp.com/send
 *   → wa.me is WhatsApp's official universal link. iOS treats it as a
 *     deep link and reliably opens the app rather than a browser tab.
 *
 * FIX 2: Use plain encodeURIComponent — no extra regex.
 *   → The previous regex encoded * → %2A, which broke bold formatting
 *     and caused parse failures in some iOS WebKit in-app browsers.
 *     encodeURIComponent is sufficient for the text= query param.
 */
export function generateWhatsAppUrl(whatsappNumber, orderData) {
  const message = formatOrderMessage(orderData);

  // wa.me requires digits only — no +, spaces, or dashes
  const cleanNumber = (whatsappNumber || '').replace(/[^0-9]/g, '');

  // Standard encoding — do NOT add extra regex on top
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Open a WhatsApp URL reliably on iOS, Android, and in-app browsers.
 *
 * FIX 3: In-app browsers (Instagram, TikTok, Facebook on iOS) use WKWebView,
 * which silently blocks window.open() unless it's the *direct* result of a
 * tap event. Creating and clicking a hidden <a> element keeps us inside the
 * trusted user-gesture window and bypasses WKWebView's popup blocker.
 *
 * Usage:
 *   const url = generateWhatsAppUrl(phone, orderData);
 *   openWhatsAppUrl(url);  // call this directly inside your onClick handler
 */
export function openWhatsAppUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener noreferrer';
  // target="_blank" lets desktop browsers open a new tab
  // On iOS it deep-links into the app instead
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}