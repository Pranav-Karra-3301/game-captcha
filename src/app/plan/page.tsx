'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimation, useInView } from 'framer-motion';
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

const letterAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
    }
  }
};

export default function PlanPage() {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  return (
    <div className={`${styles.page}`}>
      <div className={styles.starsBackground}></div>
      <div className={styles.container}>
        {/* Navigation */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={styles.navigation}
        >
          <Link href="/" className={styles.backLink} prefetch={true}>
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
          <div className={styles.titleWrapper}>
            {/* Animate each letter separately */}
            <h1 className={styles.title}>
              {"Business Plan: Game Captcha".split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: index * 0.03,
                        duration: 0.3
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {char}
                </motion.span>
              ))}
            </h1>
          </div>
          
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Revolutionizing AI Training, Data Collection, and User Verification Through Gaming
          </motion.p>
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
          
          {/* Comparison metrics - made more visible */}
          <motion.div 
            className={styles.comparisonMetrics}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.metricsContainer}>
              <motion.div 
                className={styles.metricCard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.metricValue}>3</div>
                <div className={styles.metricLabel}>images</div>
                <div className={styles.metricSubtext}>processed in 10 seconds</div>
              </motion.div>
              
              <motion.div 
                className={styles.vsContainer}
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.1, 1, 1.1, 1] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                <div className={styles.vsText}>VS</div>
              </motion.div>
              
              <motion.div 
                className={styles.metricCard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.metricValue}>27+</div>
                <div className={styles.metricLabel}>data collection points</div>
                <div className={styles.metricSubtext}>captured in 5 seconds</div>
              </motion.div>
            </div>
          </motion.div>
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
              description="We collect and anonymize player interactions, creating valuable labeled datasets similar to CAPTCHA but at much higher volume and quality. This data can be licensed to AI companies for training computer vision and decision-making models."
              marketData="$29.7B market by 2026 (21.9% CAGR)"
              citation="Grandview Research projects the AI datasets and licensing market to grow at 26.8% CAGR (2025–2030), driven by demand for specialized academic and commercial training data."
            />
            
            <RevenueCard
              emoji="🏢"
              title="Enterprise Solutions"
              description="We offer custom reinforcement learning environments for businesses. Companies can train their AI models directly using our game platform, with real human gameplay providing the training signals for strategic decision-making."
              marketData="35% YoY growth in Cloud AI platforms"
              citation="The Cloud AI market is forecast to grow at 32.4% CAGR (2024–2029), driven by enterprise adoption of scalable AI tools. Source: MarketsandMarkets"
            />
            
            <RevenueCard
              emoji="📊"
              title="Gameplay Analytics"
              description="Beyond just labeled data, we capture complete gameplay sequences that feed directly into reinforcement learning loops. This allows AI models to learn complex strategies and decision-making from human players in dynamic environments."
              marketData="18% of platforms use real-time data"
              citation="IDC forecasts cloud services spending to double by 2028, fueled by AI adoption."
            />
            
            <RevenueCard
              emoji="📱"
              title="Mobile Integration"
              description="Our platform integrates seamlessly with websites and mobile apps, replacing traditional CAPTCHAs while collecting valuable training data. Website owners can monetize user verification through our revenue-sharing program."
              marketData="58% of gaming revenue from mobile by 2026"
              citation="Mobile gaming accounts for 49% of global revenue ($92.6B in 2026), with projections to reach $103B by 2027. Newzoo via The National | Statista via Udonis"
            />
          </div>
        </motion.section>

        {/* Technical Flow */}
        <SectionHeader 
          icon={<FaCogs />}
          title="How It Works"
        />
        
        <motion.section 
          ref={ref}
          variants={fadeIn}
          initial="hidden"
          animate={controls}
          viewport={{ once: true, amount: 0.3 }}
          className={styles.technicalSection}
        >
          <div className={styles.diagramContainer}>
            <div className={styles.diagramContent}>
              <div className={styles.imageContainer}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={styles.imageInteraction}
                >
                  <Image 
                    src="/deepq.png" 
                    alt="Deep Q Learning Diagram"
                    width={1200}
                    height={600}
                    className={styles.technicalImage}
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                    priority
                  />
                  <div className={styles.captchaComparisonText}>
                    <p>Deep Q-Learning Neural Network Architecture</p>
                    <p>Our platform collects two types of valuable AI training data: 1) Labeled visual data similar to CAPTCHA but at higher volume, and 2) Complete gameplay sequences that feed directly into reinforcement learning models, teaching AI strategic decision-making in dynamic environments.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}