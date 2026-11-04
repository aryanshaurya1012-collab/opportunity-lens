"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function SpaceEarthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const isDark = document.documentElement.classList.contains("dark");

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      // Graceful fallback if WebGL is unavailable
      return;
    }

    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    if (isDark) {
      scene.fog = new THREE.FogExp2(0x070d1a, 0.001);
    }

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 2500);
    camera.position.z = 600;

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.75 : 1.1);
    scene.add(ambientLight);

    const mintLight = new THREE.PointLight(0x0d9488, isDark ? 1.0 : 1.3, 1200);
    mintLight.position.set(200, 100, 300);
    scene.add(mintLight);

    const tealLight = new THREE.PointLight(0x0284c7, isDark ? 0.8 : 1.1, 1200);
    tealLight.position.set(-200, -100, 300);
    scene.add(tealLight);

    // Starfield
    const starCount = 1400;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starVelocities: number[] = [];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2200;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1400;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2200;
      starVelocities.push((Math.random() - 0.5) * 0.4);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    const starMaterial = new THREE.PointsMaterial({
      color: isDark ? 0xffffff : 0x0284c7,
      size: isDark ? 1.5 : 1.7,
      transparent: true,
      opacity: isDark ? 0.65 : 0.28,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Central Earth group
    const earthGroup = new THREE.Group();
    const earthGeo = new THREE.SphereGeometry(62, 36, 36);
    const earthMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0b1b32 : 0x0284c7,
      emissive: isDark ? 0x22d3ee : 0x0d9488,
      emissiveIntensity: isDark ? 0.45 : 0.35,
      roughness: 0.35,
      metalness: 0.15,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // Glow ring
    const glowGeo = new THREE.SphereGeometry(67, 36, 36);
    const glowMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x2dd4bf : 0x38bdf8,
      transparent: true,
      opacity: isDark ? 0.16 : 0.22,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    earthGroup.add(glow);

    // Orbital ring
    const ringGeo = new THREE.RingGeometry(85, 87, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x22d3ee : 0x0d9488,
      transparent: true,
      opacity: isDark ? 0.22 : 0.28,
      side: THREE.DoubleSide,
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 2.5;
    earthGroup.add(orbitRing);

    scene.add(earthGroup);

    // Radar ping
    const pingGeo = new THREE.RingGeometry(55, 65, 64);
    const pingMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x22d3ee : 0x0d9488,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const ping = new THREE.Mesh(pingGeo, pingMat);
    ping.position.z = -5;
    scene.add(ping);

    // Initial render
    renderer.render(scene, camera);

    if (prefersReducedMotion) {
      // Respect prefers-reduced-motion by keeping the scene static
      return () => {
        renderer.dispose();
        scene.remove(ambientLight, mintLight, tealLight, stars, earthGroup, ping);
        earthGeo.dispose();
        earthMat.dispose();
        glowGeo.dispose();
        glowMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        pingGeo.dispose();
        pingMat.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
      };
    }

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    let targetScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let currentScrollY = targetScrollY;
    let prevScrollY = targetScrollY;
    let scrollVelocity = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Responsive container resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight, false);
        }
      }
    });
    resizeObserver.observe(canvas);

    const clock = new THREE.Clock();
    let pingRadius = 55;
    let pingOpacity = 0;
    let pingGrowing = false;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth scroll interpolation
      currentScrollY += (targetScrollY - currentScrollY) * 0.08;
      scrollVelocity = currentScrollY - prevScrollY;
      prevScrollY = currentScrollY;

      const docHeight = Math.max(
        1,
        (document.documentElement.scrollHeight || 1000) - window.innerHeight,
      );
      const scrollRatio = Math.min(1, Math.max(0, currentScrollY / docHeight));

      // Scroll-driven camera dynamics
      const targetCamZ = 600 - scrollRatio * 180;
      const targetCamY = mouseY * 70 - scrollRatio * 80;
      const targetCamX = mouseX * 90;

      camera.position.z += (targetCamZ - camera.position.z) * 0.06;
      camera.position.y += (targetCamY - camera.position.y) * 0.06;
      camera.position.x += (targetCamX - camera.position.x) * 0.06;

      const targetLookY = -scrollRatio * 40;
      camera.lookAt(0, targetLookY, 0);

      // Earth rotation and scroll-reactive orientation
      const activeSpinBonus = Math.abs(scrollVelocity) * 0.002;
      earthGroup.rotation.y += 0.0025 + activeSpinBonus;
      earthGroup.rotation.x =
        Math.sin(elapsed * 0.2) * 0.05 + scrollRatio * 0.45;
      earthGroup.position.y = -scrollRatio * 60;
      orbitRing.rotation.z += 0.001;

      // Stars responsive stream / warp on scroll
      const positions = starGeometry.attributes.position.array as Float32Array;
      const streamVelocity = scrollVelocity * 0.55;

      for (let i = 0; i < starCount; i++) {
        positions[i * 3 + 2] += starVelocities[i] + streamVelocity;
        if (positions[i * 3 + 2] > 1100) positions[i * 3 + 2] -= 2200;
        if (positions[i * 3 + 2] < -1100) positions[i * 3 + 2] += 2200;
      }
      starGeometry.attributes.position.needsUpdate = true;

      // Radar ping pulse (reacts to active scroll)
      const triggerChance = Math.abs(scrollVelocity) > 2 ? 0.04 : 0.008;
      if (!pingGrowing && Math.random() < triggerChance) {
        pingGrowing = true;
        pingRadius = 55;
        pingOpacity = 0.5;
        ping.position.y = earthGroup.position.y;
      }

      if (pingGrowing) {
        pingRadius += 2.2;
        pingOpacity -= 0.02;
        if (pingOpacity <= 0) {
          pingGrowing = false;
          pingOpacity = 0;
        }
        ping.scale.set(pingRadius / 55, pingRadius / 55, 1);
        pingMat.opacity = Math.max(0, pingOpacity);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);

      renderer.dispose();
      scene.remove(ambientLight, mintLight, tealLight, stars, earthGroup, ping);
      earthGeo.dispose();
      earthMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pingGeo.dispose();
      pingMat.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full pointer-events-none block"
      aria-hidden="true"
    />
  );
}
