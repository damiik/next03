import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Code, Package, PlayCircle, Save, RotateCw } from 'lucide-react';

const ComponentVisualizer = () => {
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    root: true,
    loader: false,
    compiler: false,
  });

  // const defaultComponents: { [key: string]: React.ComponentType } = {
  //   Component1: () => (<div className="p-4 bg-blue-100 rounded">Hello from Component 1!</div>),
  //   Component2: () => (<div className="p-4 bg-green-100 rounded">Hello from Component 2!</div>),
  //   Component3: () => (<div className="p-4 bg-purple-100 rounded">Hello from Component 3!</div>),
  // };


  // Updated to include the full component definition with React import
  const defaultComponents: { [key: string]: string } = {
    Component1: `function Component() {
  return (
    <div className="p-4 bg-blue-100 rounded">
      Hello from Component 1!
    </div>
  );
}`,
    Component2: `function Component() {
  return (
    <div className="p-4 bg-green-100 rounded">
      Hello from Component 2!
    </div>
  );
}`,
    Component3: `function Component() {
  return (
    <div className="p-4 bg-purple-100 rounded">
      Hello from Component 3!
    </div>
  );
}`
  };

  const [components, setComponents] = useState<{ [key: string]: string }>({...defaultComponents});
  // const [components, setComponents] = useState<{ [key: string]: React.ComponentType }>({...defaultComponents});
  const [selectedComponent, setSelectedComponent] = useState('');
  const [editableCode, setEditableCode] = useState('');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (selectedComponent) {
      setEditableCode(components[selectedComponent]?.toString() || ''); 
      compileAndRender(components[selectedComponent]?.toString() || '');
    }
  }, [selectedComponent, components]);

  const toggleNode = (node: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [node]: !prev[node]
    }));
  };

  const handleCodeChange = (newCode: string) => {
    setEditableCode(newCode);
  };

  const saveComponent = () => {
    if (!error && selectedComponent) {
      try {
        const Component = eval(`(${editableCode})`) as React.ComponentType; 
        setComponents(prev => ({
          ...prev,
          [selectedComponent]: Component
        }));
        refreshPreview();
      } catch (err: unknown) {
        // More robust error handling
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      }
    }
  };

  // const refreshPreview = () => {
  //   try {
  //     setIsRefreshing(true);
  //     setError('');
  //     setTimeout(() => {
  //       setPreviewKey(prev => prev + 1);
  //       setIsRefreshing(false);
  //     }, 500);
  //   } catch (err: unknown) {
  //     // More robust error handling
  //     if (err instanceof Error) {
  //         setError(err.message);
  //     } else {
  //         setError("An unexpected error occurred.");
  //     }
  //     setIsRefreshing(false);
  //   }
  // };

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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      setIsRefreshing(false);
    }
  };



  const resetComponent = () => {
    if (selectedComponent) {
      setEditableCode(defaultComponents[selectedComponent]?.toString() || '');
      setError('');
      setPreviewKey(prev => prev + 1);
    }
  };

  // const compileAndRender = (code:string) => {
  //   try {
  //     const componentCode = code.replace('export default', 'return');
  //     const ComponentFunction = new Function('React', componentCode);
  //     const Component = ComponentFunction(React);
  //     setCompiledComponent(Component);
  //     setError('');
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //         setError(`Compilation error: ${err.message}`);
  //     } else {
  //         setError("An unexpected error occurred during compilation.");
  //     }
  //     setCompiledComponent(null);
  //   }
  // };


    const compileAndRender = (code: string) => {
    try {
      // Create a component from the code using Babel-transformed code
      const transformedCode = `
        const Component = (${code});
        return Component;
      `;
      
      const ComponentFunction = new Function('React', transformedCode);
      const Component = ComponentFunction(React);
      setCompiledComponent(() => Component);
      setError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Compilation error: ${err.message}`);
      } else {
        setError("An unexpected error occurred during compilation.");
      }
      setCompiledComponent(null);
    }
  };

  const renderPreview = () => {
    if (error) return (
      <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200">
        Error: {error}
      </div>
    );

    if (isRefreshing) return (
      <div className="flex items-center justify-center p-8">
        <RotateCw className="animate-spin text-blue-500" size={24} />
      </div>
    );

    if (compiledComponent) {
      const Component = compiledComponent;
      return <div key={previewKey}><Component /></div>;
    } else {
      return <div>Select a component to preview.</div>;
    }
  };

  return (
    <div className="w-full max-w-6xl p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Dynamic Component System Visualizer</h2>

      <div className="flex gap-6">
        <div className="w-1/3 border rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Component Structure</h3>

            <div className="space-y-2">
              <div className="flex items-center">
                <button
                  onClick={() => toggleNode('root')}
                  className="hover:bg-gray-100 rounded p-1"
                >
                  {expandedNodes.root ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <Package size={16} className="mr-2" />
                <span>DynamicUserSpace</span>
              </div>

              {expandedNodes.root && (
                <div className="ml-6 space-y-2">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleNode('loader')}
                      className="hover:bg-gray-100 rounded p-1"
                    >
                      {expandedNodes.loader ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <Code size={16} className="mr-2" />
                    <span>ComponentLoader</span>
                  </div>

                  {expandedNodes.loader && (
                    <div className="ml-6 text-sm text-gray-600">
                      Fetches component code from API
                    </div>
                  )}

                  <div className="flex items-center">
                    <button
                      onClick={() => toggleNode('compiler')}
                      className="hover:bg-gray-100 rounded p-1"
                    >
                      {expandedNodes.compiler ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <Code size={16} className="mr-2" />
                    <span>ComponentCompiler</span>
                  </div>

                  {expandedNodes.compiler && (
                    <div className="ml-6 text-sm text-gray-600">
                      Transforms and compiles component code
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-2/3 space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Component Editor</h3>
            <select
              className="w-full p-2 border rounded mb-4"
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
            >
              <option value="">Select a component</option>
              {Object.keys(components).map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>

            {selectedComponent && (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    className="w-full h-48 font-mono text-sm p-4 border rounded bg-gray-50"
                    value={editableCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="Edit component code here..."
                  />
                  <div className="absolute top-2 right-2 space-x-2">
                    <button
                      onClick={saveComponent}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      title="Save changes"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={refreshPreview}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      title="Refresh preview"
                    >
                      <PlayCircle size={16} />
                    </button>
                    <button
                      onClick={resetComponent}
                      className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      title="Reset to default"
                    >
                      <RotateCw size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Live Preview:</h4>
                    {isRefreshing && (
                      <span className="text-sm text-blue-500">Refreshing...</span>
                    )}
                  </div>
                  <div className="border p-4 rounded bg-white min-h-[100px]">
                    {renderPreview()}
                  </div>
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
