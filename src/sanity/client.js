import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';

// Validate required environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

if (!projectId) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable. ' +
    'Please add it to your .env.local file and Vercel environment variables.'
  );
}

// Initialize Sanity client with CDN enabled for runtime fetches
export const client = createClient({
  projectId,
  dataset: 'production',
  apiVersion: '2024-04-18',
  useCdn: true, // Use CDN for faster response times
});

// Image URL builder
const builder = createImageUrlBuilder(client);

/**
 * Generate optimized image URLs from Sanity image sources
 * Automatically respects hotspot and crop data when available
 * @param {Object} source - Sanity image source object
 * @returns {Object} Image URL builder instance
 */
export function urlFor(source) {
  return builder.image(source);
}

/**
 * Reusable image fragment for consistent image queries
 * Includes LQIP for blur placeholders and dimensions for aspect ratio
 */
export const imageFragment = /* groq */ `
  asset->{
    _id,
    url,
    metadata {
      lqip,
      dimensions { width, height }
    }
  },
  alt,
  hotspot,
  crop
`;

/**
 * Fetch all posts filtered by language and ordered by creation date (newest first)
 * Projects only necessary fields for optimal performance
 * @param {string} locale - Language locale ('ar' or 'en')
 * @param {Object} options - Fetch options
 * @param {number} options.revalidate - Cache revalidation time in seconds (default: 60)
 * @returns {Promise<Array>} Array of post objects
 */
export async function getPosts(locale, { revalidate = 60 } = {}) {
  const query = /* groq */ `*[_type == "post" && language == $locale] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    mainImage {
      ${imageFragment}
    },
    excerpt,
    _createdAt,
    author->{
      name,
      image {
        ${imageFragment}
      }
    },
    categories[]->{
      title
    }
  }`;
  
  return await client.fetch(query, { locale }, {
    next: { revalidate }
  });
}

/**
 * Fetch a single post by slug with deep references
 * Includes author, categories, related posts, and all content
 * @param {string} slug - Post slug
 * @param {Object} options - Fetch options
 * @param {number} options.revalidate - Cache revalidation time in seconds (default: 60)
 * @returns {Promise<Object|null>} Post object or null if not found
 */
export async function getSinglePost(slug, { revalidate = 60 } = {}) {
  const query = /* groq */ `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    title,
    "slug": slug.current,
    language,
    seoTitle,
    seoDescription,
    mainImage {
      ${imageFragment}
    },
    excerpt,
    content,
    author->{
      name,
      image {
        ${imageFragment}
      },
      bio
    },
    categories[]->{
      title
    },
    relatedPosts[]->{
      title,
      "slug": slug.current,
      mainImage {
        ${imageFragment}
      },
      excerpt
    }
  }`;
  
  return await client.fetch(query, { slug }, {
    next: { revalidate }
  });
}

/**
 * Fetch all post slugs for static generation
 * Uses API directly (useCdn: false) for guaranteed fresh data
 * @param {string} locale - Optional language filter
 * @returns {Promise<Array>} Array of slug objects
 */
export async function getPostSlugs(locale = null) {
  const query = locale 
    ? /* groq */ `*[_type == "post" && defined(slug.current) && language == $locale] {
        "slug": slug.current,
        language
      }`
    : /* groq */ `*[_type == "post" && defined(slug.current)] {
        "slug": slug.current,
        language
      }`;
  
  return await client
    .withConfig({ useCdn: false })
    .fetch(query, locale ? { locale } : {});
}

/**
 * Fetch all authors
 * @param {Object} options - Fetch options
 * @param {number} options.revalidate - Cache revalidation time in seconds (default: 3600)
 * @returns {Promise<Array>} Array of author objects
 */
export async function getAuthors({ revalidate = 3600 } = {}) {
  const query = /* groq */ `*[_type == "author"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    image {
      ${imageFragment}
    },
    bio
  }`;
  
  return await client.fetch(query, {}, {
    next: { revalidate }
  });
}

/**
 * Fetch all categories
 * @param {Object} options - Fetch options
 * @param {number} options.revalidate - Cache revalidation time in seconds (default: 3600)
 * @returns {Promise<Array>} Array of category objects
 */
export async function getCategories({ revalidate = 3600 } = {}) {
  const query = /* groq */ `*[_type == "category"] | order(title asc) {
    _id,
    title,
    description
  }`;
  
  return await client.fetch(query, {}, {
    next: { revalidate }
  });
}
