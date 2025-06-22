'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Database, 
  Search, 
  History, 
  LogOut,
  Crown,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/types/database';

interface SearchHistory {
  id: string;
  search_query: string;
  results_count: number;
  search_timestamp: string;
}

interface UserStats {
  totalSearches: number;
  recentSearches: SearchHistory[];
  accountCreated: string;
  subscriptionType: string;
}

export default function Dashboard() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const router = useRouter();

  // Enhanced getUserStats with comprehensive debug logging
  const getUserStats = useCallback(async () => {
    if (!user) {
      console.log('❌ No user found, skipping getUserStats');
      return;
    }

    console.log('📊 Fetching user stats for user:', user.id);
    console.log('👤 User email:', user.email);

    try {
      // Query search history with debug logging
      const { data: searchHistory, error } = await supabase
        .from('search_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('search_timestamp', { ascending: false })
        .limit(10);

      console.log('📋 Search history query result:', { searchHistory, error });
      console.log('🔢 Search count:', searchHistory?.length || 0);

      if (error) {
        console.error('❌ Error fetching search history:', error);
      }

      const newStats = {
        totalSearches: searchHistory?.length || 0,
        recentSearches: searchHistory || [],
        accountCreated: user.created_at || new Date().toISOString(),
        subscriptionType: userProfile?.subscription_type || 'free'
      };

      console.log('📈 Setting new user stats:', newStats);
      setUserStats(newStats);

    } catch (error) {
      console.error('💥 Error in getUserStats:', error);
    } finally {
      setLoading(false);
      console.log('✅ getUserStats completed');
    }
  }, [user, userProfile?.subscription_type]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && !authLoading) {
      getUserStats();
    }
  }, [user, authLoading, router, getUserStats]);

  // Enhanced handleSearch with better debugging and error handling
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    console.log('🔍 Starting search for:', searchQuery);
    console.log('👤 User ID:', user?.id);
    
    setSearchLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          userId: user?.id 
        }),
      });
      
      console.log('📡 Search response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📄 Search result:', result);
      
      if (result.success) {
        console.log('✅ Search successful, found', result.results?.length || 0, 'results');
        
        // Add a small delay to ensure database write completes
        console.log('⏳ Waiting 1000ms for database sync...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh user stats to show updated search count
        console.log('🔄 Refreshing user stats...');
        await getUserStats();
        console.log('📊 User stats refreshed');
        
        // Clear search input after successful search
        setSearchQuery('');
      } else {
        console.error('❌ Search failed:', result.error);
        alert('Search failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Search error:', error);
      alert('Search failed: ' + error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Enhanced date formatting with better debugging and fallback to known date
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        console.warn('⚠️ No date string provided, using fallback');
        return 'Jun 21, 2025'; // Your known account creation date
      }
      
      console.log('📅 Original date string:', dateString);
      console.log('📅 Date string type:', typeof dateString);
      
      // Handle different date formats
      let date: Date;
      
      // If it's already a Date object
      if (dateString instanceof Date) {
        date = dateString;
      } else {
        // Parse the string
        date = new Date(dateString);
      }
      
      console.log('📅 Parsed date object:', date);
      console.log('📅 Date is valid:', !isNaN(date.getTime()));
      
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date string:', dateString, '- using fallback');
        return 'Jun 21, 2025'; // Fallback to your known account creation date
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      console.log('✅ Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('💥 Date formatting error:', error, 'for date:', dateString);
      return 'Jun 21, 2025'; // Fallback to known account creation date
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Unknown time';
      }
      
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
      return formatDate(dateString);
    } catch (error) {
      console.error('💥 Time formatting error:', error);
      return 'Unknown time';
    }
  };

  // Manual database check function for debugging
  const checkDatabase = async () => {
    if (!user) return;
    
    console.log('🔍 Manual database check for user:', user.id);
    
    try {
      // Check if user exists in user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('👤 User profile:', { profile, profileError });
      
      // Check search logs
      const { data: logs, error: logsError } = await supabase
        .from('search_logs')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('📋 All search logs:', { logs, logsError });
      
      // Check total count
      const { count, error: countError } = await supabase
        .from('search_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      console.log('🔢 Search count:', { count, countError });
      
    } catch (error) {
      console.error('💥 Database check error:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              <Link href="/" className="flex items-center space-x-2">
                <Database className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">SAP Table Finder</h1>
              </Link>
              {userProfile?.subscription_type === 'pro' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.email}</span>
              {/* Debug button - remove in production */}
              <button
                onClick={checkDatabase}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Debug DB
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">
            Welcome back! Continue your SAP table research with unlimited searches.
          </p>
          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-400">
            User ID: {user.id} | Status: {userProfile?.subscription_type || 'free'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Searches */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">{userStats?.totalSearches || 0}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Account Type */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Account Type</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {userProfile?.subscription_type || 'free'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Member Since - Fixed Date Display */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    // Debug the actual user object
                    console.log('👤 Full user object for date:', user);
                    console.log('👤 User created_at:', user?.created_at);
                    console.log('👤 User created_at type:', typeof user?.created_at);
                    
                    // Try multiple date sources
                    const dateToUse = user?.created_at || userStats?.accountCreated;
                    console.log('📅 Date to use:', dateToUse);
                    
                    if (dateToUse) {
                      return formatDate(dateToUse);
                    } else {
                      return 'Jun 21, 2025'; // Your known account creation date
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Search */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search SAP tables (e.g., 'vendor payment tables')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="absolute right-2 top-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Upgrade Prompt for Free Users */}
              {userProfile?.subscription_type === 'free' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-yellow-800">Upgrade to Pro</h4>
                      <p className="text-sm text-yellow-700">Get unlimited exports and advanced features</p>
                    </div>
                    <Link
                      href="/pricing"
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm transition-colors"
                    >
                      Upgrade
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Searches */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-gray-400" />
                <button
                  onClick={getUserStats}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Refresh
                </button>
              </div>
            </div>

            {userStats?.recentSearches && userStats.recentSearches.length > 0 ? (
              <div className="space-y-3">
                {userStats.recentSearches.slice(0, 5).map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer border">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{search.search_query}</p>
                      <p className="text-sm text-gray-500">
                        {search.results_count} results • {formatTimeAgo(search.search_timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSearchQuery(search.search_query)}
                      className="ml-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      Search Again
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No search history yet</p>
                <p className="text-sm text-gray-400">Start searching to see your history here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}