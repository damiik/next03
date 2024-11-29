import { NextRequest, NextResponse } from 'next/server';
import { handleLLMRequest } from '../../app/tools/ai/llmHandler';

export async function POST(req: NextRequest) {
  const { messages, query, llmProvider, llmModel } = await req.json();

  try {
    const response = await handleLLMRequest(messages, query, llmProvider || 'gemini', llmModel || 'gemini-pro-002');
    return NextResponse.json({
      content: response.content,
      fullResponse: response.fullResponse,
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Error processing request.' }, { status: 500 });
  }
}
