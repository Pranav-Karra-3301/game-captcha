"use client";

import QuestGameComponent from '../components/QuestGameComponent';
import Link from 'next/link';
import styles from './quest3.module.css';

export default function Quest3Page() {
  return (
    <div className={styles.container}>
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