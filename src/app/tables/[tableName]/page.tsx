'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Database, 
  ArrowLeft, 
  Download, 
  Share, 
  Bookmark,
  Info,
  Link2,
  Crown,
  ExternalLink,
  Search,
  FileText
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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

export default function TableDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [tableDetails, setTableDetails] = useState<TableDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const tableName = params?.tableName as string;

  useEffect(() => {
    if (tableName) {
      loadTableDetails();
    }
  }, [tableName]);

  const loadTableDetails = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`/api/tables/${tableName}`);
      if (response.ok) {
        const data = await response.json();
        setTableDetails(data);
      } else {
        // Mock data for now
        setTableDetails({
          table_name: tableName,
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
            }
          ],
          relationships: [
            {
              related_table: 'BSEG',
              relationship_type: 'one-to-many',
              join_condition: 'BKPF.BUKRS = BSEG.BUKRS AND BKPF.BELNR = BSEG.BELNR AND BKPF.GJAHR = BSEG.GJAHR',
              description: 'Header to line items relationship',
              module: 'FI'
            },
            {
              related_table: 'T001',
              relationship_type: 'many-to-one',
              join_condition: 'BKPF.BUKRS = T001.BUKRS',
              description: 'Company code master data',
              module: 'FI'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading table details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (userProfile?.subscription_type === 'free') {
      alert('Excel/PDF export is available for Pro subscribers. Upgrade to unlock unlimited exports!');
      return;
    }
    alert('Export functionality coming soon!');
  };

  const getComplexityBadge = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    const labels = {
      1: 'Basic',
      2: 'Intermediate',
      3: 'Advanced',
      4: 'Complex',
      5: 'Expert'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors]}`}>
        {labels[level as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading table details...</p>
        </div>
      </div>
    );
  }

  if (!tableDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Table not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Database className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SAP Table Finder</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Table Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{tableDetails.table_name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {tableDetails.module}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {tableDetails.table_type}
                </span>
                {getComplexityBadge(tableDetails.complexity_level)}
              </div>
              <p className="text-lg text-gray-600 mb-4">{tableDetails.description}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => alert('Bookmark functionality coming soon!')}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Bookmark Table"
              >
                <Bookmark className="h-5 w-5" />
              </button>
              <button
                onClick={() => alert('Share functionality coming soon!')}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Share Table"
              >
                <Share className="h-5 w-5" />
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              {userProfile?.subscription_type === 'free' && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'fields', label: 'Fields', icon: Database },
                { id: 'relationships', label: 'Relationships', icon: Link2 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Purpose</h3>
                  <p className="text-gray-700 leading-relaxed">{tableDetails.business_purpose}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Use Cases</h3>
                  <ul className="space-y-2">
                    {tableDetails.common_use_cases.map((useCase, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {userProfile?.subscription_type === 'free' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">🚀 Unlock More Insights</h4>
                    <p className="text-yellow-700 text-sm mb-3">
                      Get AI-powered business process explanations, integration patterns, and best practices with Pro.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center text-sm bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
                    >
                      Upgrade to Pro
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Fields Tab */}
            {activeTab === 'fields' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Table Fields ({tableDetails.fields.length})
                  </h3>
                  {userProfile?.subscription_type === 'free' && (
                    <p className="text-sm text-gray-500">
                      Showing first 10 fields. <Link href="/pricing" className="text-blue-600 hover:underline">Upgrade</Link> to see all fields.
                    </p>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Field Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Length
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Key
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(userProfile?.subscription_type === 'free' 
                        ? tableDetails.fields.slice(0, 10) 
                        : tableDetails.fields
                      ).map((field, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{field.field_name}</span>
                              {field.is_key_field && (
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Key
                                </span>
                              )}
                              {field.is_foreign_key && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  FK
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {field.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {field.data_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {field.length || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {field.is_key_field ? 'Yes' : 'No'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {userProfile?.subscription_type === 'free' && tableDetails.fields.length > 10 && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-500 text-sm mb-3">
                      {tableDetails.fields.length - 10} more fields available
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to See All Fields
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Relationships Tab */}
            {activeTab === 'relationships' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Table Relationships ({tableDetails.relationships.length})
                  </h3>
                  {userProfile?.subscription_type === 'free' && (
                    <p className="text-sm text-gray-500">
                      Showing 1-level relationships. <Link href="/pricing" className="text-blue-600 hover:underline">Upgrade</Link> for unlimited depth.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {tableDetails.relationships.map((relationship, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {tableDetails.table_name} → {relationship.related_table}
                            </h4>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {relationship.module}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {relationship.relationship_type}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{relationship.description}</p>
                          <div className="bg-gray-50 p-3 rounded border">
                            <p className="text-sm text-gray-500 mb-1">Join Condition:</p>
                            <code className="text-sm text-gray-800">{relationship.join_condition}</code>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => router.push(`/tables/${relationship.related_table}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Related Table"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {userProfile?.subscription_type === 'free' && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">🔗 Unlock Unlimited Relationship Depth</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      Explore complete integration flows with visual relationship mapping and unlimited depth traversal.
                    </p>
                    <div className="flex space-x-3">
                      <Link
                        href="/pricing"
                        className="inline-flex items-center text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Upgrade to Pro
                      </Link>
                      <button
                        onClick={() => alert('Visual relationship mapping coming soon for Pro users!')}
                        className="inline-flex items-center text-sm border border-blue-600 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        Preview Visual Mapping
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/dashboard?search=${tableDetails.table_name}`)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <Search className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Search Similar Tables</h4>
              <p className="text-sm text-gray-600">Find tables in the same module or business area</p>
            </button>

            <button
              onClick={() => alert('Documentation generation coming soon!')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <FileText className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Generate Documentation</h4>
              <p className="text-sm text-gray-600">Create technical documentation for this table</p>
            </button>

            <button
              onClick={() => alert('Integration guide coming soon for Pro users!')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <Link2 className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Integration Guide</h4>
              <p className="text-sm text-gray-600">Learn how to integrate with other systems</p>
              {userProfile?.subscription_type === 'free' && (
                <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Pro Feature
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}