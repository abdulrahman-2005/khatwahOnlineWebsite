'use client';

import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/sanity/client';
import { Reveal } from '@/components/ui/Reveal';
import i18n from '../../../data/i18n.json';

/**
 * Blog Card Component - Professional/Fun Design
 * Matches Khatwah brand identity with royal blue and gold accents
 */
export function BlogCard({ post, index, locale }) {
  const imageUrl = post.mainImage 
    ? urlFor(post.mainImage).width(800).height(600).fit('crop').url()
    : null;

  const formattedDate = new Date(post._createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });

  return (
    <Reveal direction="up" delay={index * 100} distance={40}>
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block w-full overflow-hidden rounded-[40px] border border-border-dark bg-ink transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl"
      >
        {/* Image Container */}
        {imageUrl && (
          <div className="relative aspect-4/3 overflow-hidden">
            <Image
              src={imageUrl}
              alt={post.mainImage.alt || post.title}
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              placeholder={post.mainImage.asset?.metadata?.lqip ? 'blur' : 'empty'}
              blurDataURL={post.mainImage.asset?.metadata?.lqip}
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-ink via-transparent to-transparent opacity-60" />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Date */}
          <time 
            dateTime={post._createdAt}
            className="text-xs font-bold uppercase tracking-wider mb-4 block"
            style={{ fontFamily: "var(--font-ui)", color: "var(--color-gold)" }}
          >
            {formattedDate}
          </time>

          {/* Title */}
          <h2 
            className="text-2xl sm:text-3xl font-black leading-tight mb-4 transition-colors duration-300 group-hover:text-gold line-clamp-2"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p 
              className="text-sm leading-relaxed line-clamp-3 mb-6"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Read More with animated underline */}
          <div className="flex items-center gap-3">
            <span 
              className="text-sm font-bold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ui)", color: "var(--color-gold)" }}
            >
              {i18n[locale].blog.read_article}
            </span>
            <div className="h-px flex-1 bg-gold transition-all duration-700 group-hover:flex-2" />
          </div>
        </div>

        {/* Hover accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
      </Link>
    </Reveal>
  );
}
