"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
}

export function ThreeDashboardBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      return;
    }

    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    if (isDark) {
      scene.fog = new THREE.FogExp2(0x070d1a, 0.025);
    }

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 12;

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.4 : 0.8);
    scene.add(ambientLight);

    const accentLight = new THREE.PointLight(isDark ? 0x22d3ee : 0x0d9488, 1, 50);
    accentLight.position.set(5, 5, 5);
    scene.add(accentLight);

    const accentLight2 = new THREE.PointLight(isDark ? 0x2dd4bf : 0x0284c7, 0.8, 50);
    accentLight2.position.set(-5, -5, 5);
    scene.add(accentLight2);

    const particleCount = 85;
    const particles: Particle[] = [];
    const geometry = new THREE.SphereGeometry(0.07, 8, 8);
    const material = new THREE.MeshStandardMaterial({
      color: isDark ? 0x22d3ee : 0x0d9488,
      emissive: isDark ? 0x0d9488 : 0x0284c7,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: isDark ? 0.8 : 0.6,
    });

    for (let i = 0; i < particleCount; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 18;
      mesh.position.set(x, y, z);
      scene.add(mesh);

      particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ),
      });
    }

    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: isDark ? 0x2dd4bf : 0x0d9488,
      transparent: true,
      opacity: isDark ? 0.15 : 0.12,
    });
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    renderer.render(scene, camera);

    if (prefersReducedMotion) {
      return () => {
        renderer.dispose();
        scene.remove(accentLight, accentLight2, ambientLight, lineMesh);
        for (const p of particles) {
          p.mesh.geometry.dispose();
        }
        material.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
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
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth scroll lerping
      currentScrollY += (targetScrollY - currentScrollY) * 0.08;
      scrollVelocity = currentScrollY - prevScrollY;
      prevScrollY = currentScrollY;

      const docHeight = Math.max(
        1,
        (document.documentElement.scrollHeight || 1000) - window.innerHeight,
      );
      const scrollRatio = Math.min(1, Math.max(0, currentScrollY / docHeight));

      const targetCamX = mouseX * 2;
      const targetCamY = mouseY * 1.5 - scrollRatio * 3.5;
      const targetCamZ = 12 - scrollRatio * 3;

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;
      camera.lookAt(scene.position.x, scene.position.y - scrollRatio * 2, scene.position.z);

      const scrollImpulse = Math.abs(scrollVelocity) * 0.003;

      const positions: number[] = [];
      for (const p of particles) {
        p.mesh.position.x += p.velocity.x;
        p.mesh.position.y += p.velocity.y - scrollVelocity * 0.001;
        p.mesh.position.z += p.velocity.z;

        p.mesh.position.y += Math.sin(elapsed + p.mesh.position.x) * (0.003 + scrollImpulse);
        p.mesh.position.x += Math.cos(elapsed + p.mesh.position.y) * 0.002;

        if (p.mesh.position.x > 10) p.mesh.position.x = -10;
        if (p.mesh.position.x < -10) p.mesh.position.x = 10;
        if (p.mesh.position.y > 6) p.mesh.position.y = -6;
        if (p.mesh.position.y < -6) p.mesh.position.y = 6;
        if (p.mesh.position.z > 10) p.mesh.position.z = -10;
        if (p.mesh.position.z < -10) p.mesh.position.z = 10;

        const scale = 1 + Math.sin(elapsed * 2 + p.mesh.position.x) * 0.15;
        p.mesh.scale.set(scale, scale, scale);

        positions.push(p.mesh.position.x, p.mesh.position.y, p.mesh.position.z);
      }

      lineGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(positions), 3),
      );

      const linePositions: number[] = [];
      const threshold = 3.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = particles[i].mesh.position.distanceTo(
            particles[j].mesh.position,
          );
          if (d < threshold) {
            linePositions.push(
              particles[i].mesh.position.x,
              particles[i].mesh.position.y,
              particles[i].mesh.position.z,
            );
            linePositions.push(
              particles[j].mesh.position.x,
              particles[j].mesh.position.y,
              particles[j].mesh.position.z,
            );
          }
        }
      }
      lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3),
      );

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);

      renderer.dispose();
      scene.remove(accentLight, accentLight2, ambientLight, lineMesh);
      for (const p of particles) {
        p.mesh.geometry.dispose();
      }
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
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
