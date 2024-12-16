import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${query}&format=json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('DuckDuckGo API error:', error);
    return NextResponse.json({ error: 'Error fetching data from DuckDuckGo' }, { status: 500 });
  }
}
