import Anthropic from '@anthropic-ai/sdk';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
};

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set. Please set it in your environment variables.');
}

export async function handleAnthropicRequest(llmModel: string, systemPrompt: string, messages: Message[], query: string) {

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // const conversation : Message[] = messages.map((message) => {
  //   ///return { role: message.role, content: message.content };

  //   if (message.role === 'user') return  ({ role: "user", content: message.content });
  //   if (message.role === 'assistant') return  ({ role: "assistant", content: message.content });
  //   return ({ role: message.role, content: message.content });
    
  //   // Ignore system messages for Anthropic
  // }).filter((message) => message.role !== 'system');

  const conversation  = messages.filter((message) => (message.role === 'user' || message.role === 'assistant')).map((message) => {
    
    return { 'role': (`${message.role}` as 'user' | 'assistant'), 'content': `${message.content}` };
  });

  //const prompt = [defaultSystemPrompts[3], ...conversation, `\n\nHuman: ${query}`, '\n\nAssistant:'].join('');
  // const response = await anthropic.complete({
  //   prompt,
  //   stop_sequences: ['\n\nHuman:'],
  //   max_tokens_to_sample: 1024,
  //   model: 'claude-v1',
  //   temperature: 0.7,
  // });

//   const response = await anthropic.messages.create({
//   model: "claude-3-5-sonnet-20241022",
//   max_tokens: 1024,
//   messages: [{ role: "user", content: "Hello, Claude" }],
// });

  const response = await anthropic.messages.create({
    model: llmModel,
    max_tokens: 1024,
    messages: [{ role: "user", content: systemPrompt }, 
                ...conversation,  
               { role: "user", content: query }]
  });

  //Properly type and handle the content blocks - for anthropic claude
  response.content.forEach((block) => {
    if (block.type === 'text') {
      console.log('Block text:', block.text);
    }
  });


  const content = response.content[0].type === 'text' ? response.content[0].text.trim() : "Undefined type of response.";

  return { content, fullResponse: response };
}
