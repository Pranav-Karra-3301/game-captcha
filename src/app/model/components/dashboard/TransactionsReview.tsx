"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';
import { getDashboardDailyData } from '../../data/mockData';

interface TrainingSessionsProps {
  viewMode: 'daily' | 'yearly';
}

// Category colors for session badges
const categoryColors: Record<string, string> = {
  "DQN": "#ff6b6b",
  "TUNING": "#9966ff",
  "ENV": "#66a6ff",
  "VALID": "#4cd964",
  "EVAL": "#ff9966",
  "NETWORK": "#ffcc66",
  "ANALYSIS": "#6695ff",
};

const TrainingSessions: React.FC<TrainingSessionsProps> = ({ viewMode }) => {
  const [data, setData] = useState<any>(null);
  const [checkedSessions, setCheckedSessions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data based on view mode
  useEffect(() => {
    setIsLoading(true);
    
    // Add a slight delay to simulate data loading
    const timer = setTimeout(() => {
      const newData = getDashboardDailyData(); // Only daily data has sessions
      setData(newData);
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [viewMode]);

  const toggleSession = (id: number) => {
    setCheckedSessions(prev => 
      prev.includes(id) 
        ? prev.filter(sessionId => sessionId !== id)
        : [...prev, id]
    );
  };

  if (isLoading || !data || viewMode === 'yearly') {
    return (
      <div className={styles.dashboardItem}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {viewMode === 'daily' ? 'Recent Training Sessions' : 'Training Sessions Summary'}
          </h3>
        </div>
        <div className={`${styles.loadingPlaceholder}`} style={{ height: '240px' }}></div>
      </div>
    );
  }

  const { yesterday, march26, march25 } = data.transactions;
  
  // Format values
  const formatValue = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          Recent Training Sessions
        </h3>
        <div className={styles.viewAll}>
          View all <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      <div className={styles.transactionsSection}>
        <div className={styles.sectionTitle}>YESTERDAY</div>
        
        {yesterday.map((session: any, index: number) => (
          <motion.div 
            key={session.id}
            className={styles.transactionItem}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className={styles.transactionInfo}>
              <motion.div 
                className={styles.checkbox} 
                onClick={() => toggleSession(session.id)}
                whileTap={{ scale: 0.9 }}
                style={{ 
                  backgroundColor: checkedSessions.includes(session.id) ? '#4cd964' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {checkedSessions.includes(session.id) && "✓"}
              </motion.div>
              
              <div className={styles.transactionDetails}>
                <div className={styles.transactionName}>{session.name}</div>
                <div 
                  className={styles.transactionCategory}
                  style={{ backgroundColor: `${categoryColors[session.category]}40` }}
                >
                  {session.category}
                </div>
              </div>
            </div>
            
            <div className={styles.transactionAmount}>
              {formatValue(session.amount)}
            </div>
          </motion.div>
        ))}
        
        <div className={styles.sectionTitle} style={{ marginTop: '16px' }}>WED, MARCH 26</div>
        
        {march26.map((session: any, index: number) => (
          <motion.div 
            key={session.id}
            className={styles.transactionItem}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
          >
            <div className={styles.transactionInfo}>
              <motion.div 
                className={styles.checkbox} 
                onClick={() => toggleSession(session.id)}
                whileTap={{ scale: 0.9 }}
                style={{ 
                  backgroundColor: checkedSessions.includes(session.id) ? '#4cd964' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {checkedSessions.includes(session.id) && "✓"}
              </motion.div>
              
              <div className={styles.transactionDetails}>
                <div className={styles.transactionName}>{session.name}</div>
                <div 
                  className={styles.transactionCategory}
                  style={{ backgroundColor: `${categoryColors[session.category]}40` }}
                >
                  {session.category}
                </div>
              </div>
            </div>
            
            <div className={styles.transactionAmount}>
              {formatValue(session.amount)}
            </div>
          </motion.div>
        ))}
        
        <div className={styles.sectionTitle} style={{ marginTop: '16px' }}>TUE, MARCH 25</div>
        
        {march25.map((session: any, index: number) => (
          <motion.div 
            key={session.id}
            className={styles.transactionItem}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
          >
            <div className={styles.transactionInfo}>
              <motion.div 
                className={styles.checkbox} 
                onClick={() => toggleSession(session.id)}
                whileTap={{ scale: 0.9 }}
                style={{ 
                  backgroundColor: checkedSessions.includes(session.id) ? '#4cd964' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {checkedSessions.includes(session.id) && "✓"}
              </motion.div>
              
              <div className={styles.transactionDetails}>
                <div className={styles.transactionName}>{session.name}</div>
                <div 
                  className={styles.transactionCategory}
                  style={{ backgroundColor: `${categoryColors[session.category]}40` }}
                >
                  {session.category}
                </div>
              </div>
            </div>
            
            <div className={styles.transactionAmount}>
              {formatValue(session.amount)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrainingSessions; 