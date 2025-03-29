import React from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accentColor?: string;
  fullWidth?: boolean;
}

const ChartContainer = ({ 
  title, 
  subtitle, 
  children, 
  accentColor = 'rgb(59, 130, 246)', // Default blue accent
  fullWidth = false 
}: ChartContainerProps) => {
  return (
    <div className={`${fullWidth ? 'col-span-full' : ''} bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700 hover:border-gray-600 hover:shadow-xl transition-all duration-300 h-full`}
         style={{ background: `linear-gradient(135deg, rgba(20, 20, 30, 0.9), rgba(30, 30, 40, 0.8))` }}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
      </div>
      <div className="relative h-[calc(100%-2rem)] w-full">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer; 