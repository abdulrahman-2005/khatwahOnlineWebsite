"use client";

import { useRef, useEffect, useState } from "react";

export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
        else if (options.reversible) setVisible(false);
      },
      { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/* Reveal wrapper — use ONLY on standalone elements, NOT inside divide-y or grids */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  distance = 28,
  duration = 600,
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
    scale: `scale(${visible ? 1 : 0.96})`,
    none: "none",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: t[direction],
        transition: `opacity ${duration}ms cubic-bezier(0.25,0.8,0.25,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.25,0.8,0.25,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
