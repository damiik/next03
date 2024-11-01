"use client";
import React, { createContext, useState, useEffect} from 'react';
import {defaultComponents} from './DefaultComponents';
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
  componentCompileError: string;
  setComponentCompileError: React.Dispatch<React.SetStateAction<string>>;
}

export const ComponentContext = createContext<ComponentContextProps | undefined>(undefined);

interface ComponentProviderProps {
  children: React.ReactNode;
}

export const ComponentProvider: React.FC<ComponentProviderProps> = ({ children }) => {

  const [components, setComponents] = useState<{ [key: string]: string }>({ ...defaultComponents });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [editableCode, setEditableCode] = useState<{ [key: string]: string }>({});
  const [selectedComponent, setSelectedComponent] = useState('');
  const [componentCompileError, setComponentCompileError] = useState('');

  useEffect(() => {
    console.log("Editable Code Updated:", editableCode);
    // Update the components state with the new editable code
    setComponents((prevComponents) => ({
      ...prevComponents,
      ...editableCode
    }));
  }, [editableCode]);

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
    setSelectedComponent,
    componentCompileError,
    setComponentCompileError,
  };

  return (
    <ComponentContext.Provider value={contextValue}>
      {children}
    </ComponentContext.Provider>
  );
};
