# Sanity Integration Guide

Production-ready Sanity client configuration for Next.js App Router.

## Setup

### Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=a1dj7yvt
```

## Usage Examples

### Fetching Posts

```javascript
import { getPosts, getSinglePost } from '@/sanity/client';

// Get all posts (cached for 60 seconds by default)
const posts = await getPosts();

// Get all posts with custom revalidation
const posts = await getPosts({ revalidate: 3600 }); // 1 hour

// Get single post
const post = await getSinglePost('my-post-slug');

// Get single post with custom revalidation
const post = await getSinglePost('my-post-slug', { revalidate: 300 }); // 5 minutes
```

### Rendering Images

```javascript
import { SanityImage } from '@/components/ui/SanityImage';

export default function PostCard({ post }) {
  return (
    <article>
      <SanityImage 
        value={post.mainImage}
        width={800}
        height={600}
        priority={false}
        sizes="(max-width: 768px) 100vw, 800px"
        className="rounded-lg"
      />
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </article>
  );
}
```

### Manual Image URL Generation

```javascript
import { urlFor } from '@/sanity/client';

// Generate optimized image URL
const imageUrl = urlFor(post.mainImage)
  .width(1200)
  .height(630)
  .fit('crop')
  .url();

// For Open Graph images
export async function generateMetadata({ params }) {
  const post = await getSinglePost(params.slug);
  
  return {
    title: post.title,
    openGraph: {
      images: [
        {
          url: urlFor(post.mainImage).width(1200).height(630).url(),
          width: 1200,
          height: 630,
        }
      ]
    }
  };
}
```

### Static Generation

```javascript
import { getPostSlugs } from '@/sanity/client';

// Generate static params for all posts
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}
```

## Performance Tips

1. **Use CDN**: The client is configured with `useCdn: true` for faster response times
2. **Cache Control**: All fetch functions support custom `revalidate` options
3. **Image Optimization**: Always use `SanityImage` component for automatic optimization
4. **LQIP**: Blur placeholders are automatically applied when available
5. **Hotspot**: Image cropping respects editor-defined focal points

## Query Patterns

All queries follow Sanity best practices:

- ✅ Always project specific fields (no `...` spreading)
- ✅ Use `defined(slug.current)` for optimizable filters
- ✅ Order before slice: `order()[0...N]`
- ✅ Include LQIP and dimensions for images
- ✅ Use `/* groq */` comments for syntax highlighting

## Next Steps

- Set up tag-based revalidation for instant updates
- Configure Visual Editing with Presentation Tool
- Add TypeGen for type safety
- Implement pagination for large datasets
