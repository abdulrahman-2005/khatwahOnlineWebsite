import Link from 'next/link';
import Image from 'next/image';
import { getPosts, urlFor } from '@/sanity/client';
import Eyebrow from '@/components/ui/Eyebrow';
import BlogPageClient from '@/components/blog/BlogPageClient';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

// Metadata for SEO
export const metadata = {
  title: 'Khatwah Hub | Insights & Technical Analysis',
  description: 'Technical insights, strategic perspectives, and industry analysis from the Khatwah team. Explore cutting-edge development practices and business intelligence.',
  keywords: ['innovation', 'technology insights', 'strategic thinking', 'digital transformation', 'Khatwah', 'blog', 'technical articles'],
  authors: [{ name: 'Khatwah Team' }],
  openGraph: {
    title: 'Khatwah Hub | Insights & Technical Analysis',
    description: 'Technical insights, strategic perspectives, and industry analysis from the Khatwah team.',
    type: 'website',
    url: 'https://khatwah.online/blog',
    siteName: 'Khatwah Online',
    images: [
      {
        url: 'https://khatwah.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Khatwah Blog',
      }
    ],
    locale: 'ar_EG',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khatwah Hub | Insights & Technical Analysis',
    description: 'Technical insights, strategic perspectives, and industry analysis from the Khatwah team.',
    images: ['https://khatwah.online/og-image.png'],
    creator: '@khatwah.online',
    site: '@khatwah.online',
  },
  alternates: {
    canonical: 'https://khatwah.online/blog',
    types: {
      'application/rss+xml': 'https://khatwah.online/blog/feed.xml',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function BlogPage() {
  // Fetch posts for both languages and combine them
  let allPosts = [];
  
  try {
    const englishPosts = await getPosts('en', { revalidate: 60 });
    allPosts = [...allPosts, ...englishPosts];
  } catch (error) {
    console.warn('Failed to fetch English posts:', error);
  }

  try {
    const arabicPosts = await getPosts('ar', { revalidate: 60 });
    allPosts = [...allPosts, ...arabicPosts];
  } catch (error) {
    console.warn('Failed to fetch Arabic posts:', error);
  }

  // Sort all posts by creation date
  allPosts.sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Khatwah Hub',
    description: 'Technical insights, strategic perspectives, and industry analysis from the Khatwah team.',
    url: 'https://khatwah.online/blog',
    blogPost: allPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || '',
      datePublished: post._createdAt,
      url: `https://khatwah.online/blog/${post.slug}`,
      ...(post.mainImage && {
        image: urlFor(post.mainImage).width(1200).height(630).url()
      })
    }))
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <BlogPageClient posts={allPosts} />
    </>
  );
}

