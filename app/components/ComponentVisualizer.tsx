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
      <h2 className="text-2xl font-bold mb-4">Dynamic Component System Visualizer</h2>
      <div className="flex gap-6">
        <div className="w-1/3 border rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Component Structure</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <button onClick={() => toggleNode('root')} className="hover:bg-gray-100 rounded p-1">
                  {expandedNodes.root ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <Package size={16} className="mr-2" />
                <span>DynamicUserSpace</span>
              </div>
              {expandedNodes.root && (
                <div className="ml-6 space-y-2">
                  <div className="flex items-center">
                    <button onClick={() => toggleNode('loader')} className="hover:bg-gray-100 rounded p-1">
                      {expandedNodes.loader ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <Code size={16} className="mr-2" />
                    <span>ComponentLoader</span>
                  </div>
                  {expandedNodes.loader && <div className="ml-6 text-sm text-gray-600">Fetches component code from API</div>}
                  <div className="flex items-center">
                    <button onClick={() => toggleNode('compiler')} className="hover:bg-gray-100 rounded p-1">
                      {expandedNodes.compiler ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <Code size={16} className="mr-2" />
                    <span>ComponentCompiler</span>
                  </div>
                  {expandedNodes.compiler && <div className="ml-6 text-sm text-gray-600">Transforms and compiles component code</div>}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-2/3 space-y-4">
          <div className="border rounded-lg p-4">
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
                <div className="flex items-center justify-between mb-2">
                  {isRefreshing && <span className="text-sm text-blue-500">Refreshing...</span>}
                  <div className="border p-4 rounded bg-[#1e1e1e] min-h-[100px]">{renderPreview()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentVisualizer;
