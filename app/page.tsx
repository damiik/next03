"use client";

import { useState } from 'react';
import Image from "next/image";
import OpenAI from 'openai';

// Initialize OpenAI client with empty API key since we're using a proxy
const client = new OpenAI({
  apiKey: 'dummy', // Required by the library but not used by the proxy
  baseURL: 'http://0.0.0.0:4000',
  dangerouslyAllowBrowser: true // Required for client-side usage
});

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '') return;

    // Preserve spaces in user input
    const cleanedInput = userInput.trim();
    if (!cleanedInput) {
      console.log("Empty input after cleaning. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user message to history
      const newHistory = [...chatHistory, { role: "user" as const, content: cleanedInput }];
      setChatHistory(newHistory);
      setUserInput('');

      // Get response from LLM
      const response = await client.chat.completions.create({
        model: "local/nvidia/nemotron-4-340b-instruct",
        messages: newHistory
      });

      // Extract assistant's response
      const assistantResponse = response.choices[0].message.content;
      
      // Add assistant's response to history
      setChatHistory([...newHistory, { 
        role: "assistant" as const, 
        content: assistantResponse || "No response from AI" 
      }]);

    } catch (error) {
      console.error("Error:", error);
      setChatHistory([...chatHistory, { 
        role: "system" as const, 
        content: `Error: ${error}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format chat history for display
  const formattedHistory = chatHistory.map(msg => 
    `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
  ).join('\n\n');

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 flex flex-col gap-8 items-center sm:items-start p-4">
        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Simple AI Chat
          </li>
        </ol>

      </main>
      <div className="flex flex-col w-full max-w-[95%] h-[40%] m-4 p-2 border border-gray-300 rounded bg-stone-700 text-orange-700 text-2xl font-[family-name:var(--font-cascadia-code)] overflow-y-auto">
        <textarea
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
            className="w-full p-2 border border-gray-300 rounded bg-stone-800 text-orange-700"
          />
        </form>
      </div>
    </div>
  );
}
