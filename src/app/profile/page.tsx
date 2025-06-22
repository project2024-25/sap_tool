'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Database, 
  User, 
  Clock, 
  Save,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/types/database';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  timezone?: string;
  subscription_type: string;
  created_at: string;
}

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
  { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
  { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
  { value: 'Europe/London', label: 'British Time (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET/CEST)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST/AEDT)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' }
];

export default function ProfilePage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && !authLoading) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      // Get user profile data
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
      } else if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setTimezone(profileData.timezone || 'Asia/Kolkata');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName.trim() || null,
          timezone: timezone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        await loadProfile(); // Reload profile data
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Database className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SAP Table Finder</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h2>
          <p className="text-gray-600">
            Manage your account preferences and display settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
              
              <div className="space-y-6">
                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline h-4 w-4 mr-1" />
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Used for displaying search timestamps in your local time
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    {success && (
                      <p className="text-green-600 text-sm">Profile saved successfully!</p>
                    )}
                  </div>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Type</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {profile?.subscription_type || 'free'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Prompt for Free Users */}
            {profile?.subscription_type === 'free' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade to Pro</h3>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Premium Features</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Unlimited table exports</li>
                    <li>• Advanced relationship mapping</li>
                    <li>• Priority support</li>
                  </ul>
                  <Link
                    href="/pricing"
                    className="mt-3 inline-block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm transition-colors"
                  >
                    Upgrade Now
                  </Link>
                </div>
              </div>
            )}

            {/* Current Timezone Display */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Time</h3>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {new Date().toLocaleTimeString('en-US', {
                    timeZone: timezone,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {TIMEZONE_OPTIONS.find(tz => tz.value === timezone)?.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}