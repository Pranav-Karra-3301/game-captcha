"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';
import { getDashboardDailyData, getDashboardYearlyData } from '../../data/mockData';

interface ComputationalResourcesProps {
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
      <div>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {viewMode === 'daily' ? 'Computational Resource Usage' : 'Annual Computational Projection'}
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
          <TooltipWrapper explanation="Shows the usage of GPU/CPU time in Compute Units (CU) for training the Deep Q-Network model">
            {viewMode === 'daily' ? 'Computational Resource Usage' : 'Annual Computational Projection'}
          </TooltipWrapper>
        </h3>
        <div className={styles.viewAll}>
          DETAILS <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.spendingAmount}>
            <TooltipWrapper explanation="Total compute units utilized by the reinforcement learning model">
              {formatCompute(total)}
            </TooltipWrapper>
          </div>
          <div className={styles.budgetInfo}>
            <TooltipWrapper explanation="Pre-allocated computational budget for this training period">
              {formatCompute(budgeted)} ALLOCATED
            </TooltipWrapper>
          </div>
          <motion.div 
            className={styles.overBudget}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <TooltipWrapper explanation="Amount of compute that exceeded the allocated budget">
              {formatCompute(overBudget)} OVER ALLOCATION
            </TooltipWrapper>
          </motion.div>
        </motion.div>
        
        <div style={{
          padding: '8px 16px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--pixelated-font), monospace'
        }}>
          <span style={{ fontSize: '1.2rem' }}>!</span>
          <span>OVER BUDGET: {((overBudget / budgeted) * 100).toFixed(1)}%</span>
        </div>
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
            
            {/* Budget line */}
            <line
              x1="0"
              y1={50 - ((budgeted / maxAmount) * 50)}
              x2="100"
              y2={50 - ((budgeted / maxAmount) * 50)}
              stroke="white"
              strokeWidth="0.5"
              strokeDasharray="3,2"
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
              fill="white"
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
              stroke="white"
              strokeWidth="1"
              strokeLinecap="square"
            />
            
            {/* Data points */}
            {chartData.map((d: any, i: number) => {
              const x = (i / (chartData.length - 1)) * 100;
              const y = 50 - ((d.amount / maxAmount) * 50);
              return (
                <motion.rect
                  key={`point-${i}`}
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
            
            {/* Tooltip */}
            {hoveredPoint !== null && (
              <g>
                <rect
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100 - 10, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].amount / maxAmount) * 50) - 15, 5)}
                  width="25"
                  height="10"
                  rx="0"
                  fill="black"
                  stroke="white"
                  strokeWidth="0.5"
                />
                <text
                  x={Math.min(Math.max((hoveredPoint / (chartData.length - 1)) * 100, 10), 80)}
                  y={Math.max(50 - ((chartData[hoveredPoint].amount / maxAmount) * 50) - 8, 12)}
                  fontSize="3"
                  textAnchor="middle"
                  fill="white"
                  fontFamily="monospace"
                >
                  {formatCompute(chartData[hoveredPoint].amount)}
                </text>
              </g>
            )}
          </svg>
        </div>
        
        {/* Time labels */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '8px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.7)',
          fontFamily: 'var(--pixelated-font), monospace',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <div>{viewMode === 'daily' ? '00:00' : 'Jan'}</div>
          <div>{viewMode === 'daily' ? '06:00' : 'Apr'}</div>
          <div>{viewMode === 'daily' ? '12:00' : 'Jul'}</div>
          <div>{viewMode === 'daily' ? '18:00' : 'Oct'}</div>
          <div>{viewMode === 'daily' ? '23:59' : 'Dec'}</div>
        </div>
      </div>
    </div>
  );
};

export default ComputationalResources; 