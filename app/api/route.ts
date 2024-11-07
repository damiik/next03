import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
//import Anthropic from '@anthropic-ai/sdk';

// if (!process.env.OPENAI_API_KEY) {
//   throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.');
// }

if (!process.env.XAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.');
}
if (!process.env.XAI_API_BASE) {
  throw new Error('XAI_API_BASE is not set. Please set it in your environment variables.');
}

// if (!process.env.ANTHROPIC_API_KEY) {
//   throw new Error('ANTHROPIC_API_KEY is not set. Please set it in your environment variables.');
// }

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   // baseURL: 'http://0.0.0.0:4000',
//   dangerouslyAllowBrowser: true
// });

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: process.env.XAI_API_BASE,
  dangerouslyAllowBrowser: true // Only for development. Remove this line in production.
});

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
// });

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  console.log('I got POST for LLM api\n');
  
  try {
    // const response = await client.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: messages,
    // });

    // const response = await anthropic.messages.create({
    //   model: "claude-3-5-haiku-20241022",
    //   max_tokens: 1024,
    //   messages: messages, //[{ role: "user", content: "Hello, Claude" }],
    // });

    const response = await client.chat.completions.create({
      model: 'grok-beta',
      messages: messages,
    });

    // Properly type and handle the content blocks - for anthropic claude
    // response.content.forEach((block) => {
    //   if (block.type === 'text') {
    //     console.log('Block text:', block.text);
    //   }
    // });

    // Extract the first text block if it exists - for anthropic claude
    // const firstTextBlock = response.content.find(block => block.type === 'text');
    // const responseText = firstTextBlock ? firstTextBlock.text : '';

    const responseText = response.choices[0].message?.content || null; // for openai compatybile models

    return NextResponse.json({
      content: responseText,
      fullResponse: response
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Error processing request.' }, { status: 500 });
  }
}
