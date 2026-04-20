'use client';

import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/sanity/client';
import { useLocale } from '@/contexts/LocaleContext';
import Eyebrow from '@/components/ui/Eyebrow';
import i18n from '../../../data/i18n.json';

/**
 * Featured Blog Post - Hero Style
 */
function FeaturedPost({ post, locale }) {
  const formattedDate = new Date(post._createdAt).toLocaleDateString(
    locale === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-[40px] border transition-all duration-700 hover:shadow-2xl"
        style={{ 
          borderColor: 'var(--color-border-dark)',
          backgroundColor: 'var(--color-ink)'
        }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image Side */}
          {post.mainImage && (
            <div className="relative aspect-video lg:aspect-auto lg:min-h-[500px] overflow-hidden">
              <Image
                src={urlFor(post.mainImage).width(800).height(600).url()}
                alt={post.mainImage.alt || post.title}
                width={800}
                height={600}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                placeholder={post.mainImage.asset?.metadata?.lqip ? 'blur' : 'empty'}
                blurDataURL={post.mainImage.asset?.metadata?.lqip}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              
              {/* Featured Badge */}
              <div className="absolute top-6 left-6 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  backgroundColor: 'var(--color-gold)',
                  color: 'var(--color-ink)'
                }}>
                {locale === 'ar' ? 'مميز' : 'Featured'}
              </div>
            </div>
          )}
          
          {/* Content Side */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.categories.slice(0, 3).map((category, index) => (
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
            <time className="text-sm font-bold uppercase tracking-wider mb-4 block"
              style={{ 
                fontFamily: 'var(--font-ui)',
                color: 'var(--color-gold)'
              }}>
              {formattedDate}
            </time>

            {/* Title */}
            <h2 className="text-3xl lg:text-4xl font-black mb-6 leading-tight"
              style={{ 
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text)'
              }}>
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg leading-relaxed mb-8"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)'
                }}>
                {post.excerpt}
              </p>
            )}

            {/* Author & CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {post.author?.image && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <Image
                      src={urlFor(post.author.image).width(48).height(48).url()}
                      alt={post.author.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold"
                    style={{ 
                      fontFamily: 'var(--font-ui)',
                      color: 'var(--color-text)'
                    }}>
                    {post.author?.name || 'Khatwah Team'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--color-gold)'
                }}>
                <span>{i18n[locale].blog.read_article}</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={locale === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * Regular Blog Post Card Component
 */
function BlogPostCard({ post, locale }) {
  const formattedDate = new Date(post._createdAt).toLocaleDateString(
    locale === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-[40px] border transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl h-full flex flex-col"
        style={{ 
          borderColor: 'var(--color-border-dark)',
          backgroundColor: 'var(--color-ink)'
        }}>
        
        {/* Featured Image */}
        {post.mainImage && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={urlFor(post.mainImage).width(400).height(225).url()}
              alt={post.mainImage.alt || post.title}
              width={400}
              height={225}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              placeholder={post.mainImage.asset?.metadata?.lqip ? 'blur' : 'empty'}
              blurDataURL={post.mainImage.asset?.metadata?.lqip}
            />
          </div>
        )}
        
        {/* Card Content */}
        <div className="p-8 flex-1 flex flex-col">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.slice(0, 2).map((category, index) => (
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
          <time className="text-xs font-bold uppercase tracking-wider mb-3 block"
            style={{ 
              fontFamily: 'var(--font-ui)',
              color: 'var(--color-gold)'
            }}>
            {formattedDate}
          </time>

          {/* Title */}
          <h3 className="text-xl font-black mb-4 leading-tight transition-colors duration-300 flex-1"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text)'
            }}>
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="leading-relaxed mb-6 line-clamp-3"
              style={{ 
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)'
              }}>
              {post.excerpt}
            </p>
          )}

          {/* Author */}
          <div className="flex items-center gap-3 pt-6 border-t mt-auto"
            style={{ borderColor: 'var(--color-border-dark)' }}>
            {post.author?.image && (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2"
                style={{ borderColor: 'var(--color-border)' }}>
                <Image
                  src={urlFor(post.author.image).width(40).height(40).url()}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-bold"
                style={{ 
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--color-text)'
                }}>
                {post.author?.name || 'Khatwah Team'}
              </p>
            </div>
            
            <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: 'var(--color-gold)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={locale === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPageClient({ posts }) {
  const { locale } = useLocale();
  
  // Separate featured post (most recent) from others
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <main className="relative w-full overflow-x-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Atmospheric Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[120px] opacity-20"
          style={{ backgroundColor: 'var(--color-primary-glow)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[120px] opacity-15"
          style={{ backgroundColor: 'var(--color-gold-glow)' }} />
      </div>

      {/* Page Header */}
      <section className="relative w-full px-6 pt-32 pb-12 lg:px-20">
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="mb-8">
            <Eyebrow color="var(--color-gold)" size="base">
              {i18n[locale].blog.eyebrow}
            </Eyebrow>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)'
            }}>
            {i18n[locale].blog.headline}
          </h1>
          
          <p className="text-xl sm:text-2xl leading-relaxed max-w-3xl"
            style={{ 
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)'
            }}>
            {i18n[locale].blog.subtitle}
          </p>
        </div>
      </section>

      {posts.length > 0 ? (
        <>
          {/* Featured Post Section */}
          {featuredPost && (
            <section className="relative w-full px-6 pb-16 lg:px-20">
              <div className="mx-auto max-w-6xl relative z-10">
                <FeaturedPost post={featuredPost} locale={locale} />
              </div>
            </section>
          )}

          {/* Regular Posts Grid */}
          {regularPosts.length > 0 && (
            <section className="relative w-full px-6 pb-24 lg:px-20">
              <div className="mx-auto max-w-6xl relative z-10">
                <div className="mb-12">
                  <h2 className="text-3xl font-black"
                    style={{ 
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--color-text)'
                    }}>
                    {locale === 'ar' ? 'المزيد من المقالات' : 'More Articles'}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularPosts.map((post) => (
                    <BlogPostCard key={post._id} post={post} locale={locale} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Newsletter / Social Section */}
          <section className="relative w-full px-6 pb-24 lg:px-20">
            <div className="mx-auto max-w-6xl relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stay Updated Card */}
                <div className="p-12 border rounded-[40px]"
                  style={{ 
                    borderColor: 'var(--color-border-dark)',
                    backgroundColor: 'var(--color-ink)'
                  }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                    style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      style={{ color: 'var(--color-primary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black mb-4"
                    style={{ 
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--color-text)'
                    }}>
                    {locale === 'ar' ? 'ابق على اطلاع' : 'Stay Updated'}
                  </h3>
                  <p className="leading-relaxed mb-6"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-text-muted)'
                    }}>
                    {locale === 'ar' 
                      ? 'احصل على آخر الأخبار والرؤى التقنية مباشرة في بريدك الإلكتروني.'
                      : 'Get the latest insights and technical updates delivered straight to your inbox.'}
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider rounded-full transition-all duration-300 hover:scale-105"
                    style={{ 
                      fontFamily: 'var(--font-ui)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white'
                    }}>
                    {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                  </Link>
                </div>

                {/* Follow Us Card */}
                <div className="p-12 border rounded-[40px]"
                  style={{ 
                    borderColor: 'var(--color-border-dark)',
                    backgroundColor: 'var(--color-ink)'
                  }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                    style={{ backgroundColor: 'var(--color-gold-soft)' }}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      style={{ color: 'var(--color-gold)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black mb-4"
                    style={{ 
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--color-text)'
                    }}>
                    {locale === 'ar' ? 'تابعنا' : 'Follow Us'}
                  </h3>
                  <p className="leading-relaxed mb-6"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-text-muted)'
                    }}>
                    {locale === 'ar' 
                      ? 'انضم إلى مجتمعنا على وسائل التواصل الاجتماعي للحصول على تحديثات يومية.'
                      : 'Join our community on social media for daily updates and behind-the-scenes content.'}
                  </p>
                  <div className="flex gap-4">
                    <a href="https://www.instagram.com/khatwah.online" target="_blank" rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: 'var(--color-surface)' }}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
                        style={{ color: 'var(--color-text)' }}>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a href="https://www.tiktok.com/@khatwah.online" target="_blank" rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: 'var(--color-surface)' }}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
                        style={{ color: 'var(--color-text)' }}>
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </a>
                    <a href="https://www.facebook.com/khatwah.online" target="_blank" rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: 'var(--color-surface)' }}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
                        style={{ color: 'var(--color-text)' }}>
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="relative w-full px-6 pb-24 lg:px-20">
          <div className="mx-auto max-w-6xl relative z-10">
            <div className="text-center py-20">
              <div className="max-w-md mx-auto p-12 rounded-[40px] border"
                style={{ 
                  borderColor: 'var(--color-border-dark)',
                  backgroundColor: 'var(--color-ink)'
                }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: 'var(--color-surface)' }}>
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: 'var(--color-text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-lg leading-relaxed"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text-muted)'
                  }}>
                  {i18n[locale].blog.no_posts}
                </p>
              </div>
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
