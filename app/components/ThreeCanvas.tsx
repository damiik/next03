import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [rendererError, setRendererError] = useState<string | null>(null);

  useEffect(() => {
    let scene: THREE.Scene | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let geometry: THREE.BoxGeometry | undefined;
    let material: THREE.MeshStandardMaterial | undefined;
    let cube: THREE.Mesh | undefined;
    let animate: FrameRequestCallback;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      renderer = new THREE.WebGLRenderer();
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      geometry = new THREE.BoxGeometry();
      material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.receiveShadow = true;
      scene.add(cube);

      // Add a light source to cast shadows
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 10, 7.5);
      light.castShadow = true;
      scene.add(light);

      animate = (time: number) => {
        requestAnimationFrame(animate);
        if (cube) {
          cube.rotation.x += 0.01 + time * 0.000001;
          cube.rotation.y += 0.01 + time * 0.000001;
        }
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
    } catch (error) {
      console.error("Error creating WebGL renderer:", error);
      setRendererError("WebGL is not supported in this browser or environment. Please try a different browser or update your graphics drivers.");
      return;
    }

    if (mountRef.current && renderer) {
      mountRef.current.appendChild(renderer.domElement);
      const width = mountRef.current?.clientWidth || 400;
      const height = mountRef.current?.clientHeight || 400;
      renderer.setSize(width, height);
      if (camera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    }

    if (camera) {
      camera.position.z = 5;
    }

    if (animate) {
      animate(0);
    }

    return () => {
      if (mountRef.current && renderer && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (rendererError) {
    return <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200">{rendererError}</div>;
  }

  return <div ref={mountRef} style={{ width: '100%', height: '400px' }} />;
};