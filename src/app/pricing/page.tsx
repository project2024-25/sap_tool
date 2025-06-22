'use client';

import Link from 'next/link';
import { Database, Check, Crown, Zap, Users, Building } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for occasional SAP table lookups',
      features: [
        'Unlimited searches',
        'Basic table information',
        'Business purpose descriptions',
        '1-level relationship depth',
        'CSV export (5 per day)',
        '30-day search history',
        'Email support'
      ],
      limitations: [
        'Limited export formats',
        'Basic relationship mapping',
        'No AI business insights'
      ],
      cta: 'Get Started Free',
      href: '/auth/register',
      popular: false,
      icon: Database
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For SAP consultants who need comprehensive table insights',
      features: [
        'Everything in Free',
        'Unlimited relationship depth',
        'Visual relationship mapping',
        'Excel & PDF exports (unlimited)',
        'AI business process explanations',
        'Saved table collections',
        'Advanced search filters',
        'Priority email support (24h)',
        'Integration guides'
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      href: '/auth/register?plan=pro',
      popular: true,
      icon: Crown
    },
    {
      name: 'Team',
      price: '$89',
      period: 'per month',
      description: 'For SAP consulting teams and small firms',
      features: [
        'Everything in Pro',
        'Up to 10 team members',
        '5 shared workspaces',
        'Team collaboration features',
        'Bulk export capabilities',
        'Team analytics dashboard',
        'Custom table collections',
        'Priority support (12h)',
        'Onboarding session'
      ],
      limitations: [],
      cta: 'Start Team Trial',
      href: '/auth/register?plan=team',
      popular: false,
      icon: Users
    },
    {
      name: 'Enterprise',
      price: '$299',
      period: 'per month',
      description: 'For large consulting firms and enterprises',
      features: [
        'Everything in Team',
        'Unlimited team members',
        'Unlimited workspaces',
        'SSO integration',
        'API access',
        'Custom branding',
        'Dedicated account manager',
        'Custom training sessions',
        'SLA guarantee',
        'Advanced analytics'
      ],
      limitations: [],
      cta: 'Contact Sales',
      href: '/contact-sales',
      popular: false,
      icon: Building
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SAP Table Finder</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Back to Search
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-blue-600">SAP Research</span> Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Start with unlimited searches for free. Upgrade when you need advanced features like 
            unlimited exports, visual relationship mapping, and AI business insights.
          </p>
          
          {/* Value Proposition */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 mb-12">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <span>Unlimited searches on all plans</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span>300+ SAP tables</span>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>No setup fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                    plan.popular 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                        plan.popular ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          plan.popular ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600 ml-1">/{plan.period}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <div className="mb-8">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={plan.href}
                      className={`w-full block text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.cta}
                    </Link>

                    {plan.name === 'Free' && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        No credit card required
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are searches really unlimited?
              </h3>
              <p className="text-gray-600">
                Yes! All plans include unlimited SAP table searches. We believe in removing barriers 
                to finding the information you need.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Absolutely. You can change your plan at any time. Upgrades take effect immediately, 
                and downgrades take effect at the next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's included in the free plan?
              </h3>
              <p className="text-gray-600">
                The free plan includes unlimited searches, basic table information, business context, 
                and limited exports. Perfect for occasional use.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee on all paid plans. 
                If you're not satisfied, we'll refund your payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Database className="h-6 w-6 text-blue-600" />
              <span className="text-gray-900 font-medium">SAP Table Finder</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>&copy; 2025 SAP Table Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}