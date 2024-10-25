"use client";
import React, { createContext, useContext, useState } from 'react';

interface ComponentContextProps {
  components: { [key: string]: string };
  setComponents: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  isRefreshing: boolean;
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
  previewKey: number;
  setPreviewKey: React.Dispatch<React.SetStateAction<number>>;
  editableCode: { [key: string]: string };
  setEditableCode: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  selectedComponent: string;
  setSelectedComponent: React.Dispatch<React.SetStateAction<string>>;
}

const ComponentContext = createContext<ComponentContextProps | undefined>(undefined);

interface ComponentProviderProps {
  children: React.ReactNode;
}

export const ComponentProvider: React.FC<ComponentProviderProps> = ({ children }) => {
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [editableCode, setEditableCode] = useState<{ [key: string]: string }>({});
  const [selectedComponent, setSelectedComponent] = useState('');

  const contextValue = {
    components,
    setComponents,
    isRefreshing,
    setIsRefreshing,
    previewKey,
    setPreviewKey,
    editableCode,
    setEditableCode,
    selectedComponent,
    setSelectedComponent
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
