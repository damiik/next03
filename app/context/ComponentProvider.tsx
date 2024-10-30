"use client";
import React, { createContext, useState, useEffect } from 'react';

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

export const ComponentContext = createContext<ComponentContextProps | undefined>(undefined);

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
    VimCommandAnimation: `function VimCommandAnimation ()  {
      const [step, setStep] = useState(0);
      const [isPlaying, setIsPlaying] = useState(true);
      const [inputLine, setInputLine] = useState('{ name: "BLACK", value: "#000000" },');
      const [command, setCommand] = useState(':,$s/{ name: "([^"]+)", value: "([^"]+)" },/"\\\\2", \\/*\\\\1*\\/');
      const [outputLine, setOutputLine] = useState('"#000000", /*BLACK*/');
      const [highlightedInput, setHighlightedInput] = useState('');
      const [highlightedCommand, setHighlightedCommand] = useState('');
      const [highlightedOutput, setHighlightedOutput] = useState('');
      const [description, setDescription] = useState('');
      const timerRef = useRef(null);
    
      const highlightText = (text, start, end) => {
        const before = text.slice(0, start);
        const highlight = text.slice(start, end);
        const after = text.slice(end);
        return (
          <>
            <span className="text-gray-300">{before}</span>
            <span className="bg-blue-600 text-white px-1">{highlight}</span>
            <span className="text-gray-300">{after}</span>
          </>
        );
      };
    
      const steps = [
        {
          description: "Initial state - looking at the input line",
          inputHighlight: null,
          commandHighlight: null,
          outputHighlight: null
        },
        {
          description: "Phase 1: Matching '{ name: \\"'",
          inputHighlight: [0, 9],
          commandHighlight: [5, 14],
          outputHighlight: null
        },
        {
          description: "Phase 2: Capturing color name with ([^\\"]+)",
          inputHighlight: [9, 14],
          commandHighlight: [14, 21],
          outputHighlight: [13, 18]
        },
        {
          description: "Phase 3: Matching '\\", value: \\"'",
          inputHighlight: [14, 25],
          commandHighlight: [21, 32],
          outputHighlight: null
        },
        {
          description: "Phase 4: Capturing color value with ([^\\"]+)",
          inputHighlight: [25, 32],
          commandHighlight: [32, 39],
          outputHighlight: [1, 8]
        },
        {
          description: "Phase 5: Matching ending '\\" },'",
          inputHighlight: [32, inputLine.length],
          commandHighlight: [39, 43],
          outputHighlight: null
        },
        {
          description: "Phase 6: End of section 'find'",
          inputHighlight: null,
          commandHighlight: [43, 44],
          outputHighlight: null
        },
        {
          description: "Final result: First replace with \\"\\\\2\\", ",
          inputHighlight: null,
          commandHighlight: [44, 48],
          outputHighlight: [0, 9]
        },
        {
          description: "Final result: Separation \\", \\"",
          inputHighlight: null,
          commandHighlight: [48, 50],
          outputHighlight: [9, 11]
        },
        {
          description: "Final result: Second replace with /*\\\\1*/",
          inputHighlight: null,
          commandHighlight: [50, command.length],
          outputHighlight: [11, outputLine.length]
        }
      ];
    
      const updateDisplay = (currentStep) => {
        const stepData = steps[currentStep];
        setDescription(stepData.description);
        
        setHighlightedInput(
          stepData.inputHighlight 
            ? highlightText(inputLine, stepData.inputHighlight[0], stepData.inputHighlight[1])
            : inputLine
        );
        
        setHighlightedCommand(
          stepData.commandHighlight
            ? highlightText(command, stepData.commandHighlight[0], stepData.commandHighlight[1])
            : command
        );
    
        setHighlightedOutput(
          stepData.outputHighlight
            ? highlightText(outputLine, stepData.outputHighlight[0], stepData.outputHighlight[1])
            : outputLine
        );
      };
    
      useEffect(() => {
        updateDisplay(step);
        
        if (isPlaying) {
          timerRef.current = setInterval(() => {
            setStep((prev) => (prev + 1) % steps.length);
          }, 3000);
    
          return () => clearInterval(timerRef.current);
        }
      }, [step, isPlaying]);
    
      const handlePlay = () => {
        setIsPlaying(!isPlaying);
      };
    
      const handleForward = () => {
        setStep((prev) => (prev + 1) % steps.length);
      };
    
      const handleBack = () => {
        setStep((prev) => (prev - 1 + steps.length) % steps.length);
      };
    
      const ButtonControl = ({ onClick, children, title }) => (
        <button 
          onClick={onClick}
          className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          title={title}
        >
          {children}
        </button>
      );
    
      return (
        <div className="bg-gray-900 p-6 rounded-lg space-y-4 font-mono">
          <div className="m-4 text-lg text-[#fff780] text-center">
            {description}
          </div>
    
          <div className="space-y-2">
            <div className="text-blue-400  bg-[#9fe339] text-[#352879]">Input:</div>
            <div className="p-4">{highlightedInput}</div>
    
          </div>
          
          <div className="space-y-8">
    <p>&nbsp;</p>
            <div className="text-blue-400  bg-[#9fe339] text-[#352879]">Vim Command:</div>
            <div className="p-4 text-[#d49a44]">{highlightedCommand}</div>
          </div>
    <p>&nbsp;</p>
          <div className="space-y-2">
    
            <div className=" bg-[#9fe339] text-[#433900]">Output:</div>
            <div className="p-4 text-[#9fe339] ">{highlightedOutput}</div>
          </div>
          
    
    
          <div className="flex space-x-4 justify-center mt-6">
            <ButtonControl onClick={handleBack} title="Previous Step">
              <SkipBack className="w-6 h-6" />
            </ButtonControl>
            <ButtonControl onClick={handlePlay} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </ButtonControl>
            <ButtonControl onClick={handleForward} title="Next Step">
              <SkipForward className="w-6 h-6" />
            </ButtonControl>
          </div>
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
        if (stack.length === 0 &amp;&amp; phase === 'initial') {
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
                    <div>&amp;nbsp;</div>
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
                    <div>&amp;nbsp;</div>
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
                    <div>&amp;nbsp;</div>
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
                     :(<div>&amp;nbsp;</div>)
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
