"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';
import { getDashboardDailyData, getDashboardYearlyData } from '../../data/mockData';

interface TrainingCategoriesProps {
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

// Category icons with names 
const categoryIcons: Record<string, { icon: string; explanation: string }> = {
  "Exploration": { 
    icon: "EXP", 
    explanation: "Resources used for exploration phases where the agent tries new strategies and discovers environment dynamics."
  },
  "Q-Learning": { 
    icon: "Q-L", 
    explanation: "Computational resources dedicated to updating Q-values in the network based on experience."
  },
  "Policy Gradient": { 
    icon: "POL", 
    explanation: "Resources used for policy-based optimization, complementing the value-based Q-learning approach."
  },
  "Experience Replay": { 
    icon: "MEM", 
    explanation: "Resources used for storing, sampling, and processing past experiences to improve learning efficiency."
  },
  "Parameter Updates": { 
    icon: "PAR", 
    explanation: "Compute spent on updating neural network parameters through backpropagation."
  },
  "Environment Steps": { 
    icon: "ENV", 
    explanation: "Resources allocated to running environment simulations and processing agent-environment interactions."
  },
};

const TrainingCategories: React.FC<TrainingCategoriesProps> = ({ viewMode }) => {
  const [data, setData] = useState<any>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trendDataCache, setTrendDataCache] = useState<Record<string, number[]>>({});

  // Load data based on view mode
  useEffect(() => {
    setIsLoading(true);
    
    // Add a slight delay to simulate data loading
    const timer = setTimeout(() => {
      const newData = viewMode === 'daily' 
        ? getDashboardDailyData()
        : getDashboardYearlyData();
      
      setData(newData);
      
      // Generate trend data for all categories at once
      const newTrendDataCache: Record<string, number[]> = {};
      if (newData && newData.categories) {
        newData.categories.forEach((category: any, index: number) => {
          newTrendDataCache[category.name] = generateTrendData(category, index);
        });
      }
      setTrendDataCache(newTrendDataCache);
      
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [viewMode]);

  if (isLoading || !data) {
    return (
      <div>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {viewMode === 'daily' ? 'Training Categories' : 'Yearly Training Breakdown'}
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

  const categories = data.categories;
  
  // Format values
  const formatValue = (amount: number) => {
    return amount.toLocaleString();
  };

  // Generate trend data points with deterministic values
  const generateTrendData = (category: any, index: number) => {
    const points = [];
    const baseValue = category.amount * 0.4;
    
    for (let i = 0; i < 10; i++) {
      // Create a smooth curve that ends at the current amount
      const progress = i / 9;
      let value;
      
      if (progress < 0.7) {
        // More flat growth in the beginning
        value = baseValue + (category.amount - baseValue) * (progress * 0.7);
      } else {
        // Steeper growth at the end
        value = baseValue + (category.amount - baseValue) * (0.7 + (progress - 0.7) * 1.5);
      }
      
      // Add deterministic variation based on the index
      const variation = (i % 10) / 10 * 0.1 * category.amount * (progress + 0.5);
      value = Math.min(category.amount, value + variation - (variation / 2));
      
      points.push(value);
    }
    
    return points;
  };

  // Find max value for scaling
  const maxValue = Math.max(...categories.map((c: any) => c.budget));

  return (
    <div>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TooltipWrapper explanation="Breakdown of computational resources across different reinforcement learning training categories">
            {viewMode === 'daily' ? 'Training Categories' : 'Yearly Training Metrics'}
          </TooltipWrapper>
        </h3>
        <div className={styles.viewAll}>
          ALL CATEGORIES <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      {/* Category type summary */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'rgba(255, 255, 255, 0.7)', 
            marginBottom: '4px',
            fontFamily: 'var(--pixelated-font), monospace',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Total Categories
          </div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            fontFamily: 'var(--pixelated-font), monospace'
          }}>
            {categories.length}
          </div>
        </div>
        <div style={{ 
          padding: '8px 16px', 
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontSize: '0.9rem',
          fontFamily: 'var(--pixelated-font), monospace',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <TooltipWrapper explanation="Effective utilization of computing resources across training categories">
            {viewMode === 'daily' ? 'MONITORING COMPONENTS' : 'RESOURCE ALLOCATION'}
          </TooltipWrapper>
        </div>
      </div>
      
      <div className={styles.categoriesGrid}>
        {categories.map((category: any, index: number) => {
          // Use cached trend data instead of generating on each render
          const trendData = trendDataCache[category.name] || [];
          const isOver = category.amount > category.budget;
          
          return (
            <motion.div 
              key={category.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={styles.tooltipTrigger}
              style={{ 
                padding: '16px', 
                border: `1px solid ${hoveredCategory === category.name ? 'white' : 'rgba(255, 255, 255, 0.3)'}`,
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '12px', 
                gap: '10px',
                fontFamily: 'var(--pixelated-font), monospace'
              }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  border: '1px solid rgba(255, 255, 255, 0.5)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--pixelated-font), monospace',
                  fontWeight: 'bold'
                }}>
                  <span>{categoryIcons[category.name]?.icon || 'CAT'}</span>
                </div>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '0.95rem',
                  textTransform: 'uppercase', 
                  letterSpacing: '1px'
                }}>
                  {category.name}
                </div>
              </div>
              
              {/* Mini line chart */}
              <div style={{ 
                height: '60px', 
                position: 'relative', 
                marginBottom: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                padding: '4px'
              }}>
                <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                  {/* Budget line */}
                  <line
                    x1="0"
                    y1={50 - ((category.budget / maxValue) * 50)}
                    x2="100"
                    y2={50 - ((category.budget / maxValue) * 50)}
                    stroke="white"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                  
                  {/* Area under chart line */}
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
                    d={`
                      M0,${50 - ((trendData[0] / maxValue) * 50)} 
                      ${trendData.map((value, i) => {
                        const x = (i / (trendData.length - 1)) * 100;
                        const y = 50 - ((value / maxValue) * 50);
                        return `L${x},${y}`;
                      }).join(' ')}
                      L100,50 L0,50 Z
                    `}
                    fill="white"
                  />
                  
                  {/* Chart line */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                    d={`
                      M0,${50 - ((trendData[0] / maxValue) * 50)} 
                      ${trendData.map((value, i) => {
                        const x = (i / (trendData.length - 1)) * 100;
                        const y = 50 - ((value / maxValue) * 50);
                        return `L${x},${y}`;
                      }).join(' ')}
                    `}
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="square"
                  />
                  
                  {/* Final point */}
                  <motion.rect
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                    x={98}
                    y={50 - ((category.amount / maxValue) * 50) - 2}
                    width={4}
                    height={4}
                    fill="white"
                  />
                </svg>
              </div>
              
              {/* Stats row */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.9rem',
                fontFamily: 'var(--pixelated-font), monospace'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{formatValue(category.amount)} CU</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Current</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: 'white' }}>
                    {formatValue(category.budget)} CU
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Allocated</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div style={{ 
                height: '6px', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                marginTop: '12px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((category.amount / category.budget) * 100, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + (index * 0.1) }}
                  style={{
                    height: '100%',
                    backgroundColor: 'white'
                  }}
                />
              </div>
              
              {/* Over budget indicator */}
              {isOver && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 8px',
                  border: '1px solid white',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--pixelated-font), monospace',
                  textTransform: 'uppercase'
                }}>
                  OVER
                </div>
              )}
              
              {/* Tooltip */}
              <div className={styles.tooltip} style={{ width: '200px' }}>
                {categoryIcons[category.name]?.explanation || 'Training category'}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainingCategories; 