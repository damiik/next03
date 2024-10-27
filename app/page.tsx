"use client";

import { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import ComponentVisualizer from './components/ComponentVisualizer';
import { colors } from './components/colors';
import { useComponentContext } from './context/ComponentContext';

// Initialize OpenAI client with empty API key since we're using a proxy
const client = new OpenAI({
  apiKey: 'dummy',
  baseURL: 'http://0.0.0.0:4000',
  dangerouslyAllowBrowser: true
});

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function Home() {
  const { setEditableCode, setSelectedComponent } = useComponentContext();
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([{
    role: "system",
    content:
      `You are a helpful, kind and very compentent assistant.
      ## Respond by creating React component with Tailwind styling.
       - Don't add any imports statements.
       - Don't add export statement.
       - Don't use any hooks.
       - Add constans ONLY inside of component function.
       - Don't define colors inside of component function.
      <example>
        function ComponentToRender() { const someConstArray = [...]; return (...); }
      </example>
      <important> Use ONLY form of component from example template!</important>
      <important> Please use colors ONLY from the following pallete: ${colors.map(color => color.name + ": " + color.value).join(", ")} </important>
      <important> Please use colors ONLY in follwing format: bg-[#hexcode] </important>

    `
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '') return;

    const cleanedInput = userInput.trim();
    if (!cleanedInput) {
      console.log("Empty input after cleaning. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      const newHistory : Message[] = [...chatHistory, { role: "user", content: cleanedInput }];
      setChatHistory(newHistory);
      setUserInput('');

      const response = await client.chat.completions.create({   // model: "local/nvidia/llama-3.1-nemotron-70b-instruct",
        // model: "local/nvidia/llama-3.1-nemotron-70b-instruct",
        // model: "local/nvidia/nemotron-4-340b-instruct",
         model: "local/mistral/mistral-large-latest",
         messages: newHistory,
      });

      const assistantResponse = response.choices[0].message?.content || null;
      console.log("Assistant Response:", assistantResponse); // Log the assistant response

      if (assistantResponse) {
        setChatHistory(prevHistory => [...prevHistory, { role: "assistant", content: assistantResponse }]);

        // Extract and update the code in the context
        const codeRegex = /```(javascript|tsx|jsx)([\s\S]*?)```/;
        const match = assistantResponse.match(codeRegex);

        if (match) {
          const extractedCode = match[2].trim(); // Use const
          console.log("Extracted Code:", extractedCode); // Log the extracted code
          setEditableCode(prev => ({ ...prev, ['Component1']: extractedCode }));
          setSelectedComponent('Component1');
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
  };

  // Scroll to the bottom of the textarea after update
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const formattedHistory = chatHistory.map(msg => `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`).join('\n\n');

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
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
            disabled={isLoading}
            className="w-full p-2 border-[3px] border-gray-800 rounded bg-[#2f2f2a] text-[#6FB150]"
          />
        </form>
      </div>
    </div>
  );
}
