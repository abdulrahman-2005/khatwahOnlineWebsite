/**
 * Optimized Marquee Component
 * 
 * Performance optimizations:
 * 1. Uses CSS transforms (GPU-accelerated)
 * 2. Throttled resize handler with debounce
 * 3. Intersection Observer to pause when off-screen
 * 4. Image lazy loading
 * 5. Will-change hints for browser optimization
 * 6. Reduced DOM manipulation
 * 7. Deferred initialization to prevent blocking
 */

import { useEffect, useRef, useCallback } from "react";

export function HorizontalMarquee({ images, basePath, speed = 3.6 }) {
  const trackRef = useRef(null);
  const stateRef = useRef({
    cards: [],
    scroll: 0,
    paused: false,
    visible: true,
    raf: null,
    nextDataIdx: 0,
    speed,
    initialized: false,
  });
  const resizeTimeoutRef = useRef(null);

  const updateMarquee = useCallback(() => {
    const track = trackRef.current;
    if (!track || !images || images.length === 0) return;

    const rect = track.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const containerW = rect.width;
    const containerH = rect.height;
    const GAP = 20;
    const CARD_W = containerW + GAP;
    const SLOT = CARD_W;
    const numCards = 3;
    const totalWidth = numCards * SLOT;
    const s = stateRef.current;
    
    s.nextDataIdx = numCards;
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const newCards = [];
    
    // Create cards with optimized styles
    for (let i = 0; i < numCards; i++) {
      const imgSrc = images[i % images.length];
      const card = document.createElement("div");
      card.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: ${containerW}px;
        height: ${containerH}px;
        overflow: hidden;
        will-change: transform;
        transform: translate3d(0, 0, 0);
      `;

      const img = document.createElement("img");
      img.src = `${basePath}/${imgSrc}`;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: brightness(0.6);
      `;
      
      card.appendChild(img);
      fragment.appendChild(card);
      newCards.push({ 
        el: card, 
        img, 
        offset: i * SLOT, 
        cardWidth: containerW, 
        slot: SLOT, 
        totalW: totalWidth 
      });
    }
    
    track.innerHTML = "";
    track.appendChild(fragment);
    s.cards = newCards;
    s.scroll = 0;
    s.initialized = true;
  }, [images, basePath]);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    // Defer initialization to next frame to prevent blocking
    const initTimeout = setTimeout(() => {
      updateMarquee();
    }, 0);

    // Throttled resize handler
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(updateMarquee, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Intersection Observer to pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        stateRef.current.visible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(track);

    // Mouse events
    const handlePause = () => { stateRef.current.paused = true; };
    const handleResume = () => { stateRef.current.paused = false; };
    track.addEventListener('mouseenter', handlePause, { passive: true });
    track.addEventListener('mouseleave', handleResume, { passive: true });

    // Animation loop
    let lastTs = null;
    function loop(ts) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;

      const s = stateRef.current;
      
      // Only animate if initialized, visible and not paused
      if (!s.initialized || !s.visible || s.paused) {
        s.raf = requestAnimationFrame(loop);
        return;
      }

      s.scroll += s.speed * (dt / 16.67);

      // Batch DOM updates
      for (const card of s.cards) {
        let x = card.offset - s.scroll;
        if (x < -card.slot) {
          card.offset += card.totalW;
          x = card.offset - s.scroll;
          const nextImg = images[s.nextDataIdx % images.length];
          card.img.src = `${basePath}/${nextImg}`;
          s.nextDataIdx++;
        }
        card.el.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      
      s.raf = requestAnimationFrame(loop);
    }
    stateRef.current.raf = requestAnimationFrame(loop);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      cancelAnimationFrame(stateRef.current.raf);
      observer.disconnect();
      track.removeEventListener('mouseenter', handlePause);
      track.removeEventListener('mouseleave', handleResume);
    };
  }, [images, basePath, updateMarquee]);

  return (
    <div 
      ref={trackRef} 
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ contain: 'layout style paint' }}
    />
  );
}

