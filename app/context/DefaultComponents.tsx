export const defaultComponents = {
  Component1: `function Component1() {
    return (
      <div className="p-4 bg-BLUE text-BLUE rounded">
        Hello from Component 1!
      </div>
    );
  }`,
  Component2: `function Component2() {
    return (
      <div className="p-4 bg-GREEN text-GREEN rounded">
        Hello from Component 2!
      </div>
    );
  }`,
  SimpleCounter: `function SimpleCounter() {
    const [counter, setCounter] = useState(0);
    const buttonText = counter === 0 ? 'Click Me!' : \`Clicked \${counter} times!\`;

    return (
      <div className="flex justify-center items-center h-[200px] bg-LIGHT_GREY">
        <div className="bg-WHITE p-4 rounded-lg shadow-md w-1/2 md:w-1/3">
          <h2 className="text-BLUE text-2xl mb-4">Simple Counter</h2>
          <button
            onClick={() => setCounter(counter + 1)}
            className={\`py-2 px-4 rounded-lg text-WHITE \${counter % 2 === 0 ? 'bg-RED' : 'bg-GREEN'} hover:bg-PURPLE transition duration-300 ease-in-out\`}
          >
            {buttonText}
          </button>
          <p className="mt-4 text-DARK_GREY">CURRENT COUNT: {counter}</p>
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
          <span className="text-GRAY-300">{before}</span>
          <span className="bg-YELLOW text-BLUE px-1">{highlight}</span>
          <span className="text-GRAY-300">{after}</span>
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
        className="p-2 bg-GRAY-700 rounded-lg hover:bg-GRAY-600 transition-colors"
        title={title}
      >
        {children}
      </button>
    );

    return (
      <div className="bg-GRAY-900 p-6 rounded-lg space-y-4 font-mono">
        <div className="m-4 text-lg text-YELLOW text-center">
          {description}
        </div>

        <div className="space-y-2">
          <div className="text-BLUE bg-GREEN text-BLUE">Input:</div>
          <div className="p-4">{highlightedInput}</div>

        </div>

        <div className="space-y-8">
          <p>&nbsp;</p>
          <div className="text-BLUE bg-GREEN text-BLUE">Vim Command:</div>
          <div className="p-4 text-ORANGE">{highlightedCommand}</div>
        </div>
        <p>&nbsp;</p>
        <div className="space-y-2">

          <div className=" bg-GREEN text-BROWN">Output:</div>
          <div className="p-4 text-GREEN ">{highlightedOutput}</div>
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
  MosfetTable: `function MosfetTable() {
    const transistors = [
        { name: "IRF540N", vds: 100, id: 25, rds: 0.04, qg: 67, Qgs: 26 },
        { name: "IRF1010N", vds: 55, id: 85, rds: 0.01, qg: 135, Qgs: 45 },
        { name: "IRF3205N", vds: 55, id: 110, rds: 0.008, qg: 210, Qgs: 65 },
        { name: "IRFB3206N", vds: 60, id: 120, rds: 0.008, qg: 270, Qgs: 85 },
        { name: "IRF1405N", vds: 55, id: 60, rds: 0.013, qg: 110, Qgs: 35 },
        { name: "IRF3710N", vds: 100, id: 57, rds: 0.023, qg: 110, Qgs: 35 },
        { name: "IRF5210N", vds: 100, id: 70, rds: 0.04, qg: 210, Qgs: 65 },
        { name: "IRF620N", vds: 200, id: 10, rds: 0.16, qg: 37, Qgs: 12 },
        { name: "IRF730N", vds: 200, id: 11, rds: 0.18, qg: 45, Qgs: 15 },
        { name: "IRFL9014N", vds: 60, id: 116, rds: 0.009, qg: 272, Qgs: 85 },
        { name: "IRFH8304N", vds: 80, id: 130, rds: 0.008, qg: 315, Qgs: 100 },
        { name: "IRFZ44N", vds: 55, id: 49, rds: 0.0175, qg: 115, Qgs: 38 },
        { name: "IRF840N", vds: 500, id: 8, rds: 0.85, qg: 120, Qgs: 40 },
        { name: "IRF2905N", vds: 200, id: 175, rds: 0.02, qg: 160, Qgs: 55 },
        { name: "IRF3708N", vds: 30, id: 62, rds: 0.008, qg: 45, Qgs: 15 },
        { name: "IRF4905N", vds: 55, id: 74, rds: 0.02, qg: 115, Qgs: 38 },
        { name: "IRF830N", vds: 500, id: 5, rds: 1.4, qg: 100, Qgs: 33 },
        { name: "IRF630N", vds: 200, id: 9, rds: 0.4, qg: 38, Qgs: 12 },
        { name: "IRF740N", vds: 400, id: 10, rds: 0.55, qg: 90, Qgs: 30 },
        { name: "IRF530N", vds: 100, id: 14, rds: 0.16, qg: 68, Qgs: 22 },
    ];

    return (
      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-LIGHT_GREY" style={{ borderSpacing: 4 }}>
          <thead className="bg-DARK_GREY text-ORANGE text-lg font-bold">
            <tr>
              <th className="px-4 py-2 border-BLACK border-[3px]">Transistor</th>
              <th className="px-4 py-2 border-BLACK border-[3px]">Vds (V)</th>
              <th className="px-4 py-2 border-BLACK border-[3px]">Id (A)</th>
              <th className="px-4 py-2 border-BLACK border-[3px]">Rds (Ω)</th>
              <th className="px-4 py-2 border-BLACK border-[3px]">Qg (nC)</th>
              <th className="px-4 py-2 border-BLACK border-[3px]">Qgs (nC)</th>
            </tr>
          </thead>
          <tbody>
            {transistors.map((transistor, index) => (
              <React.Fragment key={index}>
                <tr
                  className={\`\${
                    index % 2 === 0 ? "bg-LIGHT_GREY" : "bg-MID_GREY"
                  } text-BLACK\`}
                >
                  <td className="px-4 py-1 border-DARK_GREY border-[3px] bg-YELLOW">{transistor.name}</td>
                  <td className="px-4 py-1 border-DARK_GREY border-[3px] bg-PINKY_LIGHT_RED">{transistor.vds}</td>
                  <td className="px-4 py-1 border-DARK_GREY border-[3px] bg-GREEN">{transistor.id}</td>
                  <td className="px-4 py-1 border-DARK_GREY border-[3px] bg-LIGHT_GREEN">{transistor.rds}</td>
                  <td className="px-4 py-1 border-DARK_GREY border-[3px] bg-CYAN">{transistor.qg}</td>
                  <td className="px-4 py-1 border-DARK_GREY border-[3px] bg-PURPLE">{transistor.Qgs}</td>
                </tr>
                {index < transistors.length - 1 && (
                  <tr>
                    <td colSpan={6} className="bg-BLACK">
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
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
      'bg-RED',
      'bg-CYAN',
      'bg-PURPLE',
      'bg-GREEN',
      'bg-BLUE',
      'bg-YELLOW',
      'bg-ORANGE',
      'bg-BROWN',
      'bg-PINKY_LIGHT_RED',
      'bg-DARK_GREY',
      'bg-MID_GREY',
      'bg-LIGHT_GREEN',
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
            <div><span className="text-GREEN bg-BLACK px-1">S</span> - Start pointer</div>
            <div><span className="text-BLACK bg-GRAY-500 px-1">E</span> - End pointer</div>
            <div><span className="text-RED bg-CYAN px-1">P</span> - Pivot</div>
            <div><span className="text-BLUE bg-YELLOW px-1">i</span> - Last smaller element index</div>
            <div><span className="text-PURPLE bg-GREEN px-1">j</span> - Current scanning position</div>
          </div>

          {/* Start pointers row */}
          <div className="flex space-x-2">
            {array.map((_, index) => (
              <div key={\`start-\${index}\`} className="w-8 text-center">
                {index === start ? (
                  <div className="text-GREEN bg-BLACK px-1">S</div>
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
                  <div className="text-BLACK bg-GRAY-500 px-1">E</div>
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
                  <div className="text-RED bg-CYAN px-1">P</div>
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
                  (<div className="text-BLUE bg-YELLOW px-1">i</div>)
                 : index === currentJ ?
                    (<div className="text-PURPLE bg-GREEN px-1">j</div>)
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
                <span className="text-center bg-GRAY-800 text-WHITE px-1">{num}</span>
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
            className="px-4 py-2 bg-YELLOW text-WHITE rounded hover:bg-YELLOW-700"
            onClick={handleStep}
          >
            Step
          </button>
          <button
            className="px-4 py-2 bg-BLUE text-WHITE rounded hover:bg-BLUE-700"
            onClick={handleRefresh}
          >
            Random Array
          </button>
        </div>
      </div>
    );
  }`,
  HexagoCircles: `

  function HexagonCircles() {
  const colors = ['RED', 'CYAN', 'PURPLE', 'GREEN', 'BLUE', 'YELLOW'];
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotation((rotation) => (rotation + 2) % 360);
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <svg className="bg-DARK_GREY" width="400" height="400">
      {colors.map((color, index) => {
        const baseCircleCx = 200 + 120 * Math.cos((index * Math.PI) / 3);
        const baseCircleCy = 200 + 120 * Math.sin((index * Math.PI) / 3);
        const extraCircleCx = baseCircleCx + 100 * Math.cos((index * Math.PI) / 3);
        const extraCircleCy = baseCircleCy + 100 * Math.sin((index * Math.PI) / 3);

        return (
          <React.Fragment key={index}>
            <circle
              cx={baseCircleCx}
              cy={baseCircleCy}
              r="40"
              stroke="BLACK"
              strokeWidth="2"
              fill={\`\${color}\`}
              filter="url(#shadow)"
              transform={\`rotate(\${rotation} 200 200)\`}
            />
            <circle
              cx={extraCircleCx}
              cy={extraCircleCy}
              r="30"
              stroke="BLACK"
              strokeWidth="2"
              fill={\`\${color}\`}
              filter="url(#shadow)"
              transform={\`rotate(\${rotation} 200 200)\`}
            />
          </React.Fragment>
        );
      })}
      <defs>
        <filter id="shadow">
          <feDropShadow dx="2" dy="2" stdDeviation="2" />
        </filter>
      </defs>
    </svg>
  );}`
};
