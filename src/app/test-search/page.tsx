'use client';

import { useState } from 'react';

export default function TestSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
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
      console.log('Search results:', data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults({ success: false, error: 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Search API Test</h1>
      
      <div className="space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query (e.g., vendor payment tables)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Results:</h3>
          
          {results.success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p><strong>Success:</strong> {results.success ? 'Yes' : 'No'}</p>
                <p><strong>Processing Time:</strong> {results.processingTime}ms</p>
                <p><strong>AI Explanation:</strong> {results.aiExplanation}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Tables Found:</h4>
                {results.results.map((table: any, index: number) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p><strong>{table.tableName}</strong> - {table.module}</p>
                    <p>{table.description}</p>
                    <p className="text-sm text-gray-600">{table.businessPurpose}</p>
                    <p className="text-xs text-blue-600">Relevance: {table.relevanceScore}%</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p><strong>Error:</strong> {results.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}