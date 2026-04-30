import { create } from 'zustand';

/**
 * Cart Store — Zustand-based shopping cart for alakeifak
 * 
 * Cart item shape:
 * {
 *   cartItemId: string (unique per cart entry),
 *   itemId: string,
 *   itemName: string,
 *   imageUrl: string,
 *   size: { id, name, price },
 *   extras: [{ id, name, price }],
 *   quantity: number,
 * }
 * 
 * Price Calculation:
 * Cart total = Σ (size.price × quantity + Σextras.price × quantity) + deliveryFee
 */
export const useCartStore = create((set, get) => ({
  items: [],
  deliveryZone: null,  // { id, region_name, fee }
  orderType: 'delivery', // 'delivery' | 'pickup' | 'in_house'
  restaurantSlug: null,

  // Initialize cart from localStorage for a specific restaurant
  initCart: (slug) => {
    try {
      const saved = localStorage.getItem(`khatwah_alakeifak_cart_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ items: parsed.items || [], deliveryZone: parsed.deliveryZone || null, orderType: parsed.orderType || 'delivery', restaurantSlug: slug });
      } else {
        set({ items: [], deliveryZone: null, orderType: 'delivery', restaurantSlug: slug });
      }
    } catch {
      set({ items: [], deliveryZone: null, orderType: 'delivery', restaurantSlug: slug });
    }
  },

  // Persist to localStorage
  _persist: () => {
    const { items, deliveryZone, orderType, restaurantSlug } = get();
    if (restaurantSlug) {
      localStorage.setItem(
        `khatwah_alakeifak_cart_${restaurantSlug}`,
        JSON.stringify({ items, deliveryZone, orderType })
      );
    }
  },

  addItem: (item) => {
    const cartItemId = `${item.itemId}_${item.size.id}_${item.extras.map(e => e.id).sort().join(',')}`;
    
    set((state) => {
      const existing = state.items.find(i => i.cartItemId === cartItemId);
      
      let newItems;
      if (existing) {
        newItems = state.items.map(i =>
          i.cartItemId === cartItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...state.items, { ...item, cartItemId }];
      }
      
      return { items: newItems };
    });
    
    get()._persist();
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter(i => i.cartItemId !== cartItemId),
    }));
    get()._persist();
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    
    set((state) => ({
      items: state.items.map(i =>
        i.cartItemId === cartItemId ? { ...i, quantity } : i
      ),
    }));
    get()._persist();
  },

  setDeliveryZone: (zone) => {
    set({ deliveryZone: zone });
    get()._persist();
  },

  setOrderType: (type) => {
    set({ orderType: type });
    get()._persist();
  },

  clearCart: () => {
    const { restaurantSlug } = get();
    set({ items: [], deliveryZone: null, orderType: 'delivery' });
    if (restaurantSlug) {
      localStorage.removeItem(`khatwah_alakeifak_cart_${restaurantSlug}`);
    }
  },

  // Computed values
  getItemTotal: (cartItem) => {
    const sizePrice = cartItem.size.price * cartItem.quantity;
    const extrasPrice = cartItem.extras.reduce((sum, e) => sum + e.price, 0) * cartItem.quantity;
    return sizePrice + extrasPrice;
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      const sizePrice = item.size.price * item.quantity;
      const extrasPrice = item.extras.reduce((sum, e) => sum + e.price, 0) * item.quantity;
      return total + sizePrice + extrasPrice;
    }, 0);
  },

  getDeliveryFee: () => {
    const { deliveryZone, orderType } = get();
    // No delivery fee for pickup or in-house orders
    if (orderType !== 'delivery') return 0;
    return deliveryZone?.fee || 0;
  },

  getTotal: () => {
    return get().getSubtotal() + get().getDeliveryFee();
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));
