"use client";
import React, { useState, useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import * as Babel from '@babel/standalone';
import { useComponentContext } from '../context/ComponentContext';
import * as THREE from 'three';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { material } from '@uiw/codemirror-theme-material';
import { EditorView } from "@codemirror/view";
import { ThreeCanvas } from './ThreeCanvas';

const ComponentVisualizer = () => {
  const { components, previewKey, isRefreshing, setEditableCode, setComponentCompileError, componentCompileError, codeMirrorHeight, ...rest } = useComponentContext();
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
      `)(React, React.useState, React.useEffect, React.useRef, THREE, Play, Pause, SkipForward, SkipBack, ...Object.values(rest));

      if (typeof Component !== 'function' && typeof Component !== 'object') {
        throw new Error('Compiled code did not return a valid component.');
      }
      setCompiledComponent(() => Component);
      setComponentCompileError('');
    } catch (err: unknown) {
      console.error("compileAndRender(..) --> Customer Component Compilation error:", err);
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

  let fixedHeightEditor = EditorView.theme({
    "&": { height: `${codeMirrorHeight}px` },
    ".cm-scroller": { overflow: "auto" },
    ".cm-content, .cm-gutter": { minHeight: "200px" },
    ".cm-editor .cm-content": { fontFamily: "Cascadia Code", fontSize: "200%" },
  });

  useEffect(() =>{
   
   fixedHeightEditor = EditorView.theme({
    "&": { height: `${codeMirrorHeight}px` },
    ".cm-scroller": { overflow: "auto" },
    ".cm-content, .cm-gutter": { minHeight: "200px" },
    ".cm-editor .cm-content": { fontFamily: "Cascadia Code", fontSize: "200%" },
  }); 

  }, [codeMirrorHeight])

  return (
    <div className="w-full max-w-6xl bg-[#2c2d35] rounded-lg shadow-lg">
      {selectedComponent && (
        <div>
          <div className="relative">
            <CodeMirror
              value={editableCode}
              extensions={[javascript(), fixedHeightEditor]}
              onChange={(value) => handleCodeChange(value)}
              theme={material}
              basicSetup={{
                foldGutter: true,
                lineNumbers: true,
                highlightActiveLineGutter: true,
              }}
            />
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
