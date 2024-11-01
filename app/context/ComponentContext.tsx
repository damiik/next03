"use client";
import { useContext, useEffect, useState } from 'react';
import { ComponentContext, ComponentProvider } from './ComponentProvider';

export { ComponentProvider };

export const useComponentContext = () => {
  const context = useContext(ComponentContext);
  if (context === undefined) {
    throw new Error('useComponentContext must be used within a ComponentProvider');
  }

  const [componentCompileError, setComponentCompileError] = useState('');
  const [codeMirrorHeight, setCodeMirrorHeight] = useState(200); // Added state for CodeMirror height

  useEffect(() => {
    // Your error handling logic here
    // For example, you can set the error state based on certain conditions
    // setError('An error occurred');
    console.log('Context --> User Component Compilation Error:', componentCompileError);
  }, [componentCompileError]);

  // Add error and CodeMirror height to the context
  return { ...context, componentCompileError, setComponentCompileError, codeMirrorHeight, setCodeMirrorHeight };
};