export function VerticalMarquee({ images, basePath, speed = 0.6 }) {
  const trackRef = useRef(null);
  const stateRef = useRef({
    columns: [],
    scroll: 0,
    paused: false,
    visible: true,
    raf: null,
    nextImgIdx: 0,
    speed,
    initialized: false,
  });
  const resizeTimeoutRef = useRef(null);

  const updateMarquee = useCallback(() => {
    const track = trackRef.current;
    if (!track || !images || images.length === 0) return;

    const rect = track.getBoundingClientRect();
    if (!rect) return;

    const containerW = Math.round(rect.width);
    const containerH = Math.round(rect.height);
    const GAP = 12;
    const NUM_COLS = 2;
    const IMGS_PER_COL = 2;
    const colH = containerH + GAP;
    const totalH = NUM_COLS * colH;
    const imgH = Math.round((containerH - GAP) / IMGS_PER_COL);
    const s = stateRef.current;
    
    s.nextImgIdx = NUM_COLS * IMGS_PER_COL;

    // Use DocumentFragment
    const fragment = document.createDocumentFragment();
    const newColumns = [];

    let imgIdx = 0;
    for (let col = 0; col < NUM_COLS; col++) {
      const card = document.createElement('div');
      card.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: ${containerW}px;
        height: ${containerH}px;
        display: flex;
        flex-direction: column;
        gap: ${GAP}px;
        overflow: hidden;
        will-change: transform;
        transform: translate3d(0, 0, 0);
      `;

      const imgs = [];
      for (let row = 0; row < IMGS_PER_COL; row++) {
        const img = document.createElement('img');
        img.src = `${basePath}/${images[imgIdx % images.length]}`;
        img.alt = '';
        img.loading = "lazy";
        img.decoding = "async";
        img.style.cssText = `
          width: ${containerW}px;
          height: ${imgH}px;
          object-fit: cover;
          display: block;
          flex-shrink: 0;
        `;
        card.appendChild(img);
        imgs.push(img);
        imgIdx++;
      }
      fragment.appendChild(card);
      newColumns.push({ el: card, imgs, offset: col * colH, colH, totalH });
    }
    
    track.innerHTML = '';
    track.appendChild(fragment);
    s.columns = newColumns;
    s.scroll = 0;
    s.initialized = true;
  }, [images, basePath]);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    // Defer initialization
    const initTimeout = setTimeout(() => {
      updateMarquee();
    }, 0);

    // Throttled resize
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(updateMarquee, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        stateRef.current.visible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(track);

    // Mouse events
    const handlePause = () => { stateRef.current.paused = true; };
    const handleResume = () => { stateRef.current.paused = false; };
    track.addEventListener('mouseenter', handlePause, { passive: true });
    track.addEventListener('mouseleave', handleResume, { passive: true });

    // Animation loop
    let lastTs = null;
    function loop(ts) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      
      const s = stateRef.current;
      if (!s.initialized || !s.visible || s.paused) {
        s.raf = requestAnimationFrame(loop);
        return;
      }

      s.scroll += s.speed * (dt / 16.67);

      for (const col of s.columns) {
        let y = col.offset - s.scroll;
        if (y < -col.colH) {
          col.offset += col.totalH;
          y = col.offset - s.scroll;
          for (const img of col.imgs) {
            img.src = `${basePath}/${images[s.nextImgIdx % images.length]}`;
            s.nextImgIdx++;
          }
        }
        col.el.style.transform = `translate3d(0, ${y}px, 0)`;
      }
      s.raf = requestAnimationFrame(loop);
    }
    stateRef.current.raf = requestAnimationFrame(loop);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      cancelAnimationFrame(stateRef.current.raf);
      observer.disconnect();
      track.removeEventListener('mouseenter', handlePause);
      track.removeEventListener('mouseleave', handleResume);
    };
  }, [images, basePath, updateMarquee]);

  return (
    <div 
      ref={trackRef} 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        overflow: 'hidden', 
        width: '100%', 
        height: '100%',
        contain: 'layout style paint'
      }} 
    />
  );
}

export function InfiniteMarquee({ images, basePath, speed = 1.2 }) {
  const trackRef = useRef(null);
  const stateRef = useRef({
    cards: [],
    scroll: 0,
    paused: false,
    visible: true,
    raf: null,
    nextDataIdx: 0,
    speed,
    initialized: false,
  });
  const resizeTimeoutRef = useRef(null);

  const updateMarquee = useCallback(() => {
    const track = trackRef.current;
    if (!track || !images || images.length === 0) return;

    const viewportW = window.innerWidth;
    const CARD_W = viewportW < 640 ? 200 : 500;
    const GAP = viewportW < 640 ? 12 : 24;
    const SLOT = CARD_W + GAP;
    const numCards = Math.min(Math.ceil((viewportW * 2) / SLOT) + 4, 12); // Cap at 12 cards
    const totalWidth = numCards * SLOT;
    const s = stateRef.current;
    
    s.nextDataIdx = numCards;
    
    // Use DocumentFragment
    const fragment = document.createDocumentFragment();
    const newCards = [];

    for (let i = 0; i < numCards; i++) {
      const imgSrc = images[i % images.length];
      const card = document.createElement("div");
      card.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: ${CARD_W}px;
        height: ${viewportW < 640 ? "140px" : "320px"};
        border-radius: ${viewportW < 640 ? "16px" : "32px"};
        overflow: hidden;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        will-change: transform;
        transform: translate3d(${i * SLOT}px, 0, 0);
      `;

      const img = document.createElement("img");
      img.src = `${basePath}/${imgSrc}`;
      img.alt = "Project preview";
      img.loading = "lazy";
      img.decoding = "async";
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: brightness(0.95);
      `;
      
      card.appendChild(img);
      fragment.appendChild(card);
      newCards.push({ el: card, img, offset: i * SLOT, cardWidth: CARD_W, slot: SLOT, totalW: totalWidth });
    }
    
    track.innerHTML = "";
    track.appendChild(fragment);
    s.cards = newCards;
    s.scroll = 0;
    s.initialized = true;
  }, [images, basePath]);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    // Defer initialization
    const initTimeout = setTimeout(() => {
      updateMarquee();
    }, 0);

    // Throttled resize
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(updateMarquee, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        stateRef.current.visible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(track);

    // Animation loop
    let lastTs = null;
    function loop(ts) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      
      const s = stateRef.current;
      if (!s.initialized || !s.visible) {
        s.raf = requestAnimationFrame(loop);
        return;
      }

      s.scroll += s.speed * (dt / 16.67);

      for (const card of s.cards) {
        let x = card.offset - s.scroll;
        if (x < -card.slot) {
          card.offset += card.totalW;
          x = card.offset - s.scroll;
          const nextImg = images[s.nextDataIdx % images.length];
          card.img.src = `${basePath}/${nextImg}`;
          s.nextDataIdx++;
        }
        card.el.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      s.raf = requestAnimationFrame(loop);
    }
    stateRef.current.raf = requestAnimationFrame(loop);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      cancelAnimationFrame(stateRef.current.raf);
      observer.disconnect();
    };
  }, [images, basePath, updateMarquee]);

  return (
    <div 
      ref={trackRef} 
      className="relative h-[140px] sm:h-[320px] w-full"
      style={{ contain: 'layout style paint' }}
    />
  );
}
