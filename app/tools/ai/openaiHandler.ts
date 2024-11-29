import OpenAI from 'openai';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.');
}

export async function handleOpenAIRequest(llmModel: string, systemPrompt: string, messages: Message[], query: string) {

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const messagesWithoutSystem = messages.filter((message) => message.role !== 'system').map((message) => {
    return { role: (message.role as 'assistant' | 'user' | 'system'), content: message.content };
  });

  const response = await client.chat.completions.create({
    model: llmModel,
    messages: [{ role: 'system', content: systemPrompt }, ...messagesWithoutSystem, { role: 'user', content: query }],
    temperature: 0.7,
    top_p: 1,
  });

  // for openai compatybile models   
  // const responseText = response.choices[0].message?.content || null;
  const content = response.choices[0]?.message?.content || '';

  return { content, fullResponse: response };
}
