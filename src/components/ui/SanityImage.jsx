import Image from 'next/image';
import { urlFor } from '@/sanity/client';

/**
 * Reusable Sanity Image component with Next.js Image optimization
 * Automatically handles hotspot, crop, LQIP blur, and responsive sizing
 * 
 * @param {Object} props
 * @param {Object} props.value - Sanity image source object
 * @param {number} props.width - Image width (default: 800)
 * @param {number} props.height - Image height (auto-calculated if not provided)
 * @param {string} props.className - CSS classes
 * @param {boolean} props.priority - Load image with priority (for LCP)
 * @param {string} props.sizes - Responsive sizes attribute
 */
export function SanityImage({ 
  value, 
  width = 800, 
  height, 
  className, 
  priority = false,
  sizes
}) {
  if (!value?.asset) return null;

  const calculatedHeight = height || Math.round(width / 1.5);
  
  return (
    <Image
      className={className}
      src={urlFor(value)
        .width(width)
        .height(calculatedHeight)
        .fit('crop')
        .url()}
      alt={value.alt || ''}
      width={width}
      height={calculatedHeight}
      priority={priority}
      sizes={sizes}
      placeholder={value.asset.metadata?.lqip ? 'blur' : 'empty'}
      blurDataURL={value.asset.metadata?.lqip}
    />
  );
}
