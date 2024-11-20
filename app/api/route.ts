import { NextRequest, NextResponse } from 'next/server';
import { handleLLMRequest } from '../utils/llmHandler';

export async function POST(req: NextRequest) {
  const { messages, query } = await req.json();

  try {
    const response = await handleLLMRequest(messages, query);
    return NextResponse.json({
      content: response.content,
      fullResponse: response.fullResponse,
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Error processing request.' }, { status: 500 });
  }
}
