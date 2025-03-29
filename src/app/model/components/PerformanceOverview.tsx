"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";

interface PerformanceOverviewProps {
  timeRange: string;
}

// More detailed hourly data points for a single day
const hourlyData = [
  { hour: "00:00", reward: 320, humanBaseline: 580 },
  { hour: "01:00", reward: 340, humanBaseline: 580 },
  { hour: "02:00", reward: 360, humanBaseline: 580 },
  { hour: "03:00", reward: 375, humanBaseline: 580 },
  { hour: "04:00", reward: 390, humanBaseline: 580 },
  { hour: "05:00", reward: 380, humanBaseline: 580 },
  { hour: "06:00", reward: 405, humanBaseline: 580 },
  { hour: "07:00", reward: 415, humanBaseline: 580 },
  { hour: "08:00", reward: 430, humanBaseline: 580 },
  { hour: "09:00", reward: 450, humanBaseline: 580 },
  { hour: "10:00", reward: 475, humanBaseline: 580 },
  { hour: "11:00", reward: 490, humanBaseline: 580 },
  { hour: "12:00", reward: 510, humanBaseline: 580 },
  { hour: "13:00", reward: 525, humanBaseline: 580 },
  { hour: "14:00", reward: 550, humanBaseline: 580 },
  { hour: "15:00", reward: 560, humanBaseline: 580 },
  { hour: "16:00", reward: 575, humanBaseline: 580 },
  { hour: "17:00", reward: 590, humanBaseline: 580 },
  { hour: "18:00", reward: 610, humanBaseline: 580 },
  { hour: "19:00", reward: 625, humanBaseline: 580 },
  { hour: "20:00", reward: 640, humanBaseline: 580 },
  { hour: "21:00", reward: 655, humanBaseline: 580 },
  { hour: "22:00", reward: 675, humanBaseline: 580 },
  { hour: "23:00", reward: 690, humanBaseline: 580 },
];

const PerformanceOverview = ({ timeRange }: PerformanceOverviewProps) => {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  
  // Calculate key stats
  const currentReward = hourlyData[hourlyData.length - 1].reward;
  const humanBaseline = hourlyData[hourlyData.length - 1].humanBaseline;
  const startReward = hourlyData[0].reward;
  const improvement = ((currentReward - startReward) / startReward * 100).toFixed(1);
  const crossoverPoint = hourlyData.findIndex(d => d.reward >= d.humanBaseline);
  const crossoverTime = crossoverPoint >= 0 ? hourlyData[crossoverPoint].hour : "Not yet";
  
  return (
    <div>
      <h2 className={styles.cardTitle}>
        Performance Overview
        <div className={styles.infoIcon}>ℹ️</div>
      </h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <p>This graph shows the cumulative reward achieved by our AI model throughout March 31, 2025, compared to the human baseline performance. The model surpassed human-level play at {crossoverPoint >= 0 ? crossoverTime : "N/A"}.</p>
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
              <span>800</span>
              <span>600</span>
              <span>400</span>
              <span>200</span>
              <span>0</span>
            </div>
            
            {/* Human Baseline */}
            <div style={{ 
              position: 'absolute', 
              left: '0', 
              width: '100%', 
              height: '1px', 
              backgroundColor: '#82ca9d',
              top: `${100 - (humanBaseline / 800 * 100)}%`,
              borderTop: '1px dashed #82ca9d'
            }}>
              <div style={{ 
                position: 'absolute', 
                right: '0', 
                top: '-18px', 
                fontSize: '0.7rem', 
                backgroundColor: 'rgba(130, 202, 157, 0.2)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                color: '#82ca9d'
              }}>
                Human Baseline: {humanBaseline}
              </div>
            </div>
            
            {/* AI Performance Line */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8884d8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8884d8" stopOpacity="1" />
                </linearGradient>
              </defs>
              <polyline
                points={hourlyData.map((d, i) => `${i/(hourlyData.length-1) * 100}%,${100 - (d.reward / 800 * 100)}%`).join(' ')}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
              />
              {hourlyData.map((d, i) => (
                <circle
                  key={i}
                  cx={`${i/(hourlyData.length-1) * 100}%`}
                  cy={`${100 - (d.reward / 800 * 100)}%`}
                  r={selectedHour === i ? 6 : 4}
                  fill={selectedHour === i ? '#8884d8' : '#121212'}
                  stroke="#8884d8"
                  strokeWidth="2"
                  onMouseEnter={() => setSelectedHour(i)}
                  onMouseLeave={() => setSelectedHour(null)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
              
              {/* Area under the curve */}
              <path
                d={`
                  M0,100% 
                  ${hourlyData.map((d, i) => `L${i/(hourlyData.length-1) * 100}%,${100 - (d.reward / 800 * 100)}%`).join(' ')} 
                  L100%,100% Z
                `}
                fill="url(#lineGradient)"
                opacity="0.1"
              />
            </svg>
            
            {/* Tooltip */}
            {selectedHour !== null && (
              <div style={{ 
                position: 'absolute', 
                left: `calc(${selectedHour/(hourlyData.length-1) * 100}% - 75px)`, 
                top: `${100 - (hourlyData[selectedHour].reward / 800 * 100)}% - 60px`, 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '0.5rem',
                zIndex: 10,
                pointerEvents: 'none',
                minWidth: '150px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>{hourlyData[selectedHour].hour}</div>
                <div style={{ color: '#8884d8' }}>Reward: {hourlyData[selectedHour].reward}</div>
                <div style={{ color: '#82ca9d' }}>Human: {hourlyData[selectedHour].humanBaseline}</div>
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
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>Current Reward</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentReward}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>24-Hour Improvement</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8884d8' }}>+{improvement}%</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>Surpassed Human At</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: crossoverPoint >= 0 ? '#82ca9d' : 'orange' }}>
            {crossoverTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview; 