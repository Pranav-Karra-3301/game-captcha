"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';
import { getDashboardDailyData, getDashboardYearlyData } from '../../data/mockData';

interface ModelPerformanceProps {
  viewMode: 'daily' | 'yearly';
}

// Tooltip component
const TooltipWrapper = ({ children, explanation }: { children: React.ReactNode, explanation: string }) => {
  return (
    <div className={styles.tooltipTrigger}>
      {children}
      <div className={styles.tooltip}>{explanation}</div>
    </div>
  );
};

const ModelPerformance: React.FC<ModelPerformanceProps> = ({ viewMode }) => {
  const [data, setData] = useState<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'1W' | '1M' | '3M' | 'YTD'>('1M');
  const [isLoading, setIsLoading] = useState(true);

  // Load data based on view mode
  useEffect(() => {
    setIsLoading(true);
    
    // Add a slight delay to simulate data loading
    const timer = setTimeout(() => {
      const newData = viewMode === 'daily' 
        ? getDashboardDailyData()
        : getDashboardYearlyData();
      
      setData(newData);
      setIsLoading(false);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [viewMode]);

  if (isLoading || !data) {
    return (
      <div>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {viewMode === 'daily' ? 'DQN Model Performance' : 'Yearly Performance Projection'}
          </h3>
        </div>
        <div style={{ 
          height: '280px',
          border: '1px dashed rgba(255, 255, 255, 0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1rem',
          fontFamily: 'var(--pixelated-font), monospace'
        }}>
          LOADING DATA...
        </div>
      </div>
    );
  }

  const chartData = data.assets.data;
  const rewardValue = data.assets.current;
  const rewardGrowth = data.assets.growth;
  const lossValue = data.debt.current;
  const lossDecrease = data.debt.decrease;
  
  // Find max value for chart scaling
  const allValues = chartData.flatMap((d: any) => [d.assets, d.debt]);
  const maxValue = Math.max(...allValues) * 1.1;
  
  // Format values
  const formatReward = (amount: number) => {
    return amount.toLocaleString();
  };

  return (
    <div>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TooltipWrapper explanation="Shows key performance indicators for the DQN model, including reward signals and loss metrics">
            {viewMode === 'daily' ? 'DQN Model Performance' : 'Yearly Performance Projection'}
          </TooltipWrapper>
        </h3>
        <div className={styles.viewAll}>
          DETAILS <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      {/* Reward and Loss summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <motion.div 
          style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            flex: 1
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ 
            fontSize: '0.85rem', 
            marginBottom: '4px', 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontFamily: 'var(--pixelated-font), monospace',
            textTransform: 'uppercase'
          }}>
            <TooltipWrapper explanation="Accumulated reward value from the environment. Higher values indicate better model performance.">
              Reward
            </TooltipWrapper>
          </div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            fontFamily: 'var(--pixelated-font), monospace' 
          }}>
            {formatReward(rewardValue)}
          </div>
          <div style={{ 
            color: 'white',
            fontSize: '0.85rem',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--pixelated-font), monospace'
          }}>
            <span>▲</span>
            <TooltipWrapper explanation="Percentage increase in reward compared to previous period">
              {rewardGrowth}% FROM LAST PERIOD
            </TooltipWrapper>
          </div>
        </motion.div>
        
        <motion.div 
          style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            flex: 1
          }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div style={{ 
            fontSize: '0.85rem', 
            marginBottom: '4px', 
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'var(--pixelated-font), monospace',
            textTransform: 'uppercase'
          }}>
            <TooltipWrapper explanation="Loss value measuring prediction error. Lower values indicate more accurate Q-value predictions.">
              Loss
            </TooltipWrapper>
          </div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            fontFamily: 'var(--pixelated-font), monospace'
          }}>
            {formatReward(lossValue)}
          </div>
          <div style={{ 
            color: 'white',
            fontSize: '0.85rem',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--pixelated-font), monospace'
          }}>
            <span>▼</span>
            <TooltipWrapper explanation="Percentage decrease in loss compared to previous period">
              {lossDecrease}% FROM LAST PERIOD
            </TooltipWrapper>
          </div>
        </motion.div>
      </div>
      
      {/* Time range selector */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '4px',
        width: 'fit-content',
        margin: '0 auto 16px auto',
        fontFamily: 'var(--pixelated-font), monospace'
      }}>
        {(['1W', '1M', '3M', 'YTD'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              border: 'none',
              color: activeTab === tab ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              cursor: 'pointer',
              padding: '6px 12px',
              fontSize: '0.8rem',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--pixelated-font), monospace'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className={styles.chartContainer}>
        <div className={styles.lineChart}>
          {/* Line chart SVG */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
          >
            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((line) => (
              <line
                key={`line-${line}`}
                x1="0"
                y1={50 - (line / 2)}
                x2="100"
                y2={50 - (line / 2)}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="0.2"
                strokeDasharray="1,1"
              />
            ))}
            
            {/* Vertical grid lines */}
            {[0, 25, 50, 75, 100].map((line) => (
              <line
                key={`vline-${line}`}
                x1={line}
                y1="0"
                x2={line}
                y2="50"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="0.2"
                strokeDasharray="1,1"
              />
            ))}
            
            {/* Area under reward curve */}
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 1 }}
              d={`
                M0,${50 - ((chartData[0].assets / maxValue) * 50)} 
                ${chartData.map((d: any, i: number) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 50 - ((d.assets / maxValue) * 50);
                  return `L${x},${y}`;
                }).join(' ')}
                L100,50 L0,50 Z
              `}
              fill="white"
            />
            
            {/* Reward Line - solid */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d={`
                M0,${50 - ((chartData[0].assets / maxValue) * 50)} 
                ${chartData.map((d: any, i: number) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 50 - ((d.assets / maxValue) * 50);
                  return `L${x},${y}`;
                }).join(' ')}
              `}
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="square"
            />
            
            {/* Loss Line - dashed */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
              d={`
                M0,${50 - ((chartData[0].debt / maxValue) * 50)} 
                ${chartData.map((d: any, i: number) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 50 - ((d.debt / maxValue) * 50);
                  return `L${x},${y}`;
                }).join(' ')}
              `}
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="2,2"
              strokeLinecap="square"
            />
            
            {/* Data points - Reward */}
            {chartData.map((d: any, i: number) => {
              const x = (i / (chartData.length - 1)) * 100;
              const y = 50 - ((d.assets / maxValue) * 50);
              return (
                <motion.rect
                  key={`point-reward-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPoint === i ? 1 : 0.7 }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                  x={x - 1}
                  y={y - 1}
                  width={2}
                  height={2}
                  fill="white"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
            
            {/* Data points - Loss */}
            {chartData.map((d: any, i: number) => {
              const x = (i / (chartData.length - 1)) * 100;
              const y = 50 - ((d.debt / maxValue) * 50);
              return (
                <motion.rect
                  key={`point-debt-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPoint === i ? 1 : 0.7 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.02 }}
                  x={x - 1}
                  y={y - 1}
                  width={2}
                  height={2}
                  fill="white"
                  stroke={hoveredPoint === i ? "white" : "none"}
                  strokeWidth="0.5"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
            
            {/* Tooltip */}
            {hoveredPoint !== null && (
              <g>
                {/* Reward tooltip */}
                <rect
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100 - 14, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].assets / maxValue) * 50) - 15, 5)}
                  width="28"
                  height="10"
                  rx="0"
                  fill="black"
                  stroke="white"
                  strokeWidth="0.5"
                />
                <text
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].assets / maxValue) * 50) - 8, 12)}
                  fontSize="3"
                  textAnchor="middle"
                  fill="white"
                  fontFamily="monospace"
                >
                  {formatReward(chartData[hoveredPoint].assets)}
                </text>
                
                {/* Loss tooltip */}
                <rect
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100 - 14, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].debt / maxValue) * 50) - 15, 5)}
                  width="28"
                  height="10"
                  rx="0"
                  fill="black"
                  stroke="white"
                  strokeWidth="0.5"
                />
                <text
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].debt / maxValue) * 50) - 8, 12)}
                  fontSize="3"
                  textAnchor="middle"
                  fill="white"
                  fontFamily="monospace"
                >
                  {formatReward(chartData[hoveredPoint].debt)}
                </text>
              </g>
            )}
          </svg>
        </div>
        
        {/* Time labels and chart legend */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '16px',
          fontSize: '0.8rem',
          fontFamily: 'var(--pixelated-font), monospace',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              color: 'white'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: 'white'
              }}></div>
              <div>Reward</div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              color: 'white' 
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                border: '1px dashed white'
              }}></div>
              <div>Loss</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {viewMode === 'daily' ? 'LAST 24 HRS' : '12-MONTH PROJ'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance; 