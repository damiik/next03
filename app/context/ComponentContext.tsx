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
    VimCommandAnimation: `function VimCommandAnimation() {

  const [step, setStep] = useState(0);
  const [code, setCode] = useState(\`{ name: "LIGHT GREY", value: "#d8e4e4" },\`);
  const [description, setDescription] = useState("");
  const [highlightedCode, setHighlightedCode] = useState(null);

  const highlight = (start, end) => {
    if (typeof code !== 'string') {
      throw new Error('code is not a string');
    }
    const before = code.slice(0, start);
    const highlight = code.slice(start, end);
    const after = code.slice(end);
    return (
      <>
        {before}
        <span className="bg-cyan-500 text-white">{highlight}</span>
        {after}
      </>
    );
  };

  useEffect(() => {

    const timer = setInterval(() => {

      console.log('Current step:', step);
      console.log('Current code:', code);
      switch (step) {
        case 0:
          setCode(\`{ name: "LIGHT GREY", value: "#d8e4e4" },\`);
          setDescription("Initial input sequence");
          setHighlightedCode(null);
          break;

        case 1:
          setHighlightedCode(
            highlight(
              \`{ name: "LIGHT GREY", value: "#d8e4e4" },\`.length,
              \`{ name: "LIGHT GREY", value: "#d8e4e4" },$\`.length
            )
          );
          setDescription("Move cursor to end of line with \`$\`");
          break;

        case 2:
          setHighlightedCode(highlight(\`{ name: "LIGHT GREY", value: "#d8e4e4" },\`.length, code.length));
          setDescription(
            \`Search backwards for a pattern matching a key-value pair with .,$/{ name: "([^"]+)", value: "([^"]+)" },\`
          );
          break;

        case 3:
          setHighlightedCode(
            highlight(
              \`{ name: "LIGHT GREY", value: "#d8e4e4" },$/{ name: '([^']+)', value: '([^']+)' },/\`.length,
              \`{ name: "LIGHT GREY", value: "#d8e4e4" },.,$/{ name: "([^"]+)", value: "([^"]+)" },/"\\\\2", \\/*\\\\1*\\/\`.length
            )
          );
          setDescription(
            \`Replace the matched pattern with the value and a comment with /"\\\\2", /*\\\\1*/\`
          );
          break;

        case 4:
          setCode(\`"#d8e4e4", /*LIGHT GREY*/\`);
          setDescription("Final output sequence");
          setHighlightedCode(null);
          break;
        default:
          setStep(0);
          break;
      }
      setStep((step + 1) % 6);
    }, 5000);
    return () => clearInterval(timer);
  }, [step, code]);

  return (
    <div className="bg-black text-white p-4">
      <pre>
        <code className="text-sm">{highlightedCode || code}</code>
      </pre>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
}`,

    QuickSortComponent: `function QuickSortComponent() {
  const generateRandomArray = () => {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 95) + 5);
  };

  const initialArray = generateRandomArray();
  const [array, setArray] = useState(initialArray);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(array.length - 1);
  const [pivotIndex, setPivotIndex] = useState(null);
  const [currentI, setCurrentI] = useState(null);
  const [currentJ, setCurrentJ] = useState(null);
  const [stack, setStack] = useState([]);
  const [phase, setPhase] = useState('initial'); // 'initial', 'scanning', 'swapping', 'final'
  
  const colors = [
    'bg-[#9a0000]',
    'bg-[#a590e8]',
    'bg-[#b472d0]',
    'bg-[#9fe339]',
    'bg-[#352879]',
    'bg-[#fff780]',
    'bg-[#d49a44]',
    'bg-[#433900]',
    'bg-[#f6ab96]',
    'bg-[#656565]',
    'bg-[#b1b1b1]',
    'bg-[#e4ffb5]',
  ];


  const partitionStep = () => {
    const newArray = [...array];
    const pivot = newArray[end];

    if (phase === 'initial') {
      setCurrentI(start - 1);
      setCurrentJ(start);
      setPhase('scanning');
      return;
    }

    if (phase === 'scanning') {
      if (currentJ <= end) {
        if (newArray[currentJ] < pivot) {
          setCurrentI(currentI + 1);
          [newArray[currentI + 1], newArray[currentJ]] = [newArray[currentJ], newArray[currentI + 1]];
          setArray(newArray);
        }
        setCurrentJ(currentJ + 1);
      } else {
        [newArray[currentI + 1], newArray[end]] = [newArray[end], newArray[currentI + 1]];
        setArray(newArray);
        setPivotIndex(currentI + 1);
        setPhase('final');
      }
      return;
    }
  };

  useEffect(() => { // Move useEffect outside partitionStep
    if (phase === 'final') {
      let newStack = [...stack];
      if (currentI > start) {
        newStack.push({ start, end: currentI });
      }
      if (currentI + 2 <= end) {
        newStack.push({ start: currentI + 2, end });
      }

      if (newStack.length > 0) {
        const nextSection = newStack.pop();
        setTimeout(() => {
          setStart(nextSection.start);
          setEnd(nextSection.end);
          setCurrentI(nextSection.start - 1);
          setCurrentJ(nextSection.start);
          setPivotIndex(null);
          setPhase('initial');
        }, 0);
      } else {
        setPhase('done');
      }
      setStack(newStack);
    }
  }, [phase, currentI, start, end, stack]);

 
  const handleStep = () => {
    if (stack.length === 0 && phase === 'initial') {
      setStack([{ start: 0, end: array.length - 1 }]);
      setStart(0);
      setEnd(array.length - 1);
      setPhase('scanning');
    }

    partitionStep();
  };

  const handleRefresh = () => {
    const newArray = generateRandomArray();
    setArray(newArray);
    setStart(0);
    setEnd(newArray.length - 1);
    setPivotIndex(null);
    setCurrentI(null);
    setCurrentJ(null);
    setStack([]);
    setPhase('initial');
  };

  return (
    <div className="p-4">
      <div className="flex flex-col space-y-2">
        {/* Pointers explanation */}
        <div className="mb-4 text-sm space-y-1">
          <div><span className="text-green-500 bg-black px-1">S</span> - Start pointer</div>
          <div><span className="text-black bg-gray-500 px-1">E</span> - End pointer</div>
          <div><span className="text-red-600 bg-cyan-200 px-1">P</span> - Pivot</div>
          <div><span className="text-blue-600 bg-yellow-200 px-1">i</span> - Last smaller element index</div>
          <div><span className="text-purple-600 bg-green-200 px-1">j</span> - Current scanning position</div>
        </div>

        {/* Start pointers row */}
        <div className="flex space-x-2">
          {array.map((_, index) => (
            <div key={\`start-\${index}\`} className="w-8 text-center">
              {index === start ? (
                <div className="text-green-500 bg-black px-1">S</div>
              ) : (
                <div>&nbsp;</div>
              )}
            </div>
          ))}
        </div>

        {/* End pointers row */}
        <div className="flex space-x-2">
          {array.map((_, index) => (
            <div key={\`end-\${index}\`} className="w-8 text-center">
              {index === end ? (
                <div className="text-black bg-gray-500 px-1">E</div>
              ) : (
                <div>&nbsp;</div>
              )}
            </div>
          ))}
        </div>

        {/* Pivot pointers row */}
        <div className="flex space-x-2">
          {array.map((_, index) => (
            <div key={\`pivot-\${index}\`} className="w-8 text-center">
              {index === pivotIndex ? (
                <div className="text-red-600 bg-cyan-200 px-1">P</div>
              ) : (
                <div>&nbsp;</div>
              )}
            </div>
          ))}
        </div>

        {/* i and j pointers row */}
        <div className="flex space-x-2">
          {array.map((_, index) => (
            <div key={\`ij-\${index}\`} className="w-8 text-center">
              {index === currentI ? 
                (<div className="text-blue-600 bg-yellow-200 px-1">i</div>) 
               : index === currentJ ? 
                  (<div className="text-purple-600 bg-green-200 px-1">j</div>) 
                 :(<div>&nbsp;</div>)
              }
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="flex space-x-2">
          {array.map((num, index) => (
            <div key={\`bar-\${index}\`} className="flex flex-col items-center">
              <div 
                className={\`w-8 \${colors[index % colors.length]} transition-all duration-300\`} 
                style={{ height: \`\${num * 3}px\` }}
              />
              <span className="text-center bg-gray-800 text-white px-1">{num}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current phase display */}
      <div className="mt-4 text-lg font-semibold">
        Phase: {phase.charAt(0).toUpperCase() + phase.slice(1)}
      </div>

      <div className="mt-4 space-x-4">
        <button 
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          onClick={handleStep}
        >
          Step
        </button>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleRefresh}
        >
          Random Array
        </button>
      </div>
    </div>
  );}`
  
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
