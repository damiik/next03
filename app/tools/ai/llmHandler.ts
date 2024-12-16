import { systemPrompt } from './prompts/system-prompts';
import { handleOpenAIRequest } from './openaiHandler';
import { handleOpenAICompatRequest } from './openaiCompatHandler';
import { handleAnthropicRequest } from './anthropicHandler';
import { handleGroqRequest } from './groqHandler';
import { handleGrokRequest } from './grokHandler';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
};

export async function handleLLMRequest(messages: Message[], query: string, llmProvider: string, llmModel: string) {

  if (llmProvider === 'openai') {
    return await handleOpenAIRequest(llmModel, systemPrompt, messages, query);
  } 
  else if (llmProvider === 'openai-compat') {

    const validMessages : {role:'user'|'assistant'|'system', content: string} [] = messages.filter((message) => (message.role !== 'model')).map((message) => {
      return { role: (message.role as 'user' | 'assistant' | 'system'), content: message.content };
    });

    return await handleOpenAICompatRequest(llmModel, systemPrompt, validMessages , query);
  } 
  else if (llmProvider === 'anthropic') {
    return await handleAnthropicRequest(llmModel, systemPrompt, messages, query);
  } 
  else if (llmProvider === 'grok') {

    const validMessages : {role:'user'|'assistant'|'system', content: string} [] = messages.filter((message) => (message.role !== 'model')).map((message) => {
      return { role: (message.role as 'user' | 'assistant' | 'system'), content: message.content };
    });

    return await handleGrokRequest(llmModel, systemPrompt, validMessages, query);
  } 
  else if (llmProvider === 'groq') {
    return await handleGroqRequest(llmModel, systemPrompt, messages, query);
  } 
  else if (llmProvider === 'gemini') {

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set. Please set it in your environment variables.');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    const client = genAI.getGenerativeModel({
      model: llmModel,
      systemInstruction:systemPrompt
    });

    const chatSession = client.startChat({
      generationConfig: {
        temperature: 0.2,
        topP: 0.5,
        topK: 9,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
      },
      history: messages.map((message) => ({ role: message.role, parts: [{ text: message.content }] })),
    });

    const response = await chatSession.sendMessage(query);
    const responseText = await response.response;

    return { content: responseText.text(), fullResponse: response };
  } 
  else {
    throw new Error(`Unsupported LLM provider: ${llmProvider}`);
  }
}
