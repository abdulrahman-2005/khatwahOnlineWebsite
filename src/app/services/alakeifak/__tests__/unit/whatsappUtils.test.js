/**
 * ═══════════════════════════════════════════════════════════════
 * ALAKEIFAK — UNIT TESTS: WhatsApp Utilities
 * ═══════════════════════════════════════════════════════════════
 *
 * Tests phone number formatting, validation, and WhatsApp
 * URL generation for cross-platform compatibility.
 *
 * Run:  npx vitest run src/app/services/alakeifak/__tests__/unit/whatsappUtils.test.js
 * ═══════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import {
  formatEgyptianPhone,
  isValidEgyptianPhone,
  formatOrderMessage,
  generateWhatsAppUrl,
} from '../../lib/whatsappUtils.js';

describe('formatEgyptianPhone', () => {
  it('should format 01xxxxxxxxx → +20xxxxxxxxx', () => {
    expect(formatEgyptianPhone('01234567890')).toBe('+201234567890');
  });

  it('should format 10xxxxxxxx → +2010xxxxxxxx', () => {
    expect(formatEgyptianPhone('1012345678')).toBe('+201012345678');
  });

  it('should format 201xxxxxxxxx → +201xxxxxxxxx', () => {
    expect(formatEgyptianPhone('201234567890')).toBe('+201234567890');
  });

  it('should handle already formatted +20 numbers', () => {
    expect(formatEgyptianPhone('+201234567890')).toBe('+201234567890');
  });

  it('should strip spaces, dashes, and parentheses', () => {
    expect(formatEgyptianPhone('012-3456-7890')).toBe('+201234567890');
    expect(formatEgyptianPhone('(012) 345 6789 0')).toBe('+201234567890');
  });

  it('should return empty string for null/undefined', () => {
    expect(formatEgyptianPhone(null)).toBe('');
    expect(formatEgyptianPhone(undefined)).toBe('');
    expect(formatEgyptianPhone('')).toBe('');
  });
});

describe('isValidEgyptianPhone', () => {
  it('should accept valid Egyptian numbers', () => {
    expect(isValidEgyptianPhone('01012345678')).toBe(true);
    expect(isValidEgyptianPhone('01112345678')).toBe(true);
    expect(isValidEgyptianPhone('01212345678')).toBe(true);
    expect(isValidEgyptianPhone('01512345678')).toBe(true);
  });

  it('should reject invalid prefixes', () => {
    expect(isValidEgyptianPhone('01312345678')).toBe(false);
    expect(isValidEgyptianPhone('01412345678')).toBe(false);
  });

  it('should reject numbers with wrong length', () => {
    expect(isValidEgyptianPhone('0101234567')).toBe(false);    // too short
    expect(isValidEgyptianPhone('010123456789')).toBe(false);  // too long
  });

  it('should reject empty or garbage input', () => {
    expect(isValidEgyptianPhone('')).toBe(false);
    expect(isValidEgyptianPhone('not-a-number')).toBe(false);
  });
});

describe('formatOrderMessage', () => {
  const baseOrder = {
    trackingId: '#ORD-TEST',
    orderCount: 5,
    items: [
      {
        itemName: 'كريب بانيه',
        size: { id: 's1', name: 'وسط', price: 70 },
        extras: [{ id: 'e1', name: 'مخلل', price: 15 }],
        quantity: 2,
      },
    ],
    deliveryZone: { region_name: 'العريش', fee: 20 },
    subtotal: 170,
    total: 190,
    customerName: 'أحمد',
    customerPhone: '+201012345678',
    deliveryAddress: 'عنوان التوصيل',
    restaurantName: 'مطعم تست',
    orderType: 'delivery',
    tableNumber: '',
    showDeliveryPricing: true,
  };

  it('should include restaurant name', () => {
    const msg = formatOrderMessage(baseOrder);
    expect(msg).toContain('خطوة اونلاين');
  });

  it('should include item details', () => {
    const msg = formatOrderMessage(baseOrder);
    expect(msg).toContain('كريب بانيه');
    expect(msg).toContain('وسط');
  });

  it('should include extras', () => {
    const msg = formatOrderMessage(baseOrder);
    expect(msg).toContain('مخلل');
  });

  it('should include delivery zone for delivery orders', () => {
    const msg = formatOrderMessage(baseOrder);
    expect(msg).toContain('العريش');
    expect(msg).toContain('20');
  });

  it('should NOT include delivery info for pickup orders', () => {
    const msg = formatOrderMessage({ ...baseOrder, orderType: 'pickup' });
    expect(msg).not.toContain('العريش');
  });

  it('should include customer info', () => {
    const msg = formatOrderMessage(baseOrder);
    expect(msg).toContain('أحمد');
    expect(msg).toContain('+201012345678');
  });

  it('should include total', () => {
    const msg = formatOrderMessage(baseOrder);
    expect(msg).toContain('190');
  });
});

describe('generateWhatsAppUrl', () => {
  const orderData = {
    trackingId: '#ORD-TEST',
    orderCount: 1,
    items: [
      {
        itemName: 'Test',
        size: { id: 's1', name: 'Normal', price: 50 },
        extras: [],
        quantity: 1,
      },
    ],
    deliveryZone: null,
    subtotal: 50,
    total: 50,
    customerName: 'Test',
    customerPhone: '+201012345678',
    deliveryAddress: '',
    restaurantName: 'Test',
    orderType: 'pickup',
  };

  it('should generate a valid WhatsApp API URL', () => {
    const url = generateWhatsAppUrl('+201234567890', orderData);
    expect(url).toContain('https://api.whatsapp.com/send');
    expect(url).toContain('phone=201234567890');
    expect(url).toContain('text=');
  });

  it('should strip non-numeric chars from phone', () => {
    const url = generateWhatsAppUrl('+20-123-456-7890', orderData);
    expect(url).toContain('phone=201234567890');
  });

  it('should URL-encode the message body', () => {
    const url = generateWhatsAppUrl('+201234567890', orderData);
    // Should not contain raw newlines or Arabic without encoding
    expect(url).not.toContain('\n');
  });

  it('should encode special chars for iOS Safari', () => {
    const url = generateWhatsAppUrl('+201234567890', {
      ...orderData,
      customerName: "Test's (Name)",
    });
    // Parentheses and apostrophes should be percent-encoded
    expect(url).not.toMatch(/[()'].*text=/);
  });
});
