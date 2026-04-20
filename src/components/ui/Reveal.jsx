"use client";

import { useRef, useEffect, useState } from "react";

export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Disconnect after first reveal for better performance
          if (!options.reversible) {
            observer.disconnect();
          }
        } else if (options.reversible) {
          setVisible(false);
        }
      },
      { 
        threshold: options.threshold ?? 0.1, // Reduced from 0.12 for earlier trigger
        rootMargin: options.rootMargin ?? "0px 0px -80px 0px" // Trigger earlier
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.reversible, options.threshold, options.rootMargin]);

  return [ref, visible];
}

/* Reveal wrapper — use ONLY on standalone elements, NOT inside divide-y or grids */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  distance = 24, // Reduced from 28 for subtler effect
  duration = 500, // Reduced from 600 for snappier feel
  reversible = false,
  className = "",
  style = {},
}) {
  const [ref, visible] = useReveal({ reversible });

  const t = {
    up: `translateY(${visible ? 0 : distance}px)`,
    down: `translateY(${visible ? 0 : -distance}px)`,
    left: `translateX(${visible ? 0 : distance}px)`,
    right: `translateX(${visible ? 0 : -distance}px)`,
    scale: `scale(${visible ? 1 : 0.97})`, // Reduced from 0.96 for subtler effect
    none: "none",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: t[direction],
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        // Remove will-change after animation completes
        willChange: visible ? 'auto' : 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
