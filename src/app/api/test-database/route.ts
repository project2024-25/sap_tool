// src/app/api/test-database/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Test 1: Get sample SAP tables
    const { data: tables, error: tablesError } = await supabase
      .from('sap_tables')
      .select('id, table_name, description, module, complexity_level')
      .limit(5);
    
    if (tablesError) throw tablesError;
    
    // Test 2: Get table fields for BKPF
    const bkpfTable = tables?.find(t => t.table_name === 'BKPF');
    const { data: fields, error: fieldsError } = await supabase
      .from('table_fields')
      .select('field_name, description, data_type, is_key_field')
      .eq('table_id', bkpfTable?.id)
      .limit(5);
    
    if (fieldsError) throw fieldsError;
    
    // Test 3: Get relationships
    const { data: relationships, error: relError } = await supabase
      .from('table_relationships')
      .select('relationship_type, join_condition, description')
      .limit(3);
    
    if (relError) throw relError;
    
    // Test 4: Count total records
    const { count: tableCount } = await supabase
      .from('sap_tables')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({
      status: 'Database schema working perfectly! 🎉',
      summary: {
        totalTables: tableCount,
        sampleTables: tables?.length || 0,
        fieldsForBKPF: fields?.length || 0,
        relationships: relationships?.length || 0
      },
      sampleData: {
        tables: tables?.map(t => ({ 
          name: t.table_name, 
          module: t.module,
          complexity: t.complexity_level 
        })),
        bkpfFields: fields?.map(f => ({ 
          name: f.field_name, 
          type: f.data_type,
          isKey: f.is_key_field 
        })),
        relationships: relationships?.map(r => ({
          type: r.relationship_type,
          description: r.description
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}