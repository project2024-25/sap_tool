// src/components/ComingSoonCard.tsx
'use client';

import { ReactNode } from 'react';
import { Clock, Users, CheckCircle } from 'lucide-react';

interface ComingSoonCardProps {
  title: string;
  description: string;
  features: string[];
  estimatedLaunch: string;
  icon: ReactNode;
  accentColor?: string;
  currentStatus: string;
  userCount?: number;
}

export default function ComingSoonCard({
  title,
  description,
  features,
  estimatedLaunch,
  icon,
  accentColor = "blue",
  currentStatus,
  userCount = 0
}: ComingSoonCardProps) {
  
  const getAccentClasses = (color: string) => {
    const colorMap = {
      blue: {
        border: "border-blue-200",
        bg: "bg-blue-50",
        text: "text-blue-700",
        accent: "text-blue-600",
        badge: "bg-blue-100 text-blue-800",
        progressBg: "bg-blue-500"
      },
      orange: {
        border: "border-orange-200", 
        bg: "bg-orange-50",
        text: "text-orange-700",
        accent: "text-orange-600",
        badge: "bg-orange-100 text-orange-800",
        progressBg: "bg-orange-500"
      },
      green: {
        border: "border-green-200",
        bg: "bg-green-50", 
        text: "text-green-700",
        accent: "text-green-600",
        badge: "bg-green-100 text-green-800",
        progressBg: "bg-green-500"
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const colors = getAccentClasses(accentColor);

  return (
    <div className={`p-6 border-2 ${colors.border} ${colors.bg} rounded-xl hover:shadow-lg transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white ${colors.text}`}>
            {icon}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${colors.text}`}>{title}</h3>
            <p className={`text-sm ${colors.accent} font-medium`}>{currentStatus}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
          Coming Soon
        </span>
      </div>

      {/* Description */}
      <p className={`text-sm ${colors.text} mb-4 leading-relaxed`}>
        {description}
      </p>

      {/* Features */}
      <div className="mb-6">
        <h4 className={`text-sm font-semibold ${colors.text} mb-3`}>Planned Features:</h4>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className={`w-4 h-4 ${colors.accent}`} />
              <span className={`text-sm ${colors.text}`}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Timeline & User Interest */}
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${colors.accent}`} />
          <span className={colors.text}>Est. Launch: <strong>{estimatedLaunch}</strong></span>
        </div>
        
        {userCount > 0 && (
          <div className="flex items-center space-x-2">
            <Users className={`w-4 h-4 ${colors.accent}`} />
            <span className={colors.text}><strong>{userCount}</strong> interested</span>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Development Progress</span>
          <span>Research Phase</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${colors.progressBg}`}
            style={{ width: '15%' }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Currently gathering requirements and user feedback
        </p>
      </div>

      {/* Call to Action Hint */}
      <div className={`p-3 bg-white border ${colors.border} rounded-lg`}>
        <p className={`text-xs ${colors.text} text-center`}>
          <strong>Get notified first:</strong> Sign up below to receive early access when available
        </p>
      </div>
    </div>
  );
}