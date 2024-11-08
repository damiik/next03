"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent, useCallback } from 'react';
import ComponentVisualizer from './components/ComponentVisualizer';
import { colors } from './components/colors';
import { useComponentContext } from './context/ComponentContext';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const defaultSystemPrompt = `You are Grok, an expert in creating React components with Tailwind CSS.
## If user asks for a React component, you will respond by creating React component with Tailwind styling.
 - Don't add any import statements like import react from 'react' or import { useState } from 'react'.
 - Don't add export statement.
 - You can use react hooks.
 - Add constants ONLY inside of component function.
 - Use colors from the predefined palette in the format: bg-[color], text-[color], border-[color], stroke-[color], fill-[color].
<important> Please use colors ONLY from the following palette: ${colors.map(color => color.name).join(", ")} </important>
<important> PLEASE RESPOND WITH FULL COMPONENT CODE INSIDE OF \`\`\`jsx CODE BLOCK AT THE BEGINNING OF THE MESSAGE.</important>
<important> If you can't, then respond with "I'm unable to create a component for that."</important>
<example>\`\`\`jsx
  function ComponentToRender() {
     const someConstArray = [...];
     const [start, setStart] = useState(0); // use hooks like this
     return (
       ...
     );
  }
\`\`\`
</example>
`;

export default function Home() {
  const { setComponents, setSelectedComponent, componentCompileError, setComponentCompileError, components, selectedComponent, isLoading, setIsLoading, resetChatHistory: contextResetChatHistory } = useComponentContext();

  const [userInput, setUserInput] = useState('');
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [handlingError, setHandlingError] = useState(false); // Add state for error handling
  const [chatHistory, setChatHistory] = useState<Message[]>([{ role: "system", content: defaultSystemPrompt }]);
  // const [chatHistory, setChatHistory] = useState<Message[]>([{ role: "user", content: defaultSystemPrompt }]); // for anthropic claude

  const resetChatHistory = useCallback(() => {
    setChatHistory([{ role: "system", content: defaultSystemPrompt }]);
    // setChatHistory([{ role: "user", content: defaultSystemPrompt }]); // for anthropic claude
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
      // Get the user input from the form or textarea
      let cleanedInput = '';
      if (e.type ?? true) {
        const inputElement = (e.target as HTMLFormElement)?.elements?.namedItem('userInput') || e.target as HTMLTextAreaElement;
        cleanedInput = inputElement instanceof HTMLTextAreaElement ? inputElement.value.trim() : '';
       if( inputElement instanceof HTMLTextAreaElement ) inputElement.value.trim()
      }
      else {
        cleanedInput = `Can you fix error: ${componentCompileError}
        ${components[selectedComponent]}
        `

        //${Object.entries(editableCode).map(([key, value]) => `\n\n for user component ${key} with code: ${value}\n`).join('')}`;

      }

      const newHistory : Message[] = [...chatHistory, { role: "user", content: cleanedInput }];
      setChatHistory(newHistory);

      setUserInput('');

      const response = await fetch('/api2', {    //api is off now!
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newHistory }),
      });

      const data = await response.json();
      const assistantResponse = data.content;
      console.log("Assistant Response:", assistantResponse);

      if (assistantResponse) {
        setChatHistory(prevHistory => [...prevHistory, { role: "assistant", content: assistantResponse }]);

        // Extract the code from the assistant's response
        const codeRegex = /```(javascript|tsx|jsx)([\s\S]*?)```/;
        const match = assistantResponse.match(codeRegex);

        if (match) {
          const extractedCode = match[2].trim();
          // Extract the component name from the function declaration
          const functionNameRegex = /function\s+(\w+)\s*\(/;
          const functionNameMatch = extractedCode.match(functionNameRegex);
          const componentName = functionNameMatch ? functionNameMatch[1] : 'Component1';

          setComponents(prev => ({ ...prev, [componentName]: extractedCode }));
          setSelectedComponent(componentName);
        }
      } else {
        setChatHistory(prevHistory => [...prevHistory, { role: "assistant", content: "No response from AI" }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setChatHistory(prevHistory => [...prevHistory, { role: "system", content: `Error: ${error}` }]);
    } finally {
      setIsLoading(false);
      setWaitingForAnswer(false);
      setHandlingError(false);
    }
  }, [chatHistory, setComponents, setSelectedComponent, isLoading, setIsLoading, componentCompileError, components, waitingForAnswer, handlingError]);

  // Update the user input state when the textarea value changes

  useEffect(() => {
    if (componentCompileError && !handlingError) { // Check if already handling an error
      setHandlingError(true); // Set error handling to true
      console.log("onSubmit --> Customer Component Compilation error:", componentCompileError);
      const err_msg = componentCompileError;
      setComponentCompileError(''); // Clear the error

      handleSubmit({ // Call handleSubmit
        preventDefault: () => {},
        type: false,
        target: {
          elements: {
            namedItem: () => ({ value: `Compilation error: ${err_msg}\n\nCurrent user component code:\n\n${components[selectedComponent]}` })
          }
        }
      });
    }
  }, [componentCompileError, setComponentCompileError, selectedComponent, handleSubmit]);

  // Scroll to the bottom of the textarea when the chat history changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  //
  const formattedHistory = chatHistory.map(msg => `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`).join('\n\n');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 flex flex-col gap-8 items-center sm:items-start p-4">
        <ComponentVisualizer />
      </main>
      <div className="flex flex-col w-full max-w-[95%] h-[40%] m-4 p-2 border-[3px] border-[#483AA4] rounded bg-[#282824] text-[#CB993B] text-xl font-[family-name:var(--font-cascadia-code)] overflow-y-auto">
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none bg-transparent outline-none"
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
            className="w-full p-2 border-[3px] border-gray-800 rounded bg-[#2f2f2a] text-[#6FB150]"
            rows={4}
          />
        </form>
      </div>
    </div>
  );
}
