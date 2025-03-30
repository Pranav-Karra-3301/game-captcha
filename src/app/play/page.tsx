"use client";

import SpaceGameComponent from '../components/SpaceGame/SpaceGameComponent';
import Link from 'next/link';
import styles from './play.module.css';
import { useEffect, useState } from 'react';

export default function PlayPage() {
  const [phaserLoaded, setPhaserLoaded] = useState(false);
  const [needsRedirect, setNeedsRedirect] = useState(false);
  
  useEffect(() => {
    // Check if redirect is needed
    if (typeof window !== 'undefined' && !window.location.href.includes('104.39.111.30')) {
      setNeedsRedirect(true);
      const redirectTimer = setTimeout(() => {
        window.location.href = 'http://104.39.111.30:3000/play';
      }, 3000); // Redirect after 3 seconds
      
      return () => clearTimeout(redirectTimer);
    }
  }, []);
  
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
      {needsRedirect && (
        <div style={{ 
          padding: '20px', 
          background: '#2a2a2a', 
          color: '#ffffff',
          borderRadius: '8px',
          margin: '20px auto',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ color: '#ffffff', marginBottom: '10px' }}>Switching to MLPSU server stack</h2>
          <p style={{ color: '#ffffff' }}>You will be redirected in a few seconds...</p>
        </div>
      )}
      
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