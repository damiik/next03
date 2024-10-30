"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent, useCallback } from 'react';
import OpenAI from 'openai';
import ComponentVisualizer from './components/ComponentVisualizer';
import { colors } from './components/colors';
import { useComponentContext } from './context/ComponentContext';

// import Groq from "groq-sdk";
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// return groq.chat.completions.create({  messages: [] });

// // Initialize OpenAI client with empty API key since we're using a proxy
const client = new OpenAI({
  apiKey: 'dummy',
  baseURL: 'http://0.0.0.0:4000',
  dangerouslyAllowBrowser: true
});
// Initialize OpenAI client with empty API key since we're using a proxy
// const client = new OpenAI({
//   apiKey: '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',
//   baseURL: 'https://integrate.api.nvidia.com/v1',
//   dangerouslyAllowBrowser: true
// });



type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function Home() {
  const { setEditableCode, setSelectedComponent, componentCompileError, setError } = useComponentContext();
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([{
    role: "system",
    content:
      `You are a helpful, kind and very compentent assistant.
      ## If user asks for a React component, you will respond by creating React component with Tailwind styling.
       - Don't add any import statements like import react from 'react' or import { useState } from 'react'.
       - Don't add export statement.
       - You can use react hooks.
       - Add constans ONLY inside of component function.
       - Don't define colors inside of component function.
      <example>
        function ComponentToRender() {
           const someConstArray = [...]; 
           const [start, setStart] = useState(0); // use hooks like this
           return (
             ...
           ); 
        }
      </example>
      <important> Use ONLY form of component from example template!</important>
      <important> Please use colors ONLY from the following pallete: ${colors.map(color => color.name  ).join(", ")} </important>
      <important> Please use colors ONLY in follwing format: bg-PINKY_LIGHT_RED </important>

    `
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // New state variable to mirror componentCompileError
  const [pageComponentError, setPageComponentError] = useState('');

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    // Get the user input from the form
    const inputElement = (e.target as HTMLFormElement)?.elements?.namedItem('userInput') || e.target as HTMLTextAreaElement;
    const cleanedInput = inputElement instanceof HTMLTextAreaElement ? inputElement.value.trim() : '';
    if (!cleanedInput) {
      console.log("Empty input after cleaning. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      const newHistory : Message[] = [...chatHistory, { role: "user", content: cleanedInput }];
      setChatHistory(newHistory);
      setUserInput('');

      const response = await client.chat.completions.create({
          //model: "local/nvidia/llama-3.1-nemotron-70b-instruct",
          //model: "local/nvidia/nemotron-4-340b-instruct",
          model: "local/meta/llama-3.1-405b-instruct", //works good, little slow
         //model: "local/mistral/mistral-large-latest",
         messages: newHistory,
      });

      const assistantResponse = response.choices[0].message?.content || null;
      console.log("Assistant Response:", assistantResponse);

      if (assistantResponse) {
        setChatHistory(prevHistory => [...prevHistory, { role: "assistant", content: assistantResponse }]);

        // Extract and update the code in the context
        const codeRegex = /```(javascript|tsx|jsx)([\s\S]*?)```/;
        const match = assistantResponse.match(codeRegex);

        if (match) {
          const extractedCode = match[2].trim();

          // Extract the function name from the extracted code
          const functionNameRegex = /function\s+(\w+)\s*\(/;
          const functionNameMatch = extractedCode.match(functionNameRegex);
          const componentName = functionNameMatch ? functionNameMatch[1] : 'Component1';

          setEditableCode(prev => ({ ...prev, [componentName]: extractedCode }));
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
    }
  }, [chatHistory, setEditableCode, setSelectedComponent]);

  // useEffect to update pageComponentError and trigger re-render
  useEffect(() => {
    setPageComponentError(componentCompileError);
  }, [componentCompileError]);

  useEffect(() => {
    if (pageComponentError) { // Use pageComponentError here
      console.log("Submit Component Error:", pageComponentError);
      // Clear the existing error in the context
      setError('');

      // Send the error as a new user message
      handleSubmit({
        preventDefault: () => {},
        target: {
          elements: {
            namedItem: () => ({ value: `Compilation error: ${pageComponentError}` })
          }
        }
      } as unknown as FormEvent<HTMLFormElement>);
    }
  }, [pageComponentError, setError, handleSubmit]);

  // Scroll to the bottom of the textarea after update
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [chatHistory]);

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
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
            disabled={isLoading}
            className="w-full p-2 border-[3px] border-gray-800 rounded bg-[#2f2f2a] text-[#6FB150]"
            rows={4}
          />
        </form>
      </div>
    </div>
  );
}
