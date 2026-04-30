/**
 * WhatsApp Order Formatting Utilities
 * Generates URL-encoded WhatsApp messages from cart data
 */

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
}) {
  const lines = [];
  
  const typeLabels = { delivery: '🚚 توصيل', pickup: '🥡 استلام من المحل', in_house: '🍽️ طلب داخلي' };
  
  lines.push(`🧾 طلب جديد — ${restaurantName}`);
  lines.push(`📋 رقم التتبع: ${trackingId}`);
  lines.push(`📦 النوع: ${typeLabels[orderType] || typeLabels.delivery}`);
  if (orderType === 'in_house' && tableNumber) {
    lines.push(`🪑 طاولة رقم: ${tableNumber}`);
  }
  lines.push('─'.repeat(20));
  lines.push('');
  
  // Cart items
  lines.push('🛒 *تفاصيل الطلب:*');
  lines.push('');
  
  items.forEach((item, idx) => {
    lines.push(`${idx + 1}. *${item.itemName}*`);
    lines.push(`   الحجم: ${item.size.name} — ${item.size.price} جنيه`);
    
    if (item.extras.length > 0) {
      const extrasText = item.extras.map(e => `${e.name} (+${e.price})`).join('، ');
      lines.push(`   إضافات: ${extrasText}`);
    }
    
    lines.push(`   الكمية: ${item.quantity}`);
    
    const itemTotal = (item.size.price + item.extras.reduce((s, e) => s + e.price, 0)) * item.quantity;
    lines.push(`   المجموع: ${itemTotal.toFixed(2)} جنيه`);
    lines.push('');
  });
  
  lines.push('─'.repeat(20));
  lines.push(`💰 المجموع الفرعي: ${subtotal.toFixed(2)} جنيه`);
  
  if (orderType === 'delivery' && deliveryZone) {
    lines.push(`🚚 التوصيل (${deliveryZone.region_name}): ${deliveryZone.fee.toFixed(2)} جنيه`);
  }
  
  lines.push(`💵 *الإجمالي: ${total.toFixed(2)} جنيه*`);
  lines.push('');
  lines.push('─'.repeat(20));
  lines.push('');
  lines.push('👤 *بيانات العميل:*');
  lines.push(`الاسم: ${customerName}`);
  lines.push(`الهاتف: ${customerPhone}`);
  
  if (orderType === 'delivery' && deliveryAddress) {
    lines.push(`العنوان: ${deliveryAddress}`);
  }
  
  lines.push('');
  lines.push('─'.repeat(20));
  lines.push('💳 الدفع عند الاستلام');
  lines.push('');
  lines.push('_طلب عبر khatwah.online/services/alakeifak_');
  
  return lines.join('\n');
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
