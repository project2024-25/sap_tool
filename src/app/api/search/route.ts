import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Simple in-memory cache for common queries
const searchCache = new Map<string, { results: any[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedResults(query: string) {
  const cached = searchCache.get(query.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }
  return null;
}

function setCachedResults(query: string, results: any[]) {
  searchCache.set(query.toLowerCase(), {
    results,
    timestamp: Date.now()
  });
  
  // Clean old cache entries - Fixed TypeScript error
  if (searchCache.size > 100) {
    const keys = Array.from(searchCache.keys());
    const oldestKey = keys[0];
    if (oldestKey) {
      searchCache.delete(oldestKey);
    }
  }
}

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Types for our search functionality
interface SearchRequest {
  query: string;
  userId?: string;
  limit?: number;
}

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

// *** NEW: Function to log search to database ***
async function logSearchToDatabase(userId: string | null, query: string, resultsCount: number, responseTime: number) {
  try {
    console.log('📝 Logging search to database:', {
      userId,
      query,
      resultsCount,
      responseTime
    });

    if (!userId) {
      console.log('⚠️ No userId provided, skipping database log');
      return null;
    }

    // Insert search log
    const { data, error } = await supabase
      .from('search_logs')
      .insert({
        user_id: userId,
        search_query: query,
        results_count: resultsCount,
        response_time_ms: responseTime,
        search_timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to log search:', error);
      throw error;
    }

    console.log('✅ Search logged successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 Search logging error:', error);
    // Don't throw error - logging shouldn't break the search functionality
    return null;
  }
}

// Function to extract keywords from user query using OpenAI
async function extractSearchKeywords(query: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an SAP expert. Extract relevant keywords from user queries to search SAP tables.
          
          User might ask about:
          - Business processes (vendor payments, purchase orders, etc.)
          - SAP modules (FI, MM, SD, HR, etc.)
          - Document types (invoices, receipts, etc.)
          - Master data (customers, vendors, materials, etc.)
          
          Return ONLY a JSON array of 2-5 keywords, no other text.
          Example: ["vendor", "payment", "document", "FI"]`
        },
        {
          role: "user",
          content: `Extract SAP-relevant keywords from: "${query}"`
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [query];

    // Parse the JSON response
    const keywords = JSON.parse(content);
    return Array.isArray(keywords) ? keywords : [query];
  } catch (error) {
    console.error('OpenAI keyword extraction failed:', error);
    // Fallback: simple keyword extraction
    return query.toLowerCase().split(' ').filter(word => word.length > 2);
  }
}

// Function to search database based on keywords
async function searchSAPTables(keywords: string[], limit: number = 10) {
    try {
      console.log('Searching with keywords:', keywords);
      
      // Build multiple search strategies
      const searches = [];
      
      // Strategy 1: Exact table name match (highest priority)
      for (const keyword of keywords) {
        if (keyword.length > 3) {
          searches.push(
            supabase
              .from('sap_tables')
              .select('*')
              .ilike('table_name', `%${keyword}%`)
              .limit(5)
          );
        }
      }
      
      // Strategy 2: Description and business purpose search
      const mainKeyword = keywords[0];
      searches.push(
        supabase
          .from('sap_tables')
          .select('*')
          .or(
            `description.ilike.%${mainKeyword}%,` +
            `business_purpose.ilike.%${mainKeyword}%`
          )
          .limit(8)
      );
      
      // Strategy 3: Module-based search if keyword matches module
      const sapModules = ['FI', 'MM', 'SD', 'HR', 'PP', 'QM', 'PM'];
      const moduleKeywords = keywords.filter(k => 
        sapModules.some(m => m.toLowerCase() === k.toLowerCase())
      );
      
      if (moduleKeywords.length > 0) {
        searches.push(
          supabase
            .from('sap_tables')
            .select('*')
            .in('module', moduleKeywords.map(k => k.toUpperCase()))
            .limit(5)
        );
      }
      
      // Execute all searches in parallel
      const results = await Promise.all(searches);
      
      // Combine and deduplicate results
      const allTables = new Map();
      
      results.forEach((result, index) => {
        if (result.data) {
          result.data.forEach(table => {
            if (!allTables.has(table.id)) {
              // Add priority score based on search strategy
              table.searchPriority = index === 0 ? 100 : (90 - index * 10);
              allTables.set(table.id, table);
            }
          });
        }
      });
      
      // Convert to array and sort by priority
      const finalResults = Array.from(allTables.values())
        .sort((a, b) => (b.searchPriority || 0) - (a.searchPriority || 0))
        .slice(0, limit);
      
      console.log(`Found ${finalResults.length} unique tables`);
      return finalResults;
      
    } catch (error) {
      console.error('Database search failed:', error);
      return [];
    }
  }

// Function to generate AI explanation
async function generateExplanation(query: string, results: any[]): Promise<string> {
  if (results.length === 0) {
    return "No matching SAP tables found for your query.";
  }

  try {
    const tableNames = results.map(r => r.table_name).join(', ');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an SAP consultant. Explain why these SAP tables are relevant to the user's query in 1-2 sentences. Be concise and business-focused."
        },
        {
          role: "user",
          content: `User searched for: "${query}"\nFound tables: ${tableNames}\nExplain the relevance briefly.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0]?.message?.content || `Found ${results.length} relevant SAP tables for "${query}".`;
  } catch (error) {
    console.error('OpenAI explanation failed:', error);
    return `Found ${results.length} relevant SAP tables for your search.`;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body: SearchRequest = await request.json();
    const { query, userId, limit = 10 } = body;

    console.log('🚀 Search API called with:', { query, userId });

    // Validate input
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required',
        results: [],
        aiExplanation: '',
        processingTime: Date.now() - startTime
      } as SearchResponse, { status: 400 });
    }

    console.log('Processing search query:', query);

     // Check cache first
     const cachedResults = getCachedResults(query);
     if (cachedResults) {
       console.log('Returning cached results');
       
       const processingTime = Date.now() - startTime;
       
       // *** IMPORTANT: Log cached searches too ***
       console.log('📝 Logging cached search...');
       await logSearchToDatabase(userId || null, query, cachedResults.length, processingTime);
       
       return NextResponse.json({
         success: true,
         results: cachedResults,
         aiExplanation: `Found ${cachedResults.length} relevant SAP tables for "${query}" (cached - instant results).`,
         processingTime
       } as SearchResponse);
     }

    // Step 1: Extract keywords using OpenAI
    const keywords = await extractSearchKeywords(query.trim());
    console.log('Extracted keywords:', keywords);

    // Step 2: Search database
    const dbResults = await searchSAPTables(keywords, limit);
    console.log('Database results:', dbResults.length, 'tables found');

    // Step 3: Transform results and calculate relevance
    const results: SearchResult[] = dbResults.map((table, index) => ({
      tableName: table.table_name,
      description: table.description,
      module: table.module,
      businessPurpose: table.business_purpose || table.description,
      relevanceScore: Math.max(95 - (index * 5), 60) // Simple relevance scoring
    }));

    // Step 4: Generate AI explanation
    const aiExplanation = await generateExplanation(query, dbResults);

    // Cache the results
    setCachedResults(query, results);

    const processingTime = Date.now() - startTime;

    // *** CRITICAL: Log the search to database ***
    console.log('📝 About to log search to database...');
    const logResult = await logSearchToDatabase(userId || null, query, results.length, processingTime);
    console.log('📋 Search log result:', logResult);

    const response: SearchResponse = {
      success: true,
      results,
      aiExplanation,
      processingTime
    };

    console.log('✅ Search API completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Search API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      results: [],
      aiExplanation: '',
      processingTime: Date.now() - startTime
    } as SearchResponse, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}