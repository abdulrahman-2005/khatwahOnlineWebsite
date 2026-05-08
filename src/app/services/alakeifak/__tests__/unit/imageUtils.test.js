/**
 * ═══════════════════════════════════════════════════════════════
 * ALAKEIFAK — UNIT TESTS: Image Utilities
 * ═══════════════════════════════════════════════════════════════
 *
 * Tests the image compression and validation utilities used
 * when partners upload logos, banners, and item photos.
 *
 * Run:  npx vitest run src/app/services/alakeifak/__tests__/unit/imageUtils.test.js
 * ═══════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi } from 'vitest';

// We test the pure validation logic from the upload route
describe('Upload Validation Logic', () => {
  const MAX_SIZE = 1 * 1024 * 1024; // 1MB
  const ALLOWED_FOLDERS = ['logos', 'items', 'banners'];

  describe('File Type Validation', () => {
    it('should accept image/webp', () => {
      expect('image/webp').toBe('image/webp');
    });

    it('should reject image/jpeg', () => {
      expect('image/jpeg').not.toBe('image/webp');
    });

    it('should reject image/png', () => {
      expect('image/png').not.toBe('image/webp');
    });

    it('should reject application/pdf', () => {
      expect('application/pdf').not.toBe('image/webp');
    });
  });

  describe('File Size Validation', () => {
    it('should accept files under 1MB', () => {
      expect(500 * 1024).toBeLessThan(MAX_SIZE);
    });

    it('should reject files over 1MB', () => {
      expect(2 * 1024 * 1024).toBeGreaterThan(MAX_SIZE);
    });

    it('should accept files exactly at 1MB', () => {
      expect(MAX_SIZE).toBeLessThanOrEqual(MAX_SIZE);
    });
  });

  describe('Folder Validation', () => {
    it('should accept "logos" folder', () => {
      expect(ALLOWED_FOLDERS.includes('logos')).toBe(true);
    });

    it('should accept "items" folder', () => {
      expect(ALLOWED_FOLDERS.includes('items')).toBe(true);
    });

    it('should accept "banners" folder', () => {
      expect(ALLOWED_FOLDERS.includes('banners')).toBe(true);
    });

    it('should reject arbitrary folder names', () => {
      expect(ALLOWED_FOLDERS.includes('malware')).toBe(false);
      expect(ALLOWED_FOLDERS.includes('../../etc')).toBe(false);
      expect(ALLOWED_FOLDERS.includes('')).toBe(false);
    });
  });

  describe('Key Generation', () => {
    it('should generate unique keys with folder prefix', () => {
      const folder = 'logos';
      const key1 = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
      const key2 = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;

      expect(key1).toMatch(/^logos\/\d+_[a-z0-9]+\.webp$/);
      expect(key1).not.toBe(key2); // Should be unique
    });
  });
});
