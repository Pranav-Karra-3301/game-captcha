import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  icon,
  color = '#4cd964',
  isLoading = false,
  trend = 'neutral',
  className = '',
}) => {
  // Determine trend icon and color
  let trendIcon = '–';
  let trendColor = 'text-gray-400';
  
  if (trend === 'up' || (change !== undefined && change > 0)) {
    trendIcon = '↑';
    trendColor = 'text-green-400';
  } else if (trend === 'down' || (change !== undefined && change < 0)) {
    trendIcon = '↓';
    trendColor = 'text-red-400';
  }
  
  return (
    <div className={`bg-gray-800/70 backdrop-blur rounded-xl p-4 transition-all duration-300 hover:shadow-lg border border-gray-700 hover:border-gray-600 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
          
          <div className="mt-2 flex items-baseline">
            {prefix && <span className="text-sm text-gray-400 mr-1">{prefix}</span>}
            
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-700 rounded-md animate-pulse"></div>
            ) : (
              <div className="text-2xl font-semibold" style={{ color }}>
                {value}
              </div>
            )}
            
            {suffix && <span className="text-sm text-gray-400 ml-1">{suffix}</span>}
          </div>
          
          {change !== undefined && (
            <div className={`flex items-center mt-1 text-xs ${trendColor}`}>
              <span className="mr-1">{trendIcon}</span>
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="ml-1 text-gray-500">from previous</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div 
            className="p-2 rounded-lg opacity-80"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard; 