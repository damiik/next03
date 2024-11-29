import OpenAI from 'openai';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function handleOpenAICompatRequest(llmModel: string, systemPrompt: string, messages: Message[], query: string) {
 
  let response;
  console.log('handleOpenAICompatRequest:', llmModel, messages, query);

   // grok
  if (llmModel == 'grok-beta') {

    
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

    response = await client.chat.completions.create({ 
      model: llmModel,
      messages: [{ role: 'system', content: systemPrompt }, ...messages, { role: 'user', content: query }],
      temperature: 0.7,
      top_p: 1,
    });    
  }
  else if (
    llmModel === 'mistral/mistral-large-latest' || 
    llmModel === 'nvidia/llama-3.1-nemotron-70b-instruct' || 
    llmModel === 'meta/llama-3.1-405b-instruct' ||
    llmModel === 'meta/llama-3.1-70b-instruct') {

    // liteLLM proxy
    const client = new OpenAI({
      apiKey: "EMPTY",
      baseURL: 'http://0.0.0.0:4000',
      dangerouslyAllowBrowser: true
    });

    response = await client.chat.completions.create({
      model: llmModel,
      messages: [{ role: "system", content: systemPrompt }, ...messages, { role: "user", content: query }],
      temperature:0.75,
      top_p:1,
      //max_tokens:1024,
      // stream:true,
    }); 
  }
   

  // const messagesWithoutSystem = messages.filter((message) => message.role !== 'system').map((message) => {
  //   return { role: (message.role as 'assistant' | 'user' | 'system'), content: message.content };
  // });





  // for openai compatybile models
  //const responseText = response.choices[0].message?.content || null; 
  const content = response?.choices[0]?.message?.content || '';

  return { content, fullResponse: response };
}
