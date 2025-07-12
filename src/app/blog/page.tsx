// src/app/blog/page.tsx - Updated to use enhanced blog data system
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Calendar, User, Clock, Search, AlertTriangle, BookOpen } from 'lucide-react';
import { getAllPosts, getFeaturedPosts, getCategories, searchPosts, type BlogPost } from '@/lib/blog/blog-data';

export default function BlogIndexPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on component mount
  useEffect(() => {
    try {
      const posts = getAllPosts();
      const featured = getFeaturedPosts();
      const cats = ['All', ...getCategories()];
      
      setAllPosts(posts);
      setFilteredPosts(posts);
      setFeaturedPosts(featured);
      setCategories(cats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setIsLoading(false);
    }
  }, []);

  // Filter posts when category or search changes
  useEffect(() => {
    let filtered = allPosts;

    // Filter by search query first
    if (searchQuery.trim()) {
      filtered = searchPosts(searchQuery);
    }

    // Then filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [allPosts, selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const getCurrentYear = () => new Date().getFullYear();
  const getYearsUntil2027 = () => Math.max(0, 2027 - getCurrentYear());

  // Convert BlogPost to display format
  const formatPostForDisplay = (post: BlogPost) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    publishDate: post.publishedAt,
    author: post.author,
    readTime: parseInt(post.readTime.replace(' min', '')),
    featured: post.featured || false
  });

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
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Search Tables
              </Link>
              <Link 
                href="/pricing" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
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
          
          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{allPosts.length}</div>
              <div className="text-sm text-gray-600">Expert Articles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">2027</div>
              <div className="text-sm text-gray-600">ECC End of Life</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-sm text-gray-600">Tables Covered</div>
            </div>
          </div>
          
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
              />
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      {featuredPosts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">🔥 Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post) => {
                const displayPost = formatPostForDisplay(post);
                return (
                  <article key={post.slug} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        post.category === 'Migration' ? 'bg-red-100 text-red-700' :
                        post.category === 'Career' ? 'bg-yellow-100 text-yellow-700' :
                        post.category === 'Technical' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 gap-4 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      Read Article →
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">All Articles</h2>
          
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
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
                const displayPost = formatPostForDisplay(post);
                return (
                  <article key={post.slug} className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      {/* Category and Featured Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          post.category === 'Migration' ? 'bg-red-100 text-red-700' :
                          post.category === 'Career' ? 'bg-yellow-100 text-yellow-700' :
                          post.category === 'Technical' ? 'bg-blue-100 text-blue-700' :
                          post.category === 'Reference' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {post.category}
                        </span>
                        {post.featured && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta Information */}
                      <div className="flex items-center text-xs text-gray-500 gap-4 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>

                      {/* Read More Link */}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        Read Article →
                      </Link>
                    </div>
                  </article>
                );
              })}
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
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Upgrade to Pro
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
              <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
              <a href="mailto:hello@erptables.io" className="hover:text-blue-600 transition-colors">Contact</a>
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