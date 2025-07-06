'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Zap, Database, Sparkles, Building2, AlertTriangle, Clock, ExternalLink } from 'lucide-react';

interface SearchResult {
  tableName: string;
  description: string;
  module: string;
  businessPurpose: string;
  relevanceScore: number;
  migrationStatus?: string;
  migrationMessage?: string;
  urgencyFlag?: string;
}

interface SearchResponse {
  results: SearchResult[];
  aiExplanation: string;
  processingTime: number;
  success: boolean;
  searchContext?: string;
  migrationAlert?: string;
  error?: string;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults({ 
        success: false, 
        error: 'Search failed. Please try again.',
        results: [],
        aiExplanation: '',
        processingTime: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    'SAP ECC migration tables',
    'vendor payment business process',
    'ABAP custom development',
    'material master data'
  ];

  const getCurrentYear = () => new Date().getFullYear();
  const getYearsUntil2027 = () => 2027 - getCurrentYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ERP Tables</h1>
                <p className="text-xs text-gray-500">AI-powered multi-ERP reference</p>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <a href="#search" className="text-gray-600 hover:text-blue-600 transition-colors">Search</a>
              <a href="#erp-systems" className="text-gray-600 hover:text-blue-600 transition-colors">ERP Systems</a>
              <a href="#migration" className="text-gray-600 hover:text-blue-600 transition-colors">Migration</a>
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link 
                href="/auth/login"
                className="text-gray-600 hover:text-blue-600 mr-3"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Migration Alert Banner */}
      <div className="bg-red-50 border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center space-x-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              ⏰ SAP ECC End of Life: {getYearsUntil2027()} years remaining until mandatory S/4HANA migration (January 2027)
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="search" className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find ERP Tables{' '}
            <span className="text-blue-600">10x Faster</span>{' '}
            with AI
          </h1>
          
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            AI-powered table reference for SAP, Oracle, and Microsoft Dynamics. 
            Get migration-aware search results with business context and 2027 deadline urgency.
          </p>

          {/* Migration Urgency Message */}
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-yellow-800">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                SAP ECC Migration Urgent: Get migration-ready table guidance with AI-powered 2027 deadline awareness
              </span>
            </div>
          </div>

