"use client";

import GameComponent from '../components/GameComponent';
import Link from 'next/link';
import styles from './play.module.css';

export default function PlayPage() {
  return (
    <div className={styles.container}>
      <GameComponent />
      <Link href="/" className={styles.backButton}>
        Back to Home
      </Link>
    </div>
  );
} 