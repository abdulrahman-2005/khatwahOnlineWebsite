"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useMediaQuery } from "react-responsive";
import { useTheme } from "@/contexts/ThemeContext";

const ParticleField = () => {
  const mountRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const prefersReducedMotion = useMediaQuery({ query: "(prefers-reduced-motion: reduce)" });
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { theme } = useTheme();

  const lerp = (a, b, t) => a * (1 - t) + b * t;

  const animate = useCallback((scene, camera, renderer, points) => {
    if (prefersReducedMotion) return;

    const targetX = mouseX.current * 0.4;
    const targetY = mouseY.current * 0.4;

    camera.position.x = lerp(camera.position.x, targetX, 0.05);
    camera.position.y = lerp(camera.position.y, targetY, 0.05);
    camera.lookAt(scene.position);

    points.rotation.y += isMobile ? 0.0004 : 0.0008; // Slower for mobile performance
    renderer.render(scene, camera);
  }, [prefersReducedMotion, isMobile]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true }); // No AA on mobile for performance
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    const particleCount = isMobile ? 800 : 2000;
    const spread = isMobile ? 15 : 12; // Wider spread for mobile perspective

    const isLight = theme === 'light';
    const primaryColor = new THREE.Color(isLight ? '#0230B1' : '#4A7AFA'); 
    const secondaryColor = new THREE.Color(isLight ? '#C36E0E' : '#FFFFFF');

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread;
      vertices.push(x, y, z);

      const mix = Math.random();
      const color = new THREE.Color().lerpColors(primaryColor, secondaryColor, mix);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isLight ? (isMobile ? 0.15 : 0.12) : 0.05,
      opacity: isLight ? 0.6 : 0.6,
      transparent: true,
      vertexColors: true,
      blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const onMouseMove = (event) => {
      mouseX.current = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    if (!isMobile) window.addEventListener("mousemove", onMouseMove);

    let frameId;
    const renderScene = () => {
      animate(scene, camera, renderer, points);
      frameId = requestAnimationFrame(renderScene);
    };
    renderScene();

    const onWindowResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      if (!isMobile) window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onWindowResize);
      cancelAnimationFrame(frameId);
      currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [animate, prefersReducedMotion, theme, isMobile]);

  return <div ref={mountRef} className="absolute inset-0" />;
};

export default ParticleField;