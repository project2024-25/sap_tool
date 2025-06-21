'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Database, 
  Search, 
  History, 
  User, 
  Settings, 
  LogOut,
  Crown,
  Download,
  TrendingUp,
  Clock
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/auth/login');
          return;
        }

        setUser(user);

        // Get user stats and search history
        const { data: searchHistory } = await supabase
          .from('search_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('search_timestamp', { ascending: false })
          .limit(10);

        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('subscription_type, created_at')
          .eq('id', user.id)
          .single();

        setUserStats({
          totalSearches: searchHistory?.length || 0,
          recentSearches: searchHistory || [],
          accountCreated: user.created_at,
          subscriptionType: userProfile?.subscription_type || 'free'
        });

      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
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
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
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
              {userStats?.subscriptionType === 'pro' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.email}</span>
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

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">
            Welcome back! Continue your SAP table research with unlimited searches.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">{userStats?.totalSearches}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Account Type</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {userStats?.subscriptionType}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats ? formatDate(userStats.accountCreated) : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Interface */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search SAP tables..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="absolute right-2 top-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {userStats?.subscriptionType === 'free' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-yellow-800">Upgrade to Pro</h4>
                      <p className="text-sm text-yellow-700">Get unlimited exports and advanced features</p>
                    </div>
                    <Link
                      href="/pricing"
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                    >
                      Upgrade
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Search Results */}
            {searchResults && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Search Results</h4>
                {/* Add search results display here - use same component from landing page */}
                <p className="text-sm text-gray-600">
                  Search results will be displayed here (use existing search results component)
                </p>
              </div>
            )}
          </div>

          {/* Search History */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
              <History className="h-5 w-5 text-gray-400" />
            </div>

            {userStats?.recentSearches && userStats.recentSearches.length > 0 ? (
              <div className="space-y-3">
                {userStats.recentSearches.slice(0, 8).map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer border">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{search.search_query}</p>
                      <p className="text-sm text-gray-500">
                        {search.results_count} results • {formatTimeAgo(search.search_timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSearchQuery(search.search_query)}
                      className="ml-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
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

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Search className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">New Search</p>
                <p className="text-sm text-gray-500">Find SAP tables</p>
              </div>
            </Link>
            
            <Link
              href="/pricing"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <Crown className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Upgrade</p>
                <p className="text-sm text-gray-500">Get Pro features</p>
              </div>
            </Link>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <Download className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Export Data</p>
                <p className="text-sm text-gray-500">Download results</p>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <Settings className="h-6 w-6 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">Account settings</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}