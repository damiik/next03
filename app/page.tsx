"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent, useCallback } from 'react';
import ComponentVisualizer from './components/ComponentVisualizer';
import { useComponentContext } from './context/ComponentContext';
import { replaceFragments } from './tools/diff';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
};

const assistant = 'model'; // for gemini //
// const assistant = 'assistant'; // for rest of the world

export default function Home() {
  const { setComponents, setSelectedComponent, componentCompileError, setComponentCompileError, components, selectedComponent, isLoading, setIsLoading, resetChatHistory: contextResetChatHistory, handlingError, setHandlingError } = useComponentContext();

  const [userInput, setUserInput] = useState('');
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  const resetChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  // synchronizes the local resetChatHistory function with the context's resetChatHistory function.
  // Because the context's resetChatHistory is initially an empty function, this useEffect ensures that
  // the actual implementation from app/page.tsx is used to update the shared state in the context
  // whenever the local resetChatHistory changes.
  // This is crucial for ensuring that the reset operation is properly reflected throughout the application.
  useEffect(() => {
    contextResetChatHistory(); // The user removed the function call here, but it's needed to update the context
  }, [resetChatHistory, contextResetChatHistory]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement> | {preventDefault: () => void, type: false, target: {elements: {namedItem: (name: string) => ({value: string})}}}) => {
    e.preventDefault();
    if (isLoading || waitingForAnswer) return;

    setWaitingForAnswer(true);
    setIsLoading(true);

    try {
      console.log("Selected Component in handleSubmit:", selectedComponent); // Add console log here
      // Get the user input from the form or textarea
      let cleanedInput = '';
      if (e.type ?? true) {
        const inputElement = (e.target as HTMLFormElement)?.elements?.namedItem('userInput') || e.target as HTMLTextAreaElement;
        cleanedInput = inputElement instanceof HTMLTextAreaElement ? inputElement.value.trim() : '';
        const matchess = cleanedInput.match(/([\s\S]*?)\{\{code\}\}([\s\S]*)/);
        if( matchess ) {
          const codeLines : string[]  = components[selectedComponent]?.split('\n') ?? [];
          if (codeLines.length === 0) {
            console.log(`No component code available for selected component: ${selectedComponent}`);
            cleanedInput = "";//matchess[1] + 'No component code available' + matchess[2];
          } else {
            // Reconstruct cleanedInput by combining text before {{comp}},adding numbered component lines, and text after {{comp}}
            // cleanedInput = matchess[1] + codeLines.flatMap((line, index) => [`${index + 1}. ${line}`]).join('\n') + matchess[2];
            cleanedInput = matchess[1] + "\n" + codeLines.join('\n') + matchess[2]; // no line numbering
          }
        }
      }
      else {
        cleanedInput = `Can you fix error: ${componentCompileError}
        in component code:
        ${components[selectedComponent]?.split('\n').flatMap((line, index) => [`${index + 1}. ${line}`]).join('\n')}
        `
      }

      setUserInput('');

      if (cleanedInput !== '') { // Cline: Added condition to check if cleanedInput is empty


        const response = await fetch('/api', {    //api is called now!
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: chatHistory, query: cleanedInput}),
        });

        const data = await response.json();
        const assistantResponse = data.content;
        console.log("Assistant Response:", assistantResponse);


        const newHistory : Message[] = [...chatHistory, { role: "user", content: cleanedInput }];
        setChatHistory(newHistory);

        if( assistantResponse ) {
          
          setChatHistory(prevHistory => [...prevHistory, { role: assistant, content: assistantResponse }]); //gemini

          // Extract the code from the assistant's response
          const match = assistantResponse.match(/```(javascript|typescript|tsx|jsx)([\s\S]*?)```/);
          const frResult = replaceFragments(assistantResponse, components[selectedComponent]);
          if(frResult.success) {
            console.log("diff success with code:", frResult.code??""); // Add console log here
            setComponents(prev => ({ ...prev, [selectedComponent]: frResult.code??"" }));
          }
          else { 
            if(frResult.error) console.log(frResult.error);
            if (match) {
              const extractedCode = match[2].trim();
              // Extract the component name from the function declaration
              const functionNameRegex = /function\s+(\w+)\s*\(/;
              const functionNameMatch = extractedCode.match(functionNameRegex);
              const componentName = functionNameMatch ? functionNameMatch[1] : 'Component1';

              setComponents(prev => ({ ...prev, [componentName]: extractedCode }));
              setSelectedComponent(componentName);
            }
          }
        } else {
          setChatHistory(prevHistory => [...prevHistory, { role: assistant, content: "No response from AI" }]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setChatHistory(prevHistory => [...prevHistory, { role: "user", content: `Error: ${error}` }]);
    } finally {
      setIsLoading(false);
      setWaitingForAnswer(false);
      setHandlingError(false); // Cline: setHandlingError to false in finally block
    }
  }, [chatHistory, selectedComponent, isLoading, componentCompileError, components, waitingForAnswer, setComponents, setHandlingError, setIsLoading, setSelectedComponent]);

  // Update the user input state when the textarea value changes
  useEffect(() => {
    if (componentCompileError && handlingError) { // Check if already handling an error
      //setHandlingError(true); // Set error handling to true
      console.log("onSubmit --> Customer Component Compilation error:", componentCompileError);
      const err_msg = componentCompileError;
      setComponentCompileError(''); // Clear the error

      handleSubmit({ // Call handleSubmit with a fake event object (todo: must be refactored in the future)
        preventDefault: () => {},
        type: false,
        target: {
          elements: {
            namedItem: () => ({ value: `Compilation error: ${err_msg}\n\nCurrent user component code:\n\n${components[selectedComponent]}` })
          }
        }
      });
    }
  }, [componentCompileError, setComponentCompileError, selectedComponent, handlingError, setHandlingError, components, handleSubmit]); // Removed handleSubmit from the dependency array

  // Scroll to the bottom of the textarea when the chat history changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  //
  const formattedHistory = chatHistory.map(msg => `${msg.role === 'user' ? 'You:\n' : 'Assistant:\n'}: ${msg.content}`).join('\n\n');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w[95%]">
      <main className="flex-1 flex flex-col gap-8 items-center sm:items-start p-4 font-[family-name:var(--font-cascadia-code)]">
        <ComponentVisualizer />
      </main>
      <div className="flex flex-col w-full max-w-[95%] min-h-[400px] m-4 p-2 border-[3px] border-[#483AA4] rounded bg-[#282824] text-[#CB993B] text-xl font-[family-name:var(--font-cascadia-code)] overflow-y-auto">
        <textarea
          ref={textareaRef}
          className="flex-1 h-full bg-transparent outline-none"
          value={formattedHistory}
          readOnly
        />
        <form onSubmit={handleSubmit} className="mt-2">
          <textarea
            name="userInput"
            value={userInput}
            onChange={(e) => {if(!isLoading) setUserInput(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
            disabled={isLoading || waitingForAnswer}
            className="w-full h-full p-2 border-[3px] border-gray-800 rounded bg-[#2f2f2a] text-[#6FB150]"
            rows={4}
          />
        </form>
      </div>
    </div>
  );
}
