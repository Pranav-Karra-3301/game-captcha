"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';
import { getDashboardDailyData, getDashboardYearlyData } from '../../data/mockData';

interface ComputationalResourcesProps {
  viewMode: 'daily' | 'yearly';
}

const ComputationalResources: React.FC<ComputationalResourcesProps> = ({ viewMode }) => {
  const [data, setData] = useState<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
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
    }, 300);
    
    return () => clearTimeout(timer);
  }, [viewMode]);

  if (isLoading || !data) {
    return (
      <div className={styles.dashboardItem}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {viewMode === 'daily' ? 'Computational Resource Usage' : 'Annual Computational Projection'}
          </h3>
        </div>
        <div className={`${styles.loadingPlaceholder}`} style={{ height: '240px' }}></div>
      </div>
    );
  }

  const chartData = viewMode === 'daily' 
    ? data.spending.data
    : data.spending.data;
  
  const total = data.spending.total;
  const budgeted = data.spending.budgeted;
  const overBudget = data.spending.overBudget;
  
  // Calculate points for the line chart
  const maxAmount = Math.max(...chartData.map((d: any) => d.amount)) * 1.1;
  
  // Format compute units
  const formatCompute = (amount: number) => {
    return `${amount.toLocaleString()} CU`;
  };

  return (
    <div>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          {viewMode === 'daily' ? 'Computational Resource Usage' : 'Annual Computational Projection'}
        </h3>
        <div className={styles.viewAll}>
          View details <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      <div>
        <motion.div 
          className={styles.spendingAmount}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {formatCompute(total)}
        </motion.div>
        <div className={styles.budgetInfo}>
          {formatCompute(budgeted)} allocated
        </div>
        <motion.div 
          className={styles.overBudget}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {formatCompute(overBudget)} over allocation
        </motion.div>
      </div>
      
      <div className={styles.chartContainer}>
        {/* Chart area */}
        <div className={styles.lineChart}>
          {/* Line chart SVG */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="spending-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ff6b6b" stopOpacity="1" />
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
            
            {/* Budget line */}
            <line
              x1="0"
              y1={50 - ((budgeted / maxAmount) * 50)}
              x2="100"
              y2={50 - ((budgeted / maxAmount) * 50)}
              stroke="#4cd964"
              strokeWidth="0.5"
              strokeDasharray="1,1"
            />
            
            {/* Area under curve */}
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 1 }}
              d={`
                M0,50 
                ${chartData.map((d: any, i: number) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 50 - ((d.amount / maxAmount) * 50);
                  return `L${x},${y}`;
                }).join(' ')} 
                L100,50 Z
              `}
              fill="url(#spending-gradient)"
            />
            
            {/* Spending line */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d={`
                M0,${50 - ((chartData[0].amount / maxAmount) * 50)} 
                ${chartData.map((d: any, i: number) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 50 - ((d.amount / maxAmount) * 50);
                  return `L${x},${y}`;
                }).join(' ')}
              `}
              fill="none"
              stroke="url(#spending-gradient)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
            
            {/* Data points */}
            {chartData.map((d: any, i: number) => {
              const x = (i / (chartData.length - 1)) * 100;
              const y = 50 - ((d.amount / maxAmount) * 50);
              return (
                <motion.circle
                  key={`point-${i}`}
                  initial={{ opacity: 0, r: 0 }}
                  animate={{ opacity: hoveredPoint === i ? 1 : 0.3, r: hoveredPoint === i ? 1.5 : 0.8 }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                  cx={x}
                  cy={y}
                  fill={hoveredPoint === i ? "#ff6b6b" : "#ffffff"}
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
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100 - 10, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].amount / maxAmount) * 50) - 15, 5)}
                  width="20"
                  height="10"
                  rx="2"
                  fill="rgba(0, 0, 0, 0.8)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="0.2"
                />
                <text
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].amount / maxAmount) * 50) - 8, 12)}
                  fontSize="3"
                  textAnchor="middle"
                  fill="#ffffff"
                >
                  {formatCompute(chartData[hoveredPoint].amount)}
                </text>
              </g>
            )}
          </svg>
          
          {/* Glow effect */}
          <div className={`${styles.chartGlow} ${styles.redGlow}`}></div>
        </div>
      </div>
    </div>
  );
};

export default ComputationalResources; 