import { ImageResponse } from 'next/og';
import projects from '../../../../data/projects.json';

export const alt = 'Khatwah Project';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
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
          Khatwah Projects
        </div>
      ),
      { ...size }
    );
  }

  // If project has an image, try to use it
  const projectImage = project.image || project.images?.[0];
  
  if (projectImage) {
    const imageUrl = `https://khatwah.online${projectImage}`;
    
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            background: 'linear-gradient(135deg, #0A0D0B 0%, #1a1d1b 100%)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 80,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 32,
                textAlign: 'center',
              }}
            >
              {project.titleAr}
            </div>
            <div
              style={{
                fontSize: 32,
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                maxWidth: '80%',
              }}
            >
              {project.descriptionAr?.substring(0, 150)}...
            </div>
            <div
              style={{
                fontSize: 28,
                color: 'rgba(255, 255, 255, 0.6)',
                marginTop: 48,
              }}
            >
              Khatwah Online
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // Text-only fallback
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
          {project.titleAr}
        </div>
        <div style={{ fontSize: 32, opacity: 0.8, marginTop: 24, maxWidth: '80%' }}>
          {project.descriptionAr?.substring(0, 150)}...
        </div>
        <div style={{ fontSize: 28, marginTop: 48, opacity: 0.6 }}>
          Khatwah Online
        </div>
      </div>
    ),
    { ...size }
  );
}
