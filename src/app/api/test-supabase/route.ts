// src/app/api/test-supabase/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple test - get database time
    const { data, error } = await supabase.rpc('now');
    
    return NextResponse.json({
      status: 'Supabase connection successful! 🎉',
      url: supabaseUrl,
      hasAnon: !!supabaseKey,
      hasService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serverTime: data,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Supabase connection failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}