"use client";
import React, { useState, useEffect, useRef, Component} from 'react';
import ts from 'typescript';
import { ErrorBoundary } from "react-error-boundary";
import { RotateCw } from 'lucide-react';
import { useComponentContext } from '../context/ComponentContext';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { darcula } from '@uiw/codemirror-theme-darcula';
import { EditorView } from '@codemirror/view';

// ErrorBoundary component for catching errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ErrorFallback extends Component<any> {
  render() {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200">
        <p>Something went wrong:</p>
        <pre>{this.props.error.message}</pre>
      </div>
    );
  }
}

const ComponentVisualizer = () => {
  const {
    components,
    setComponents,
    previewKey,
    isRefreshing,
    setComponentCompileError,
    componentCompileError,
    codeMirrorHeight,
  } = useComponentContext();

  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType | null>(null);
  const { selectedComponent } = useComponentContext();

  const editorRef = useRef<ReactCodeMirrorRef | null>(null);

  const compileAndRender = (code: string) => {
    try {
      // Create a Blob representing the worker code
      const workerBlob = new Blob(
        [
          `
          self.addEventListener('message', e => {
            try {
              ${compileCode(code)}
              postMessage({ success: true });
            } catch (err) {
              postMessage({ success: false, error: err.message });
            }
          });
          `,
        ],
        { type: 'application/javascript' }
      );

      const workerURL = URL.createObjectURL(workerBlob);
      const worker = new Worker(workerURL);

      worker.onmessage = (e) => {
        if (e.data.success) {
          setComponentCompileError('');
          setCompiledComponent(() => createComponent(code));
        } else {
          setComponentCompileError(e.data.error);
          setCompiledComponent(null);
        }
        worker.terminate();
        URL.revokeObjectURL(workerURL);
      };

      worker.postMessage({});
    } catch (err) {
      console.error('Compilation error:', (err as Error).message);
      setComponentCompileError((err as Error).message);
      setCompiledComponent(null);
    }
  };

  const compileCode = (code: string): string => {
    const jsCode = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        strict: false,
      },
      fileName: 'component.tsx',
    }).outputText;
    return jsCode;
  };

  const createComponent = (code: string): React.FC => {
    const Component = new Function(
      'React',
      'useState',
      'useEffect',
      'useRef',
      'Play',
      'Pause',
      'SkipForward',
      'SkipBack',
      'useComponentContext',
      `
      ${compileCode(code)}
      return ${getExportName(code)};
    `
    )(React, React.useState, React.useEffect, React.useRef, Play, Pause, SkipForward, SkipBack, useComponentContext);
    const Comp = () => (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Component />
      </ErrorBoundary>
    );
    return Comp;
  };

  const getExportName = (code: string): string => {
    const match = code.match(/function\s+(\w+)/);
    return match ? match[1] : 'Component';
  };

  useEffect(() => {
    if (selectedComponent) {
      const componentCode = components[selectedComponent] || '';
      if (componentCode) {
        compileAndRender(componentCode);
      }
    } else {
      setCompiledComponent(null);
    }
  }, [selectedComponent, components]);

  const handleCodeChange = (newCode: string) => {
    setComponents((prev) => ({ ...prev, [selectedComponent]: newCode }));
  };

  const fixedHeightEditor = EditorView.theme({
    "&": {
      height: `${codeMirrorHeight}px`,
      fontFamily: "var(--font-cascadia-mono-nf), monospace",
      fontSize: "1.2rem",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-cascadia-mono-nf), monospace",
      background: "#292524",
    },
    ".cm-content, .cm-gutter": { minHeight: "200px" },
  });

  useEffect(() => {
    if (editorRef.current) {
      const editorDOM = editorRef.current.editor?.getElementsByClassName("cm-editor");
      if (editorDOM) {
        editorDOM[0].setAttribute("height", `${codeMirrorHeight}px`);
      }
    }
  }, [codeMirrorHeight]);

  const renderPreview = () => {
    if (componentCompileError)
      return <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200">{`Error: ${componentCompileError}`}</div>;
    if (isRefreshing)
      return (
        <div className="flex items-center justify-center p-8">
          <RotateCw className="animate-spin text-blue-500" size={24} />
        </div>
      );
    if (compiledComponent) {
      const Component = compiledComponent;
      return (
        <div key={previewKey}>
          <Component />
        </div>
      );
    } else {
      return <div>Select a component to preview.</div>;
    }
  };

  return (
    <div className="w-full max-w-6xl bg-[#2c2d35] rounded-lg shadow-lg">
      {selectedComponent && (
        <div>
          <div className="relative">
            <CodeMirror
              className="font-[family-name:var(--font-cascadia-code)], monospace"
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
