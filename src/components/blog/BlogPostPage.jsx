'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/sanity/client';
import { useLocale } from '@/contexts/LocaleContext';
import i18n from '../../../data/i18n.json';

/**
 * Portable Text Components following design system
 */
const PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      
      return (
        <figure className="my-12">
          <div className="relative overflow-hidden rounded-[20px] border"
            style={{ borderColor: 'var(--color-border-dark)' }}>
            <Image
              src={urlFor(value).width(800).height(600).url()}
              alt={value.alt || 'Article image'}
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, 800px"
              className="w-full h-auto object-cover"
              placeholder={value.asset.metadata?.lqip ? 'blur' : 'empty'}
              blurDataURL={value.asset.metadata?.lqip}
            />
          </div>
          {value.alt && (
            <figcaption className="mt-4 text-center text-sm"
              style={{ 
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)'
              }}>
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
    
    adBanner: ({ value }) => {
      const { adText, buttonText, buttonUrl, backgroundColor = 'blue' } = value;
      
      const bgColors = {
        blue: 'var(--color-primary-soft)',
        green: 'var(--color-accent-soft)',
        gray: 'var(--color-surface)'
      };

      return (
        <div className="my-12 p-8 rounded-[20px] border"
          style={{ 
            backgroundColor: bgColors[backgroundColor],
            borderColor: 'var(--color-border)'
          }}>
          <div className="text-center">
            {adText && (
              <p className="text-lg font-bold mb-6 leading-relaxed"
                style={{ 
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-text)'
                }}>
                {adText}
              </p>
            )}
            {buttonText && buttonUrl && (
              <a
                href={buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 font-bold uppercase tracking-wider rounded-full transition-all duration-300 hover:scale-105"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}>
                {buttonText}
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      );
    }
  },
  
  block: {
    h1: ({ children }) => (
      <h1 className="text-4xl sm:text-5xl font-black mt-16 mb-8 leading-tight"
        style={{ 
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text)'
        }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl sm:text-4xl font-bold mt-12 mb-6 leading-tight"
        style={{ 
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text)'
        }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl sm:text-3xl font-bold mt-10 mb-4 leading-tight"
        style={{ 
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text)'
        }}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-bold mt-8 mb-3"
        style={{ 
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text)'
        }}>
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-lg leading-relaxed mb-6"
        style={{ 
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text)'
        }}>
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 pl-6 my-8 py-4 rounded-r-[20px] italic"
        style={{ 
          borderColor: 'var(--color-gold)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-muted)'
        }}>
        {children}
      </blockquote>
    )
  },
  
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside ml-6 mb-6 space-y-2"
        style={{ color: 'var(--color-text)' }}>
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside ml-6 mb-6 space-y-2"
        style={{ color: 'var(--color-text)' }}>
        {children}
      </ol>
    )
  },
  
  listItem: {
    bullet: ({ children }) => (
      <li className="text-lg leading-relaxed"
        style={{ fontFamily: 'var(--font-body)' }}>
        {children}
      </li>
    ),
    number: ({ children }) => (
      <li className="text-lg leading-relaxed"
        style={{ fontFamily: 'var(--font-body)' }}>
        {children}
      </li>
    )
  },
  
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold" style={{ color: 'var(--color-gold)' }}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic" style={{ color: 'var(--color-text-muted)' }}>
        {children}
      </em>
    ),
    link: ({ children, value }) => (
      <a
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-2 underline-offset-2 transition-colors"
        style={{ color: 'var(--color-primary)' }}>
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="px-2 py-1 rounded text-sm border"
        style={{ 
          fontFamily: 'monospace',
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border-dark)',
          color: 'var(--color-primary)'
        }}>
        {children}
      </code>
    )
  }
};

/**
 * Related Posts Card Component
 */
