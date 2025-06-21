// src/types/database.ts
// Enhanced database types with authentication support

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export type SAPTable = {
  id: number
  table_name: string
  description: string
  module: string
  table_type: string
  business_purpose: string | null
  common_use_cases: string[] | null
  complexity_level: number
  search_frequency: number
  created_at: string
  updated_at: string
}

export type TableField = {
  id: number
  table_id: number
  field_name: string
  description: string | null
  data_type: string | null
  length: number | null
  is_key_field: boolean
  is_foreign_key: boolean
  field_order: number
}

// Enhanced UserProfile type (PRD-compliant)
export type UserProfile = {
  id: string
  email: string
  created_at: string
  subscription_type: 'free' | 'pro' | 'team' | 'enterprise'
  subscription_start: string | null
  subscription_end: string | null
  stripe_customer_id: string | null
  daily_export_count: number
  last_export_reset: string
  conversion_trigger_views: Record<string, any>
}

// Additional types for search logging (PRD: unlimited search tracking)
export type SearchLog = {
  id: number
  user_id: string | null
  search_query: string
  results_count: number
  clicked_table_id: number | null
  search_timestamp: string
  response_time_ms: number
  user_ip: string | null
  session_id: string
  conversion_opportunity: boolean
}

// Table relationships type
export type TableRelationship = {
  id: number
  parent_table_id: number
  child_table_id: number
  relationship_type: string
  join_condition: string | null
  description: string | null
  strength: number
  business_flow_order: number
}

// Table collections for Pro users
export type TableCollection = {
  id: string
  user_id: string
  name: string
  description: string | null
  table_ids: number[]
  is_shared: boolean
  workspace_id: string | null
  created_at: string
  updated_at: string
}

// Authentication helper functions
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Unexpected error getting user:', error)
    return null
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return null
  }
}

export async function createUserProfile(userId: string, email: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        subscription_type: 'free',
        daily_export_count: 0,
        last_export_reset: new Date().toISOString().split('T')[0],
        conversion_trigger_views: {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Unexpected error creating profile:', error)
    return null
  }
}

// PRD-compliant search logging (unlimited searches)
export async function logSearch(
  searchQuery: string,
  resultsCount: number,
  userId?: string,
  clickedTableId?: number,
  responseTimeMs: number = 0
) {
  try {
    // Generate session ID for tracking
    const sessionId = userId || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { error } = await supabase
      .from('search_logs')
      .insert({
        user_id: userId || null,
        search_query: searchQuery,
        results_count: resultsCount,
        clicked_table_id: clickedTableId || null,
        response_time_ms: responseTimeMs,
        session_id: sessionId,
        conversion_opportunity: false // Will implement detection later
      })
    
    if (error) {
      console.error('Error logging search:', error)
    }
  } catch (error) {
    console.error('Unexpected error logging search:', error)
  }
}