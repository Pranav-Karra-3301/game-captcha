"use client";

import { useState } from "react";
import styles from "../page.module.css";

interface TrainingMetricsProps {
  timeRange: string;
}

// Hourly data for March 31
const hourlyData = [
  { hour: '00:00', loss: 1.82, entropy: 1.42, kl: 0.62 },
  { hour: '01:00', loss: 1.76, entropy: 1.38, kl: 0.59 },
  { hour: '02:00', loss: 1.74, entropy: 1.35, kl: 0.56 },
  { hour: '03:00', loss: 1.69, entropy: 1.33, kl: 0.54 },
  { hour: '04:00', loss: 1.65, entropy: 1.30, kl: 0.52 },
  { hour: '05:00', loss: 1.63, entropy: 1.28, kl: 0.50 },
  { hour: '06:00', loss: 1.58, entropy: 1.25, kl: 0.48 },
  { hour: '07:00', loss: 1.52, entropy: 1.22, kl: 0.46 },
  { hour: '08:00', loss: 1.49, entropy: 1.20, kl: 0.43 },
  { hour: '09:00', loss: 1.45, entropy: 1.18, kl: 0.42 },
  { hour: '10:00', loss: 1.43, entropy: 1.15, kl: 0.40 },
  { hour: '11:00', loss: 1.38, entropy: 1.12, kl: 0.38 },
  { hour: '12:00', loss: 1.32, entropy: 1.10, kl: 0.36 },
  { hour: '13:00', loss: 1.28, entropy: 1.08, kl: 0.35 },
  { hour: '14:00', loss: 1.25, entropy: 1.05, kl: 0.33 },
  { hour: '15:00', loss: 1.21, entropy: 1.02, kl: 0.31 },
  { hour: '16:00', loss: 1.18, entropy: 0.99, kl: 0.30 },
  { hour: '17:00', loss: 1.15, entropy: 0.97, kl: 0.28 },
  { hour: '18:00', loss: 1.12, entropy: 0.95, kl: 0.27 },
  { hour: '19:00', loss: 1.08, entropy: 0.93, kl: 0.25 },
  { hour: '20:00', loss: 1.05, entropy: 0.91, kl: 0.24 },
  { hour: '21:00', loss: 1.02, entropy: 0.89, kl: 0.23 },
  { hour: '22:00', loss: 0.99, entropy: 0.87, kl: 0.22 },
  { hour: '23:00', loss: 0.96, entropy: 0.85, kl: 0.21 }
];

