// src/app/dynamics-tables/page.tsx
'use client';

import Link from 'next/link';
import { Database, ArrowLeft, ExternalLink, Zap, Users, TrendingUp, Building2 } from 'lucide-react';
import ComingSoonCard from '@/components/ComingSoonCard';
import EmailCapture from '@/components/EmailCapture';

export default function DynamicsTablesPage() {
  const dynamicsFeatures = [
    'Complete Dynamics 365 table catalog',
    'AI-powered natural language search',
    'Table relationships and dependencies',
    'Business process context',
    'Power Platform integration guides',
    'Cloud migration assistance',
    'Custom entity documentation',
    'Dataverse integration patterns'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/auth/login" 
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-2xl">
                <Building2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Microsoft Dynamics Tables
              <span className="block text-green-600">Coming Soon</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              The first AI-powered Microsoft Dynamics 365 table reference platform. Find Dynamics tables 10x faster with natural language search, business context, and Power Platform integration guides.
            </p>
            
            {/* Status Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-green-200">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Requirements Gathering</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-blue-200">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">10% Development Progress</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-orange-200">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-gray-700">Q3 2025 Target</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Card Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ComingSoonCard
            title="Microsoft Dynamics 365 Tables"
            description="Comprehensive Dynamics 365 table reference with AI-powered search capabilities. We're building the most complete Dynamics table documentation with business context, Power Platform integration guides, and practical examples for consultants and developers."
            features={dynamicsFeatures}
            estimatedLaunch="Q3 2025"
            icon={<Building2 className="w-6 h-6" />}
            accentColor="green"
            currentStatus="Research & Planning Phase"
            userCount={0}
          />
        </div>
      </section>

      {/* Why Dynamics Tables Matter */}
      <section className="py-16 bg-green-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Dynamics Table Reference Matters
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Microsoft Dynamics 365 consultants need better tools to understand table structures, Dataverse relationships, and Power Platform integrations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Complex Dataverse Structure
              </h3>
              <p className="text-gray-600">
                Dynamics 365 spans multiple apps with complex entity relationships. Finding the right tables for business requirements requires deep platform knowledge.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <ExternalLink className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Power Platform Integration
              </h3>
              <p className="text-gray-600">
                Understanding how Dynamics tables integrate with Power Apps, Power Automate, and Power BI requires specialized documentation and examples.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Cloud-First Architecture
              </h3>
              <p className="text-gray-600">
                Dynamics 365's cloud-native approach creates new patterns for data access, security, and integration that consultants need to master.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Early Access to Dynamics Tables
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Be among the first Dynamics consultants to access our AI-powered table reference platform. 
              Help us prioritize features that matter most to Dynamics professionals.
            </p>
          </div>

          <EmailCapture 
            erpSystem="dynamics"
            title="Join the Dynamics Tables Waitlist"
            description="Get notified when we launch comprehensive Dynamics 365 table reference tools with AI search and Power Platform integration guides."
          />
        </div>
      </section>

      {/* Meanwhile Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Meanwhile, Explore Our SAP Tables
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Experience how our AI-powered table reference works with our comprehensive SAP table database.
          </p>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">300+ SAP Tables</h3>
                <p className="text-sm text-gray-600">Comprehensive coverage of FI, MM, SD, HR modules</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Search</h3>
                <p className="text-sm text-gray-600">Natural language queries with business context</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Migration Guides</h3>
                <p className="text-sm text-gray-600">ECC to S/4HANA table mappings and impact analysis</p>
              </div>
            </div>
          </div>

          <Link 
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Explore SAP Tables
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">ERP Tables</h3>
            <p className="text-gray-400 mb-6">
              AI-powered ERP table reference for consultants and developers
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                SAP Tables
              </Link>
              <Link href="/oracle-tables" className="text-gray-300 hover:text-white transition-colors">
                Oracle Tables
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}