'use client';

import React, { useState, useRef, useEffect, FormEvent, KeyboardEvent, useCallback } from 'react';
import { ChevronsRight, CornerRightDown, Palette, FileCode2, Wrench } from 'lucide-react';
import { colors } from '../res/colors';
import { useComponentContext } from '../context/ComponentContext';
import { useChatContext } from '../context/ChatContext';
import { pipe } from 'fp-ts/lib/function';
import { match } from 'fp-ts/lib/Either';
import { replaceFragments } from '../tools/diff';

let assistant: 'assistant' | 'model' = 'model';

// type Message = {
//   role: 'user' | 'assistant' | 'system' | 'model';
//   content: string;
// };

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    componentStyle: false,
    background: false,
    chat: true,
  });

  const {
    selectedComponent,
    setSelectedComponent,
    components,
    isLoading,
    setIsLoading,
    componentCompileError,
    setComponentCompileError,
    setComponents,
    handlingError,
    setHandlingError,
    resetChatHistory: contextResetChatHistory,
  } = useComponentContext();

  const {
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
  } = useChatContext();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleNode = (node: string) => {
    setExpandedNodes(prev => ({ ...prev, [node]: !prev[node] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleComponentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedComponent(event.target.value);
    if (event.target.value) {
      //compileAndRender(event.target.value);
    }
  }



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

          if (assistantResponse) {
            setChatHistory([
              ...chatHistory,
              { role: 'user', content: cleanedInput },
              { role: assistant, content: assistantResponse }
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
            setChatHistory([...chatHistory, { role: assistant, content: 'No response from AI' }]);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setChatHistory([...chatHistory, { role: assistant, content: `Error: ${error}` }]);
      } finally {
        setIsLoading(false);
        setWaitingForAnswer(false);
        setHandlingError(false);
      }
    },
    [
      chatHistory,
      components,
      waitingForAnswer,
      llmProvider,
      llmModel,
      setComponents,
      setHandlingError,
      setIsLoading,
      setWaitingForAnswer,
      isLoading,
      selectedComponent,
      componentCompileError,
      setChatHistory,
      setUserInput,
    ]
  );

  const resetChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  useEffect(() => {
    contextResetChatHistory();
  }, [resetChatHistory, contextResetChatHistory]);


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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formattedHistory = chatHistory
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n\n');

  return (
    <div className={`bg-gray-800 p-4 shadow-md h-full overflow-y-auto relative ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-white">Component:</h2>
      <ul>
        <li>
          <select className="w-full p-2 border mb-4 bg-gray-700 text-white rounded text-sm" value={selectedComponent} onChange={handleComponentChange}>
            <option value="">Select a component</option>
            {Object.keys(components).map(comp => <option key={comp} value={comp}>{comp}</option>)}
          </select>
        </li>
        <li>
          <div className="flex items-center">
            <button
              className=" py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
              onClick={() => toggleNode('componentStyle')}
            >
              {expandedNodes.componentStyle ?
                <div className="flex items-center">
                  <Wrench className="mr-2 transition-transform" />
                  <span>Properties</span>
                  <CornerRightDown className="ml-2 transition-transform translate-y-2" />
                </div>

                :
                <div className="flex items-center">
                  <ChevronsRight className="mr-2 transition-transform" />
                  <FileCode2 className="mr-2 transition-transform" />
                  <span>Component Style</span>
                </div>

              }
            </button>
          </div>
          <ul className={`ml-4 ${expandedNodes.componentStyle ? '' : 'hidden'}`}>
            <li>
              <button
                className=" py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
                onClick={() => toggleNode('background')}
              >
                {expandedNodes.background ?
                  <div className="flex items-center">
                    <Palette className="mr-2 transition-transform" />
                    <span>Colors</span>
                    <CornerRightDown className="ml-2 transition-transform translate-y-2" />
                  </div>
                  :
                  <div className="flex items-center">
                    <ChevronsRight className="mr-2 transition-transform" />
                    <Palette className="mr-2 transition-transform" />
                    Palette
                  </div>
                }

              </button>
              <ul className={`ml-4 ${expandedNodes.background ? '' : 'hidden'}`}>
                {colors.map((color, index) => (
                  <li key={color.name}>
                    <button
                      className={`bg-${color.name} px-4 py-0 rounded-md hover:bg-[#555555] min-w-[200px] text-${colors[(index+16) % colors.length].name}`}
                      onClick={() => copyToClipboard("[" + color.value + "]")}
                    >
                      {color.name}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </li>
        <li className="mb-4">
          <div className="flex items-center">
            <button
              className="py-2 px-4 rounded-md hover:bg-gray-700 text-white flex items-center"
              onClick={() => toggleNode('chat')}
            >
              {expandedNodes.chat ? (
                <div className="flex items-center">
                  <Wrench className="mr-2" />
                  <span>Chat</span>
                  <CornerRightDown className="ml-2 transition-transform translate-y-2" />
                </div>
              ) : (
                <div className="flex items-center">
                  <ChevronsRight className="mr-2" />
                  <FileCode2 className="mr-2" />
                  <span>Chat</span>
                </div>
              )}
            </button>
          </div>
          {expandedNodes.chat && (
            <div className="mt-2">
              <div className="flex flex-col w-full min-h-[400px] border-[3px] border-[#483AA4] rounded bg-[#282824] text-[#CB993B] text-xl font-[family-name:var(--font-cascadia-code)] overflow-y-auto">
                <textarea
                  ref={textareaRef}
                  className="text-sm flex-1 h-full bg-transparent outline-none p-2"
                  value={formattedHistory}
                  readOnly
                />
                <form onSubmit={handleSubmit} className="mt-2 p-2">
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
                      value={`${llmProvider},${llmModel}`}
                      onChange={(e) => {
                        const [provider, model] = e.target.value.split(',')
                        if(provider === "gemini") assistant = 'model';
                        else assistant = 'assistant';
                        console.log(`provider:${provider}, model:${model}, assistantName:${assistant}`);
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
                        <option value='openai-compat,meta/llama-3.3-70b-instruct'>LiteLLM: nvidia/llama-3.3-70b-instruct</option>
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
                        <option value="gemini,gemini-exp-1206">gemini-exp-1206</option>
                        <option value="gemini,gemini-exp-1114">gemini-exp-1114</option>
                        <option value="gemini,gemini-1.5-pro-002">gemini-1.5-pro</option>
                        <option value="gemini,gemini-1.5-flash-002">gemini-1.5-flash-002</option>
                      </optgroup>
                    </select>
                  </div>
                </form>
              </div>
            </div>
          )}
        </li>
      </ul>

    </div>
  );
};

export default Sidebar;
