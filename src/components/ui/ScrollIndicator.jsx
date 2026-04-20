"use client";

import { useEffect, useState } from "react";

export default function ScrollIndicator({ color = "var(--color-gold)" }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide indicator after scrolling 100px
      setIsVisible(window.scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 transition-all duration-500 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Animated text */}
      <span
        className="animate-bounce text-sm sm:text-base font-black uppercase tracking-widest"
        style={{ fontFamily: "var(--font-ui)", color, animationDuration: "2s" }}
      >
        Scroll
      </span>

      {/* Animated mouse icon */}
      <button
        onClick={handleClick}
        className="group relative flex h-12 w-7 cursor-pointer items-start justify-center rounded-full border-2 p-2 transition-all duration-300 hover:scale-110"
        style={{ borderColor: color }}
        aria-label="Scroll down"
      >
        {/* Scrolling dot */}
        <div
          className="h-1.5 w-1.5 animate-scroll rounded-full"
          style={{ backgroundColor: color }}
        />
      </button>

      {/* Animated arrow */}
      <svg
        className="h-5 w-5 animate-bounce"
        style={{ color, animationDuration: "2s", animationDelay: "0.2s" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(12px);
            opacity: 0;
          }
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
