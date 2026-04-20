"use client";

import { PHONE_BRANDS } from "../assets/brands";
import { Smartphone } from "lucide-react";
import Image from "next/image";

export default function BrandIcon({ brandId, size = 24, className = "" }) {
  const brand = PHONE_BRANDS.find(b => b.id === brandId);
  
  if (!brand?.logo) {
    return <Smartphone size={size} className={className} />;
  }
  
  return (
    <div 
      style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}
      className={className}
    >
      <Image 
        src={brand.logo} 
        alt={brand.name}
        fill
        style={{ objectFit: 'contain' }}
        sizes={`${size}px`}
        unoptimized
      />
    </div>
  );
}
