/**
 * scrollLockManager — Ref-counted scroll lock utility
 *
 * Uses `overflow: hidden` on <body> instead of `position: fixed`.
 * This means the page NEVER moves, so we never need to save/restore
 * scroll position. Eliminates the "scroll jump" bug entirely.
 *
 * Ref-counting ensures nested modals (e.g. CartDrawer → CheckoutModal)
 * don't fight each other — the last one to unlock actually unlocks.
 */

let lockCount = 0;
let scrollbarWidth = 0;

function getScrollbarWidth() {
  // Only measure once
  if (scrollbarWidth) return scrollbarWidth;
  const outer = document.createElement('div');
  outer.style.cssText = 'visibility:hidden;overflow:scroll;position:absolute;top:-9999px';
  document.body.appendChild(outer);
  const inner = document.createElement('div');
  outer.appendChild(inner);
  scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  document.body.removeChild(outer);
  return scrollbarWidth;
}

export function lockScroll() {
  if (typeof window === 'undefined') return;
  if (lockCount === 0) {
    const sbw = getScrollbarWidth();
    // Compensate for scrollbar disappearing to prevent layout shift
    document.body.style.paddingRight = sbw > 0 ? `${sbw}px` : '';
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

export function unlockScroll() {
  if (typeof window === 'undefined') return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

/** Emergency reset — call if you suspect a stale lock */
export function resetScrollLock() {
  lockCount = 0;
  if (typeof window !== 'undefined') {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}
