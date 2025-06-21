// Create this file: src/app/api/test-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test environment variables (never expose actual keys!)
    const envStatus = {
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      status: 'Environment variables loaded successfully',
      ...envStatus
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load environment variables' },
      { status: 500 }
    );
  }
}