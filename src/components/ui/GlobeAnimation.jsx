import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/contexts/ThemeContext';

const getCSSVar = (varName, fallback) => {
  if (typeof window !== 'undefined') {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || fallback;
  }
  return fallback;
};

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
  const arishGroupRef = useRef();
  const markerRef = useRef();
  const beaconRef = useRef();
  const [hovered, setHovered] = useState(false);
  const GLOBE_RADIUS = mobile ? 2.0 : 2.3;
  const { theme } = useTheme();

  const texture = useLoader(
    THREE.TextureLoader,
    '/textures/earth_specular_2048.jpg'
  );

  const latReal = 31.13;
  const lonReal = 33.80;

  const uniforms = useMemo(() => {
    const isLight = theme === 'light';
    const landColorHex = isLight ? '#D1D5DB' : '#ee930c'; 
    const seaColorHex = isLight ? '#CBD5E1' : '#0247FE';  
    const gridColorHex = isLight ? '#4B5563' : '#001B48'; 

    return {
      earthMap: { value: texture },
      colorLand: { value: new THREE.Color(landColorHex) },
      colorSea: { value: new THREE.Color(seaColorHex) },
      gridColor: { value: new THREE.Color(gridColorHex) },
      isLight: { value: isLight ? 1.0 : 0.0 }
    };
  }, [theme, texture]);

  const { arishPoints, arishColors, targetPosition, beaconPoints } = useMemo(() => {
    const points = [];
    const colors = [];
    const colorGold = new THREE.Color(getCSSVar('--color-gold', '#ee930c'));
    const colorAccent = new THREE.Color(getCSSVar('--color-accent', '#FF3D6B'));
    const height = .8;
    const baseWidth = 5.0;

    for (let dy = 0; dy <= height; dy += 0.05) {
      const currentWidth = baseWidth * (1 - (dy / height));
      for (let dx = -currentWidth/2; dx <= currentWidth/2; dx += 0.05) {
        const pLat = latReal - dy;
        const pLon = lonReal + dx;
        const pos = getGeoCoordinates(pLat, pLon, GLOBE_RADIUS + 0.01);
        points.push(pos.x, pos.y, pos.z);
        if (Math.random() > 0.85) {
          colors.push(colorAccent.r, colorAccent.g, colorAccent.b);
        } else {
          colors.push(colorGold.r, colorGold.g, colorGold.b);
        }
      }
    }
    const centerPos = getGeoCoordinates(latReal - (height/2), lonReal, GLOBE_RADIUS + 0.02);
    const beaconTop = getGeoCoordinates(latReal - (height/2), lonReal, GLOBE_RADIUS + 0.6);
    return {
      arishPoints: new Float32Array(points),
      arishColors: new Float32Array(colors),
      targetPosition: [centerPos.x, centerPos.y, centerPos.z],
      beaconPoints: [centerPos, beaconTop]
    };
  }, [theme, GLOBE_RADIUS]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = time * 0.015;
    if (arishGroupRef.current) arishGroupRef.current.rotation.y = time * 0.015;
    if (markerRef.current) {
        const scale = 1 + Math.sin(time * 3) * 0.3;
        markerRef.current.scale.set(scale, scale, scale);
        markerRef.current.material.opacity = 0.3 + Math.sin(time * 3) * 0.5;
    }
    if (beaconRef.current) {
        beaconRef.current.material.opacity = 0.5 + Math.sin(time * 5) * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[GLOBE_RADIUS, mobile ? 64 : 128, mobile ? 64 : 128]} />
        <shaderMaterial
          attach="material"
          vertexShader={EarthShaderMaterial.vertexShader}
          fragmentShader={EarthShaderMaterial.fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
      <group ref={arishGroupRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={arishPoints.length / 3} array={arishPoints} itemSize={3} />
            <bufferAttribute attach="attributes-color" count={arishColors.length / 3} array={arishColors} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={mobile ? 0.025 : 0.018} vertexColors={true} transparent opacity={0.9} blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending} depthWrite={false} />
        </points>
        <Line ref={beaconRef} points={beaconPoints} color={getCSSVar('--color-accent', '#FF3D6B')} lineWidth={mobile ? 8 : 15} transparent blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending} />
        <mesh position={targetPosition} ref={markerRef}>
           <ringGeometry args={[0.04, 0.05, 35]} />
           <meshBasicMaterial color={getCSSVar('--color-gold', '#ee930c')} transparent opacity={0.8} side={THREE.DoubleSide} blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  );
};

export const ArishGlobe = ({ mobile }) => {
  const initialCamPos = getGeoCoordinates(31.13, 33.80, mobile ? 10 : 8);
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas 
        camera={{ position: [initialCamPos.x, initialCamPos.y, initialCamPos.z], fov: mobile ? 45 : 55 }}
        gl={{ antialias: !mobile, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1} />
        <React.Suspense fallback={null}>
          <ActualEarthAndArish mobile={mobile} />
        </React.Suspense>
        <OrbitControls enableZoom={false} autoRotate={true} autoRotateSpeed={mobile ? 0.8 : 0.4} enablePan={false} />
      </Canvas>
    </div>
  );
};