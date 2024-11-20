"use client";
import React, { useState, useEffect, useRef, Component } from 'react';
import ts from 'typescript';
import { ErrorBoundary } from "react-error-boundary";
import { RotateCw } from 'lucide-react';
import * as Babel from '@babel/standalone';
import { useComponentContext } from '../context/ComponentContext';
import * as THREE from 'three';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { darcula } from '@uiw/codemirror-theme-darcula';
import { EditorView } from '@codemirror/view';
import { ThreeCanvas } from './ThreeCanvas';
import { diffLines } from 'diff'; // for components
// import { select } from 'three/webgpu';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ErrorFallback extends Component<any> {  // Error Boundary Component
  render() {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200">
        <p>Something went wrong:</p>
        <pre>{((this.props.error as Error) ).message}</pre>
      </div>
    );
  }
}



const ComponentVisualizer = () => {
  const { components, setComponents, previewKey, isRefreshing, setComponentCompileError, componentCompileError, codeMirrorHeight, ...rest } = useComponentContext();

  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType | null>(null);
  const { selectedComponent } = useComponentContext();


  const editorRef = useRef<ReactCodeMirrorRef | null>(null);

  const compileAndRender = (code: string) => {
    try {


      // Kompilacja TypeScript do JavaScript
      const jsCode = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.React,
          strict: false // Added this line to disable strict mode
        },
        fileName: 'component.tsx'
      }).outputText;


      console.log("Babel transform code..\n"); //+jsCode);
      const transformedCode = Babel.transform(jsCode, { presets: ['react'] }).code; 
      console.log("Babel code transformed.\n");//+transformedCode);
      if (!transformedCode) {
        throw new Error("Babel transformation failed.");
      }
      //console.log("Babel transformed code:", transformedCode);
      // Pass React, hooks, and other necessary variables to the compiled component
      // Wrap the evaluation in a try...catch

      try {
        const Component = new Function('React', 'useState', 'useEffect', 'useRef', 'THREE', 'Play', 'Pause', 'SkipForward', 'SkipBack', 'diffLines', ...Object.keys(rest), `
          return (${transformedCode}); // Added semicolon here for safety
        `)(React, React.useState, React.useEffect, React.useRef, THREE, Play, Pause, SkipForward, SkipBack, diffLines, ...Object.values(rest));

        if (typeof Component !== 'function' && typeof Component !== 'object' ) { // Added check for object to allow functional components
          throw new Error('Compiled code did not return a valid component. Make sure it returns a React functional component or a class component.');
        }
 
        
              // Create a wrapper component
        // const SafeComponent: React.FC = () => {
        //   try {
        //     return <Component />; // Render the user's component
        //   } catch (renderError) {
        //     console.error("Component render error:", (renderError as Error).message);
        //     return <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200">Error: {(renderError as Error).message}</div>;
        //   }
        // };
        const SafeComponent = () => (
          <ErrorBoundary FallbackComponent={ErrorFallback}> {/* Use Error Boundary */}
            <Component />
          </ErrorBoundary>
        );

        console.log("ComponentVisualizer - compileAndRender - Setting SafeComponent...");        
        setCompiledComponent(() => SafeComponent);
        setComponentCompileError('');
      } catch (evalError) {
        console.error("Component evaluation error:", (evalError as Error).message);
        setComponentCompileError((evalError as Error).message);
        setCompiledComponent(null); // Important: Reset the component to prevent rendering broken code
      }

    } catch (transformError) {
      console.error("Babel transformation error:", (transformError as Error).message);
      setComponentCompileError((transformError as Error).message);
      setCompiledComponent(null); // Important: Reset the component
    }
  };

  
// component code changed - recompile and render
  useEffect(() => {
    if (selectedComponent) {
      console.log(`ComponentVisualizer - compileAndRender:", ${selectedComponent}`);
      const componentCode = components[selectedComponent] || '';

      if (componentCode) {
        compileAndRender(componentCode);
      }
    } else {
      setCompiledComponent(() => ThreeCanvas);
    }
  }, [selectedComponent, components]);


  const handleCodeChange = (newCode: string) => {
    setComponents(prev => ({ ...prev, [selectedComponent]: newCode }));
  };

  // function lolizer() {
  //   return {
  //     visitor: {
  //       Identifier(path) {
  //         path.node.name = "LOL";
  //       },
  //     },
  //   };
  // }
  // Babel.registerPlugin("lolizer", lolizer);

  const renderPreview = () => {
    if (componentCompileError) return <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200">{`Error -->: ${componentCompileError}`}</div>;
    if (isRefreshing) return <div className="flex items-center justify-center p-8"><RotateCw className="animate-spin text-blue-500" size={24} /></div>;
    if (compiledComponent) {
      const Component = compiledComponent;
      return <div key={previewKey}><Component /></div>;
    } else {
      return <div>Select a component to preview.</div>;
    }
  };

  const fixedHeightEditor = EditorView.theme({
    "&": { 
      height: `${codeMirrorHeight}px`,  
      fontFamily: "var(--font-cascadia-mono-nf), monospace", 
      fontSize: "1.2rem" 
    },
    ".cm-scroller": { 
      fontFamily: "var(--font-cascadia-mono-nf), monospace", 
      background: "#292524",//[#292524]
      // borderRadius: "0.5rem",
      // padding: "1rem",
      // boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
    },
    ".cm-content, .cm-gutter": { minHeight: "200px" },
  });



  useEffect(() => {

    console.log("codeMirrorHeight changed:", codeMirrorHeight);
    if (editorRef.current) {
      // Access the DOM node directly and set the height.
      const editorDOM = editorRef.current.editor?.getElementsByClassName("cm-editor");
      if (editorDOM) {
        editorDOM[0].setAttribute("height", `${codeMirrorHeight}px`); // style.height = `${codeMirrorHeight}px`;
      }
    }
  }, [codeMirrorHeight]);

  return (
    <div className="w-full max-w-6xl bg-[#2c2d35] rounded-lg shadow-lg">
      {selectedComponent && (
        <div>
          <div className="relative">
            <CodeMirror className='font-[family-name:var(--font-cascadia-code)], monospace'

              value={components[selectedComponent]}
              extensions={[javascript({ jsx: true }), fixedHeightEditor]}
              onChange={(value) => handleCodeChange(value)}
              theme={darcula}
              basicSetup={{
                foldGutter: true,
                lineNumbers: true,
                highlightActiveLineGutter: true,
              }}
              ref={editorRef}
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
