'use client';

import { useState, useEffect } from 'react';
import styles from './data.module.css';

type CSVFile = {
  name: string;
  data: string[][];
};

export default function DataPage() {
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  useEffect(() => {
    // Generate static data on component mount
    const sampleFiles = generateStaticData();
    setCsvFiles(sampleFiles);
    setActiveFile(sampleFiles[0].name);
    setLoading(false);
  }, []);
  
  // Function to generate static data that represents CSV files
  const generateStaticData = (): CSVFile[] => {
    const sampleFiles: CSVFile[] = [];
    
    // Sample headers based on CSV structure
    const headers = [
      'player_id', 'timestamp', 'score', 'level', 'aliens_destroyed', 
      'shots_fired', 'accuracy', 'time_played_seconds', 'lives_remaining', 
      'player_x_position', 'player_movement', 'powerups_collected', 
      'game_completed', 'device_type', 'browser', 'os', 'session_id'
    ];
    
    // Generate sample files
    for (let i = 1; i <= 20; i++) {
      const rows = [headers];
      
      // Generate rows of sample data for each file
      for (let j = 0; j < 20; j++) {
        const row = [
          generateRandomId(), // player_id
          generateRandomTimestamp(), // timestamp
          Math.floor(Math.random() * 10000).toString(), // score
          Math.floor(Math.random() * 10 + 1).toString(), // level
          Math.floor(Math.random() * 50).toString(), // aliens_destroyed
          Math.floor(Math.random() * 100).toString(), // shots_fired
          (Math.random()).toFixed(2), // accuracy
          Math.floor(Math.random() * 600).toString(), // time_played_seconds
          Math.floor(Math.random() * 4).toString(), // lives_remaining
          Math.floor(Math.random() * 800).toString(), // player_x_position
          ['left', 'right', 'stationary'][Math.floor(Math.random() * 3)], // player_movement
          Math.floor(Math.random() * 6).toString(), // powerups_collected
          Math.random() > 0.5 ? 'True' : 'False', // game_completed
          ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)], // device_type
          ['chrome', 'firefox', 'safari', 'edge'][Math.floor(Math.random() * 4)], // browser
          ['windows', 'macos', 'linux', 'ios', 'android'][Math.floor(Math.random() * 5)], // os
          generateRandomId() // session_id
        ];
        
        rows.push(row);
      }
      
      sampleFiles.push({
        name: `game_data_${i}.csv`,
        data: rows
      });
    }
    
    return sampleFiles;
  };
  
  // Helper function to generate random ID
  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 10);
  };
  
  // Helper function to generate random timestamp between now and tomorrow 11am
  const generateRandomTimestamp = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    
    const randomTime = new Date(
      now.getTime() + Math.random() * (tomorrow.getTime() - now.getTime())
    );
    
    return randomTime.toISOString();
  };
  
  // Display a specific CSV file
  const displayCSVFile = (fileName: string) => {
    setActiveFile(fileName);
  };
  
  // Find the active file data
  const activeFileData = csvFiles.find(file => file.name === activeFile)?.data || [];

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Loading data files...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.scanline}></div>
      
      <header className={styles.header}>
        <h1 className={styles.title}>Game Data Files</h1>
        <div className={styles.divider}></div>
      </header>
      
      <div className={styles.fileSelector}>
        <div className={styles.fileList}>
          {csvFiles.map((file) => (
            <button
              key={file.name}
              className={`${styles.fileButton} ${activeFile === file.name ? styles.active : ''}`}
              onClick={() => displayCSVFile(file.name)}
            >
              {file.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          {activeFileData.length > 0 ? (
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  {activeFileData[0].map((header, index) => (
                    <th key={index} className={styles.tableHeaderCell}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeFileData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className={styles.tableRow}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className={styles.tableCell}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noData}>No data available for this file</div>
          )}
        </div>
      </div>
      
      <div className={styles.dataStats}>
        <div className={styles.statsItem}>
          <span className={styles.statsLabel}>Total Files:</span>
          <span className={styles.statsValue}>{csvFiles.length}</span>
        </div>
        <div className={styles.statsItem}>
          <span className={styles.statsLabel}>Active File:</span>
          <span className={styles.statsValue}>{activeFile}</span>
        </div>
        <div className={styles.statsItem}>
          <span className={styles.statsLabel}>Rows:</span>
          <span className={styles.statsValue}>{activeFileData.length > 0 ? activeFileData.length - 1 : 0}</span>
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