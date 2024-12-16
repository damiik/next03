import OpenAI from 'openai';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function handleOpenAICompatRequest(llmModel: string, systemPrompt: string, messages: Message[], query: string) {
 
  console.log('handleOpenAICompatRequest:', llmModel, messages, query);

  // liteLLM proxy check
  if (
    llmModel !== 'mistral/mistral-large-latest' &&
    llmModel !== 'nvidia/llama-3.1-nemotron-70b-instruct' &&
    llmModel !== 'meta/llama-3.1-405b-instruct' &&
    llmModel !== 'meta/llama-3.3-70b-instruct') 
    console.log('handleOpenAICompatRequest: Trying to use liteLLM proxy with not listed model:', llmModel);
  const client = new OpenAI({
    apiKey: "EMPTY",
    baseURL: 'http://0.0.0.0:4000',
    dangerouslyAllowBrowser: true
  });

  const response = await client.chat.completions.create({
    model: llmModel,
    messages: [{ role: "system", content: systemPrompt }, ...messages, { role: "user", content: query }],
    temperature:0.3,
    top_p:0.7,
    //max_tokens:1024,
    // stream:true,
  }); 
  
   
  const content = response?.choices[0]?.message?.content || '';

  return { content, fullResponse: response };
}
