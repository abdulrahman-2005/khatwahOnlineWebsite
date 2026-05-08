/**
 * ═══════════════════════════════════════════════════════════════
 * ALAKEIFAK — UNIT TESTS: Cart Store (Zustand)
 * ═══════════════════════════════════════════════════════════════
 *
 * Tests the pure business logic of the shopping cart:
 *  - Adding/removing items
 *  - Quantity updates
 *  - Price calculations (subtotal, delivery fee, total)
 *  - Cart ID generation (deduplication logic)
 *  - Edge cases (zero quantity, empty cart, etc.)
 *
 * Run:  npx vitest run src/app/services/alakeifak/__tests__/unit/cartStore.test.js
 * ═══════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing the store
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Now import the store
const { useCartStore } = await import('../../lib/cartStore.js');

// ── Test Fixtures ───────────────────────────────────────────────
const ITEM_PANEH = {
  itemId: 'item-1',
  itemName: 'كريب بانيه',
  imageUrl: '/test.webp',
  size: { id: 'size-1', name: 'وسط', price: 70 },
  extras: [{ id: 'extra-1', name: 'مخلل', price: 15 }],
  quantity: 1,
};

const ITEM_PANEH_LARGE = {
  ...ITEM_PANEH,
  size: { id: 'size-2', name: 'كبير', price: 100 },
};

const ITEM_STEAK = {
  itemId: 'item-2',
  itemName: 'كريب ستيك',
  imageUrl: '/test2.webp',
  size: { id: 'size-3', name: 'عادي', price: 120 },
  extras: [],
  quantity: 2,
};

const DELIVERY_ZONE = { id: 'zone-1', region_name: 'العريش', fee: 20 };

// ── Tests ───────────────────────────────────────────────────────
describe('CartStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    const store = useCartStore.getState();
    store.clearCart();
    store.initCart('test-restaurant');
  });

  describe('Adding Items', () => {
    it('should add an item to empty cart', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].itemName).toBe('كريب بانيه');
    });

    it('should merge identical items (same size + same extras)', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      useCartStore.getState().addItem(ITEM_PANEH);
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    it('should NOT merge items with different sizes', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      useCartStore.getState().addItem(ITEM_PANEH_LARGE);
      expect(useCartStore.getState().items).toHaveLength(2);
    });

    it('should keep different items separate', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      useCartStore.getState().addItem(ITEM_STEAK);
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe('Removing Items', () => {
    it('should remove an item by cartItemId', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      const cartItemId = useCartStore.getState().items[0].cartItemId;
      useCartStore.getState().removeItem(cartItemId);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('should only remove the targeted item', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      useCartStore.getState().addItem(ITEM_STEAK);
      const cartItemId = useCartStore.getState().items[0].cartItemId;
      useCartStore.getState().removeItem(cartItemId);
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].itemName).toBe('كريب ستيك');
    });
  });

  describe('Quantity Updates', () => {
    it('should update quantity for a specific item', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      const cartItemId = useCartStore.getState().items[0].cartItemId;
      useCartStore.getState().updateQuantity(cartItemId, 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('should remove item when quantity set to 0', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      const cartItemId = useCartStore.getState().items[0].cartItemId;
      useCartStore.getState().updateQuantity(cartItemId, 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('should remove item when quantity set to negative', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      const cartItemId = useCartStore.getState().items[0].cartItemId;
      useCartStore.getState().updateQuantity(cartItemId, -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('Price Calculations', () => {
    it('should calculate subtotal correctly (size + extras) × quantity', () => {
      useCartStore.getState().addItem(ITEM_PANEH); // 70 + 15 = 85
      expect(useCartStore.getState().getSubtotal()).toBe(85);
    });

    it('should calculate subtotal for multiple items', () => {
      useCartStore.getState().addItem(ITEM_PANEH);  // (70+15) × 1 = 85
      useCartStore.getState().addItem(ITEM_STEAK);  // 120 × 2 = 240
      expect(useCartStore.getState().getSubtotal()).toBe(325);
    });

    it('should calculate delivery fee correctly', () => {
      useCartStore.getState().setDeliveryZone(DELIVERY_ZONE);
      useCartStore.getState().setOrderType('delivery');
      expect(useCartStore.getState().getDeliveryFee()).toBe(20);
    });

    it('should return 0 delivery fee for pickup orders', () => {
      useCartStore.getState().setDeliveryZone(DELIVERY_ZONE);
      useCartStore.getState().setOrderType('pickup');
      expect(useCartStore.getState().getDeliveryFee()).toBe(0);
    });

    it('should return 0 delivery fee for in_house orders', () => {
      useCartStore.getState().setDeliveryZone(DELIVERY_ZONE);
      useCartStore.getState().setOrderType('in_house');
      expect(useCartStore.getState().getDeliveryFee()).toBe(0);
    });

    it('should calculate total = subtotal + delivery fee', () => {
      useCartStore.getState().addItem(ITEM_PANEH);  // 85
      useCartStore.getState().setDeliveryZone(DELIVERY_ZONE); // +20
      useCartStore.getState().setOrderType('delivery');
      expect(useCartStore.getState().getTotal()).toBe(105);
    });

    it('should return correct item count', () => {
      useCartStore.getState().addItem(ITEM_PANEH);  // qty 1
      useCartStore.getState().addItem(ITEM_STEAK);  // qty 2
      expect(useCartStore.getState().getItemCount()).toBe(3);
    });

    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getSubtotal()).toBe(0);
      expect(useCartStore.getState().getTotal()).toBe(0);
      expect(useCartStore.getState().getItemCount()).toBe(0);
    });
  });

  describe('Clear Cart', () => {
    it('should empty the cart completely', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      useCartStore.getState().addItem(ITEM_STEAK);
      useCartStore.getState().setDeliveryZone(DELIVERY_ZONE);
      useCartStore.getState().clearCart();

      expect(useCartStore.getState().items).toHaveLength(0);
      expect(useCartStore.getState().deliveryZone).toBeNull();
      expect(useCartStore.getState().getTotal()).toBe(0);
    });
  });

  describe('Persistence', () => {
    it('should persist cart to localStorage on add', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should remove localStorage key on clearCart', () => {
      useCartStore.getState().addItem(ITEM_PANEH);
      useCartStore.getState().clearCart();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });
});
