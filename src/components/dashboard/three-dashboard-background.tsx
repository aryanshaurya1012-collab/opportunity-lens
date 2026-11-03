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

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070d1a, 0.035);

    const camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const accentLight = new THREE.PointLight(0x22d3ee, 1, 50);
    accentLight.position.set(5, 5, 5);
    scene.add(accentLight);

    const accentLight2 = new THREE.PointLight(0x2dd4bf, 0.8, 50);
    accentLight2.position.set(-5, -5, 5);
    scene.add(accentLight2);

    const particleCount = 90;
    const particles: Particle[] = [];
    const geometry = new THREE.SphereGeometry(0.07, 8, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0d9488,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
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
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.15,
    });
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

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

      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      const positions: number[] = [];
      for (const p of particles) {
        p.mesh.position.x += p.velocity.x;
        p.mesh.position.y += p.velocity.y;
        p.mesh.position.z += p.velocity.z;

        p.mesh.position.y += Math.sin(elapsed + p.mesh.position.x) * 0.003;
        p.mesh.position.x += Math.cos(elapsed + p.mesh.position.y) * 0.002;

        if (p.mesh.position.x > 10) p.mesh.position.x = -10;
        if (p.mesh.position.x < -10) p.mesh.position.x = 10;
        if (p.mesh.position.y > 6) p.mesh.position.y = -6;
        if (p.mesh.position.y < -6) p.mesh.position.y = 6;
        if (p.mesh.position.z > 10) p.mesh.position.z = -10;
        if (p.mesh.position.z < -10) p.mesh.position.z = -10;

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
      scene.remove(accentLight);
      scene.remove(accentLight2);
      scene.remove(ambientLight);
      for (const p of particles) {
        p.mesh.geometry.dispose();
      }
      (material as THREE.Material).dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
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