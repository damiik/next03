"use client";

// import { useRef, useEffect, FormEvent, KeyboardEvent, useCallback } from 'react';
import ComponentVisualizer from './components/ComponentVisualizer';
// import { useComponentContext } from './context/ComponentContext';


export default function Home() {
  // const {
  //   setComponents,
  //   setSelectedComponent,
  //   componentCompileError,
  //   setComponentCompileError,
  //   components,
  //   selectedComponent,
  //   isLoading,
  //   setIsLoading,
  //   handlingError,
  //   setHandlingError,
  // } = useComponentContext();



  return (
    <div className="flex flex-col h-full w-full max-w[95%]">
      <main className="flex-1 flex flex-col gap-8 items-center sm:items-start p-4 font-[family-name:var(--font-cascadia-code)]">
        <ComponentVisualizer />
      </main>

    </div>
  );
}
