"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a15, 0.04);

    const camera = new THREE.PerspectiveCamera(
      55,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Subtle accent light
    const accentLight = new THREE.PointLight(0x22d3ee, 0.5, 20);
    accentLight.position.set(2, 2, 4);
    scene.add(accentLight);

    // Fluid-like line geometry
    const pointCount = 200;
    const lineCount = 15;
    const lineGroups: THREE.Line[] = [];

    for (let l = 0; l < lineCount; l++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(pointCount * 3);
      const velocities: number[] = [];
      const phases: number[] = [];

      for (let i = 0; i < pointCount; i++) {
        const t = i / (pointCount - 1);
        positions[i * 3] = (t - 0.5) * 8;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        velocities.push((Math.random() - 0.5) * 0.01);
        phases.push(Math.random() * Math.PI * 2);
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.25,
      });
      const line = new THREE.Line(geometry, material);
      (line as any).userData = { velocities, phases, positions };
      scene.add(line);
      lineGroups.push(line);
    }

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Gentle camera drift
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.4 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Animate fluid lines
      for (const line of lineGroups) {
        const { velocities, phases, positions } = (line as any).userData;
        const posAttr = line.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        for (let i = 0; i < pointCount; i++) {
          arr[i * 3 + 1] += velocities[i];
          arr[i * 3 + 1] +=
            Math.sin(elapsed * 0.5 + phases[i] + arr[i * 3] * 0.5) * 0.005;
          arr[i * 3 + 2] +=
            Math.cos(elapsed * 0.3 + phases[i]) * 0.003;

          // Wrap around
          if (arr[i * 3 + 1] > 1) arr[i * 3 + 1] = -1;
          if (arr[i * 3 + 1] < -1) arr[i * 3 + 1] = 1;
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
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.remove(ambientLight, accentLight, ...lineGroups);
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
