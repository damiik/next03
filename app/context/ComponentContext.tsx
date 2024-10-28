"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    SimpleCounter: `function SimpleCouunter() {
      const [counter, setCounter] = useState(0);
      const buttonText = counter === 0 ? 'Click Me!' : \`Clicked \${counter} times!\`;
    
      return (
        <div className="flex justify-center items-center h-[200px] bg-[#d8e4e4]">
          <div className="bg-[#ffffff] p-4 rounded-lg shadow-md w-1/2 md:w-1/3">
            <h2 className="text-[#352879] text-2xl mb-4">Simple Counter</h2>
            <button 
              onClick={() => setCounter(counter + 1)}
              className={\`py-2 px-4 rounded-lg text-[#ffffff] \${counter % 2 === 0 ? 'bg-[#9a0000]' : 'bg-[#9fe339]'} hover:bg-[#b472d0] transition duration-300 ease-in-out\`}
            >
              {buttonText}
            </button>
            <p className="mt-4 text-[#656565]">CURRENT COUNT: {counter}</p>
          </div>
        </div>
      );
    }`,
    QuickSortComponent: `function QuickSortComponent() {
 const array = [34, 7, 23, 32, 5, 62, 14, 27, 18, 45, 56, 9];
  const colors = [
    'bg-[#9a0000]', 'bg-[#a590e8]', 'bg-[#b472d0]', 'bg-[#9fe339]',
    'bg-[#352879]', 'bg-[#fff780]', 'bg-[#d49a44]', 'bg-[#433900]',
    'bg-[#f6ab96]', 'bg-[#656565]', 'bg-[#b1b1b1]', 'bg-[#e4ffb5]'
  ];

  const stack = [];
  let start = 0;
  let end = array.length - 1;
  let pivot = array[ end ];

  const handleStep = () => {
    if (stack.length === 0) {
      stack.push({ start: 0, end: array.length - 1 });
    }

    let { start1, end1 } = stack.pop();
    start = start1;
    end = end1;
    if (start >= end) return;

    pivot = array[end];
    let index = start;

    for (let i = start; i < end; i++) {
      if (array[i] < pivot) {
        [array[i], array[index]] = [array[index], array[i]];
        index++;
      }
    }

    [array[index], array[end]] = [array[end], array[index]];

    if (index > start) {
      stack.push({ start, end: index - 1 });
    }

    if (index < end) {
      stack.push({ start: index + 1, end });
    }

    console.log('Step', array);
  };

  return (
    <div className="p-4">
      <div className="flex space-x-2">
        {array.map((num, index) => (
          <div key={index} className="flex flex-col items-center">
            {index === start && <div className="absolute top-0 left-0 text-[#9fe339] bg-[#000000]">&nbsp;S&nbsp;</div>}
            {index === end && <div className="absolute top-0 right-0 text-[#000000] bg-[#656565]">&nbsp;E&nbsp;</div>}
            {index === pivot && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-[#9a0000] bg-[#a9f3fe]">&nbsp;P&nbsp;</div>}
            {index !== start && index !== end && index !== pivot && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-[#000000]">*</div>}
            <div className={\`w-8 \${colors[index % colors.length]}\`} style={{ height: \`\${num * 5}px\` }}></div>
            <span className="text-center text-[#d49a44] bg-[#433900]">{num}</span>
          </div>
        ))}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-[#433900] text-[#ffffff] rounded"
        onClick={handleStep}
      >
        Step
      </button>
    </div>
  );
}`
  };
  const [components, setComponents] = useState<{ [key: string]: string }>({...defaultComponents});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [editableCode, setEditableCode] = useState<{ [key: string]: string }>({});
  const [selectedComponent, setSelectedComponent] = useState('');

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
