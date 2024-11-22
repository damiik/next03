import { defaultSystemPrompts } from './prompts/system-prompts';
import { GoogleGenerativeAI } from '@google/generative-ai';
type Message = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
};

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set. Please set it in your environment variables.');
}

export async function handleLLMRequest(messages : Message[], query:string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
  const client = genAI.getGenerativeModel({
    // model: 'gemini-1.5-pro-002',
    model: 'gemini-exp-1121',
    systemInstruction: defaultSystemPrompts[3],
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
  const responseText = await response.response.text();

  return { content: responseText, fullResponse: response };
}
