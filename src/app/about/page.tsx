"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function AboutPage() {
  // About page will be implemented later
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>About Space Blaster AI Trainer</h1>
        <p className={styles.description}>Coming soon...</p>
        <Link href="/" className={styles.backButton}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}