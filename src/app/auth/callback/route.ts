// src/app/auth/callback/route.ts
// Fixed to use standard supabase-js client without auth-helpers

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    try {
      // Exchange the auth code for a session using standard supabase client
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Code exchange error:', error);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`
        );
      }

      if (data.user) {
        // Create or update user profile in our database
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            subscription_type: 'free',
            created_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't redirect to error - user is authenticated, just log the issue
        }

        // Redirect to dashboard for authenticated users
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      }
    } catch (err) {
      console.error('Unexpected callback error:', err);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent('Authentication failed')}`
      );
    }
  }

  // No code parameter - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
}