const TrainingMetrics = ({ timeRange }: TrainingMetricsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<'loss' | 'entropy' | 'kl'>('loss');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Calculate improvement percentages
  const startValues = hourlyData[0];
  const endValues = hourlyData[hourlyData.length - 1];
  const improvementPercentages = {
    loss: ((startValues.loss - endValues.loss) / startValues.loss * 100).toFixed(1),
    entropy: ((startValues.entropy - endValues.entropy) / startValues.entropy * 100).toFixed(1),
    kl: ((startValues.kl - endValues.kl) / startValues.kl * 100).toFixed(1)
  };
  
  // Colors for each metric
  const metricColors = {
    loss: '#FF4560',
    entropy: '#00E396', 
    kl: '#0090FF'
  };
  
  // Max values for scaling
  const maxValues = {
    loss: 2.0,
    entropy: 1.5,
    kl: 0.7
  };
  
  // Labels for metrics
  const metricLabels = {
    loss: 'Policy Loss',
    entropy: 'Entropy',
    kl: 'KL Divergence'
  };
  
  // Descriptions for metrics
  const metricDescriptions = {
    loss: 'Measures how far the current policy is from an optimal policy',
    entropy: 'Quantifies the randomness in the model\'s action selection',
    kl: 'Measures how much the policy has changed since the last update'
  };
  
  return (
    <div>
      <h2 className={styles.cardTitle}>
        Training Metrics
        <div className={styles.infoIcon}>ℹ️</div>
      </h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <p>These metrics track the internal training parameters of the reinforcement learning algorithm on March 31, 2025. Lower values generally indicate better model convergence.</p>
      </div>
      
      {/* Metric Selector */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '1rem', 
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        borderRadius: '8px',
        padding: '0.5rem'
      }}>
        {Object.entries(metricLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedMetric(key as 'loss' | 'entropy' | 'kl')}
            style={{ 
              flex: 1,
              backgroundColor: selectedMetric === key ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem',
              color: selectedMetric === key ? metricColors[key as keyof typeof metricColors] : 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontWeight: selectedMetric === key ? 'bold' : 'normal',
              transition: 'all 0.2s ease'
            }}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* Metric Description */}
      <div style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        padding: '0.8rem', 
        borderRadius: '8px',
        marginBottom: '1rem',
        color: metricColors[selectedMetric],
        fontSize: '0.85rem'
      }}>
        {metricDescriptions[selectedMetric]}
      </div>
      
      <div className={styles.chartContainer}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          {/* X and Y Axes */}
          <div style={{ 
            position: 'absolute', 
            left: '30px', 
            bottom: '30px', 
            width: 'calc(100% - 40px)', 
            height: 'calc(100% - 50px)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* X-axis Labels */}
            <div style={{ 
              position: 'absolute', 
              bottom: '-25px', 
              left: '0', 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'space-between',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.7rem'
            }}>
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
            
            {/* Y-axis Labels */}
            <div style={{ 
              position: 'absolute', 
              top: '0', 
              left: '-30px', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.7rem'
            }}>
              <span>{maxValues[selectedMetric]}</span>
              <span>{(maxValues[selectedMetric] * 0.75).toFixed(1)}</span>
              <span>{(maxValues[selectedMetric] * 0.5).toFixed(1)}</span>
              <span>{(maxValues[selectedMetric] * 0.25).toFixed(1)}</span>
              <span>0</span>
            </div>
            
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((value) => (
              <div 
                key={value}
                style={{ 
                  position: 'absolute', 
                  left: '0', 
                  width: '100%', 
                  height: '1px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  top: `${100 - value * 100}%`
                }}
              />
            ))}
            
            {/* Metric Line */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id={`${selectedMetric}Gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={metricColors[selectedMetric]} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={metricColors[selectedMetric]} stopOpacity="1" />
                </linearGradient>
              </defs>
              <polyline
                points={hourlyData.map((d, i) => 
                  `${i/(hourlyData.length-1) * 100}%,${100 - (d[selectedMetric] / maxValues[selectedMetric] * 100)}%`
                ).join(' ')}
                fill="none"
                stroke={`url(#${selectedMetric}Gradient)`}
                strokeWidth="3"
              />
              {hourlyData.map((d, i) => (
                <circle
                  key={i}
                  cx={`${i/(hourlyData.length-1) * 100}%`}
                  cy={`${100 - (d[selectedMetric] / maxValues[selectedMetric] * 100)}%`}
                  r={hoveredIndex === i ? 6 : 4}
                  fill={hoveredIndex === i ? metricColors[selectedMetric] : '#121212'}
                  stroke={metricColors[selectedMetric]}
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
              
              {/* Area under the curve */}
              <path
                d={`
                  M0,100% 
                  ${hourlyData.map((d, i) => 
                    `L${i/(hourlyData.length-1) * 100}%,${100 - (d[selectedMetric] / maxValues[selectedMetric] * 100)}%`
                  ).join(' ')} 
                  L100%,100% Z
                `}
                fill={`url(#${selectedMetric}Gradient)`}
                opacity="0.1"
              />
            </svg>
            
            {/* Tooltip */}
            {hoveredIndex !== null && (
              <div style={{ 
                position: 'absolute', 
                left: `calc(${hoveredIndex/(hourlyData.length-1) * 100}% - 75px)`, 
                top: `${100 - (hourlyData[hoveredIndex][selectedMetric] / maxValues[selectedMetric] * 100)}% - 60px`, 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '0.5rem',
                zIndex: 10,
                pointerEvents: 'none',
                minWidth: '150px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>{hourlyData[hoveredIndex].hour}</div>
                <div style={{ color: metricColors[selectedMetric] }}>
                  {metricLabels[selectedMetric]}: {hourlyData[hoveredIndex][selectedMetric]}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        padding: '0.8rem', 
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>Starting Value</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{startValues[selectedMetric]}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>Current Value</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: metricColors[selectedMetric] }}>
            {endValues[selectedMetric]}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>Improvement</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00E396' }}>
            {improvementPercentages[selectedMetric]}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingMetrics; 