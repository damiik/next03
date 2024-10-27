"use client";
import React, { useState, useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import * as Babel from '@babel/standalone';
import { useComponentContext } from '../context/ComponentContext';
import * as THREE from 'three';

const ThreeCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [rendererError, setRendererError] = useState<string | null>(null);

  useEffect(() => {
    let scene: THREE.Scene | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let geometry: THREE.BoxGeometry | undefined;
    let material: THREE.MeshBasicMaterial | undefined;
    let cube: THREE.Mesh | undefined;
    let animate: FrameRequestCallback | undefined;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Default aspect ratio
      renderer = new THREE.WebGLRenderer();
      geometry = new THREE.BoxGeometry();
      material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      animate = () => {
        if (animate) {
          requestAnimationFrame(animate);
        }
        if (cube) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
        }
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
    } catch (error) {
      console.error("Error creating WebGL renderer:", error);
      setRendererError("WebGL is not supported in this browser or environment. Please try a different browser or update your graphics drivers.");
      return; // Exit early if WebGL initialization fails
    }


    if (mountRef.current && renderer) {
      mountRef.current.appendChild(renderer.domElement);
      const width = mountRef.current?.clientWidth || 400; // Default width
      const height = mountRef.current?.clientHeight || 400; // Default height
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
      animate();
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

  return <div ref={mountRef} style={{ width: '10px', height: '10px' }} />;
};

const ComponentVisualizer = () => {
  const { components, previewKey, isRefreshing, setEditableCode, selectedComponent, setSelectedComponent, ...rest } = useComponentContext();
  const [editableCode, setEditableCodeLocal] = useState('');
  const [error, setError] = useState('');
  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType | null>(null);

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
    setEditableCode(prev => ({ ...prev, [selectedComponent]: newCode }));
    compileAndRender(newCode);
  };

  const compileAndRender = (code: string) => {
    try {
      const transformedCode = Babel.transform(code, { presets: ['react'] }).code;
      // Create an array of argument names, including React and THREE
      const argNames = ['React', 'THREE', ...Object.keys(rest)];
      // Create a function that takes all the arguments and returns the component
      const Component = new Function(...argNames, `return (${transformedCode})`)(React, THREE, ...Object.values(rest));
      if (typeof Component !== 'function' && typeof Component !== 'object') {
        throw new Error('Compiled code did not return a valid component.');
      }
      setCompiledComponent(() => Component);
      setError('');
    } catch (err: unknown) {
      setError((err as Error).message);
      setCompiledComponent(null);
    }
  };

  const renderPreview = () => {
    if (error) return <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200">Error: {error}</div>;
    if (isRefreshing) return <div className="flex items-center justify-center p-8"><RotateCw className="animate-spin text-blue-500" size={24} /></div>;
    if (compiledComponent) {
      const Component = compiledComponent;
      return <div key={previewKey}><Component /></div>;
    } else {
      return <div>Select a component to preview.</div>;
    }
  };

  return (
    <div className="w-full max-w-6xl p-6 bg-[#2c2d35] rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">Component Editor</h3>
      <select className="w-full p-2 border rounded mb-4 bg-[#b472d0]" value={selectedComponent} onChange={(e) => setSelectedComponent(e.target.value)}>
        <option value="">Select a component</option>
        {Object.keys(components).map(comp => <option key={comp} value={comp}>{comp}</option>)}
      </select>
      {selectedComponent && (
        <div className="space-y-4">
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
