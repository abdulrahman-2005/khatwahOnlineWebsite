/**
 * Notification utilities for the Partner OMS.
 * Handles audio pings and browser notifications for new orders.
 */

let audioContext = null;

/**
 * Play a notification sound using the Web Audio API.
 * Uses a pleasant two-tone chime that's attention-grabbing but not jarring.
 */
export function playOrderSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const now = audioContext.currentTime;

    // First tone (higher)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone (lower, delayed)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1175, now + 0.15); // D6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn("Audio notification failed:", e);
  }
}

/**
 * Request browser notification permission.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Show a browser notification for a new order.
 */
export function showOrderNotification(order) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const orderType = order.order_type === "pickup" 
    ? "🥡 استلام" 
    : order.order_type === "in_house" 
    ? "🍽️ داخلي" 
    : "🚚 توصيل";

  const notification = new Notification("🔔 طلب جديد!", {
    body: `${order.customer_name} — ${Number(order.total_amount).toFixed(0)} ج.م\n${orderType} • ${order.tracking_id}`,
    icon: "/services/alakeifak/assets/logo.png",
    tag: `order-${order.id}`,
    requireInteraction: true,
  });

  // Auto-close after 10 seconds
  setTimeout(() => notification.close(), 10000);
}

/**
 * Format a relative time string in Arabic (e.g., "منذ 5 دقائق")
 */
export function getRelativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 30) return "الآن";
  if (diffSec < 60) return `منذ ${diffSec} ثانية`;
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHour < 24) return `منذ ${diffHour} ساعة`;
  return `منذ ${diffDay} يوم`;
}
