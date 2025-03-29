import React from 'react';
import { motion } from 'framer-motion';
import styles from '../plan.module.css';

interface RevenueCardProps {
  emoji: string;
  title: string;
  description: string;
  marketData?: string;
  citation?: string;
}

const RevenueCard = ({ emoji, title, description, marketData, citation }: RevenueCardProps) => {
  return (
    <motion.div 
      className={styles.revenueCard}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <div className={styles.emoji}>{emoji}</div>
      <h3 className={styles.revenueTitle}>{title}</h3>
      <p className={styles.revenueDescription}>{description}</p>
      {marketData && <p className={styles.marketData}>{marketData}</p>}
      {citation && (
        <div className={styles.citationBox}>
          <p className={styles.citationText}>{citation}</p>
        </div>
      )}
    </motion.div>
  );
};

export default RevenueCard; 