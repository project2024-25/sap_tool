// src/app/api/email-capture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/types/database';

interface EmailCaptureRequest {
  email: string;
  firstName: string;
  company: string;
  role: 'consultant' | 'developer' | 'analyst' | 'manager' | 'other';
  companySize: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  timeline: '3-months' | '6-months' | '12-months' | 'evaluating';
  erpSystem: 'oracle' | 'dynamics';
  source: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailCaptureRequest = await request.json();
    
    // Validate required fields
    if (!body.email || !body.firstName || !body.erpSystem) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert into email_captures table
    const { data, error } = await supabase
      .from('email_captures')
      .insert({
        email: body.email.toLowerCase().trim(),
        first_name: body.firstName.trim(),
        company: body.company.trim() || null,
        role: body.role,
        company_size: body.companySize,
        timeline: body.timeline,
        erp_system: body.erpSystem,
        source: body.source,
        interest_level: 'high', // Default value
        notes: null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Email already registered. We\'ll notify you when available!',
          data: null
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to save email. Please try again.' },
        { status: 500 }
      );
    }

    console.log('✅ Email capture successful:', {
      email: body.email,
      erpSystem: body.erpSystem,
      id: data.id
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! We\'ll notify you when available.',
      data: data
    });

  } catch (error) {
    console.error('Email capture API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}