// src/app/api/tables/[tableName]/route.ts
// FIXED VERSION: Returns mock data properly

import { NextRequest, NextResponse } from 'next/server';

interface TableField {
  field_name: string;
  description: string;
  data_type: string;
  length: number | null;
  is_key_field: boolean;
  is_foreign_key: boolean;
}

interface TableRelationship {
  related_table: string;
  relationship_type: string;
  join_condition: string;
  description: string;
  module: string;
}

interface TableDetails {
  table_name: string;
  description: string;
  module: string;
  table_type: string;
  business_purpose: string;
  common_use_cases: string[];
  complexity_level: number;
  fields: TableField[];
  relationships: TableRelationship[];
}

// Mock data - always returns this for now
const mockData: Record<string, TableDetails> = {
  'BKPF': {
    table_name: 'BKPF',
    description: 'Accounting Document Header',
    module: 'FI',
    table_type: 'Transaction',
    business_purpose: 'The BKPF table stores header information for all accounting documents in SAP Financial Accounting. It serves as the central repository for document-level data including document number, company code, fiscal year, and posting date.',
    common_use_cases: [
      'Financial reporting and analysis',
      'Audit trail and compliance',
      'Integration with other SAP modules',
      'Document workflow and approval processes'
    ],
    complexity_level: 3,
    fields: [
      {
        field_name: 'BUKRS',
        description: 'Company Code',
        data_type: 'CHAR',
        length: 4,
        is_key_field: true,
        is_foreign_key: false
      },
      {
        field_name: 'BELNR',
        description: 'Accounting Document Number',
        data_type: 'CHAR',
        length: 10,
        is_key_field: true,
        is_foreign_key: false
      },
      {
        field_name: 'GJAHR',
        description: 'Fiscal Year',
        data_type: 'NUMC',
        length: 4,
        is_key_field: true,
        is_foreign_key: false
      },
      {
        field_name: 'BLDAT',
        description: 'Document Date',
        data_type: 'DATS',
        length: 8,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'BUDAT',
        description: 'Posting Date',
        data_type: 'DATS',
        length: 8,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'WAERS',
        description: 'Currency Key',
        data_type: 'CUKY',
        length: 5,
        is_key_field: false,
        is_foreign_key: true
      },
      {
        field_name: 'KURSF',
        description: 'Exchange Rate',
        data_type: 'DEC',
        length: 9,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'BLART',
        description: 'Document Type',
        data_type: 'CHAR',
        length: 2,
        is_key_field: false,
        is_foreign_key: true
      },
      {
        field_name: 'BSTAT',
        description: 'Document Status',
        data_type: 'CHAR',
        length: 1,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'XBLNR',
        description: 'Reference Document Number',
        data_type: 'CHAR',
        length: 16,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'STBLG',
        description: 'Reverse Document Number',
        data_type: 'CHAR',
        length: 10,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'STJAH',
        description: 'Reverse Document Fiscal Year',
        data_type: 'NUMC',
        length: 4,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'BKTXT',
        description: 'Document Header Text',
        data_type: 'CHAR',
        length: 25,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'AWKEY',
        description: 'Reference Key',
        data_type: 'CHAR',
        length: 20,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'AWSYS',
        description: 'Logical System',
        data_type: 'CHAR',
        length: 10,
        is_key_field: false,
        is_foreign_key: false
      }
    ],
    relationships: [
      {
        related_table: 'BSEG',
        relationship_type: 'one-to-many',
        join_condition: 'BKPF.BUKRS = BSEG.BUKRS AND BKPF.BELNR = BSEG.BELNR AND BKPF.GJAHR = BSEG.GJAHR',
        description: 'Header to line items relationship - each document header can have multiple line items',
        module: 'FI'
      },
      {
        related_table: 'T001',
        relationship_type: 'many-to-one',
        join_condition: 'BKPF.BUKRS = T001.BUKRS',
        description: 'Company code master data - links to company code configuration',
        module: 'FI'
      },
      {
        related_table: 'T003',
        relationship_type: 'many-to-one',
        join_condition: 'BKPF.BLART = T003.BLART',
        description: 'Document type configuration - defines document behavior and number ranges',
        module: 'FI'
      }
    ]
  },
  'MARA': {
    table_name: 'MARA',
    description: 'General Material Data',
    module: 'MM',
    table_type: 'Master',
    business_purpose: 'The MARA table contains general material master data that is valid across all plants and sales organizations. It serves as the foundation for material management in SAP.',
    common_use_cases: [
      'Material master maintenance',
      'Procurement and purchasing decisions',
      'Inventory management',
      'Product catalog management'
    ],
    complexity_level: 2,
    fields: [
      {
        field_name: 'MATNR',
        description: 'Material Number',
        data_type: 'CHAR',
        length: 18,
        is_key_field: true,
        is_foreign_key: false
      },
      {
        field_name: 'ERSDA',
        description: 'Created On',
        data_type: 'DATS',
        length: 8,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'ERNAM',
        description: 'Name of Person who Created the Object',
        data_type: 'CHAR',
        length: 12,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'LAEDA',
        description: 'Date of Last Change',
        data_type: 'DATS',
        length: 8,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'AENAM',
        description: 'Name of person who changed object',
        data_type: 'CHAR',
        length: 12,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'VPSTA',
        description: 'Maintenance status',
        data_type: 'CHAR',
        length: 15,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'PSTAT',
        description: 'Maintenance Status',
        data_type: 'CHAR',
        length: 15,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'LVORM',
        description: 'Flag Material for Deletion at Client Level',
        data_type: 'CHAR',
        length: 1,
        is_key_field: false,
        is_foreign_key: false
      },
      {
        field_name: 'MTART',
        description: 'Material Type',
        data_type: 'CHAR',
        length: 4,
        is_key_field: false,
        is_foreign_key: true
      },
      {
        field_name: 'MBRSH',
        description: 'Industry Sector',
        data_type: 'CHAR',
        length: 1,
        is_key_field: false,
        is_foreign_key: false
      }
    ],
    relationships: [
      {
        related_table: 'MARC',
        relationship_type: 'one-to-many',
        join_condition: 'MARA.MATNR = MARC.MATNR',
        description: 'Material master plant data - extends material data for specific plants',
        module: 'MM'
      },
      {
        related_table: 'MAKT',
        relationship_type: 'one-to-many',
        join_condition: 'MARA.MATNR = MAKT.MATNR',
        description: 'Material descriptions in different languages',
        module: 'MM'
      },
      {
        related_table: 'T134',
        relationship_type: 'many-to-one',
        join_condition: 'MARA.MTART = T134.MTART',
        description: 'Material type configuration and field selection',
        module: 'MM'
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { tableName: string } }
) {
  try {
    const tableName = params.tableName.toUpperCase();
    console.log('📊 Fetching table details for:', tableName);

    // For now, always return mock data
    const tableData = mockData[tableName];
    
    if (!tableData) {
      console.log('❌ Table not found:', tableName);
      return NextResponse.json({
        error: 'Table not found',
        available_tables: Object.keys(mockData),
        table_name: tableName
      }, { status: 404 });
    }

    console.log('✅ Returning mock data for:', tableName);
    console.log('📈 Fields count:', tableData.fields.length);
    console.log('🔗 Relationships count:', tableData.relationships.length);
    
    return NextResponse.json(tableData);

  } catch (error) {
    console.error('💥 Error in table details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}