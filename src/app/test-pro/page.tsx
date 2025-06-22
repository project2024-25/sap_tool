'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/types/database';
import Link from 'next/link';
import { Database, Crown, Settings } from 'lucide-react';

export default function TestProPage() {
  const { user, userProfile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const updateSubscription = async (type: 'free' | 'pro') => {
    if (!user) {
      setMessage('❌ Please login first');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_type: type })
        .eq('id', user.id);

      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage(`✅ Updated to ${type.toUpperCase()}! Refreshing...`);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Database className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Pro Testing</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Settings className="h-6 w-6 text-gray-600" />
              <span className="text-sm bg-yellow-100 px-2 py-1 rounded">DEV MODE</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">🎯 Current Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">User</p>
              <p className="font-semibold">{user?.email || 'Not logged in'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Subscription</p>
              <p className="font-semibold flex items-center">
                {userProfile?.subscription_type || 'free'}
                {userProfile?.subscription_type === 'pro' && (
                  <Crown className="h-4 w-4 ml-1 text-yellow-500" />
                )}
              </p>
            </div>
          </div>

          {/* Switch Subscription */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">Switch subscription for testing:</p>
            <div className="flex gap-3">
              <button
                onClick={() => updateSubscription('free')}
                disabled={updating}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Test as Free'}
              </button>
              <button
                onClick={() => updateSubscription('pro')}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Test as Pro'}
              </button>
            </div>
            {message && (
              <div className={`mt-3 p-3 rounded text-sm ${
                message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Testing Scenarios */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-bold mb-6">🧪 Testing Scenarios</h3>
          
          <div className="space-y-6">
            {/* Test 1: Table Details */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">📊 Test 1: Table Field Limits</h4>
              <p className="text-gray-600 text-sm mb-3">
                Compare how many fields are shown for Free vs Pro users
              </p>
              <div className="space-y-2">
                <Link 
                  href="/tables/BKPF" 
                  className="inline-block bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-sm transition-colors"
                >
                  View BKPF Table → Fields Tab
                </Link>
                <p className="text-xs text-gray-500">
                  Free: "Showing first 10 fields" | Pro: All fields shown
                </p>
              </div>
            </div>

            {/* Test 2: Relationships */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🔗 Test 2: Relationship Depth</h4>
              <p className="text-gray-600 text-sm mb-3">
                Check relationship limitations and upgrade prompts
              </p>
              <div className="space-y-2">
                <Link 
                  href="/tables/MARA" 
                  className="inline-block bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-sm transition-colors"
                >
                  View MARA → Relationships Tab
                </Link>
                <p className="text-xs text-gray-500">
                  Free: "1-level relationships" + upgrade prompt | Pro: No limitations
                </p>
              </div>
            </div>

            {/* Test 3: Export */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">📥 Test 3: Export Features</h4>
              <p className="text-gray-600 text-sm mb-3">
                Test export button behavior for different user types
              </p>
              <div className="space-y-2">
                <Link 
                  href="/tables/BKPF" 
                  className="inline-block bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-sm transition-colors"
                >
                  Go to Any Table → Click Export
                </Link>
                <p className="text-xs text-gray-500">
                  Free: Upgrade prompt | Pro: Export options available
                </p>
              </div>
            </div>

            {/* Test 4: UI Differences */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">🎨 Test 4: UI Differences</h4>
              <p className="text-gray-600 text-sm mb-3">
                Look for visual differences between Free and Pro
              </p>
              <div className="space-y-2">
                <Link 
                  href="/dashboard" 
                  className="inline-block bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-sm transition-colors"
                >
                  Check Dashboard Header
                </Link>
                <p className="text-xs text-gray-500">
                  Free: No crown icon | Pro: Crown icon in header
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-bold mb-4">🔗 Quick Test Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/dashboard" className="p-3 border rounded hover:bg-gray-50 text-center">
              Dashboard
            </Link>
            <Link href="/pricing" className="p-3 border rounded hover:bg-gray-50 text-center">
              Pricing Page
            </Link>
            <Link href="/tables/BKPF" className="p-3 border rounded hover:bg-gray-50 text-center">
              BKPF Table
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-3">📋 Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
            <li>Make sure you're logged in (go to /auth/login if needed)</li>
            <li>Click "Test as Free" and test all scenarios above</li>
            <li>Click "Test as Pro" and test the same scenarios</li>
            <li>Compare the differences in features and UI</li>
            <li>Look for upgrade prompts, limitations, and pro features</li>
          </ol>
        </div>
      </div>
    </div>
  );
}