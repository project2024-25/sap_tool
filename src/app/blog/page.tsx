// src/app/blog/page.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Calendar, User, Clock, Search, AlertTriangle, BookOpen } from 'lucide-react';

// Blog article interface
interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishDate: string;
  author: string;
  readTime: number;
  featured: boolean;
}

// Sample blog articles data (moved outside component to prevent re-creation)
const blogArticles: BlogArticle[] = [
  {
    slug: 'sap-ecc-vs-s4hana-complete-migration-guide',
    title: 'SAP ECC vs S/4HANA: Complete Table Migration Guide for 2027 Deadline',
    excerpt: 'Everything SAP consultants need to know about table changes, deprecated structures, and migration strategies before the 2027 deadline.',
    category: 'Migration',
    publishDate: '2025-01-15',
    author: 'SAP Migration Expert',
    readTime: 12,
    featured: true
  },
  {
    slug: 'sap-ecc-end-of-life-2027-consultant-guide',
    title: 'SAP ECC End of Life 2027: What Every Consultant Must Know',
    excerpt: 'A comprehensive guide to the SAP ECC end-of-life deadline, business implications, and strategic recommendations for consultants.',
    category: 'Strategy',
    publishDate: '2025-01-10',
    author: 'SAP Strategy Consultant',
    readTime: 15,
    featured: true
  },
  {
    slug: 'acdoca-universal-journal-explained',
    title: 'ACDOCA: SAP Universal Journal Complete Guide',
    excerpt: 'Deep dive into ACDOCA table structure, what it replaces, and how it impacts your S/4HANA migration strategy.',
    category: 'Technical',
    publishDate: '2025-01-05',
    author: 'SAP Technical Expert',
    readTime: 10,
    featured: false
  }
];

export default function BlogIndexPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<BlogArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(blogArticles.map(article => article.category)))];

  // Initialize articles on component mount
  useEffect(() => {
    setArticles(blogArticles);
    setFilteredArticles(blogArticles);
    setIsLoading(false);
  }, []); // Empty dependency array - runs once on mount

  // Filter articles when category or search changes
  useEffect(() => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query)
      );
    }

    setFilteredArticles(filtered);
  }, [articles, selectedCategory, searchQuery]); // Dependencies that trigger filtering

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const getCurrentYear = () => new Date().getFullYear();
  const getYearsUntil2027 = () => 2027 - getCurrentYear();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <span className="text-xl font-bold text-gray-900">ERP Tables</span>
                <p className="text-xs text-gray-500">Migration Authority Blog</p>
              </div>
            </Link>
            <Link 
              href="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Migration Urgency Banner */}
      <div className="bg-red-50 border-b border-red-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              ⏰ SAP ECC End of Life: {getYearsUntil2027()} years remaining until mandatory S/4HANA migration
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            SAP Migration Authority Blog
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Expert insights, migration guides, and deadline urgency content for SAP consultants 
            navigating the 2027 ECC end-of-life transition.
          </p>
          
          {/* Newsletter Signup Preview */}
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto border shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">📧 SAP Migration Weekly</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get weekly migration tips, deadline reminders, and table updates.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                disabled
              />
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <article key={article.slug} className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Category and Featured Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        article.category === 'Migration' ? 'bg-red-100 text-red-700' :
                        article.category === 'Strategy' ? 'bg-yellow-100 text-yellow-700' :
                        article.category === 'Technical' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {article.category}
                      </span>
                      {article.featured && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                      <Link 
                        href={`/blog/${article.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center text-xs text-gray-500 gap-4 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.publishDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} min
                      </span>
                    </div>

                    {/* Read More Link */}
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      Read Article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Articles Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No articles found matching "${searchQuery}"`
                  : `No articles found in ${selectedCategory} category`
                }
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Master SAP Table Migrations?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Use our AI-powered tool to understand table relationships and prepare for the 2027 deadline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Database className="h-5 w-5 mr-2" />
              Explore SAP Tables
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Database className="h-6 w-6 text-blue-600" />
              <span className="text-gray-900 font-medium">ERP Tables Blog</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link href="/auth/register" className="hover:text-blue-600 transition-colors">Sign Up</Link>
              <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>&copy; {getCurrentYear()} ERP Tables. Migration authority content for SAP consultants.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}