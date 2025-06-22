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
  Clock,
  ExternalLink,
  Download,
  User,
  Play,
  Loader
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
  memberSince: string;
  subscriptionType: string;
  userTimezone?: string;
  fullName?: string;
}

interface SearchResult {
  tableName: string;
  description: string;
  module: string;
  businessPurpose: string;
  relevanceScore: number;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  aiExplanation: string;
  processingTime: number;
}

export default function Dashboard() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  
  // State for search results
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const router = useRouter();

  // FIXED: Enhanced auth check that waits for auth context
  useEffect(() => {
    // Only redirect if auth is NOT loading and user is NOT authenticated
    if (!authLoading && !user) {
      console.log('No valid session found, redirecting to login');
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  // Get user stats with proper count updates
  const getUserStats = useCallback(async () => {
    if (!user) return;

    try {
      // Get FULL search history for accurate count
      const { data: searchHistory, error: searchError } = await supabase
        .from('search_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('search_timestamp', { ascending: false })
        .order('id', { ascending: false });

      if (searchError) {
        console.error('Error fetching search history:', searchError);
      }

      // Get recent searches (limit for display)
      const recentSearches = searchHistory?.slice(0, 10) || [];

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('created_at, subscription_start, subscription_type, timezone, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
      }

      // Determine member since date
      let memberSince = 'N/A';
      if (profileData?.subscription_start) {
        memberSince = profileData.subscription_start;
      } else if (profileData?.created_at) {
        memberSince = profileData.created_at;
      } else if (user.created_at) {
        memberSince = user.created_at;
      }

      const newStats = {
        totalSearches: searchHistory?.length || 0,
        recentSearches: recentSearches,
        memberSince: memberSince,
        subscriptionType: profileData?.subscription_type || userProfile?.subscription_type || 'free',
        userTimezone: profileData?.timezone || 'Asia/Kolkata',
        fullName: profileData?.full_name
      };

      setUserStats(newStats);

    } catch (error) {
      console.error('Error in getUserStats:', error);
    } finally {
      setLoading(false);
    }
  }, [user, userProfile?.subscription_type]);

  useEffect(() => {
    if (user && !authLoading) {
      getUserStats();
    }
  }, [user, authLoading, getUserStats]);

  // Enhanced session listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login');
        } else if (event === 'SIGNED_IN' && session) {
          getUserStats();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed successfully');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, getUserStats]);

  // Shared search function for both new searches and history clicks
  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setSearchLoading(true);
    setShowResults(false);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query,
          userId: user?.id 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const result: SearchResponse = await response.json();
      
      if (result.success) {
        // Show search results
        setSearchResults(result);
        setLastSearchQuery(query);
        setShowResults(true);
        
        // Update stats with optimistic update
        if (userStats) {
          setUserStats(prev => ({
            ...prev!,
            totalSearches: prev!.totalSearches + 1
          }));
        }
        
        // Refresh stats after delay
        setTimeout(async () => {
          await getUserStats();
        }, 2000);
        
      } else {
        alert('Search failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed: ' + error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle new search from input
  const handleSearch = async () => {
    await performSearch(searchQuery);
    setSearchQuery(''); // Clear input after search
  };

  // Handle clicking on recent search
  const handleRecentSearchClick = async (query: string) => {
    setSearchQuery(query); // Set the query in input for user to see
    await performSearch(query); // Perform the search
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Format date without time complexity
  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString === 'N/A') {
        return 'N/A';
      }
      
      let date: Date;
      if (dateString.length === 10 && !dateString.includes('T')) {
        date = new Date(dateString + 'T00:00:00.000Z');
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      }).format(date);
    } catch (error) {
      return 'N/A';
    }
  };

  // Handle viewing table details
  const handleViewTable = (tableName: string) => {
    router.push(`/tables/${tableName}`);
  };

  // FIXED: Show loading state while auth context is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // FIXED: Only show "redirecting" if we're definitely not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
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
              {userProfile?.subscription_type === 'pro' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {userStats?.fullName || user.email}
              </span>
              <Link
                href="/profile"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
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
                <p className="text-xs text-gray-400 mt-1">Unlimited searches available</p>
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
          
          {/* Member Since */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats?.memberSince ? formatDate(userStats.memberSince) : 'Loading...'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {userStats?.memberSince?.includes('T') ? 'Account creation' : 'Subscription start'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search SAP Tables</h3>
            
            <div className="space-y-6">
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

              {/* Search Results Section */}
              {showResults && searchResults && searchResults.results && searchResults.results.length > 0 && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Search Results for "{lastSearchQuery}"
                    </h4>
                    <div className="text-sm text-gray-500">
                      {searchResults.results.length} results in {searchResults.processingTime}ms
                    </div>
                  </div>
                  
                  {/* AI Explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>AI Insight:</strong> {searchResults.aiExplanation}
                    </p>
                  </div>

                  {/* Results List */}
                  <div className="space-y-3">
                    {searchResults.results.map((result, index) => (
                      <div 
                        key={`${result.tableName}-${index}`}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => handleViewTable(result.tableName)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="text-lg font-semibold text-gray-900">
                                {result.tableName}
                              </h5>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {result.module}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {result.relevanceScore}% match
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{result.description}</p>
                            <p className="text-sm text-gray-500">{result.businessPurpose}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTable(result.tableName);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View Details"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            {userProfile?.subscription_type === 'pro' && (
                              <button 
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="Export Table"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results message */}
              {showResults && searchResults && (!searchResults.results || searchResults.results.length === 0) && (
                <div className="border-t pt-6">
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No tables found for "{lastSearchQuery}"</p>
                    <p className="text-sm text-gray-400">Try different keywords or check spelling</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Searches and Upgrade Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Searches - ENHANCED with clickable functionality */}
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
                {userStats.recentSearches.slice(0, 5).map((search, index) => (
                  <div 
                    key={search.id} 
                    className="group flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg cursor-pointer border hover:border-blue-200 transition-all"
                    onClick={() => handleRecentSearchClick(search.search_query)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-1 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
                          <Play className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate">{search.search_query}</p>
                          <p className="text-sm text-gray-500">
                            {search.results_count} results
                            {index === 0 && (
                              <span className="ml-2 text-xs text-blue-600 font-medium">Latest</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-blue-600 font-medium">Click to search</span>
                    </div>
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

          {/* Upgrade Prompt */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userProfile?.subscription_type === 'pro' ? 'Pro Features' : 'Upgrade to Pro'}
            </h3>
            
            {userProfile?.subscription_type === 'free' ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Unlock Premium Features</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Unlimited table exports (Excel, PDF)</li>
                    <li>• Advanced relationship mapping</li>
                    <li>• AI business process insights</li>
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
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Pro Features Active</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✅ Unlimited table exports</li>
                    <li>✅ Advanced relationship mapping</li>
                    <li>✅ AI business process insights</li>
                    <li>✅ Priority support</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}