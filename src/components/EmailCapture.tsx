// src/components/EmailCapture.tsx
'use client';

import { useState, FormEvent } from 'react';
import { Mail, User, Building, CheckCircle, Loader } from 'lucide-react';

interface EmailCaptureProps {
  erpSystem: 'oracle' | 'dynamics';
  title?: string;
  description?: string;
}

interface FormData {
  email: string;
  firstName: string;
  company: string;
  role: 'consultant' | 'developer' | 'analyst' | 'manager' | 'other';
  companySize: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  timeline: '3-months' | '6-months' | '12-months' | 'evaluating';
}

export default function EmailCapture({ erpSystem, title, description }: EmailCaptureProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    company: '',
    role: 'consultant',
    companySize: '11-50',
    timeline: '6-months'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Submit to API endpoint
      const response = await fetch('/api/email-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          erpSystem,
          source: `${erpSystem}-coming-soon`,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit. Please try again.');
      }

      setIsSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto p-8 bg-green-50 border border-green-200 rounded-lg text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Thank You!
        </h3>
        <p className="text-green-700 mb-4">
          We'll notify you as soon as {erpSystem === 'oracle' ? 'Oracle' : 'Microsoft Dynamics'} tables are available.
        </p>
        <p className="text-sm text-green-600">
          In the meantime, explore our comprehensive SAP tables reference.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="text-center mb-6">
        <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title || `Get Early Access to ${erpSystem === 'oracle' ? 'Oracle' : 'Microsoft Dynamics'} Tables`}
        </h3>
        <p className="text-gray-600 text-sm">
          {description || `Be the first to know when we launch comprehensive ${erpSystem === 'oracle' ? 'Oracle' : 'Microsoft Dynamics'} table reference tools.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="your.email@company.com"
          />
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="John"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your Company"
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            id="role"
            required
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value as FormData['role'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="consultant">Consultant</option>
            <option value="developer">Developer</option>
            <option value="analyst">Business Analyst</option>
            <option value="manager">Manager</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
            Company Size
          </label>
          <select
            id="companySize"
            value={formData.companySize}
            onChange={(e) => handleInputChange('companySize', e.target.value as FormData['companySize'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>

        {/* Timeline */}
        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
            Implementation Timeline
          </label>
          <select
            id="timeline"
            value={formData.timeline}
            onChange={(e) => handleInputChange('timeline', e.target.value as FormData['timeline'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="3-months">Next 3 months</option>
            <option value="6-months">Next 6 months</option>
            <option value="12-months">Next 12 months</option>
            <option value="evaluating">Just evaluating</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Get Early Access'
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        We respect your privacy. No spam, just updates about new ERP table tools.
      </p>
    </div>
  );
}