// src/lib/supabase.ts
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

export type UserProfile = {
  id: string
  email: string
  created_at: string
  subscription_type: 'free' | 'pro' | 'team' | 'enterprise'
  subscription_start: string | null
  subscription_end: string | null
}