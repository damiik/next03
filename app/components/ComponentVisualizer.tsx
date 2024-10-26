"use client";
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Code, Package, RotateCw } from 'lucide-react';
import * as Babel from '@babel/standalone';
import { useComponentContext } from '../context/ComponentContext';

const ComponentVisualizer = () => {
  const { components, previewKey, isRefreshing, setEditableCode, selectedComponent, setSelectedComponent } = useComponentContext();

  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    root: true,
    loader: false,
    compiler: false,
  });

  const [editableCode, setEditableCodeLocal] = useState('');
  const [error, setError] = useState('');
  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (selectedComponent) {
      const componentCode = components[selectedComponent] || '';
      setEditableCodeLocal(componentCode);
      compileAndRender(componentCode);
    }
  }, [selectedComponent, components]);

  const toggleNode = (node: string) => {
    setExpandedNodes(prev => ({ ...prev, [node]: !prev[node] }));
  };

  const handleCodeChange = (newCode: string) => {
    setEditableCodeLocal(newCode);
    // Update the context's editableCode whenever the textarea content changes
    setEditableCode(prev => ({
      ...prev,
      [selectedComponent]: newCode
    }));
  };

  const compileAndRender = (code: string) => {
    try {
      const transformedCode = Babel.transform(code, { presets: ['react'] }).code;
      const Component = new Function('React', `return (${transformedCode})`)(React);
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
      <select className="w-full p-2 border rounded mb-4" value={selectedComponent} onChange={(e) => setSelectedComponent(e.target.value)}>
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
    </div>
  );
};

export default ComponentVisualizer;
