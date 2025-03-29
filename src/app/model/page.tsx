"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import ComputationalResources from './components/dashboard/ComputationalResources';
import ModelPerformance from './components/dashboard/ModelPerformance';
import TrainingSessions from './components/dashboard/TrainingSessions';

export default function ModelPage() {
  const [viewMode, setViewMode] = useState<'daily' | 'yearly'>('daily');
  
  // Current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <div className={styles.dashboard}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>
          <Link href="/" className={styles.backLink}>
            <span className={styles.backIcon}>←</span>
          </Link>
          Space Trainer AI Dashboard
        </h1>
        <div className={styles.dateDisplay}>{currentDate}</div>
      </div>
      
  
      {/* View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className={styles.description} style={{ margin: 0, maxWidth: '70%' }}>
          <h2>{viewMode === 'daily' ? 'Deep Q-Network Training Dashboard' : 'Yearly DQN Performance Projection'}</h2>
        </div>
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewToggleButton} ${viewMode === 'daily' ? styles.viewToggleButtonActive : ''}`}
            onClick={() => setViewMode('daily')}
          >
            Daily View
          </button>
          <button 
            className={`${styles.viewToggleButton} ${viewMode === 'yearly' ? styles.viewToggleButtonActive : ''}`}
            onClick={() => setViewMode('yearly')}
          >
            Yearly Projection
          </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Description Text */}
          <div className={styles.description} style={{ marginBottom: '30px', textAlign: 'center', fontSize: '1.2rem' }}>
            <p>
              {viewMode === 'daily' 
                ? 'This dashboard provides detailed metrics on our Deep Q-Network (DQN) model\'s performance over the last 24 hours of training. DQN combines Q-learning with deep neural networks to learn optimal policies directly from high-dimensional sensory inputs.'
                : 'View projected performance metrics if the current DQN training regime continues for an entire year. This projection shows estimated reward growth, Q-function convergence, exploration policy performance, and resource utilization over a 12-month period.'}
            </p>
            {viewMode === 'yearly' && (
              <div className={styles.projectionNote} style={{ fontSize: '1.2rem' }}>
                Note: These projections are based on ReCaptcha training history and represent simulated data for demonstration purposes.
              </div>
            )}
            <div className={styles.staticNotice} style={{ fontSize: '1.2rem' }}>
              This is a static dashboard with data loaded from CSV files. Values do not update in real-time.
            </div>
          </div>

          {/* DeepQ Image */}
          <div style={{ textAlign: 'center', marginBottom: '24px', width: '100%' }}>
            <Image 
              src="/deepq.png" 
              alt="Deep Q-Network Visualization" 
              width={600} 
              height={300} 
              style={{ width: '100%', height: 'auto', maxWidth: '900px' }}
            />
          </div>
      
          {/* Main Dashboard Layout */}
          <div className={styles.dashboardGrid}>
            {/* Top row: Computational resources and Model performance charts */}
            <div className={styles.dashboardItem}>
              <ComputationalResources viewMode={viewMode} />
            </div>
            
            <div className={styles.dashboardItem}>
              <ModelPerformance viewMode={viewMode} />
            </div>
            
            {/* TrainingSessions table (replacing TrainingCategories) */}
            <div className={`${styles.dashboardItem} ${styles.fullWidth}`}>
              <TrainingSessions viewMode={viewMode} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}