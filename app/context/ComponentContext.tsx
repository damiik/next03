"use client";
import React, { createContext, useContext, useState } from 'react';
import { defaultComponents } from './DefaultComponents';

interface ComponentContextProps {
  components: { [key: string]: string };
  setComponents: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  isRefreshing: boolean;
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
  previewKey: number;
  setPreviewKey: React.Dispatch<React.SetStateAction<number>>;
  selectedComponent: string;
  setSelectedComponent: React.Dispatch<React.SetStateAction<string>>;
  componentCompileError: string;
  setComponentCompileError: React.Dispatch<React.SetStateAction<string>>;
  codeMirrorHeight: number;
  setCodeMirrorHeight: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resetChatHistory: () => void;
}

export const ComponentContext = createContext<ComponentContextProps | undefined>(undefined);

interface ComponentProviderProps {
  children: React.ReactNode;
}

export const ComponentProvider: React.FC<ComponentProviderProps> = ({ children }) => {
  const [components, setComponents] = useState<{ [key: string]: string }>({ ...defaultComponents });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [componentCompileError, setComponentCompileError] = useState('');
  const [codeMirrorHeight, setCodeMirrorHeight] = useState(400);
  const [isLoading, setIsLoading] = useState(false);


  const contextValue = {
    components,
    setComponents,
    isRefreshing,
    setIsRefreshing,
    previewKey,
    setPreviewKey,
    selectedComponent,
    setSelectedComponent,
    componentCompileError,
    setComponentCompileError,
    codeMirrorHeight,
    setCodeMirrorHeight,
    isLoading,
    setIsLoading,
    resetChatHistory: () => {}, // Initialize with empty function. Will be overwritten in page.tsx.
  };

  return (
    <ComponentContext.Provider value={contextValue}>
      {children}
    </ComponentContext.Provider>
  );
};


export const useComponentContext = () => {
  const context = useContext(ComponentContext);
  if (context === undefined) {
    throw new Error('useComponentContext must be used within a ComponentProvider');
  }
  return context;
};
