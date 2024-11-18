import { NextRequest, NextResponse } from 'next/server';
import { defaultSystemPrompts } from '../prompts/system-prompts';

//import OpenAI from 'openai';
//import Anthropic from '@anthropic-ai/sdk';
import {GoogleGenerativeAI}  from "@google/generative-ai";


type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};


// opeai
// if (!process.env.OPENAI_API_KEY) {
//   throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.');
// }

// grok
// if (!process.env.XAI_API_KEY) {
//   throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.');
// }
// if (!process.env.XAI_API_BASE) {
//   throw new Error('XAI_API_BASE is not set. Please set it in your environment variables.');
// }

// antrhopic
// if (!process.env.ANTHROPIC_API_KEY) {
//   throw new Error('ANTHROPIC_API_KEY is not set. Please set it in your environment variables.');
// }

// google
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set. Please set it in your environment variables.');
}

// openai
// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   // baseURL: 'http://0.0.0.0:4000',
//   dangerouslyAllowBrowser: true
// });


// grok
// const client = new OpenAI({
//   apiKey: process.env.XAI_API_KEY,
//   baseURL: process.env.XAI_API_BASE,
//   dangerouslyAllowBrowser: true // Only for development. Remove this line in production.
// });


// liteLLM proxy
// const client = new OpenAI({
//   apiKey: "EMPTY",
//   baseURL: 'http://0.0.0.0:4000',
//   dangerouslyAllowBrowser: true
// });

// anthropic
// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
// });



export async function POST(req: NextRequest) {
  const { messages, query } = await req.json();
  // const messages  = messages_any as Message[];

  // google
  console.log(`I got POST for LLM api: ${JSON.stringify(messages)} \n`);
  
  try {

    // openai
    // const response = await client.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages:[{ role: "system", content: defaultSystemPrompts[3] }, ...messages, { role: "user", content: query }],
    // });

    //  litellm
    // const response = await client.chat.completions.create({
    //   //model: 'nvidia/llama-3.1-nemotron-70b-instruct',
    //   //model: 'llama-3.1-70b-instruct',
    //   model: 'meta/llama-3.1-405b-instruct',
    //   messages: [{ role: "system", content: defaultSystemPrompts[3] }, ...messages, { role: "user", content: query }],
    //   temperature:0.75,
    //   top_p:1,
    //   //max_tokens:1024,
    //   // stream:true,
    // });

    // grok
    // const response = await client.chat.completions.create({
    //   model: 'grok-beta',
    //   messages:[{ role: "system", content: defaultSystemPrompts[3] }, ...messages, { role: "user", content: query }],
    // });

    // anthropic
    // const response = await anthropic.messages.create({
    //   model: "claude-3-5-haiku-20241022",
    //   max_tokens: 1024,
    //   messages:[{ role: "user", content: defaultSystemPrompts[3] }, ...messages, { role: "user", content: query }],
    // });
    // Properly type and handle the content blocks - for anthropic claude
    // response.content.forEach((block) => {
    //   if (block.type === 'text') {
    //     console.log('Block text:', block.text);
    //   }
    // });


    // google
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY??"");
    const client = genAI.getGenerativeModel({
      model: "gemini-exp-1114",
      systemInstruction: defaultSystemPrompts[3],
    });
    const chatSession = client.startChat({

      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      },
      history: (messages as Message[]).map(message  => ({role: message.role, parts: [{text: message.content}]})),
    });

    const response = await chatSession.sendMessage(query); //(messages as Message[]).slice(-1)[0].content ));
    const responseText = response.response.text()

    // Extract the first text block if it exists - for anthropic claude
    // const firstTextBlock = response.content.find(block => block.type === 'text');
    // const responseText = firstTextBlock ? firstTextBlock.text : '';

    // for openai compatybile models
    // const responseText = response.choices[0].message?.content || null;

    return NextResponse.json({
      content: responseText,
      fullResponse: response
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Error processing request.' }, { status: 500 });
  }
}
