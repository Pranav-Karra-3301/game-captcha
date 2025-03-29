"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';
import { getDashboardDailyData, getDashboardYearlyData } from '../../data/mockData';

interface TrainingCategoriesProps {
  viewMode: 'daily' | 'yearly';
}

// Category icons with colors
const categoryIcons: Record<string, { icon: string; color: string }> = {
  "Exploration": { icon: "🔍", color: "#9966ff" },
  "Q-Learning": { icon: "📊", color: "#ff6b6b" },
  "Policy Gradient": { icon: "📈", color: "#ff9966" },
  "Experience Replay": { icon: "🔄", color: "#66a6ff" },
  "Parameter Updates": { icon: "⚙️", color: "#4cd964" },
  "Environment Steps": { icon: "🌐", color: "#ffcc66" },
};

const TrainingCategories: React.FC<TrainingCategoriesProps> = ({ viewMode }) => {
  const [data, setData] = useState<any>(null);
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
    }, 500);
    
    return () => clearTimeout(timer);
  }, [viewMode]);

  if (isLoading || !data) {
    return (
      <div className={styles.dashboardItem}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {viewMode === 'daily' ? 'Training Categories' : 'Yearly Training Breakdown'}
          </h3>
        </div>
        <div className={`${styles.loadingPlaceholder}`} style={{ height: '240px' }}></div>
      </div>
    );
  }

  const categories = data.categories;
  
  // Format values
  const formatValue = (amount: number) => {
    return amount.toLocaleString();
  };

  return (
    <div>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          {viewMode === 'daily' ? 'Training Categories' : 'Yearly Training Breakdown'}
        </h3>
        <div className={styles.viewAll}>
          View all <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      <div className={styles.categoriesList}>
        {categories.map((category: any, index: number) => {
          const percentage = Math.min(100, (category.amount / category.budget) * 100);
          const isOverBudget = category.amount > category.budget;
          
          return (
            <motion.div 
              key={category.name}
              className={styles.categoryItem}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className={styles.categoryInfo}>
                <div className={styles.categoryIcon} style={{ backgroundColor: `${categoryIcons[category.name]?.color}20` }}>
                  <span>{categoryIcons[category.name]?.icon || '📊'}</span>
                </div>
                <div>
                  <div className={styles.categoryName}>{category.name}</div>
                  <div className={styles.categoryBudget}>Target: {formatValue(category.budget)}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className={styles.categoryAmount}>{formatValue(category.amount)}</div>
                <div className={styles.progressContainer}>
                  <motion.div 
                    className={`${styles.progressBar} ${isOverBudget ? styles.progressOverBudget : styles.progressUnderBudget}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainingCategories; 