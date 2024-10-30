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

  useEffect(() => {
    // Your error handling logic here
    // For example, you can set the error state based on certain conditions
    // setError('An error occurred');
    console.log('User Component Compilation Error:', componentCompileError);
  }, [componentCompileError]);

  // Add error to the context
  return { ...context, componentCompileError, setComponentCompileError, setError: setComponentCompileError };
};
