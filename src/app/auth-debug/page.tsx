'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/types/database';
import Link from 'next/link';
import { Database, Crown, Settings, Loader, CheckCircle, XCircle } from 'lucide-react';

export default function AuthDebugPage() {
  const { user, userProfile, loading, isAuthenticated } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateSubscription = async (newType: 'free' | 'pro') => {
    if (!user || !userProfile) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_type: newType,
          subscription_start: newType === 'pro' ? new Date().toISOString() : userProfile.subscription_start
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        alert('Failed to update subscription');
      } else {
        alert(`Updated to ${newType} successfully! Please refresh the page.`);
        window.location.reload();
      }
    } catch (err) {
      console.error('Update exception:', err);
      alert('Failed to update subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (isGood: boolean) => {
    return isGood ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading authentication state...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            🧪 Auth Debug & Pro Testing
          </h1>
          <p className="text-gray-600">
            Development testing page for authentication and Pro features
          </p>
        </div>

        {/* Auth Status Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🔍 Authentication Status
            {getStatusIcon(isAuthenticated)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {isAuthenticated ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">User Profile:</span>
                <span className={userProfile ? 'text-green-600' : 'text-red-600'}>
                  {userProfile ? '✅ Loaded' : '❌ Missing'}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Subscription:</span>
                <span className="text-blue-600 flex items-center">
                  {userProfile?.subscription_type === 'pro' && <Crown className="w-4 h-4 mr-1" />}
                  {userProfile?.subscription_type || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Auth Context Data */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">User Data (from Auth Context):</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify(
  {
    user: user ? {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    } : null,
    userProfile: userProfile,
    isAuthenticated: isAuthenticated,
    loading: loading
  }, 
  null, 
  2
)}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isAuthenticated && userProfile ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">🎯 Pro Feature Testing</h2>
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => updateSubscription('free')}
                disabled={isUpdating}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Test as Free User'}
              </button>
              
              <button
                onClick={() => updateSubscription('pro')}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Crown className="w-4 h-4 mr-2" />
                {isUpdating ? 'Updating...' : 'Test as Pro User'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Test Core Features:</h3>
                <Link href="/dashboard" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  🏠 Dashboard (check crown icon)
                </Link>
                <Link href="/tables/BKPF" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  📊 BKPF Table (check field limits)
                </Link>
                <Link href="/tables/MARA" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  🔗 MARA Relationships (check depth limits)
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Test Pro Features:</h3>
                <Link href="/pricing" className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  💳 Pricing Page (conversion prompts)
                </Link>
                <Link href="/profile" className="block p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  👤 Profile Page (subscription management)
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">🚫 Not Authenticated</h2>
            <p className="text-gray-600 mb-4">
              You need to be logged in to test Pro features.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Login
              </Link>
              <Link href="/auth/register" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Feature Testing Guide */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Testing Checklist</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Free User Experience:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Unlimited searches (no search limits)</li>
                <li>⚠️ Fields tab shows "Showing first 10 fields"</li>
                <li>⚠️ Relationships tab shows "1-level relationships"</li>
                <li>⚠️ Export button prompts for upgrade</li>
                <li>📢 Strategic upgrade prompts visible</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Pro User Experience:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Unlimited searches</li>
                <li>✅ All table fields displayed</li>
                <li>✅ Unlimited relationship depth</li>
                <li>✅ Premium export options</li>
                <li>👑 Crown icon in header</li>
                <li>🚫 No upgrade prompts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}