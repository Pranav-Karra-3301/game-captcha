import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from '../plan.module.css';

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
}

const SectionHeader = ({ icon, title }: SectionHeaderProps) => {
  return (
    <motion.div 
      className={styles.sectionHeader}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <span className={styles.sectionIcon}>{icon}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
    </motion.div>
  );
};

export default SectionHeader; 