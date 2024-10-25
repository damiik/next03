import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Code, Package, PlayCircle, Save, RotateCw } from 'lucide-react';
import * as Babel from '@babel/standalone';

const ComponentVisualizer = () => {
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    root: true,
    loader: false,
    compiler: false,
  });

  const defaultComponents: { [key: string]: string } = {
    Component1: `function Component1() {
      return (
        <div className="p-4 bg-blue-500 rounded">
          Hello from Component 1!
        </div>
      );
    }`,
    Component2: `function Component2() {
      return (
        <div className="p-4 bg-green-500 rounded">
          Hello from Component 2!
        </div>
      );
    }`,
    Component3: `function Component3() {
      return (
        <div className="p-4 text-[#ff0] bg-purple-500 rounded">
          Hello from Component 3!
        </div>
      );
    }`
  };

  const [components, setComponents] = useState<{ [key: string]: string }>({...defaultComponents});
  const [selectedComponent, setSelectedComponent] = useState('');
  const [editableCode, setEditableCode] = useState('');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (selectedComponent) {
      setEditableCode(components[selectedComponent] || '');
      compileAndRender(components[selectedComponent] || '');
    }
  }, [selectedComponent, components]);

  const toggleNode = (node: string) => {
    setExpandedNodes(prev => ({ ...prev, [node]: !prev[node] }));
  };

  const handleCodeChange = (newCode: string) => {
    setEditableCode(newCode);
  };

  const saveComponent = () => {
    if (!error && selectedComponent) {
      try {
        const Component = new Function(`return (${editableCode})`)();
        if (typeof Component !== 'function') {
          throw new Error('Invalid component code: must return a function.');
        }
        setComponents(prev => ({ ...prev, [selectedComponent]: editableCode }));
        refreshPreview();
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    }
  };

  const refreshPreview = () => {
    try {
      setIsRefreshing(true);
      setError('');
      setTimeout(() => {
        compileAndRender(editableCode);
        setPreviewKey(prev => prev + 1);
        setIsRefreshing(false);
      }, 500);
    } catch (err: unknown) {
      setError((err as Error).message);
      setIsRefreshing(false);
    }
  };

  const resetComponent = () => {
    if (selectedComponent) {
      setEditableCode(defaultComponents[selectedComponent] || '');
      setError('');
      setPreviewKey(prev => prev + 1);
    }
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
                  <div className="absolute top-2 right-2 space-x-2">
                    <button onClick={saveComponent} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" title="Save changes"><Save size={16} /></button>
                    <button onClick={refreshPreview} className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title="Refresh preview"><PlayCircle size={16} /></button>
                    <button onClick={resetComponent} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors" title="Reset to default"><RotateCw size={16} /></button>
                  </div>
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
