"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
};

interface ChatContextType {
  userInput: string;
  setUserInput: (input: string) => void;
  waitingForAnswer: boolean;
  setWaitingForAnswer: (waiting: boolean) => void;
  chatHistory: Message[];
  setChatHistory: (history: Message[]) => void;
  llmProvider: string;
  setLLMProvider: (provider: string) => void;
  llmModel: string;
  setLLMModel: (model: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [userInput, setUserInput] = useState('');
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [llmProvider, setLLMProvider] = useState('gemini');
  const [llmModel, setLLMModel] = useState('gemini-1.5-pro-002');

  return (
    <ChatContext.Provider
      value={{
        userInput,
        setUserInput,
        waitingForAnswer,
        setWaitingForAnswer,
        chatHistory,
        setChatHistory,
        llmProvider,
        setLLMProvider,
        llmModel,
        setLLMModel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
