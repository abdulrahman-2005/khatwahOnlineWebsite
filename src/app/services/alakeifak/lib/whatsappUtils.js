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
  items,
  deliveryZone,
  subtotal,
  total,
  customerName,
  customerPhone,
  deliveryAddress,
  restaurantName,
  orderType,
}) {
  const typeLabels = { delivery: '🚚 توصيل', pickup: '🥡 استلام', in_house: '🍽️ داخلي' };
  
  let msg = `🧾 طلب من ${restaurantName}\n`;
  msg += `📦 ${typeLabels[orderType] || typeLabels.delivery}\n\n`;
  
  msg += `🛒 *الطلب:*\n`;
  items.forEach((item, idx) => {
    let itemLine = `${item.quantity}x ${item.itemName} (${item.size.name})`;
    if (item.extras.length > 0) {
      itemLine += ` + ${item.extras.map(e => e.name).join(',')}`;
    }
    const itemTotal = (item.size.price + item.extras.reduce((s, e) => s + e.price, 0)) * item.quantity;
    msg += `${itemLine} = ${itemTotal.toFixed(0)}ج\n`;
  });
  
  msg += `\n💰 *الحساب:*\n`;
  msg += `الطلب: ${subtotal.toFixed(0)}ج\n`;
  if (orderType === 'delivery' && deliveryZone) {
    msg += `توصيل (${deliveryZone.region_name}): ${deliveryZone.fee.toFixed(0)}ج\n`;
  }
  msg += `*الإجمالي: ${total.toFixed(0)} جنيه*\n\n`;
  
  msg += `👤 *العميل:*\n${customerName} - ${customerPhone}\n`;
  if (orderType === 'delivery' && deliveryAddress) {
    msg += `${deliveryAddress}\n`;
  }
  
  return msg;
}

/**
 * Generate a WhatsApp URL with the formatted order message
 * 
 * @param {string} whatsappNumber - Including country code (e.g., +201234567890)
 * @param {Object} orderData - Same params as formatOrderMessage
 * @returns {string} Full wa.me URL
 */
export function generateWhatsAppUrl(whatsappNumber, orderData) {
  const message = formatOrderMessage(orderData);
  // Remove the + prefix and any spaces
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
