import OpenAI from 'openai';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function handleGrokRequest(llmModel: string, systemPrompt: string, messages: Message[], query: string) {
 
  console.log('handleGrokRequest:', llmModel, messages, query);

  // grok

  if (!process.env.XAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.');
  }
  if (!process.env.XAI_API_BASE) {
    throw new Error('XAI_API_BASE is not set. Please set it in your environment variables.');
  }

  const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: process.env.XAI_API_BASE,
    dangerouslyAllowBrowser: true // Only for development. Remove this line in production.
  });

  const response = await client.chat.completions.create({ 
    model: llmModel,
    messages: [{ role: 'system', content: systemPrompt }, ...messages, { role: 'user', content: query }],
    temperature: 0.45,
    top_p: 1,
  });    

  const content = response?.choices[0]?.message?.content || '';

  return { content, fullResponse: response };
}
