"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface LineUserData {
  velocities: number[];
  phases: number[];
}

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isDark = document.documentElement.classList.contains("dark");

    const scene = new THREE.Scene();
    if (isDark) {
      scene.fog = new THREE.FogExp2(0x0b1322, 0.015);
    }

    const camera = new THREE.PerspectiveCamera(
      55,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.4 : 0.8);
    scene.add(ambientLight);

    // Accent lights
    const accentLight = new THREE.PointLight(isDark ? 0x22d3ee : 0x0d9488, isDark ? 0.6 : 0.9, 25);
    accentLight.position.set(2, 2, 4);
    scene.add(accentLight);

    const accentLight2 = new THREE.PointLight(isDark ? 0x2dd4bf : 0x0284c7, isDark ? 0.4 : 0.7, 25);
    accentLight2.position.set(-2, -2, 3);
    scene.add(accentLight2);

    // Fluid-like line geometry
    const pointCount = 200;
    const lineCount = 18;
    const lineGroups: THREE.Line[] = [];

    for (let l = 0; l < lineCount; l++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(pointCount * 3);
      const velocities: number[] = [];
      const phases: number[] = [];

      const layerOffset = (l / lineCount - 0.5) * 3;

      for (let i = 0; i < pointCount; i++) {
        const t = i / (pointCount - 1);
        positions[i * 3] = (t - 0.5) * 9;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5 + layerOffset * 0.3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 3 + layerOffset;
        velocities.push((Math.random() - 0.5) * 0.008);
        phases.push(Math.random() * Math.PI * 2);
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({
        color: isDark
          ? (l % 2 === 0 ? 0x2dd4bf : 0x22d3ee)
          : (l % 2 === 0 ? 0x0d9488 : 0x0284c7),
        transparent: true,
        opacity: isDark ? 0.22 + (l / lineCount) * 0.12 : 0.18 + (l / lineCount) * 0.08,
      });
      const line = new THREE.Line(geometry, material);
      const userData: LineUserData = { velocities, phases };
      line.userData = userData;
      scene.add(line);
      lineGroups.push(line);
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

      // Scroll and mouse reactive camera
      const targetCamX = mouseX * 0.45;
      const targetCamY = mouseY * 0.35 - scrollRatio * 1.2;
      const targetCamZ = 4.2 - scrollRatio * 0.8;

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;

      camera.lookAt(0, -scrollRatio * 0.6, 0);

      // Animate fluid lines with scroll speed responsiveness
      const activeWaveBonus = Math.abs(scrollVelocity) * 0.012;
      const waveSpeed = 0.6 + activeWaveBonus;

      for (const line of lineGroups) {
        const { velocities, phases } = line.userData as LineUserData;
        const posAttr = line.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        for (let i = 0; i < pointCount; i++) {
          arr[i * 3 + 1] += velocities[i];
          arr[i * 3 + 1] +=
            Math.sin(elapsed * waveSpeed + phases[i] + arr[i * 3] * 0.6) *
            (0.004 + activeWaveBonus * 0.3);
          arr[i * 3 + 2] +=
            Math.cos(elapsed * 0.35 + phases[i]) * 0.003 - scrollVelocity * 0.0015;

          // Wrap around in boundaries
          if (arr[i * 3 + 1] > 1.8) arr[i * 3 + 1] = -1.8;
          if (arr[i * 3 + 1] < -1.8) arr[i * 3 + 1] = 1.8;
          if (arr[i * 3 + 2] > 3) arr[i * 3 + 2] = -3;
          if (arr[i * 3 + 2] < -3) arr[i * 3 + 2] = 3;
        }

        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      renderer.dispose();
      scene.remove(ambientLight, accentLight, accentLight2, ...lineGroups);
      for (const line of lineGroups) {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
