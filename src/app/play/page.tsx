"use client";

import SpaceGameComponent from '../components/SpaceGame/SpaceGameComponent';
import Link from 'next/link';
import styles from './play.module.css';
import { useEffect, useState } from 'react';

export default function PlayPage() {
  const [phaserLoaded, setPhaserLoaded] = useState(false);
  
  useEffect(() => {
    // Check if Phaser is already loaded
    if (typeof window !== 'undefined' && (window as any).Phaser) {
      console.log("Phaser already loaded");
      setPhaserLoaded(true);
      return;
    }
    
    // Dynamically load Phaser
    const script = document.createElement('script');
    script.src = '/assets/js/phaser.min.js';
    script.async = false;
    script.onload = () => {
      console.log("Phaser.js loaded successfully");
      setPhaserLoaded(true);
    };
    script.onerror = (err) => {
      console.error("Failed to load Phaser:", err);
      // Try loading from CDN as fallback
      const cdnScript = document.createElement('script');
      cdnScript.src = 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js';
      cdnScript.async = false;
      cdnScript.onload = () => {
        console.log("Phaser.js loaded from CDN successfully");
        setPhaserLoaded(true);
      };
      cdnScript.onerror = () => {
        console.error("Failed to load Phaser from CDN");
      };
      document.head.appendChild(cdnScript);
    };
    
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className={styles.container}>
      {phaserLoaded ? (
        <SpaceGameComponent />
      ) : (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading game engine...</p>
        </div>
      )}
      
      <Link href="/" className={styles.backButton}>
        Back to Home
      </Link>
    </div>
  );
} 