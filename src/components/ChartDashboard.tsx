import React from 'react';
import ChartContainer from './ChartContainer';

interface ChartDashboardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const ChartDashboard: React.FC<ChartDashboardProps> = ({
  children,
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        {children}
      </div>
    </div>
  );
};

// Dashboard item variants
export const ChartDashboardItem: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string;
  span?: 'sm' | 'md' | 'lg' | 'full';
  height?: number;
}> = ({
  children,
  title,
  subtitle,
  accentColor,
  span = 'sm',
  height,
}) => {
  // Map span to column span classes
  const colSpanClass = {
    sm: '',
    md: 'sm:col-span-2',
    lg: 'sm:col-span-2 lg:col-span-3',
    full: 'col-span-full',
  }[span];
  
  const rowSpanClass = height ? `row-span-${Math.ceil(height/100)}` : '';
  
  return (
    <div className={`${colSpanClass} ${rowSpanClass}`} style={{ minHeight: height ? `${height}px` : '220px' }}>
      <ChartContainer
        title={title}
        subtitle={subtitle}
        accentColor={accentColor}
        fullWidth={span === 'full'}
      >
        {children}
      </ChartContainer>
    </div>
  );
};

export default ChartDashboard; 