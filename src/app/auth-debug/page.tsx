'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/types/database';

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Session Error:', sessionError);

      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User:', user);
      console.log('User Error:', userError);

      setAuthState({
        session,
        user,
        sessionError,
        userError
      });

      // Get profile if user exists
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('Profile:', profileData);
        console.log('Profile Error:', profileError);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const updateToPro = async () => {
    if (!authState?.user) return;
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ subscription_type: 'pro' })
      .eq('id', authState.user.id);
    
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Updated to Pro! Refresh to see changes.');
      checkAuth();
    }
  };

  const updateToFree = async () => {
    if (!authState?.user) return;
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ subscription_type: 'free' })
      .eq('id', authState.user.id);
    
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Updated to Free! Refresh to see changes.');
      checkAuth();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Auth Debug</h1>
      
      <div className="space-y-6">
        {/* Auth State */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-bold mb-2">Authentication State</h2>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>

        {/* Profile */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-bold mb-2">User Profile</h2>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        {authState?.user && (
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-bold mb-4">Quick Actions</h2>
            <div className="space-x-3">
              <button 
                onClick={updateToFree}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Set to Free
              </button>
              <button 
                onClick={updateToPro}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Set to Pro
              </button>
              <button 
                onClick={checkAuth}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}

        {/* Test Links */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-bold mb-4">Test Links</h2>
          <div className="space-y-2">
            <a href="/dashboard" className="block text-blue-600 hover:underline">Dashboard</a>
            <a href="/tables/BKPF" className="block text-blue-600 hover:underline">BKPF Table</a>
            <a href="/tables/MARA" className="block text-blue-600 hover:underline">MARA Table</a>
            <a href="/pricing" className="block text-blue-600 hover:underline">Pricing Page</a>
          </div>
        </div>
      </div>
    </div>
  );
}