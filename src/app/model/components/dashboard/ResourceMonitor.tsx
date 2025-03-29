"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';
import { getDashboardDailyData, getDashboardYearlyData } from '../../data/mockData';

interface ResourceMonitorProps {
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

// Usage metrics
const usageMetrics = [
  {
    id: 'gpu',
    name: 'GPU Usage',
    value: 76,
    limit: 100,
    explanation: 'Current GPU utilization as a percentage'
  },
  {
    id: 'memory',
    name: 'Memory',
    value: 42,
    limit: 64,
    explanation: 'RAM usage in GB'
  },
  {
    id: 'storage',
    name: 'Storage',
    value: 512,
    limit: 1000,
    explanation: 'Storage usage in GB'
  },
  {
    id: 'budget',
    name: 'Budget',
    value: 720,
    limit: 1000,
    explanation: 'Current spending as a percentage of allocated budget'
  }
];

const ResourceMonitor: React.FC<ResourceMonitorProps> = ({ viewMode }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      const newData = viewMode === 'daily' 
        ? getDashboardDailyData()
        : getDashboardYearlyData();
      
      setData(newData);
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [viewMode]);

  if (isLoading || !data) {
    return (
      <div>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            Resource Monitor
          </h3>
        </div>
        <div style={{ 
          height: '180px',
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

  return (
    <div>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TooltipWrapper explanation="Monitoring of compute resources used by model training">
            Resource Monitor
          </TooltipWrapper>
        </h3>
        <div className={styles.viewAll}>
          ALL RESOURCES <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      <div className={styles.resourcesGrid}>
        {usageMetrics.map((metric, index) => {
          const percentage = (metric.value / metric.limit) * 100;
          const isOverBudget = percentage > 72;
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={styles.tooltipTrigger}
              style={{ 
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '16px'
              }}
            >
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ 
                  fontFamily: 'var(--pixelated-font), monospace',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {metric.name}
                </div>
                <div className={`${isOverBudget ? styles.overBudget : ''}`} style={{ 
                  fontFamily: 'var(--pixelated-font), monospace',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  {metric.value}/{metric.limit}
                  {metric.id === 'budget' && isOverBudget && (
                    <span style={{ marginLeft: '4px' }}>!</span>
                  )}
                </div>
              </div>
              
              {/* Usage bar */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ 
                  height: '20px',
                  width: '100%',
                  border: '1px solid white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                    style={{ 
                      height: '100%',
                      background: isOverBudget ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  />
                  
                  {/* Tick marks */}
                  {[25, 50, 75].map(tick => (
                    <div
                      key={`tick-${tick}`}
                      style={{
                        position: 'absolute',
                        left: `${tick}%`,
                        top: 0,
                        height: '100%',
                        width: '1px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        zIndex: 2
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                fontFamily: 'var(--pixelated-font), monospace'
              }}>
                <div style={{ opacity: 0.7 }}>
                  {percentage.toFixed(0)}%
                </div>
                <div style={{ 
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {isOverBudget ? 'HIGH USAGE' : 'NORMAL'}
                </div>
              </div>
              
              <div className={styles.tooltip}>
                {metric.explanation}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceMonitor; 