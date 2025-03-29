"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';
import { getDashboardDailyData, getDashboardYearlyData } from '../../data/mockData';

interface ModelPerformanceProps {
  viewMode: 'daily' | 'yearly';
}

const ModelPerformance: React.FC<ModelPerformanceProps> = ({ viewMode }) => {
  const [data, setData] = useState<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'1W' | '1M' | 'YTD' | '3M' | '1Y' | 'ALL'>('1M');
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
      <div className={styles.dashboardItem}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {viewMode === 'daily' ? 'DQN Model Performance' : 'Yearly Performance Projection'}
          </h3>
        </div>
        <div className={`${styles.loadingPlaceholder}`} style={{ height: '240px' }}></div>
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
          {viewMode === 'daily' ? 'DQN Model Performance' : 'Yearly Performance Projection'}
        </h3>
        <div className={styles.viewAll}>
          View all <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      {/* Reward and Loss summary */}
      <div className={styles.metricsContainer}>
        <motion.div 
          className={styles.metricBox}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.metricLabel}>• Reward</div>
          <div className={styles.metricValue}>{formatReward(rewardValue)}</div>
          <div className={`${styles.metricChange} ${styles.positive}`}>
            {rewardGrowth}%
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.metricBox}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={styles.metricLabel}>• Loss</div>
          <div className={styles.metricValue}>{formatReward(lossValue)}</div>
          <div className={`${styles.metricChange} ${styles.negative}`}>
            {lossDecrease}%
          </div>
        </motion.div>
      </div>
      
      {/* Time range selector */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        marginBottom: '16px',
        fontSize: '0.8rem'
      }}>
        {(['1W', '1M', 'YTD', '3M', '1Y', 'ALL'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === tab ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '0.8rem'
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
            {/* Gradients */}
            <defs>
              <linearGradient id="reward-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4cd964" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#4cd964" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="loss-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff9966" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ff9966" stopOpacity="1" />
              </linearGradient>
            </defs>
            
            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((line) => (
              <line
                key={`line-${line}`}
                x1="0"
                y1={50 - (line / 2)}
                x2="100"
                y2={50 - (line / 2)}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="0.2"
              />
            ))}
            
            {/* Reward Line */}
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
              stroke="url(#reward-gradient)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
            
            {/* Loss Line */}
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
              stroke="url(#loss-gradient)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
            
            {/* Data points - Reward */}
            {chartData.map((d: any, i: number) => {
              const x = (i / (chartData.length - 1)) * 100;
              const y = 50 - ((d.assets / maxValue) * 50);
              return (
                <motion.circle
                  key={`point-reward-${i}`}
                  initial={{ opacity: 0, r: 0 }}
                  animate={{ opacity: hoveredPoint === i ? 1 : 0.3, r: hoveredPoint === i ? 1.5 : 0.8 }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                  cx={x}
                  cy={y}
                  fill={hoveredPoint === i ? "#4cd964" : "#ffffff"}
                  stroke={hoveredPoint === i ? "#ffffff" : "none"}
                  strokeWidth="0.2"
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
                <motion.circle
                  key={`point-loss-${i}`}
                  initial={{ opacity: 0, r: 0 }}
                  animate={{ opacity: hoveredPoint === i ? 1 : 0.3, r: hoveredPoint === i ? 1.5 : 0.8 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.02 }}
                  cx={x}
                  cy={y}
                  fill={hoveredPoint === i ? "#ff9966" : "#ffffff"}
                  stroke={hoveredPoint === i ? "#ffffff" : "none"}
                  strokeWidth="0.2"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
            
            {/* Tooltip */}
            {hoveredPoint !== null && (
              <g>
                <rect
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100 - 12, 10), 76)}
                  y={Math.max(50 - ((chartData[hoveredPoint].assets / maxValue) * 50) - 15, 5)}
                  width="24"
                  height="14"
                  rx="2"
                  fill="rgba(0, 0, 0, 0.8)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="0.2"
                />
                <text
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].assets / maxValue) * 50) - 10, 10)}
                  fontSize="2.5"
                  textAnchor="middle"
                  fill="#4cd964"
                >
                  R: {formatReward(chartData[hoveredPoint].assets)}
                </text>
                <text
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].assets / maxValue) * 50) - 6, 14)}
                  fontSize="2.5"
                  textAnchor="middle"
                  fill="#ff9966"
                >
                  L: {formatReward(chartData[hoveredPoint].debt)}
                </text>
              </g>
            )}
          </svg>
          
          {/* Glow effects */}
          <div className={`${styles.chartGlow} ${styles.greenGlow}`} style={{ bottom: '30px' }}></div>
          <div className={`${styles.chartGlow} ${styles.redGlow}`} style={{ bottom: '10px', opacity: 0.5 }}></div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance; 