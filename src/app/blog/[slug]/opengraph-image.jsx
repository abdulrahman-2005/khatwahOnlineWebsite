import { ImageResponse } from 'next/og';
import { getSinglePost, urlFor } from '@/sanity/client';

export const alt = 'Khatwah Blog Post';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { slug } = await params;
  const post = await getSinglePost(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: 'linear-gradient(135deg, #0A0D0B 0%, #1a1d1b 100%)',
            color: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Khatwah Blog
        </div>
      ),
      { ...size }
    );
  }

  // If post has a main image, use it
  if (post.mainImage) {
    const imageUrl = urlFor(post.mainImage).width(1200).height(630).url();
    return fetch(imageUrl).then(res => res.arrayBuffer()).then(buffer => {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              position: 'relative',
            }}
          >
            <img
              src={imageUrl}
              alt={post.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        ),
        { ...size }
      );
    }).catch(() => {
      // Fallback if image fetch fails
      return generateTextImage(post);
    });
  }

  return generateTextImage(post);
}

function generateTextImage(post) {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #0A0D0B 0%, #1a1d1b 100%)',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 24 }}>
          {post.title}
        </div>
        {post.excerpt && (
          <div style={{ fontSize: 32, opacity: 0.8, marginTop: 24 }}>
            {post.excerpt.substring(0, 120)}...
          </div>
        )}
        <div style={{ fontSize: 28, marginTop: 48, opacity: 0.6 }}>
          Khatwah Online
        </div>
      </div>
    ),
    { ...size }
  );
}
