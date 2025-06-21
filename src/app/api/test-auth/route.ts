// src/app/api/test-auth/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test: Check if auth is working by getting current session
    const { data: { session }, error } = await supabase.auth.getSession()

    return NextResponse.json({
      status: 'Authentication system ready! 🔐',
      authConfig: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        authEnabled: true
      },
      currentSession: session ? 'User logged in' : 'No active session',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Authentication test failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}