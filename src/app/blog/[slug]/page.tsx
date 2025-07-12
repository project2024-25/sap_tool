// src/app/blog/[slug]/page.tsx - Updated to use your existing lib/blog structure
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { getPostBySlug, getRelatedPosts } from '@/lib/blog/blog-data';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Article Not Found - ERP Tables',
      description: 'The requested article was not found.'
    };
  }

  return {
    title: `${post.title} - ERP Tables`,
    description: post.excerpt,
    keywords: post.seoKeywords?.join(', ') || post.tags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    }
  };
}

export default function BlogArticlePage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  const relatedPosts = getRelatedPosts(params.slug, 3);

  if (!post) {
    notFound();
  }

  // Helper function to render markdown-style content as HTML
  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Handle headers
        if (line.startsWith('# ')) {
          return `<h1 key="${index}" class="text-3xl font-bold text-gray-900 mt-8 mb-4">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 key="${index}" class="text-2xl font-bold text-gray-900 mt-6 mb-3">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 key="${index}" class="text-xl font-bold text-gray-900 mt-4 mb-2">${line.substring(4)}</h3>`;
        }
        
        // Handle bold text
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
        
        // Handle lists
        if (line.startsWith('- ')) {
          return `<li key="${index}" class="ml-4 mb-1 list-disc">• ${boldText.substring(2)}</li>`;
        }
        
        // Handle table rows (basic support)
        if (line.includes('|') && !line.startsWith('|---')) {
          const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
          if (cells.length > 1) {
            const isHeader = line.includes('**');
            const cellTag = isHeader ? 'th' : 'td';
            const cellClass = isHeader ? 'px-4 py-2 bg-gray-100 font-semibold text-left' : 'px-4 py-2 border-b';
            const cellsHtml = cells.map(cell => `<${cellTag} class="${cellClass}">${cell.replace(/\*\*/g, '')}</${cellTag}>`).join('');
            return `<tr key="${index}">${cellsHtml}</tr>`;
          }
        }
        
        // Handle empty lines
        if (line.trim() === '') {
          return `<br key="${index}" />`;
        }
        
        // Regular paragraphs
        if (line.trim() && !line.includes('|')) {
          return `<p key="${index}" class="mb-4 text-gray-700 leading-relaxed">${boldText}</p>`;
        }
        
        return '';
      })
      .join('');
  };

  // Wrap tables properly
  const processedContent = renderContent(post.content)
    .replace(/<tr key="[^"]*">/g, (match, offset, string) => {
      const prevTr = string.lastIndexOf('<tr key="', offset - 1);
      if (prevTr === -1) {
        return '<div class="overflow-x-auto my-6"><table class="min-w-full bg-white border border-gray-200">' + match;
      }
      return match;
    })
    .replace(/<\/tr>(?![\s\S]*<tr)/g, '</tr></table></div>');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-blue-600">
              ERP Tables
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                Blog
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Search Tables
              </Link>
              <Link href="/pricing" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>→</span>
          <Link href="/blog" className="hover:text-gray-900">Blog</Link>
          <span>→</span>
          <span className="text-gray-900">{post.title}</span>
        </div>

        {/* Back to Blog */}
        <Link 
          href="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {post.readTime}
            </div>
            <div>
              By {post.author}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map((tag) => (
              <span 
                key={tag} 
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ 
              __html: processedContent
            }} 
          />
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 border-t pt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.slug} 
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {relatedPost.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {relatedPost.title}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {relatedPost.excerpt}
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    {relatedPost.readTime}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Explore SAP Tables?
            </h3>
            <p className="text-gray-600 mb-6">
              Use our AI-powered search to find and understand SAP table relationships, 
              migration impacts, and business context.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search SAP Tables
              </Link>
              <Link 
                href="/pricing"
                className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 bg-gray-900 rounded-lg p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              Stay Updated on SAP Migration
            </h3>
            <p className="text-gray-300 mb-6">
              Get weekly insights on SAP ECC to S/4HANA migration, table changes, 
              and consultant career guidance.
            </p>
            <form className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-gray-400 mt-4">
              No spam. Unsubscribe anytime. Join 500+ SAP consultants.
            </p>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mt-12 flex items-center justify-between border-t pt-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Share this article
            </h4>
            <div className="flex space-x-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <Link 
            href="/blog"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Read More Articles →
          </Link>
        </div>
      </article>
    </div>
  );
}