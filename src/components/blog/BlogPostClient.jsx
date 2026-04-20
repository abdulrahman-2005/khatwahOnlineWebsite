'use client';

import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { urlFor } from '@/sanity/client';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import i18n from '../../../data/i18n.json';

export function BlogPostClient({ post }) {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const formattedDate = new Date(post._createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const imageUrl = post.mainImage 
    ? urlFor(post.mainImage).width(1200).height(800).url()
    : null;

  return (
    <main className="relative w-full overflow-x-hidden bg-background">
      {/* Atmospheric Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 ${locale === 'ar' ? 'right-1/4' : 'left-1/4'} w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-primary-glow rounded-full blur-[80px] sm:blur-[120px] ${isLight ? 'opacity-30' : 'opacity-20'}`} />
        <div className={`absolute bottom-1/4 ${locale === 'ar' ? 'left-1/4' : 'right-1/4'} w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gold-glow rounded-full blur-[80px] sm:blur-[120px] ${isLight ? 'opacity-25' : 'opacity-15'}`} />
      </div>

      {/* Back Link */}
      <section className="relative w-full px-6 pt-12 lg:px-20">
        <div className="mx-auto max-w-4xl relative z-10">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-gold"
            style={{ fontFamily: "var(--font-ui)", color: "var(--color-text-muted)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={locale === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
            {locale === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </Link>
        </div>
      </section>

      {/* Article Header */}
      <article className="relative w-full px-6 py-12 sm:py-16 lg:py-20 lg:px-20">
        <div className="mx-auto max-w-4xl relative z-10">
          {/* Date */}
          <time 
            dateTime={post._createdAt}
            className="text-xs font-bold uppercase tracking-wider mb-6 block"
            style={{ fontFamily: "var(--font-ui)", color: "var(--color-gold)" }}
          >
            {formattedDate}
          </time>

          {/* Title */}
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-8" 
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p 
              className="text-xl leading-relaxed mb-12" 
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Featured Image */}
          {imageUrl && (
            <div className="relative aspect-video overflow-hidden rounded-[40px] mb-12">
              <Image
                src={imageUrl}
                alt={post.mainImage.alt || post.title}
                width={1200}
                height={800}
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover w-full h-full"
                priority
                placeholder={post.mainImage.asset?.metadata?.lqip ? 'blur' : 'empty'}
                blurDataURL={post.mainImage.asset?.metadata?.lqip}
              />
            </div>
          )}

          {/* Article Content */}
          {post.content ? (
            <div className="blog-content mb-12">
              {typeof post.content === 'string' ? (
                <ReactMarkdown 
                  components={{
                    h1: ({ children }) => (
                      <h2 
                        className="text-4xl sm:text-5xl font-black mt-16 mb-8 leading-tight"
                        style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
                      >
                        {children}
                      </h2>
                    ),
                    h2: ({ children }) => (
                      <h3 
                        className="text-3xl sm:text-4xl font-bold mt-12 mb-6 leading-tight"
                        style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
                      >
                        {children}
                      </h3>
                    ),
                    h3: ({ children }) => (
                      <h4 
                        className="text-2xl sm:text-3xl font-bold mt-10 mb-4 leading-tight"
                        style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
                      >
                        {children}
                      </h4>
                    ),
                    p: ({ children }) => (
                      <p 
                        className="text-lg leading-relaxed mb-6"
                        style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
                      >
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong 
                        className="font-bold"
                        style={{ color: "var(--color-gold)" }}
                      >
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em 
                        className="italic"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {children}
                      </em>
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href}
                        className="text-primary hover:text-gold transition-colors underline decoration-2 underline-offset-2"
                        target={href?.startsWith('http') ? '_blank' : undefined}
                        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {children}
                      </a>
                    ),
                    ul: ({ children }) => (
                      <ul 
                        className="list-disc list-outside ml-6 mb-6 space-y-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol 
                        className="list-decimal list-outside ml-6 mb-6 space-y-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li 
                        className="text-lg leading-relaxed"
                        style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
                      >
                        {children}
                      </li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote 
                        className="border-l-4 border-gold pl-6 py-4 my-8 bg-surface rounded-r-[20px] italic"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {children}
                      </blockquote>
                    ),
                    code: ({ children, inline }) => 
                      inline ? (
                        <code 
                          className="px-2 py-1 bg-surface rounded text-sm border border-border-dark"
                          style={{ fontFamily: "monospace", color: "var(--color-primary)" }}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-ink p-6 rounded-[20px] border border-border-dark overflow-x-auto my-8">
                          <code 
                            className="text-sm"
                            style={{ fontFamily: "monospace", color: "var(--color-text)" }}
                          >
                            {children}
                          </code>
                        </pre>
                      ),
                    hr: () => (
                      <hr className="my-12 border-0 h-px bg-linear-to-r from-transparent via-border-dark to-transparent" />
                    ),
                    img: ({ src, alt }) => (
                      <figure className="my-12">
                        <img
                          src={src}
                          alt={alt || 'Article image'}
                          className="w-full h-auto rounded-[20px] border border-border-dark"
                        />
                        {alt && (
                          <figcaption 
                            className="mt-4 text-center text-sm"
                            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
                          >
                            {alt}
                          </figcaption>
                        )}
                      </figure>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              ) : Array.isArray(post.content) ? (
                // Handle Portable Text blocks if they still exist
                <div className="space-y-6">
                  {post.content.map((block, index) => {
                    if (block._type === 'block') {
                      // Handle text blocks
                      const text = block.children?.map(child => child.text).join('') || '';
                      if (block.style === 'h2') {
                        return (
                          <h2 
                            key={index} 
                            className="text-3xl sm:text-4xl font-black mt-12 mb-6"
                            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
                          >
                            {text}
                          </h2>
                        );
                      } else if (block.style === 'h3') {
                        return (
                          <h3 
                            key={index} 
                            className="text-2xl sm:text-3xl font-bold mt-10 mb-4"
                            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
                          >
                            {text}
                          </h3>
                        );
                      } else {
                        return (
                          <p 
                            key={index} 
                            className="text-lg leading-relaxed mb-6"
                            style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
                          >
                            {text}
                          </p>
                        );
                      }
                    } else if (block._type === 'image' && block.asset) {
                      // Handle image blocks
                      return (
                        <figure key={index} className="my-12">
                          <Image
                            src={urlFor(block).width(1200).height(800).url()}
                            alt={block.alt || 'Article image'}
                            width={1200}
                            height={800}
                            sizes="(max-width: 1024px) 100vw, 1024px"
                            className="rounded-[20px] border border-border-dark w-full h-auto"
                          />
                          {block.caption && (
                            <figcaption 
                              className="mt-4 text-center text-sm"
                              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
                            >
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                // Handle object content - try to extract text
                <div className="p-6 border border-yellow-500 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 font-medium mb-2">
                    {locale === 'ar' ? 'تنسيق محتوى غير مدعوم' : 'Unsupported content format'}
                  </p>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-yellow-700">
                      {locale === 'ar' ? 'عرض البيانات الخام' : 'Show raw data'}
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-yellow-100 rounded">
                      {JSON.stringify(post.content, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <div className="my-12 p-8 border border-border-dark rounded-[20px] bg-surface">
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
                {locale === 'ar' ? 'لا يوجد محتوى متاح لهذا المقال.' : 'No content available for this article.'}
              </p>
            </div>
          )}

          {/* Pillar Post UI Loop - Only show if NOT a pillar and HAS a pillar reference */}
          {!post.isPillar && post.pillarSlug && post.pillarTitle && (
            <div className="mt-16 p-8 border-l-4 border-primary bg-surface rounded-[20px]">
              <p 
                className="text-sm font-bold uppercase tracking-wider mb-3"
                style={{ fontFamily: "var(--font-ui)", color: "var(--color-primary)" }}
              >
                {locale === 'ar' ? '📚 الدليل الشامل' : '📚 Master Guide'}
              </p>
              <p 
                className="text-lg mb-4"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
              >
                {locale === 'ar' 
                  ? 'اتقن الاستراتيجية الكاملة في دليلنا الرئيسي:' 
                  : 'Master the complete strategy in our main guide:'}
              </p>
              <Link 
                href={`/blog/${post.pillarSlug}`}
                className="text-2xl font-black hover:text-primary transition-colors inline-flex items-center gap-3"
                style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
              >
                {post.pillarTitle}
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={locale === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </article>

      {/* CTA Section */}
      <section className="relative w-full px-6 pb-24 sm:pb-32 lg:pb-40 lg:px-20">
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="p-12 border border-border-dark rounded-[40px] bg-ink text-center">
            <h2 
              className="text-3xl sm:text-4xl font-black mb-4"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
            >
              {locale === 'ar' ? 'عجبك اللي شفته؟' : 'Like what you see?'}
            </h2>
            <p 
              className="text-lg mb-8"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
            >
              {locale === 'ar' ? 'نقدر نبني حاجة أحسن لمشروعك' : 'We can build something better for your project'}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ink font-bold uppercase tracking-wider rounded-full transition-all duration-300 hover:scale-105"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
