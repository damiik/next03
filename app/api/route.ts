import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.');
}

const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,
  // baseURL: 'http://0.0.0.0:4000',
  dangerouslyAllowBrowser: true
  });





export async function POST(req: NextRequest) {

  const { messages } = await req.json();
  console.log('I got POST for LLM api\n');
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
    });



    response.choices.forEach((choice) => {
      console.log(choice.message.content);
    });

    return NextResponse.json( response);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Error processing request.' }, { status: 500 });
  }
}
