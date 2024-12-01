"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent, useCallback } from 'react';
import ComponentVisualizer from './components/ComponentVisualizer';
import { useComponentContext } from './context/ComponentContext';
import { replaceFragments } from './tools/diff';
import { pipe } from 'fp-ts/lib/function';
import { match } from 'fp-ts/lib/Either';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
};

let assistant : 'assistant' |  'model' = 'model'; // Standardize assistant role

export default function Home() {
  const {
    setComponents,
    setSelectedComponent,
    componentCompileError,
    setComponentCompileError,
    components,
    selectedComponent,
    isLoading,
    setIsLoading,
    resetChatHistory: contextResetChatHistory,
    handlingError,
    setHandlingError,
  } = useComponentContext();

  const [userInput, setUserInput] = useState('');
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [llmProvider, setLLMProvider] = useState('gemini'); // New state for LLM provider
  const [llmModel, setLLMModel] = useState('gemini-1.5-pro-002'); // New state for LLM model

  const resetChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  useEffect(() => {
    contextResetChatHistory();
  }, [resetChatHistory, contextResetChatHistory]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const processUserInput = (input: string): string => {
    let cleanedInput = input.trim();
    const matches = cleanedInput.match(/([\s\S]*?)\{\{\}\}([\s\S]*)/);
    if (matches) {
      const codeLines: string[] = components[selectedComponent]?.split('\n') ?? [];
      cleanedInput = `${matches[1]}\n##Current component source code:\n${codeLines.join('\n')}\n${matches[2]}`;
    }
    return cleanedInput;
  };

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      if (isLoading || waitingForAnswer) return;

      setWaitingForAnswer(true);
      setIsLoading(true);

      try {
        let cleanedInput = '';
        if (e.type !== 'click') {
          const inputElement = e.target as HTMLTextAreaElement;
          cleanedInput = processUserInput(inputElement.value);
        } else {
          cleanedInput = `Can you fix error: ${componentCompileError}\n in component code:\n${components[selectedComponent]}`;
        }

        setUserInput('');

        if (cleanedInput !== '') {
          const response = await fetch('/api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: chatHistory, query: cleanedInput, llmProvider, llmModel }),
          });

          const data = await response.json();
          const assistantResponse = data.content;

          const newHistory: Message[] = [
            ...chatHistory,
            { role: 'user', content: cleanedInput },
          ];
          setChatHistory(newHistory);

          if (assistantResponse) {
            setChatHistory((prevHistory) => [
              ...prevHistory,
              { role: assistant, content: assistantResponse },
            ]);

            const frResult: string | undefined = pipe(
              replaceFragments(assistantResponse, components[selectedComponent]),
              match(
                () => undefined,
                (code) => code
              )
            );
            if (frResult !== undefined) {
              setComponents((prev) => ({ ...prev, [selectedComponent]: frResult }));
            } else {
              const match = assistantResponse.match(/```(javascript|typescript|tsx|jsx)([\s\S]*?)```/);
              if (match) {
                const extractedCode = match[2].trim();
                const functionNameRegex = /function\s+(\w+)\s*\(/;
                const functionNameMatch = extractedCode.match(functionNameRegex);
                const componentName = functionNameMatch ? functionNameMatch[1] : 'Component1';

                setComponents((prev) => ({ ...prev, [componentName]: extractedCode }));
                setSelectedComponent(componentName);
              }
            }
          } else {
            setChatHistory((prevHistory) => [
              ...prevHistory,
              { role: assistant, content: 'No response from AI' },
            ]);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { role: 'user', content: `Error: ${error}` },
        ]);
      } finally {
        setIsLoading(false);
        setWaitingForAnswer(false);
        setHandlingError(false);
      }
    },
    [
      chatHistory,
      selectedComponent,
      isLoading,
      componentCompileError,
      components,
      waitingForAnswer,
      llmProvider,
      llmModel, // Add llmModel to the dependency array
      setComponents,
      setHandlingError,
      setIsLoading,
      setSelectedComponent,
    ]
  );


  useEffect(() => {
    if (componentCompileError && handlingError) {
      console.log('Compilation error:', componentCompileError);
      setComponentCompileError('');

      handleSubmit({
        preventDefault: () => {},
        type: 'click',
        target: {} as EventTarget,
      } as FormEvent<HTMLFormElement>);
    }
  }, [componentCompileError, setComponentCompileError, handlingError, handleSubmit]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const formattedHistory = chatHistory
    .map((msg) => `${msg.role === 'user' ? 'You:\n' : 'Assistant:\n'}${msg.content}`)
    .join('\n\n');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w[95%]">
      <main className="flex-1 flex flex-col gap-8 items-center sm:items-start p-4 font-[family-name:var(--font-cascadia-code)]">
        <ComponentVisualizer />
      </main>
      <div className="flex flex-col w-full max-w-[95%] min-h-[400px] m-4 p-2 border-[3px] border-[#483AA4] rounded bg-[#282824] text-[#CB993B] text-xl font-[family-name:var(--font-cascadia-code)] overflow-y-auto">
        <textarea
          ref={textareaRef}
          className="text-sm flex-1 h-full bg-transparent outline-none"
          value={formattedHistory}
          readOnly
        />
        <form onSubmit={handleSubmit} className="mt-2">
          <textarea
            name="userInput"
            value={userInput}
            onChange={(e) => {
              if (!isLoading) setUserInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Waiting for response...' : 'Type your message...'}
            disabled={isLoading || waitingForAnswer}
            className="w-full h-full p-2 text-sm border-[3px] border-gray-800 rounded bg-[#2f2f2a] text-[#6FB150]"
            rows={4}
          />
          <div className="flex mt-2">
            <select
              value={`${llmProvider},${llmModel}`} // Use a comma to separate the values for the select
              onChange={(e) => {
                const [provider, model] = e.target.value.split(',')
                if(provider === "gemini") assistant = 'model';
                else 
                  assistant = 'assistant';
                console.log('provider:', provider, 'model:', model);
                setLLMProvider(provider);
                setLLMModel(model);
              }}
              className="p-2 bg-gray-700 text-white rounded text-sm"
            >
              <optgroup label="OpenAI Compatible">
                <option value="openai-compat,grok-beta">grok-beta</option>
              </optgroup>
              <optgroup label="LiteLLM (proxy)">
                <option value='openai-compat,mistral/mistral-large-latest'>LiteLLM: mistral/mistral-large-latest</option>
                <option value='openai-compat,nvidia/llama-3.1-nemotron-70b-instruct'>LiteLLM: llama-3.1-nemotron-70b-instruct</option>
                <option value='openai-compat,meta/llama-3.1-70b-instruct'>LiteLLM: nvidia/llama-3.1-70b-instruct</option>
                <option value='openai-compat,meta/llama-3.1-405b-instruct'>LiteLLM: nvidia/llama-3.1-405b-instruct</option>
              </optgroup>
              <optgroup label="OpenAI">
                <option value="openai,gpt-4o">gpt-4o</option>
                <option value="openai,gpt-3.5-turbo">gpt-3.5-turbo</option>
              </optgroup>
              <optgroup label="Anthropic">
                <option value="anthropic,claude-3-5-haiku-20241022">claude-3-5-haiku-20241022</option>
                <option value="anthropic,claude-3-5-sonet-20241022">claude-3-5-sonet-20241022</option>
              </optgroup>
              <optgroup label="Gemini">
                <option value="gemini,gemini-exp-1114">gemini-exp-1114</option>
                <option value="gemini,gemini-1.5-pro-002">gemini-1.5-pro</option>
                <option value="gemini,gemini-1.5-flash-002">gemini-1.5-flash-002</option>
              </optgroup>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
}
