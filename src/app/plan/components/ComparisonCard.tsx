import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from '../plan.module.css';

interface ComparisonCardProps {
  title: string;
  titleColor: string;
  bgColor: string;
  imagePlaceholder?: string;
  image?: string;
  content: string;
}

const ComparisonCard = ({ title, titleColor, bgColor, imagePlaceholder, image, content }: ComparisonCardProps) => {
  return (
    <motion.div 
      className={styles.card}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <h3 className={`${styles.cardTitle} ${titleColor}`}>{title}</h3>
      <div className={`${styles.imagePlaceholder}`}>
        {image ? (
          <Image src={image} alt={title} width={300} height={200} className={styles.comparisonImage} />
        ) : (
          imagePlaceholder
        )}
      </div>
      
      <div className={styles.comparisonItem}>
        <p className={styles.comparisonText}>{content}</p>
      </div>
    </motion.div>
  );
};

export default ComparisonCard; 