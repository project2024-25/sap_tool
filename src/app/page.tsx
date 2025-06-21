'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Zap, Database, Sparkles } from 'lucide-react';

interface SearchResult {
  tableName: string;
  description: string;
  module: string;
  businessPurpose: string;
  relevanceScore: number;
}

interface SearchResponse {
  results: SearchResult[];
  aiExplanation: string;
  processingTime: number;
  success: boolean;
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
    'vendor payment tables',
    'material master data',
    'customer information',
    'purchase order tables'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SAP Table Finder</h1>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <a href="#search" className="text-gray-600 hover:text-blue-600 transition-colors">Search</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
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
            
            {/* Mobile menu button (optional for future) */}
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

      {/* Hero Section */}
      <section id="search" className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find SAP Tables{' '}
            <span className="text-blue-600">10x Faster</span>{' '}
            with AI
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stop wasting hours searching through SAP documentation. 
            Our AI-powered search understands your business needs and finds the exact tables you need instantly.
          </p>

          {/* Search Interface */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search SAP tables (e.g., 'vendor payment tables')"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                aria-label="Search SAP tables"
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
              <span>AI-Powered Search</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span>300+ SAP Tables</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <span>Instant Results</span>
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
                    <span className="text-sm text-gray-500">
                      {results.processingTime}ms • {results.results.length} tables found
                    </span>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">
                      <span className="font-semibold">AI Explanation:</span> {results.aiExplanation}
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
                        </div>
                        <span className="text-sm text-green-600 font-medium">
                          {table.relevanceScore}% match
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{table.description}</p>
                      <p className="text-sm text-gray-500">{table.businessPurpose}</p>
                      
                      {/* Call-to-action for registration */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Want to explore table relationships and get exports?</span>
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
                      Create a free account to save your search history and unlock table relationships
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

      {/* Value Proposition */}
      {!results && (
        <section id="features" className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why SAP Consultants Choose Our Tool
              </h2>
              <p className="text-xl text-gray-600">
                Save 15-20% of your project time with intelligent SAP table discovery
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Intelligence</h3>
                <p className="text-gray-600">
                  Natural language search understands your business context and finds relevant tables instantly.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Get results in seconds, not hours. Our optimized search delivers instant answers.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Database</h3>
                <p className="text-gray-600">
                  300+ SAP tables with business context, relationships, and real-world use cases.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pre-footer CTA */}
      {!results && (
        <section id="pricing" className="pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to accelerate your SAP projects?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join hundreds of SAP consultants who save hours every day with our AI-powered search
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Start Free Today
                </Link>
                <Link
                  href="/auth/login"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
              <p className="text-sm mt-4 opacity-75">
                No credit card required • Unlimited searches • 5-minute setup
              </p>
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
              <span className="text-gray-900 font-medium">SAP Table Finder</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>&copy; 2024 SAP Table Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}