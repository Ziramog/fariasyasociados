import { NextResponse } from 'next/server';
import { generateAIDescription } from '@/lib/quotations/ai-description';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const input = await request.json();
    const description = await generateAIDescription(input);
    return NextResponse.json({ description });
  } catch (err) {
    console.error('[API/generate-ai] Error:', err);
    return NextResponse.json({ error: err.message, description: null }, { status: 500 });
  }
}