          {/* Search Interface */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tables (e.g., 'SAP ECC migration tables')"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                aria-label="Search ERP tables"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                aria-label="Search button"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>

            {/* Example Queries */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-500">Try:</span>
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  aria-label={`Try searching for ${example}`}
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span>Migration-Aware AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span>300+ SAP Tables</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <span>2027 Deadline Alerts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {results && (
        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {results.success ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{results.processingTime}ms</span>
                      <span>{results.results.length} tables found</span>
                      {results.searchContext && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {results.searchContext} context
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Migration Alert */}
                  {results.migrationAlert && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <p className="text-red-800 font-medium">
                        {results.migrationAlert}
                      </p>
                    </div>
                  )}
                  
                  {/* AI Explanation */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">
                      <span className="font-semibold">AI Insight:</span> {results.aiExplanation}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {results.results.map((table, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-gray-900">{table.tableName}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {table.module}
                          </span>
                          {table.migrationStatus && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              table.migrationStatus === 'DEPRECATED' ? 'bg-red-100 text-red-800' :
                              table.migrationStatus === 'ECC_ONLY' ? 'bg-yellow-100 text-yellow-800' :
                              table.migrationStatus === 'S4HANA_ONLY' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {table.migrationStatus}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-green-600 font-medium">
                          {table.relevanceScore}% match
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{table.description}</p>
                      <p className="text-sm text-gray-500 mb-3">{table.businessPurpose}</p>
                      
                      {/* Migration Message */}
                      {table.migrationMessage && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                          <p className="text-yellow-800 text-sm font-medium">
                            📋 {table.migrationMessage}
                          </p>
                        </div>
                      )}

                      {/* Urgency Flag */}
                      {table.urgencyFlag && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                          <p className="text-red-800 text-sm font-medium">
                            {table.urgencyFlag}
                          </p>
                        </div>
                      )}
                      
                      {/* Call-to-action for registration */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Want to explore relationships and get exports?</span>
                          <Link 
                            href="/auth/register"
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                          >
                            Sign Up Free
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Post-search conversion prompt */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      🎉 Found what you're looking for?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create a free account to save your research and unlock migration planning tools
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/auth/register"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Create Free Account
                      </Link>
                      <Link
                        href="/auth/login"
                        className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                      >
                        Already have an account?
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                  <p className="text-red-600 font-medium">Error: {results.error}</p>
                  <p className="text-gray-500 mt-2">Please try again or contact support if the issue persists.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ERP Systems Section */}
      {!results && (
        <section id="erp-systems" className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete ERP Table Reference Platform
              </h2>
              <p className="text-xl text-gray-600">
                AI-powered table documentation for all major ERP systems
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* SAP Tables - Available */}
              <Link href="/dashboard" className="group">
                <div className="p-6 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <Database className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">SAP Tables</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Available Now</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    300+ tables with migration guides, business context, and 2027 deadline awareness
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>ECC to S/4HANA migration tracking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span>AI-powered migration-aware search</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span>2027 deadline urgency alerts</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700">
                    <span className="font-medium">Explore SAP Tables</span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>

              {/* Oracle Tables - Coming Soon */}
              <Link href="/oracle-tables" className="group">
                <div className="p-6 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <Database className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Oracle Tables</h3>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Q2 2025</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Complete Oracle ERP table reference with AI search and cloud migration guides
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-orange-500" />
                      <span>Oracle ERP table catalog</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      <span>Natural language search</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-orange-500" />
                      <span>Cloud migration assistance</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-orange-600 group-hover:text-orange-700">
                    <span className="font-medium">Join Waitlist</span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>

              {/* Dynamics Tables - Coming Soon */}
              <Link href="/dynamics-tables" className="group">
                <div className="p-6 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <Building2 className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Dynamics Tables</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Q3 2025</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Microsoft Dynamics 365 table reference with Power Platform integration guides
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <span>Dynamics 365 table catalog</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-green-500" />
                      <span>Power Platform integration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-green-500" />
                      <span>Dataverse documentation</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-green-600 group-hover:text-green-700">
                    <span className="font-medium">Join Waitlist</span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Migration Urgency Section */}
      {!results && (
        <section id="migration" className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-2xl p-8 border border-red-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🚨 SAP ECC End of Life Approaching
                </h2>
                <p className="text-xl text-gray-700">
                  Only <strong>{getYearsUntil2027()} years</strong> until mandatory S/4HANA migration
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Migration Urgency</h3>
                  <p className="text-gray-600 text-sm">
                    Get AI-powered migration guidance with table-level impact analysis and 2027 deadline awareness
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Table Impact Analysis</h3>
                  <p className="text-gray-600 text-sm">
                    Understand which tables are deprecated, ECC-only, or require changes in S/4HANA
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Migration Assistant</h3>
                  <p className="text-gray-600 text-sm">
                    Get context-aware recommendations for your specific migration scenarios and business needs
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Start Migration Planning Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Database className="h-6 w-6 text-blue-600" />
              <span className="text-gray-900 font-medium">ERP Tables</span>
              <span className="text-gray-500 text-sm">AI-powered multi-ERP reference</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="/oracle-tables" className="hover:text-blue-600 transition-colors">Oracle Tables</Link>
              <Link href="/dynamics-tables" className="hover:text-blue-600 transition-colors">Dynamics Tables</Link>
              <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>&copy; {getCurrentYear()} ERP Tables. All rights reserved. • SAP ECC End of Life: January 2027</p>
          </div>
        </div>
      </footer>
    </div>
  );
}