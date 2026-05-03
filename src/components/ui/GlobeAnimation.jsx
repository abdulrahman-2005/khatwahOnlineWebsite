import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/contexts/ThemeContext';

const EarthShaderMaterial = {
  uniforms: {
    earthMap: { value: null },
    colorSea: { value: new THREE.Color() },
    colorLand: { value: new THREE.Color() },
    gridColor: { value: new THREE.Color() },
    isLight: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D earthMap;
    uniform vec3 colorSea;
    uniform vec3 colorLand;
    uniform vec3 gridColor;
    uniform float isLight;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec4 texColor = texture2D(earthMap, vUv);
      float isWater = texColor.r;

      vec3 finalColor = mix(colorLand, colorSea, isWater);

      vec2 grid = fract(vUv * vec2(400.0, 200.0));
      float dist = length(grid - vec2(0.5));
      float dotPattern = smoothstep(0.35, 0.25, dist);

      if (isWater < 0.1) {
        vec3 darkLandBase = colorLand * (isLight > 0.5 ? 0.75 : 0.3);
        finalColor = mix(darkLandBase, gridColor, dotPattern * (isLight > 0.5 ? 0.6 : 0.9));
      } else {
        float scanline = sin(vUv.y * 600.0) * (isLight > 0.5 ? 0.05 : 0.03);
        finalColor += scanline;
      }

      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
      fresnel = pow(fresnel, isLight > 0.5 ? 3.5 : 2.8);

      vec3 glowColor = mix(colorSea, vec3(0.5, 0.8, 1.0), 0.5);
      finalColor += glowColor * fresnel * (isLight > 0.5 ? 1.5 : 1.8);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const getGeoCoordinates = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
};

const ActualEarthAndArish = ({ mobile }) => {
  const earthRef = useRef();
  const GLOBE_RADIUS = mobile ? 2.0 : 2.3;
  const { theme } = useTheme();

  const texture = useLoader(
    THREE.TextureLoader,
    '/textures/earth_specular_2048.webp'
  );

  const uniforms = useMemo(() => {
    const isLight = theme === 'light';
    const landColorHex = isLight ? '#84CC16' : '#4D7C0F';  
    const seaColorHex  = isLight ? '#38BDF8' : '#0369A1';  
    const gridColorHex = isLight ? '#1F2937' : '#94A3B8';  

    return {
      earthMap: { value: texture },
      colorLand: { value: new THREE.Color(landColorHex) },
      colorSea: { value: new THREE.Color(seaColorHex) },
      gridColor: { value: new THREE.Color(gridColorHex) },
      isLight: { value: isLight ? 1.0 : 0.0 }
    };
  }, [theme, texture]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = time * 0.015;
  });

  return (
    <group>
      <mesh ref={earthRef} renderOrder={1}>
        <sphereGeometry args={[GLOBE_RADIUS, mobile ? 64 : 128, mobile ? 64 : 128]} />
        <shaderMaterial
          attach="material"
          vertexShader={EarthShaderMaterial.vertexShader}
          fragmentShader={EarthShaderMaterial.fragmentShader}
          uniforms={uniforms}
          transparent={false}
          opacity={1.0}
          depthWrite={true}
          depthTest={true}
          side={THREE.FrontSide}
          alphaTest={0}
        />
      </mesh>
    </group>
  );
};

export const ArishGlobe = ({ mobile }) => {
  const initialCamPos = getGeoCoordinates(31.13, 33.80, mobile ? 10 : 8);
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // Aggressive memory management: Only mount WebGL when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '200px' } // Pre-load 200px before it scrolls into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {isInView && (
        <Canvas 
          camera={{ position: [initialCamPos.x, initialCamPos.y, initialCamPos.z], fov: mobile ? 45 : 55 }}
          gl={{ 
            antialias: !mobile, 
            powerPreference: "high-performance",
            alpha: true,
            depth: true,
            premultipliedAlpha: false
          }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1} />
          <React.Suspense fallback={null}>
            <ActualEarthAndArish mobile={mobile} />
          </React.Suspense>
          <OrbitControls enableZoom={false} autoRotate={true} autoRotateSpeed={mobile ? 0.8 : 0.4} enablePan={false} />
        </Canvas>
      )}
    </div>
  );
};