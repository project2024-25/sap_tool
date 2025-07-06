// src/app/api/search/route.ts
// ENHANCED VERSION with migration-aware business context

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { 
  detectSearchContext, 
  generateSearchPrompt, 
  enhanceTableResults 
} from '@/lib/ai-prompts';

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
  
  // Clean old cache entries
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

// Types for our enhanced search functionality
interface SearchRequest {
  query: string;
  userId?: string;
  limit?: number;
}

interface EnhancedSearchResult {
  tableName: string;
  description: string;
  module: string;
  businessPurpose: string;
  relevanceScore: number;
  // NEW: Migration-specific fields
  migrationStatus?: string;
  migrationUrgency?: number;
  migrationMessage?: string;
  urgencyFlag?: string;
}

interface SearchResponse {
  results: EnhancedSearchResult[];
  aiExplanation: string;
  processingTime: number;
  success: boolean;
  searchContext: string; // NEW: Context detection result
  migrationAlert?: string; // NEW: 2027 deadline awareness
  error?: string;
}

// Enhanced search logging with context tracking
async function logSearchToDatabase(
  userId: string | null, 
  query: string, 
  resultsCount: number, 
  responseTime: number,
  searchContext: string
) {
  try {
    console.log('📝 Logging enhanced search:', {
      userId, query, resultsCount, responseTime, searchContext
    });

    if (!userId) {
      console.log('⚠️ No userId provided, skipping database log');
      return null;
    }

    // Insert search log with context
    const { data, error } = await supabase
      .from('search_logs')
      .insert({
        user_id: userId,
        search_query: query,
        results_count: resultsCount,
        response_time_ms: responseTime,
        search_timestamp: new Date().toISOString(),
        conversion_opportunity: searchContext === 'migration' // Migration searches are conversion opportunities
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to log search:', error);
      throw error;
    }

    console.log('✅ Enhanced search logged successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 Search logging error:', error);
    return null;
  }
}

// Enhanced keyword extraction with migration awareness
async function extractSearchKeywords(query: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an SAP expert extracting keywords for table search with migration awareness.
          
          CONTEXT: SAP ECC End of Life is 2027. Prioritize migration-related terms.
          
          Extract 2-5 keywords prioritizing:
          1. Migration terms (ecc, s4hana, deprecated, acdoca)
          2. Business processes (vendor, payment, invoice, material)
          3. SAP modules (FI, MM, SD, HR, etc.)
          4. Technical terms (document, master, transaction)
          
          Return ONLY a JSON array of keywords.
          Example: ["vendor", "payment", "migration", "FI"]`
        },
        {
          role: "user",
          content: `Extract SAP keywords from: "${query}"`
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [query];

    const keywords = JSON.parse(content);
    return Array.isArray(keywords) ? keywords : [query];
  } catch (error) {
    console.error('OpenAI keyword extraction failed:', error);
    // Fallback: enhanced keyword extraction
    const migrationTerms = ['ecc', 's4hana', 'migration', 'deprecated', 'acdoca'];
    const foundMigrationTerms = migrationTerms.filter(term => 
      query.toLowerCase().includes(term)
    );
    
    const basicKeywords = query.toLowerCase()
      .split(' ')
      .filter(word => word.length > 2);
    
    return [...foundMigrationTerms, ...basicKeywords].slice(0, 5);
  }
}

// Enhanced database search with migration prioritization
async function searchSAPTables(keywords: string[], limit: number = 10) {
  try {
    console.log('🔍 Enhanced search with keywords:', keywords);
    
    const searches = [];
    
    // Strategy 1: Migration-priority exact matches
    const migrationKeywords = keywords.filter(k => 
      ['ecc', 's4hana', 'migration', 'deprecated', 'acdoca'].includes(k.toLowerCase())
    );
    
    if (migrationKeywords.length > 0) {
      searches.push(
        supabase
          .from('sap_tables')
          .select('*, ecc_vs_s4hana, migration_priority')
          .or(migrationKeywords.map(k => `ecc_vs_s4hana.ilike.%${k}%`).join(','))
          .order('migration_priority', { ascending: false })
          .limit(8)
      );
    }
    
    // Strategy 2: Exact table name match (highest priority)
    for (const keyword of keywords) {
      if (keyword.length > 3) {
        searches.push(
          supabase
            .from('sap_tables')
            .select('*, ecc_vs_s4hana, migration_priority')
            .ilike('table_name', `%${keyword}%`)
            .limit(5)
        );
      }
    }
    
    // Strategy 3: Enhanced description and business purpose search
    const mainKeyword = keywords[0];
    searches.push(
      supabase
        .from('sap_tables')
        .select('*, ecc_vs_s4hana, migration_priority')
        .or([
          `description.ilike.%${mainKeyword}%`,
          `business_purpose.ilike.%${mainKeyword}%`,
          `table_name.ilike.%${mainKeyword}%`
        ].join(','))
        .limit(8)
    );
    
    // Strategy 4: Module-based search with migration priority
    const sapModules = ['FI', 'MM', 'SD', 'HR', 'PP', 'QM', 'PM'];
    const moduleKeywords = keywords.filter(k => 
      sapModules.some(m => m.toLowerCase() === k.toLowerCase())
    );
    
    if (moduleKeywords.length > 0) {
      searches.push(
        supabase
          .from('sap_tables')
          .select('*, ecc_vs_s4hana, migration_priority')
          .in('module', moduleKeywords.map(k => k.toUpperCase()))
          .order('migration_priority', { ascending: false })
          .limit(5)
      );
    }
    
    // Execute all searches in parallel
    const results = await Promise.all(searches);
    
    // Combine and deduplicate results with migration awareness
    const allTables = new Map();
    
    results.forEach((result, index) => {
      if (result.data) {
        result.data.forEach(table => {
          if (!allTables.has(table.id)) {
            // Enhanced priority scoring with migration factor
            let priorityScore = 90 - (index * 10);
            
            // Boost migration-critical tables
            if (table.ecc_vs_s4hana === 'DEPRECATED') {
              priorityScore += 25;
            } else if (table.ecc_vs_s4hana === 'ECC_ONLY') {
              priorityScore += 15;
            }
            
            table.searchPriority = priorityScore;
            allTables.set(table.id, table);
          }
        });
      }
    });
    
    // Sort by enhanced priority and return
    const finalResults = Array.from(allTables.values())
      .sort((a, b) => (b.searchPriority || 0) - (a.searchPriority || 0))
      .slice(0, limit);
    
    console.log(`✅ Found ${finalResults.length} tables with migration context`);
    return finalResults;
    
  } catch (error) {
    console.error('Database search failed:', error);
    return [];
  }
}

// Enhanced AI explanation with migration context
async function generateEnhancedExplanation(
  query: string, 
  results: any[],
  searchContext: any
): Promise<string> {
  if (results.length === 0) {
    return "No matching SAP tables found for your query.";
  }

  try {
    const prompt = generateSearchPrompt(query, searchContext, results);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: `Provide a helpful explanation for: "${query}"`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const explanation = completion.choices[0]?.message?.content || 
      `Found ${results.length} relevant SAP tables for "${query}".`;
    
    // Add migration urgency if relevant
    const deprecatedTables = results.filter(r => r.ecc_vs_s4hana === 'DEPRECATED');
    if (deprecatedTables.length > 0) {
      return `🚨 MIGRATION ALERT: ${deprecatedTables.length} deprecated table(s) found. ${explanation}`;
    }
    
    return explanation;
  } catch (error) {
    console.error('OpenAI explanation failed:', error);
    return `Found ${results.length} relevant SAP tables. ${searchContext.type === 'migration' ? 'Review migration status for 2027 compliance.' : ''}`;
  }
}

// Main enhanced search endpoint
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: SearchRequest = await request.json();
    const { query, userId, limit = 10 } = body;

    console.log('🚀 Enhanced search API called:', { query, userId });

    // Validate input
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required',
        results: [],
        aiExplanation: '',
        processingTime: Date.now() - startTime,
        searchContext: 'error'
      } as SearchResponse, { status: 400 });
    }

    // NEW: Detect search context for enhanced responses
    const searchContext = detectSearchContext(query.trim());
    console.log('🔍 Search context detected:', searchContext);

    // Check cache first
    const cachedResults = getCachedResults(query);
    if (cachedResults) {
      console.log('📦 Returning cached results with context');
      
      const processingTime = Date.now() - startTime;
      await logSearchToDatabase(userId || null, query, cachedResults.length, processingTime, searchContext.type);
      
      return NextResponse.json({
        success: true,
        results: cachedResults,
        aiExplanation: `Found ${cachedResults.length} relevant SAP tables for "${query}" (cached results).`,
        processingTime,
        searchContext: searchContext.type
      } as SearchResponse);
    }

    // Step 1: Enhanced keyword extraction
    const keywords = await extractSearchKeywords(query.trim());
    console.log('🏷️ Enhanced keywords extracted:', keywords);

    // Step 2: Enhanced database search with migration priority
    const dbResults = await searchSAPTables(keywords, limit);
    console.log('🗄️ Database results with migration context:', dbResults.length);

    // Step 3: Enhance results with migration context
    const enhancedResults = enhanceTableResults(dbResults, searchContext);

    // Step 4: Transform to API response format
    const results: EnhancedSearchResult[] = enhancedResults.map((table, index) => ({
      tableName: table.table_name,
      description: table.description,
      module: table.module,
      businessPurpose: table.business_purpose || table.description,
      relevanceScore: Math.max(95 - (index * 5), 60),
      migrationStatus: table.ecc_vs_s4hana,
      migrationUrgency: table.migrationUrgency,
      migrationMessage: table.migrationMessage,
      urgencyFlag: table.urgencyFlag
    }));

    // Step 5: Generate enhanced AI explanation
    const aiExplanation = await generateEnhancedExplanation(query, dbResults, searchContext);

    // Cache the results
    setCachedResults(query, results);

    const processingTime = Date.now() - startTime;

    // Log enhanced search with context
    console.log('📝 Logging enhanced search to database...');
    await logSearchToDatabase(userId || null, query, results.length, processingTime, searchContext.type);

    // Prepare response with migration awareness
    const response: SearchResponse = {
      success: true,
      results,
      aiExplanation,
      processingTime,
      searchContext: searchContext.type
    };

    // Add migration alert if relevant
    const currentYear = new Date().getFullYear();
    const yearsUntil2027 = 2027 - currentYear;
    if (searchContext.type === 'migration' || searchContext.urgency === 'high') {
      response.migrationAlert = `⏰ SAP ECC End of Life: ${yearsUntil2027} years remaining until mandatory S/4HANA migration.`;
    }

    console.log('✅ Enhanced search completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Enhanced search API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      results: [],
      aiExplanation: '',
      processingTime: Date.now() - startTime,
      searchContext: 'error'
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