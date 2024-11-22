import Anthropic from '@anthropic-ai/sdk';
import { defaultSystemPrompts } from './prompts/system-prompts';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set. Please set it in your environment variables.');
}

export async function handleAnthropicRequest(messages: Message[], query: string) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const conversation = messages.map((message) => {
    if (message.role === 'user') return `\n\nHuman: ${message.content}`;
    if (message.role === 'assistant') return `\n\nAssistant: ${message.content}`;
    return ''; // Ignore system messages for Anthropic
  });

  const prompt = [defaultSystemPrompts[3], ...conversation, `\n\nHuman: ${query}`, '\n\nAssistant:'].join('');

  const response = await anthropic.complete({
    prompt,
    stop_sequences: ['\n\nHuman:'],
    max_tokens_to_sample: 1024,
    model: 'claude-v1',
    temperature: 0.7,
  });

  const content = response.completion.trim();

  return { content, fullResponse: response };
}
