"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Star {
  mesh: THREE.Points;
  velocity: number;
  baseZ: number;
}

export function SpaceEarthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a15, 0.02);

    const camera = new THREE.PerspectiveCamera(
      55,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      2000,
    );
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Mint accent light
    const mintLight = new THREE.PointLight(0x22d3ee, 0.8, 1000);
    mintLight.position.set(200, 100, 300);
    scene.add(mintLight);

    const tealLight = new THREE.PointLight(0x2dd4bf, 0.6, 1000);
    tealLight.position.set(-200, -100, 300);
    scene.add(tealLight);

    // Starfield
    const starCount = 1500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starVelocities: number[] = [];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
      starVelocities.push((Math.random() - 0.5) * 0.5);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Central "Earth" sphere with glow
    const earthGroup = new THREE.Group();
    const earthGeo = new THREE.SphereGeometry(60, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x0b1b32,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // Glow ring around earth
    const glowGeo = new THREE.SphereGeometry(65, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    earthGroup.add(glow);
    scene.add(earthGroup);

    // Radar ping effect
    const pingGeo = new THREE.RingGeometry(55, 65, 64);
    const pingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const ping = new THREE.Mesh(pingGeo, pingMat);
    ping.position.z = -5;
    scene.add(ping);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();
    let pingRadius = 55;
    let pingOpacity = 0;
    let pingGrowing = false;

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Camera drift with mouse
      camera.position.x += (mouseX * 100 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 80 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Rotate earth slowly
      earthGroup.rotation.y += 0.002;
      earthGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.05;

      // Animate stars (parallax drift)
      const positions = starGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        positions[i * 3 + 2] += starVelocities[i];
        if (positions[i * 3 + 2] > 1000) positions[i * 3 + 2] -= 2000;
        if (positions[i * 3 + 2] < -1000) positions[i * 3 + 2] += 2000;
      }
      starGeometry.attributes.position.needsUpdate = true;

      // Radar ping pulse
      if (!pingGrowing && Math.random() < 0.01) {
        pingGrowing = true;
        pingRadius = 55;
        pingOpacity = 0.5;
      }
      if (pingGrowing) {
        pingRadius += 2;
        pingOpacity -= 0.02;
        if (pingOpacity <= 0) {
          pingGrowing = false;
          pingOpacity = 0;
        }
        ping.scale.set(pingRadius / 55, pingRadius / 55, 1);
        ping.material.opacity = Math.max(0, pingOpacity);
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
      scene.remove(ambientLight, mintLight, tealLight, stars, earthGroup, ping);
      earthGeo.dispose();
      earthMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      pingGeo.dispose();
      pingMat.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
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