function RelatedPostCard({ post, locale }) {
  const formattedDate = new Date(post._createdAt || Date.now()).toLocaleDateString(
    locale === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="rounded-[20px] border overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
        style={{ 
          borderColor: 'var(--color-border-dark)',
          backgroundColor: 'var(--color-ink)'
        }}>
        {post.mainImage && (
          <div className="aspect-video overflow-hidden">
            <Image
              src={urlFor(post.mainImage).width(400).height(225).url()}
              alt={post.mainImage.alt || post.title}
              width={400}
              height={225}
              sizes="(max-width: 768px) 100vw, 400px"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              placeholder={post.mainImage.asset?.metadata?.lqip ? 'blur' : 'empty'}
              blurDataURL={post.mainImage.asset?.metadata?.lqip}
            />
          </div>
        )}
        <div className="p-6">
          <time className="text-sm font-bold uppercase tracking-wider"
            style={{ 
              fontFamily: 'var(--font-ui)',
              color: 'var(--color-gold)'
            }}>
            {formattedDate}
          </time>
          <h3 className="text-xl font-bold mt-2 mb-3 leading-tight transition-colors"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text)'
            }}>
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="leading-relaxed line-clamp-3"
              style={{ 
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)'
              }}>
              {post.excerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

/**
 * Main Blog Post Page Component
 */
export function BlogPostPage({ post }) {
  const { locale } = useLocale();
  const isRTL = post.language === 'ar';
  
  const formattedDate = new Date(post._createdAt).toLocaleDateString(
    locale === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <main className="relative w-full overflow-x-hidden" 
      style={{ backgroundColor: 'var(--color-background)' }}
      dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Atmospheric Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 ${isRTL ? 'right-1/4' : 'left-1/4'} w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[120px] opacity-20`}
          style={{ backgroundColor: 'var(--color-primary-glow)' }} />
        <div className={`absolute bottom-1/4 ${isRTL ? 'left-1/4' : 'right-1/4'} w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[120px] opacity-15`}
          style={{ backgroundColor: 'var(--color-gold-glow)' }} />
      </div>

      {/* Back Link */}
      <section className="relative w-full px-6 pt-12 lg:px-20">
        <div className="mx-auto max-w-4xl relative z-10">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors"
            style={{ 
              fontFamily: 'var(--font-ui)',
              color: 'var(--color-text-muted)'
            }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
            {i18n[locale].blog.back_to_blog}
          </Link>
        </div>
      </section>

      {/* Article Header */}
      <article className="relative w-full px-6 py-12 sm:py-16 lg:py-20 lg:px-20">
        <div className="mx-auto max-w-4xl relative z-10">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category, index) => (
                <span
                  key={index}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    backgroundColor: 'var(--color-primary-soft)',
                    color: 'var(--color-primary)'
                  }}>
                  {category.title}
                </span>
              ))}
            </div>
          )}

          {/* Date */}
          <time 
            dateTime={post._createdAt}
            className="text-xs font-bold uppercase tracking-wider mb-6 block"
            style={{ 
              fontFamily: 'var(--font-ui)',
              color: 'var(--color-gold)'
            }}>
            {formattedDate}
          </time>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-8"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)'
            }}>
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl leading-relaxed mb-12"
              style={{ 
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)'
              }}>
              {post.excerpt}
            </p>
          )}

          {/* Author */}
          {post.author && (
            <div className="flex items-center gap-4 mb-12">
              {post.author.image && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <Image
                    src={urlFor(post.author.image).width(64).height(64).url()}
                    alt={post.author.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-bold text-lg"
                  style={{ 
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--color-text)'
                  }}>
                  {post.author.name}
                </p>
                {post.author.bio && (
                  <p className="text-sm"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-text-muted)'
                    }}>
                    {post.author.bio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Featured Image */}
          {post.mainImage && (
            <div className="relative aspect-video overflow-hidden rounded-[40px] mb-12 border"
              style={{ borderColor: 'var(--color-border-dark)' }}>
              <Image
                src={urlFor(post.mainImage).width(1200).height(675).url()}
                alt={post.mainImage.alt || post.title}
                width={1200}
                height={675}
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover w-full h-full"
                priority
                placeholder={post.mainImage.asset?.metadata?.lqip ? 'blur' : 'empty'}
                blurDataURL={post.mainImage.asset?.metadata?.lqip}
              />
            </div>
          )}

          {/* Article Content */}
          {post.content && Array.isArray(post.content) ? (
            <div className="mb-12">
              <PortableText 
                value={post.content} 
                components={PortableTextComponents}
              />
            </div>
          ) : (
            <div className="my-12 p-8 border rounded-[20px]"
              style={{ 
                borderColor: 'var(--color-border-dark)',
                backgroundColor: 'var(--color-surface)'
              }}>
              <p style={{ 
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)'
              }}>
                {i18n[locale].blog.no_content}
              </p>
            </div>
          )}
        </div>
      </article>

      {/* Related Posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="relative w-full px-6 pb-24 lg:px-20">
          <div className="mx-auto max-w-6xl relative z-10">
            <h2 className="text-3xl font-black mb-8"
              style={{ 
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text)'
              }}>
              {i18n[locale].blog.related_articles}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {post.relatedPosts.map((relatedPost, index) => (
                <RelatedPostCard 
                  key={index} 
                  post={relatedPost} 
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative w-full px-6 pb-24 lg:px-20">
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="p-12 border rounded-[40px] text-center"
            style={{ 
              borderColor: 'var(--color-border-dark)',
              backgroundColor: 'var(--color-ink)'
            }}>
            <h2 className="text-3xl sm:text-4xl font-black mb-4"
              style={{ 
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text)'
              }}>
              {i18n[locale].common.like_what_you_see}
            </h2>
            <p className="text-lg mb-8"
              style={{ 
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)'
              }}>
              {i18n[locale].common.can_build_better}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-wider rounded-full transition-all duration-300 hover:scale-105"
              style={{ 
                fontFamily: 'var(--font-ui)',
                backgroundColor: 'var(--color-gold)',
                color: 'var(--color-ink)'
              }}>
              {i18n[locale].common.contact_us}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
