// src/app/api/test-database-simple/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Test with anon key first
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    console.log('Testing with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Anon key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
    console.log('Service key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
    
    // Simple test: Get SAP tables (they should be publicly readable)
    const { data: tables, error: tablesError } = await supabase
      .from('sap_tables')
      .select('table_name, description, module')
      .limit(3);
    
    if (tablesError) {
      console.error('Tables error:', tablesError);
      throw tablesError;
    }
    
    return NextResponse.json({
      status: 'Database test successful! 🎉',
      environmentCheck: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
      },
      tablesFound: tables?.length || 0,
      sampleTables: tables,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      },
      { status: 500 }
    );
  }
}