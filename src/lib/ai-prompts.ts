// src/lib/ai-prompts.ts
// Enhanced AI prompts for migration-aware, business-context search

export interface SearchContext {
    type: 'migration' | 'consultant' | 'developer' | 'general';
    urgency: 'high' | 'medium' | 'low';
    userTier: 'free' | 'pro';
  }
  
  export function detectSearchContext(query: string): SearchContext {
    const migrationKeywords = [
      'migration', 'ecc', 's4hana', 's/4hana', 'convert', 'upgrade', 
      '2027', 'end of life', 'deprecated', 'acdoca', 'new gl'
    ];
    
    const consultantKeywords = [
      'business', 'process', 'client', 'requirement', 'workflow', 
      'implementation', 'configuration', 'functional'
    ];
    
    const developerKeywords = [
      'abap', 'custom', 'code', 'development', 'api', 'integration',
      'enhancement', 'badi', 'user exit', 'function module'
    ];
  
    const queryLower = query.toLowerCase();
    
    // Determine context type
    let contextType: SearchContext['type'] = 'general';
    if (migrationKeywords.some(keyword => queryLower.includes(keyword))) {
      contextType = 'migration';
    } else if (consultantKeywords.some(keyword => queryLower.includes(keyword))) {
      contextType = 'consultant';
    } else if (developerKeywords.some(keyword => queryLower.includes(keyword))) {
      contextType = 'developer';
    }
    
    // Determine urgency (especially for migration)
    let urgency: SearchContext['urgency'] = 'low';
    if (contextType === 'migration' || queryLower.includes('urgent') || queryLower.includes('critical')) {
      urgency = 'high';
    } else if (queryLower.includes('planning') || queryLower.includes('prepare')) {
      urgency = 'medium';
    }
    
    return { type: contextType, urgency, userTier: 'free' }; // userTier set elsewhere
  }
  
  export function generateSearchPrompt(
    query: string, 
    context: SearchContext, 
    tables: any[]
  ): string {
    const basePrompt = `You are an expert SAP consultant assistant helping users find the right SAP tables. Current date: ${new Date().getFullYear()}.
  
  CRITICAL CONTEXT: SAP ECC End of Life is January 2027. All ECC customers must migrate to S/4HANA.
  
  User Query: "${query}"
  Found Tables: ${tables.map(t => `${t.table_name} (${t.module}) - ${t.description}`).join(', ')}`;
  
    switch (context.type) {
      case 'migration':
        return `${basePrompt}
  
  🚨 MIGRATION EXPERT MODE - 2027 DEADLINE APPROACHING:
  
  For each table, provide:
  1. **Migration Status**: ECC_ONLY (must migrate), S4HANA_ONLY (new), DEPRECATED (find replacement), BOTH (review changes)
  2. **Business Impact**: How migration affects business processes
  3. **Action Required**: Immediate steps for 2027 compliance
  4. **Alternative Tables**: S/4HANA replacements if deprecated
  
  Focus on URGENCY and practical migration guidance. Be specific about 2027 deadline implications.
  
  Example format:
  "BKPF (Financial Documents): BOTH - Review required for S/4HANA
  ⚠️ Action: Validate custom fields compatibility by Q2 2025
  📋 Impact: Core FI posting process, affects month-end closing"`;
  
      case 'consultant':
        return `${basePrompt}
  
  👔 CONSULTANT MODE - Business-Focused Guidance:
  
  For each table, explain:
  1. **Business Purpose**: Real-world usage in business processes
  2. **Client Value**: How this solves business problems
  3. **Integration Points**: Connections to other SAP modules
  4. **Common Scenarios**: Typical implementation use cases
  5. **Migration Considerations**: 2027 deadline implications if relevant
  
  Use business language, not technical jargon. Focus on client value and process impact.
  
  Example format:
  "MARA (Material Master): Central product data hub
  💼 Business Value: Single source of truth for all products
  🔄 Process Impact: Affects procurement, sales, inventory
  ⚡ Quick Win: Standardize material numbering across plants"`;
  
      case 'developer':
        return `${basePrompt}
  
  💻 DEVELOPER MODE - Technical Implementation Focus:
  
  For each table, provide:
  1. **Technical Structure**: Key fields and data types
  2. **Performance Notes**: Indexing and query optimization
  3. **Integration APIs**: Standard BAPIs and function modules
  4. **Custom Development**: Enhancement points and exits
  5. **S/4HANA Changes**: Technical differences in new system
  
  Balance technical depth with practical implementation guidance.
  
  Example format:
  "BKPF (Document Header): Transaction table with clustered index
  🔧 Key Fields: BUKRS, BELNR, GJAHR (primary key)
  ⚡ Performance: Use company code in WHERE clause
  🛠️ APIs: BAPI_ACC_DOCUMENT_* for posting
  📈 S/4HANA: Enhanced with ACDOCA integration"`;
  
      default:
        return `${basePrompt}
  
  🎯 GENERAL SAP GUIDANCE:
  
  Provide a clear, balanced explanation covering:
  1. **Table Purpose**: What this table stores
  2. **Business Context**: When and why it's used
  3. **Key Information**: Most important fields or relationships
  4. **Migration Notes**: 2027 deadline awareness if relevant
  
  Keep explanations accessible to both technical and functional users.
  
  Format: Professional, helpful, and actionable advice.`;
    }
  }
  
  export function enhanceTableResults(
    tables: any[], 
    context: SearchContext
  ): any[] {
    return tables.map(table => {
      const enhanced = { ...table };
      
      // Add migration urgency scoring
      if (table.ecc_vs_s4hana) {
        enhanced.migrationUrgency = getMigrationUrgency(table.ecc_vs_s4hana);
        enhanced.migrationMessage = getMigrationMessage(table.ecc_vs_s4hana);
      }
      
      // Boost relevance for migration context
      if (context.type === 'migration' && table.ecc_vs_s4hana === 'DEPRECATED') {
        enhanced.relevanceScore = Math.min(enhanced.relevanceScore + 20, 100);
        enhanced.urgencyFlag = '🚨 URGENT: Find S/4HANA replacement';
      }
      
      return enhanced;
    });
  }
  
  function getMigrationUrgency(status: string): number {
    switch (status) {
      case 'DEPRECATED': return 100;
      case 'ECC_ONLY': return 80;
      case 'BOTH': return 60;
      case 'S4HANA_ONLY': return 20;
      default: return 0;
    }
  }
  
  function getMigrationMessage(status: string): string {
    const year = new Date().getFullYear();
    const yearsUntil2027 = 2027 - year;
    
    switch (status) {
      case 'DEPRECATED':
        return `⛔ Table deprecated in S/4HANA. Find replacement immediately (${yearsUntil2027} years until ECC end-of-life).`;
      case 'ECC_ONLY':
        return `📋 ECC-only table. Plan S/4HANA migration strategy (${yearsUntil2027} years remaining).`;
      case 'BOTH':
        return `🔄 Available in both systems. Review field changes for S/4HANA compatibility.`;
      case 'S4HANA_ONLY':
        return `✨ New S/4HANA functionality. Consider for future implementations.`;
      default:
        return '';
    }
  }
  
  // Export all functions for easy import
  export default {
    detectSearchContext,
    generateSearchPrompt,
    enhanceTableResults,
    getMigrationUrgency,
    getMigrationMessage
  };