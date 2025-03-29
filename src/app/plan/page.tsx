'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaRocket, FaChartLine, FaCogs, FaDatabase, FaGamepad, FaBriefcase, FaChartBar, FaUser, FaRobot, FaServer, FaSyncAlt } from 'react-icons/fa';
import styles from './plan.module.css';
import SectionHeader from './components/SectionHeader';
import ComparisonCard from './components/ComparisonCard';
import RevenueCard from './components/RevenueCard';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function PlanPage() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={styles.navigation}
      >
        <Link href="/" className={styles.backLink}>
          <FaArrowLeft /> <span>Back to Home</span>
        </Link>
      </motion.div>
      
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className={styles.hero}
      >
        <h1 className={styles.title}>Business Plan: Space Trainer</h1>
        <p className={styles.subtitle}>Revolutionizing AI Training Through Gaming</p>
      </motion.section>

      {/* Side by Side Comparison */}
      <SectionHeader 
        icon={<FaRocket />}
        title="Traditional CAPTCHA vs. Space Trainer"
      />
      
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className={styles.comparisonSection}
      >
        <div className={styles.comparisonGrid}>
          <ComparisonCard
            title="CAPTCHA"
            titleColor="text-red-600"
            bgColor="bg-gray-900"
            image="/plan/captcha.webp"
            content="Traditional CAPTCHAs create friction with a passive experience that interrupts user workflow. Static data labeling is inefficient, with 25% of users abandoning forms due to frustration with complex verification challenges."
          />
          
          <ComparisonCard
            title="Space Trainer"
            titleColor="text-blue-600"
            bgColor="bg-gray-800"
            image="/spaceInvaders.png"
            content="Space Trainer transforms security into entertainment through active gameplay that users enjoy. Dynamic AI training occurs naturally during play, with 98% of users preferring this engaging approach and 40% higher completion rates."
          />
        </div>
      </motion.section>

      {/* Business Model */}
      <SectionHeader 
        icon={<FaChartLine />}
        title="Revenue Streams"
      />
      
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className={styles.businessSection}
      >
        <div className={styles.revenueGrid}>
          <RevenueCard
            emoji="🤖"
            title="AI Data Licensing"
            description="Anonymized training data for ML models"
            marketData="$29.7B market by 2026 (21.9% CAGR)"
          />
          
          <RevenueCard
            emoji="🏢"
            title="Enterprise Solutions"
            description="Custom RL environments for businesses"
            marketData="35% YoY growth in Cloud AI platforms"
          />
          
          <RevenueCard
            emoji="📊"
            title="Data Insights"
            description="Aggregated behavioral analytics"
            marketData="18% of platforms use real-time data"
          />
          
          <RevenueCard
            emoji="📱"
            title="Mobile Integration"
            description="Touch-friendly design for mobile gamers"
            marketData="58% of gaming revenue from mobile by 2026"
          />
        </div>
      </motion.section>

      {/* Technical Flow */}
      <SectionHeader 
        icon={<FaCogs />}
        title="How It Works"
      />
      
      <motion.section 
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className={styles.technicalSection}
      >
        <div className={styles.diagramContainer}>
          <div className={styles.diagramContent}>
            <div className={styles.imageContainer}>
              <Image 
                src="/deepq.png" 
                alt="Deep Q Learning Diagram"
                width={800}
                height={400}
                className={styles.technicalImage}
              />
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
} 