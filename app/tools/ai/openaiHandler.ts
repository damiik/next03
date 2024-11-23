import OpenAI from 'openai';
import { defaultSystemPrompts } from './prompts/system-prompts';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.');
}

export async function handleOpenAIRequest(messages: Message[], query: string) {

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const messagesWithoutSystem = messages.filter((message) => message.role !== 'system').map((message) => {
    return { role: (message.role as 'assistant' | 'user' | 'system'), content: message.content };
  });

  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo', // or 'gpt-4' if available
    messages: [{ role: 'system', content: defaultSystemPrompts[3] }, ...messagesWithoutSystem, { role: 'user', content: query }],
    temperature: 0.7,
    top_p: 1,
  });

  const content = response.choices[0]?.message?.content || '';

  return { content, fullResponse: response };
}
