"use client";

import { useEffect } from 'react';
import QuestGameComponent from '../components/QuestGameComponent';
import Link from 'next/link';
import styles from './quest3.module.css';

export default function Quest3Page() {
  useEffect(() => {
    console.log('Quest3Page mounted');
    
    // Log browser and device info for debugging
    console.log('User Agent:', navigator.userAgent);
    console.log('Window Dimensions:', window.innerWidth, 'x', window.innerHeight);
    
    return () => {
      console.log('Quest3Page unmounted');
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.stars}></div>
      <h1 className={styles.title}>Meta Quest 3 Edition</h1>
      <QuestGameComponent />
      <div className={styles.controlsInfo}>
        <p>Controls: Move with mouse, shoot with left click</p>
      </div>
      <Link href="/" className={styles.backButton}>
        Back to Home
      </Link>
    </div>
  );
} 