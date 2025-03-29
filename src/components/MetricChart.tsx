import React, { useState } from 'react';

interface MetricChartProps {
  data: number[];
  color: string;
  label?: string;
  showPercentage?: boolean;
  height?: number;
  showDataPoints?: boolean;
  animateOnLoad?: boolean;
  showTooltip?: boolean;
}

const MetricChart = ({ 
  data, 
  color, 
  label = "Current Value",
  showPercentage = true,
  height = 120,
  showDataPoints = false,
  animateOnLoad = true,
  showTooltip = true
}: MetricChartProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }
  
  const currentValue = data[data.length - 1];
  const previousValue = data.length > 1 ? data[data.length - 2] : null;
  const percentChange = previousValue !== null 
    ? ((currentValue - previousValue) / previousValue * 100).toFixed(1)
    : null;
  
  // Generate path for area and line
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const normalizedData = data.map(val => 
    (val - minVal) / (maxVal - minVal || 1) * 100
  );
  
  const areaCurve = `
    M0,100 
    ${normalizedData.map((val, i) => 
      `L${(i / (normalizedData.length - 1)) * 100},${100 - val}`
    ).join(' ')} 
    L100,100 Z
  `;
  
  const lineCurve = `
    M0,${100 - normalizedData[0]} 
    ${normalizedData.map((val, i) => 
      `L${(i / (normalizedData.length - 1)) * 100},${100 - val}`
    ).join(' ')}
  `;
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold" style={{ color }}>
            {currentValue}{showPercentage ? '%' : ''}
          </div>
          {percentChange !== null && (
            <div className={`text-xs px-2 py-1 rounded ${Number(percentChange) >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {Number(percentChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(percentChange))}%
            </div>
          )}
        </div>
        <div className="text-gray-400 text-xs">{label}</div>
      </div>
      
      <div className="relative flex-grow" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Area under curve */}
          <path
            d={areaCurve}
            fill={`url(#gradient-${color.replace('#', '')})`}
            className={animateOnLoad ? "animate-fadeIn" : ""}
          />
          
          {/* The line itself */}
          <path
            d={lineCurve}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animateOnLoad ? "animate-drawLine" : ""}
          />
          
          {/* Data points */}
          {showDataPoints && normalizedData.map((val, i) => (
            <circle
              key={i}
              cx={`${(i / (normalizedData.length - 1)) * 100}`}
              cy={`${100 - val}`}
              r={hoveredPoint === i ? "3" : "2"}
              fill={hoveredPoint === i ? color : "#121212"}
              stroke={color}
              strokeWidth="1"
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
          
          {/* Tooltip */}
          {showTooltip && hoveredPoint !== null && (
            <g>
              <line 
                x1={`${(hoveredPoint / (normalizedData.length - 1)) * 100}`} 
                y1="0" 
                x2={`${(hoveredPoint / (normalizedData.length - 1)) * 100}`} 
                y2="100" 
                stroke={color} 
                strokeWidth="1" 
                strokeDasharray="2,2" 
              />
              <rect 
                x={`${(hoveredPoint / (normalizedData.length - 1)) * 100 - 15}`} 
                y={`${100 - normalizedData[hoveredPoint] - 25}`} 
                width="30" 
                height="20" 
                rx="4" 
                fill="rgba(20, 20, 30, 0.9)" 
                stroke={color} 
                strokeWidth="1" 
              />
              <text 
                x={`${(hoveredPoint / (normalizedData.length - 1)) * 100}`} 
                y={`${100 - normalizedData[hoveredPoint] - 12}`} 
                textAnchor="middle" 
                fill="white" 
                fontSize="8" 
              >
                {data[hoveredPoint]}{showPercentage ? '%' : ''}
              </text>
            </g>
          )}
          
          {/* Horizontal grid lines */}
          {[25, 50, 75].map((line) => (
            <line
              key={`line-${line}`}
              x1="0"
              y1={line}
              x2="100"
              y2={line}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default MetricChart; 