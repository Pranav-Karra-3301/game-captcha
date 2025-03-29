'use client';

import { useState } from 'react';
import styles from './data.module.css';

type PlayerPosition = {
  id: string;
  player_id?: string;
  session_id?: string;
  x?: number;
  y?: number;
  timestamp?: string;
};

// Static sample data to display instead of fetching from database
const staticPlayerPositions: PlayerPosition[] = [
  {
    id: '1',
    player_id: 'player-1',
    session_id: 'session-123',
    x: 145.32,
    y: 278.54,
    timestamp: '2023-09-15T14:22:31Z'
  },
  {
    id: '2',
    player_id: 'player-1',
    session_id: 'session-123',
    x: 167.89,
    y: 278.54,
    timestamp: '2023-09-15T14:22:33Z'
  },
  {
    id: '3',
    player_id: 'player-1',
    session_id: 'session-123',
    x: 198.42,
    y: 278.54,
    timestamp: '2023-09-15T14:22:36Z'
  },
  {
    id: '4',
    player_id: 'player-2',
    session_id: 'session-456',
    x: 120.75,
    y: 278.54,
    timestamp: '2023-09-16T09:45:12Z'
  },
  {
    id: '5',
    player_id: 'player-2',
    session_id: 'session-456',
    x: 154.23,
    y: 278.54,
    timestamp: '2023-09-16T09:45:15Z'
  }
];

export default function DataPage() {
  // No loading state needed since we use static data
  const [playerPositions] = useState<PlayerPosition[]>(staticPlayerPositions);

  // Function to format float values
  const formatFloat = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return value.toFixed(2); // Display with 2 decimal places
  };

  // Format timestamp for better readability
  const formatTimestamp = (timestamp: string | undefined): string => {
    if (!timestamp) return '-';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.scanline}></div>
      <header className={styles.header}>
        <h1 className={styles.title}>Sample Data Display</h1>
        <div className={styles.divider}></div>
      </header>
      
      <div className={styles.notice}>
        <p>This is a static page showing sample player position data.</p>
        <p>In a production environment, this would be connected to a database.</p>
      </div>
      
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>ID</th>
                <th className={styles.tableHeaderCell}>Player ID</th>
                <th className={styles.tableHeaderCell}>Session ID</th>
                <th className={styles.tableHeaderCell}>Position X</th>
                <th className={styles.tableHeaderCell}>Position Y</th>
                <th className={styles.tableHeaderCell}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {playerPositions.map((position) => (
                <tr 
                  key={position.id} 
                  className={styles.tableRow}
                >
                  <td className={styles.tableCell}>{position.id}</td>
                  <td className={styles.tableCell}>{position.player_id || '-'}</td>
                  <td className={styles.tableCell}>{position.session_id || '-'}</td>
                  <td className={styles.tableCell}>{formatFloat(position.x)}</td>
                  <td className={styles.tableCell}>{formatFloat(position.y)}</td>
                  <td className={styles.tableCell}>{formatTimestamp(position.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className={styles.buttonContainer}>
        <a 
          href="/" 
          className={styles.backButton}
        >
          Back to Home
        </a>
      </div>
    </div>
  );
} 