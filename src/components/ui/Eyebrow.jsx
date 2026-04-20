/**
 * Eyebrow component - decorative label with line accent
 * Used consistently across all pages for section headers
 */
export default function Eyebrow({ 
  children, 
  color = "var(--color-primary)",
  size = "base" // "sm" | "base" | "lg"
}) {
  const sizeClasses = {
    sm: "text-base sm:text-lg",      // 16px -> 18px (readable minimum)
    base: "text-lg sm:text-xl",      // 18px -> 20px (standard)
    lg: "text-xl sm:text-2xl lg:text-3xl" // 20px -> 24px -> 30px (hero sections)
  };

  return (
    <div className="flex items-center gap-4">
      <span 
        className="h-1 w-12 sm:w-16" 
        style={{ backgroundColor: color }} 
      />
      <span 
        className={`${sizeClasses[size]} font-black tracking-wider uppercase`}
        style={{ 
          fontFamily: "var(--font-ui)", 
          color: color 
        }}
      >
        {children}
      </span>
    </div>
  );
}
