// src/lib/auth-context.tsx
// Updated to work with your current database schema

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/types/database'

interface AuthError {
  message: string;
  status?: number;
}

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  subscription_type: 'free' | 'pro' | 'team' | 'enterprise';
  subscription_start?: string | null;
  subscription_end?: string | null;
  stripe_customer_id?: string | null;
  daily_export_count?: number;
  last_export_reset?: string;
  conversion_trigger_views?: Record<string, unknown>;
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to get user profile
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.log('User profile not found, will create one:', error.message)
        return null
      }
      
      return data
    } catch (error) {
      console.log('Error fetching user profile:', error)
      return null
    }
  }

  // Helper function to create user profile with explicit ID
  const createUserProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
    try {
      // First, delete any existing profile with different ID but same email
      await supabase
        .from('user_profiles')
        .delete()
        .eq('email', email)
        .neq('id', userId)

      // Create new profile with the correct user ID
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId, // Explicitly set the ID to match auth.users.id
          email: email,
          subscription_type: 'free',
          daily_export_count: 0,
          last_export_reset: new Date().toISOString().split('T')[0],
          conversion_trigger_views: {}
        })
        .select()
        .single()

      if (error) {
        console.log('Could not create user profile:', error.message)
        // Return a default profile if creation fails
        return {
          id: userId,
          email: email,
          created_at: new Date().toISOString(),
          subscription_type: 'free',
          daily_export_count: 0,
          last_export_reset: new Date().toISOString().split('T')[0],
          conversion_trigger_views: {}
        }
      }
      
      return data
    } catch (error) {
      console.log('Error creating user profile:', error)
      // Return a default profile
      return {
        id: userId,
        email: email,
        created_at: new Date().toISOString(),
        subscription_type: 'free',
        daily_export_count: 0,
        last_export_reset: new Date().toISOString().split('T')[0],
        conversion_trigger_views: {}
      }
    }
  }

  useEffect(() => {
    // Get initial auth state
    const getInitialAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          let profile = await fetchUserProfile(user.id)
          if (!profile && user.email) {
            // Create profile with the correct user ID
            profile = await createUserProfile(user.id, user.email)
          }
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Error getting initial auth:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          let profile = await fetchUserProfile(session.user.id)
          if (!profile && session.user.email) {
            profile = await createUserProfile(session.user.id, session.user.email)
          }
          setUserProfile(profile)
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      return { error: error ? { message: error.message } : null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: { message: 'Sign up failed' } }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { error: error ? { message: error.message } : null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: { message: 'Sign in failed' } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hooks
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

export function useUser() {
  const { user } = useAuth()
  return user
}

export function useUserProfile() {
  const { userProfile } = useAuth()
  return userProfile
}