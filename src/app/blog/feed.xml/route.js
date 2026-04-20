import { getPosts, urlFor } from '@/sanity/client';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const baseUrl = 'https://khatwah.online';
  
  // Fetch all posts
  let allPosts = [];
  
  try {
    const englishPosts = await getPosts('en', { revalidate: 60 });
    allPosts = [...allPosts, ...englishPosts];
  } catch (error) {
    console.warn('Failed to fetch English posts for RSS:', error);
  }

  try {
    const arabicPosts = await getPosts('ar', { revalidate: 60 });
    allPosts = [...allPosts, ...arabicPosts];
  } catch (error) {
    console.warn('Failed to fetch Arabic posts for RSS:', error);
  }

  // Sort by date
  allPosts.sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Khatwah Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Technical insights, strategic perspectives, and industry analysis from the Khatwah team.</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/og-image.png</url>
      <title>Khatwah Blog</title>
      <link>${baseUrl}/blog</link>
    </image>
    ${allPosts.map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const imageUrl = post.mainImage 
        ? urlFor(post.mainImage).width(1200).height(630).url()
        : `${baseUrl}/og-image.png`;
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.excerpt || post.title}]]></description>
      <pubDate>${new Date(post._createdAt).toUTCString()}</pubDate>
      ${post.author ? `<dc:creator><![CDATA[${post.author.name}]]></dc:creator>` : ''}
      ${post.categories?.map(cat => `<category><![CDATA[${cat.title}]]></category>`).join('\n      ') || ''}
      <enclosure url="${imageUrl}" type="image/jpeg"/>
    </item>`;
    }).join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
