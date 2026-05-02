import { notFound } from 'next/navigation';
import { getSinglePost, getPostSlugs, urlFor } from '@/sanity/client';
import { BlogPostPage } from '@/components/blog/BlogPostPage';
import { seoConfig } from '@/lib/seo';

// Generate static params for all posts
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getSinglePost(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Khatwah Blog',
      description: 'The blog post you are looking for could not be found.',
    };
  }

  const ogImage = post.mainImage 
    ? urlFor(post.mainImage).width(1200).height(630).url()
    : `${seoConfig.baseUrl}/og-image.png`;

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || post.title;
  const url = `${seoConfig.baseUrl}/blog/${post.slug}`;

  return {
    title: `${title} | Khatwah Blog`,
    description: description,
    keywords: post.categories?.map(cat => cat.title).join(', ') || 'blog, technology, insights',
    authors: post.author ? [{ name: post.author.name }] : [{ name: 'Khatwah Team' }],
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      publishedTime: post._createdAt,
      modifiedTime: post._updatedAt || post._createdAt,
      authors: post.author ? [post.author.name] : ['Khatwah Team'],
      url: url,
      siteName: 'Khatwah Online',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.mainImage?.alt || post.title,
        }
      ],
      locale: post.language === 'ar' ? 'ar_EG' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage],
      creator: '@khatwah.online',
      site: '@khatwah.online',
    },
    alternates: {
      canonical: url,
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
}

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function BlogPost({ params }) {
  const { slug } = await params;
  
  try {
    const post = await getSinglePost(slug);

    if (!post) {
      notFound();
    }

    // Structured data for article (BlogPosting schema)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt || post.title,
      datePublished: post._createdAt,
      dateModified: post._updatedAt || post._createdAt,
      author: post.author ? {
        '@type': 'Person',
        name: post.author.name,
        url: post.author.url || `${seoConfig.baseUrl}/about`
      } : {
        '@type': 'Organization',
        name: 'Khatwah Online',
        url: seoConfig.baseUrl
      },
      publisher: {
        '@type': 'Organization',
        name: 'Khatwah Online',
        url: seoConfig.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${seoConfig.baseUrl}/og-image.png`
        }
      },
      image: post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : undefined,
      url: `${seoConfig.baseUrl}/blog/${post.slug}`
    };

    return (
      <>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        <BlogPostPage post={post} />
      </>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}
