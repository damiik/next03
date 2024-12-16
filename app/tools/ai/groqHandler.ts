import Groq from 'groq-sdk';
import { ChatCompletionAssistantMessageParam, ChatCompletionMessageParam, ChatCompletionUserMessageParam } from 'groq-sdk/resources/chat/completions.mjs';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
};

export async function handleGroqRequest(
  model: string,
  systemPrompt: string,
  messages: Message[],
  query: string
) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Please set it in your environment variables.');
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });


  const mappedMessages = messages
    .map((message): ChatCompletionMessageParam | null => {
      if (message.role === 'assistant' || message.role === 'model') {
        return { content: message.content, role: 'assistant' } as ChatCompletionAssistantMessageParam;
      } 
      else if (message.role === 'user') {
        return { content: message.content, role: 'user' } as ChatCompletionUserMessageParam;
      }
      return null;
    })
    .filter((msg): msg is ChatCompletionMessageParam => msg !== null);

  const formattedMessages: ChatCompletionMessageParam[] = [
    { content: systemPrompt, role: 'system' },
    ...mappedMessages,
    { content: query, role: 'user' } as ChatCompletionUserMessageParam,
  ];

  const chatCompletion = await groq.chat.completions.create({
    messages: formattedMessages,
    model: model,
    temperature: 1,
    // max_tokens: 1024,
    top_p: 1,
    // stream: true,
    stream: false,
    stop: null
  });

  //const content = chatCompletion.choices[0]?.message
  // for openai compatybile models   
  // const responseText = response.choices[0].message?.content || null;
  const content = chatCompletion.choices[0]?.message?.content || '';
  return { content, fullResponse: chatCompletion };
}
