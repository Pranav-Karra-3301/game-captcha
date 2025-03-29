import React, { useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

type ChartType = 'line' | 'bar' | 'area' | 'donut';

interface AdvancedChartProps {
  data: DataPoint[];
  type: ChartType;
  color: string;
  secondaryColor?: string;
  height?: number;
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  animate?: boolean;
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
  className?: string;
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  data,
  type = 'line',
  color = 'rgb(59, 130, 246)',
  secondaryColor,
  height = 200,
  title,
  showLegend = false,
  showGrid = true,
  showLabels = true,
  animate = true,
  formatValue = (v) => v.toString(),
  formatLabel = (l) => l,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  if (!data || data.length === 0) {
    return (
      <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-400 text-sm">No data available</p>
        </div>
      </div>
    );
  }
  
  const gradientId = `chart-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;
  
  // Normalize values for rendering
  const normalizeValue = (value: number) => {
    if (range === 0) return 50; // Default to middle if all values are the same
    return 90 - ((value - minValue) / range * 80);
  };
  
  const renderLineChart = () => {
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = normalizeValue(d.value);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {showGrid && [20, 40, 60, 80].map(y => (
          <line 
            key={`grid-${y}`}
            x1="0" 
            y1={y} 
            x2="100" 
            y2={y} 
            stroke="rgba(255,255,255,0.1)" 
            strokeDasharray="1,1"
          />
        ))}
        
        {/* Area fill */}
        {type === 'area' && (
          <path
            d={`M0,${normalizeValue(data[0].value)} ${data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = normalizeValue(d.value);
              return `L${x},${y}`;
            }).join(' ')} L100,100 L0,100 Z`}
            fill={`url(#${gradientId})`}
            className={animate ? "animate-fadeIn" : ""}
          />
        )}
        
        {/* Line */}
        <path
          d={`M0,${normalizeValue(data[0].value)} ${data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = normalizeValue(d.value);
            return `L${x},${y}`;
          }).join(' ')}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className={animate ? "animate-drawLine" : ""}
        />
        
        {/* Data points */}
        {data.map((d, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={(i / (data.length - 1)) * 100}
              cy={normalizeValue(d.value)}
              r={hoveredIndex === i ? 4 : 3}
              fill={hoveredIndex === i ? color : "#151515"}
              stroke={color}
              strokeWidth="1.5"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            />
            
            {hoveredIndex === i && (
              <>
                <line
                  x1={(i / (data.length - 1)) * 100}
                  y1={normalizeValue(d.value)}
                  x2={(i / (data.length - 1)) * 100}
                  y2="100"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                  strokeDasharray="2,2"
                />
                
                <rect
                  x={(i / (data.length - 1)) * 100 - 20}
                  y={normalizeValue(d.value) - 25}
                  width="40"
                  height="20"
                  rx="4"
                  fill="rgba(20, 20, 30, 0.9)"
                  stroke={color}
                  strokeWidth="1"
                />
                
                <text
                  x={(i / (data.length - 1)) * 100}
                  y={normalizeValue(d.value) - 12}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {formatValue(d.value)}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    );
  };
  
  const renderBarChart = () => {
    const barWidth = 100 / (data.length * 1.5);
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {showGrid && [20, 40, 60, 80].map(y => (
          <line 
            key={`grid-${y}`}
            x1="0" 
            y1={y} 
            x2="100" 
            y2={y} 
            stroke="rgba(255,255,255,0.1)" 
            strokeDasharray="1,1"
          />
        ))}
        
        {data.map((d, i) => {
          const centerX = (i / (data.length - 1)) * 100;
          const height = 100 - normalizeValue(d.value);
          const barX = centerX - (barWidth / 2);
          
          return (
            <g key={`bar-${i}`}>
              <rect
                x={barX}
                y={normalizeValue(d.value)}
                width={barWidth}
                height={height}
                fill={hoveredIndex === i ? color : secondaryColor || color}
                fillOpacity={hoveredIndex === i ? 1 : 0.7}
                rx={1}
                ry={1}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
                className={animate ? "animate-fadeIn" : ""}
              />
              
              {hoveredIndex === i && (
                <>
                  <rect
                    x={centerX - 20}
                    y={normalizeValue(d.value) - 25}
                    width="40"
                    height="20"
                    rx="4"
                    fill="rgba(20, 20, 30, 0.9)"
                    stroke={color}
                    strokeWidth="1"
                  />
                  
                  <text
                    x={centerX}
                    y={normalizeValue(d.value) - 12}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {formatValue(d.value)}
                  </text>
                </>
              )}
              
              {showLabels && (
                <text
                  x={centerX}
                  y="98"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="6"
                >
                  {formatLabel(d.label)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };
  
  const renderDonutChart = () => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const radius = 40;
    const center = { x: 50, y: 50 };
    let currentAngle = 0;
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <g transform={`translate(${center.x}, ${center.y})`}>
          {data.map((d, i) => {
            const angle = (d.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = radius * Math.sin(startRad);
            const y1 = -radius * Math.cos(startRad);
            const x2 = radius * Math.sin(endRad);
            const y2 = -radius * Math.cos(endRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            // Calculate position for label line and text
            const midAngle = startAngle + angle / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const labelRadius = radius * 1.2;
            const labelX = labelRadius * Math.sin(midRad);
            const labelY = -labelRadius * Math.cos(midRad);
            
            const isHovered = hoveredIndex === i;
            const customColor = Array.isArray(color) ? color[i % color.length] : 
              `hsl(${(i * 137.5) % 360}, 70%, 65%)`;
            
            return (
              <g 
                key={`slice-${i}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <path
                  d={`M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={customColor}
                  stroke="#161616"
                  strokeWidth="0.5"
                  opacity={isHovered ? 1 : 0.85}
                  transform={isHovered ? `scale(1.05)` : ''}
                  style={{ 
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                />
                
                {showLabels && angle > 15 && (
                  <>
                    <line
                      x1={x1 * 0.8}
                      y1={y1 * 0.8}
                      x2={labelX}
                      y2={labelY}
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="0.5"
                      opacity={isHovered ? 1 : 0.6}
                    />
                    <text
                      x={labelX * 1.1}
                      y={labelY * 1.1}
                      textAnchor={midAngle > 180 ? "end" : "start"}
                      fill="rgba(255,255,255,0.8)"
                      fontSize="6"
                      fontWeight={isHovered ? "bold" : "normal"}
                      opacity={isHovered ? 1 : 0.7}
                    >
                      {`${formatLabel(d.label)} (${Math.round((d.value / total) * 100)}%)`}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          
          {/* Center hole for donut */}
          <circle
            cx="0"
            cy="0"
            r={radius * 0.6}
            fill="#161616"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
          />
          
          {/* Display total in center */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
          >
            {formatValue(total)}
          </text>
          
          <text
            x="0"
            y="8"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize="6"
          >
            TOTAL
          </text>
        </g>
      </svg>
    );
  };
  
  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      {title && (
        <div className="mb-2 text-sm font-medium text-gray-300">{title}</div>
      )}
      
      <div className="relative w-full h-full">
        {type === 'donut' && renderDonutChart()}
        {type === 'bar' && renderBarChart()}
        {(type === 'line' || type === 'area') && renderLineChart()}
        
        {showLegend && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 py-1">
            {data.map((d, i) => (
              <div 
                key={`legend-${i}`}
                className="flex items-center gap-1 text-xs"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ 
                    backgroundColor: Array.isArray(color) ? color[i % color.length] : 
                      type === 'donut' ? `hsl(${(i * 137.5) % 360}, 70%, 65%)` : color 
                  }}
                ></div>
                <span className={`${hoveredIndex === i ? 'text-white' : 'text-gray-400'}`}>
                  {formatLabel(d.label)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedChart; 