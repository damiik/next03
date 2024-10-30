"use client";
import React, { useState, useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import * as Babel from '@babel/standalone';
import { useComponentContext } from '../context/ComponentContext';
import * as THREE from 'three';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

const ThreeCanvas = () => {
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

const ComponentVisualizer = () => {
  const { components, previewKey, isRefreshing, setEditableCode, setComponentCompileError, componentCompileError, ...rest } = useComponentContext();
  const [editableCode, setEditableCodeLocal] = useState('');

  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType | null>(null);
  const { selectedComponent } = useComponentContext();

  const compileAndRender = (code: string) => {
    try {
      console.log("Code to compile:", code);
      const transformedCode = Babel.transform(code, { presets: ['react'] }).code;
      console.log("Transformed code:", transformedCode);
      if (!transformedCode) {
        throw new Error("Babel transformation failed.");
      }

      // Pass React, hooks, and other necessary variables to the compiled component
      const Component = new Function('React', 'useState', 'useEffect', 'useRef', 'THREE', 'Play', 'Pause', 'SkipForward', 'SkipBack', ...Object.keys(rest), `
        return (${transformedCode})
      `)(React, React.useState, React.useEffect, React.useRef, THREE, Play, Pause, SkipForward, SkipBack,...Object.values(rest));

      if (typeof Component !== 'function' && typeof Component !== 'object') {
        throw new Error('Compiled code did not return a valid component.');
      }
      setCompiledComponent(() => Component);
      setComponentCompileError('');
    } catch (err: unknown) {
      console.error("Compilation error:", err);
      setComponentCompileError((err as Error).message);
      setCompiledComponent(null);
    }
  };

  useEffect(() => {
    if (selectedComponent) {
      const componentCode = components[selectedComponent] || '';
      setEditableCodeLocal(componentCode);
      compileAndRender(componentCode);
    } else {
      setCompiledComponent(() => ThreeCanvas);
    }
  }, [selectedComponent, components]);

  const handleCodeChange = (newCode: string) => {
    setEditableCodeLocal(newCode);
    setEditableCode((prev) => ({ ...prev, [selectedComponent]: newCode }));
    compileAndRender(newCode);
  };

  const renderPreview = () => {
    if (componentCompileError) return <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200">Error --&ge;: {componentCompileError}</div>;
    if (isRefreshing) return <div className="flex items-center justify-center p-8"><RotateCw className="animate-spin text-blue-500" size={24} /></div>;
    if (compiledComponent) {
      const Component = compiledComponent;
      return <div key={previewKey}><Component /></div>;
    } else {
      return <div>Select a component to preview.</div>;
    }
  };

  return (
    <div className="w-full max-w-6xl  bg-[#2c2d35] rounded-lg shadow-lg">
      {selectedComponent && (
        <div>
          <div className="relative">
            <textarea className="w-full h-48 font-mono text-sm p-4 border rounded bg-[#1e1e1e] text-white" value={editableCode} onChange={(e) => handleCodeChange(e.target.value)} placeholder="Edit component code here..." />
          </div>
          {isRefreshing && <span className="text-sm text-blue-500">Refreshing...</span>}
          {renderPreview()}
        </div>
      )}
      {!selectedComponent && renderPreview()}
    </div>
  );
};

export default ComponentVisualizer;
