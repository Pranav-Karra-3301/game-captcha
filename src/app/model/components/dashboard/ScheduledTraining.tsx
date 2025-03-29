"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';

interface ScheduledTrainingProps {
  viewMode: 'daily' | 'yearly';
}

// Tooltip component
const TooltipWrapper = ({ children, explanation }: { children: React.ReactNode, explanation: string }) => {
  return (
    <div className={styles.tooltipTrigger}>
      {children}
      <span className={styles.infoIcon}>ⓘ</span>
      <div className={styles.tooltip}>{explanation}</div>
    </div>
  );
};

// Mock data for scheduled training
const scheduledTrainingData = [
  {
    id: 1,
    name: "DQN Epsilon Schedule Update",
    amount: 125.99,
    date: "Apr 10",
    category: "DQN",
    progress: 65,
  },
  {
    id: 2,
    name: "Batch Normalization Training",
    amount: 49.99,
    date: "Apr 12",
    category: "Optimization",
    progress: 45,
  },
  {
    id: 3,
    name: "Double Q-Learning Batch",
    amount: 29.99,
    date: "Apr 14",
    category: "Q-Learning",
    progress: 32,
  },
  {
    id: 4,
    name: "RND Exploration Run",
    amount: 18.99,
    date: "Apr 15",
    category: "Exploration",
    progress: 20,
  }
];

// Mock data for yearly projected training
const yearlyTrainingData = [
  {
    id: 1,
    name: "Full Environment Suite",
    amount: 4200.00,
    date: "Yearly Allocation",
    category: "Environment",
    progress: 75,
  },
  {
    id: 2,
    name: "Distributed Training Pipeline",
    amount: 1299.99,
    date: "Annual Budget",
    category: "Compute",
    progress: 60,
  },
  {
    id: 3,
    name: "Hyperparameter Optimization",
    amount: 799.99,
    date: "Quarterly Sweeps",
    category: "Tuning",
    progress: 90,
  },
  {
    id: 4,
    name: "Neural Architecture Search",
    amount: 2499.99,
    date: "Biannual Runs",
    category: "Architecture",
    progress: 85,
  },
  {
    id: 5,
    name: "Transfer Learning Projects",
    amount: 899.95,
    date: "Multi-Environment",
    category: "Transfer",
    progress: 40,
  }
];

const ScheduledTraining: React.FC<ScheduledTrainingProps> = ({ viewMode }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    
    return () => clearTimeout(timer);
  }, [viewMode]);
  
  const data = viewMode === 'daily' ? scheduledTrainingData : yearlyTrainingData;
  
  // Format compute units
  const formatCompute = (amount: number) => {
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CU`;
  };

  if (isLoading) {
    return (
      <div className={styles.dashboardItem}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {viewMode === 'daily' ? 'Upcoming Training' : 'Annual Training Plan'}
          </h3>
        </div>
        <div className={`${styles.loadingPlaceholder}`} style={{ height: '180px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TooltipWrapper explanation="Shows planned and scheduled training sessions for the reinforcement learning model">
            {viewMode === 'daily' ? 'Upcoming Training' : 'Annual Training Plan'}
          </TooltipWrapper>
        </h3>
        <div className={styles.viewAll}>
          View all <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      <div className={styles.recurringGrid}>
        {data.map((item, index) => (
          <motion.div
            key={item.id}
            className={styles.recurringCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <div className={styles.recurringHeader}>
              <div>
                <div className={styles.recurringTitle}>
                  <TooltipWrapper explanation={`Training session focused on ${item.category}`}>
                    {item.name}
                  </TooltipWrapper>
                </div>
                <div className={styles.recurringDate}>
                  <TooltipWrapper explanation={viewMode === 'daily' ? 'Scheduled date' : 'Planning timeframe'}>
                    {item.date}
                  </TooltipWrapper> • 
                  <TooltipWrapper explanation="Training category">
                    {item.category}
                  </TooltipWrapper>
                </div>
              </div>
              <div className={styles.recurringAmount}>
                <TooltipWrapper explanation="Estimated compute units required">
                  {formatCompute(item.amount)}
                </TooltipWrapper>
              </div>
            </div>
            
            <div className={styles.recurringProgress}>
              <div className={styles.recurringProgressText}>
                <span>
                  <TooltipWrapper explanation="Percentage of preparation completed for this training session">
                    {item.progress}% complete
                  </TooltipWrapper>
                </span>
                <span>
                  <TooltipWrapper explanation={viewMode === 'daily' ? 'Will execute soon' : 'Part of annual training plan'}>
                    {viewMode === 'daily' ? 'Runs Soon' : 'Annual Phase'}
                  </TooltipWrapper>
                </span>
              </div>
              <div className={styles.progressContainer} style={{ width: '100%', height: '6px' }}>
                <motion.div
                  className={styles.progressBar}
                  style={{ backgroundColor: '#ff9966' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                ></motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ScheduledTraining; 