"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../page.module.css';

interface TrainingSessionsProps {
  viewMode: 'daily' | 'yearly';
}

// Tooltip component
const TooltipWrapper = ({ children, explanation }: { children: React.ReactNode, explanation: string }) => {
  return (
    <div className={styles.tooltipTrigger}>
      {children}
      <div className={styles.tooltip}>{explanation}</div>
    </div>
  );
};

// Define the training session data structure
interface TrainingSession {
  id: string;
  outcome: 'WIN' | 'LOSS' | 'DRAW';
  score: number;
  timestamp: Date;
  inputs: number;
}

// Generate fake training session data from the last 24 hours
const generateTrainingSessions = (count: number): TrainingSession[] => {
  const sessions: TrainingSession[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Generate random time within last 24 hours
    const hoursAgo = Math.random() * 24;
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    // Generate random outcome
    const outcomes: Array<'WIN' | 'LOSS' | 'DRAW'> = ['WIN', 'LOSS', 'DRAW'];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    // Generate score based on outcome
    let baseScore = 0;
    switch(outcome) {
      case 'WIN': baseScore = 800 + Math.floor(Math.random() * 400); break;
      case 'LOSS': baseScore = 100 + Math.floor(Math.random() * 400); break;
      case 'DRAW': baseScore = 400 + Math.floor(Math.random() * 300); break;
    }
    
    // Generate random number of inputs between 30-90
    const inputs = 30 + Math.floor(Math.random() * 61);
    
    sessions.push({
      id: `TR-${1000 + i}`,
      outcome,
      score: baseScore,
      timestamp,
      inputs
    });
  }
  
  // Sort by timestamp (newest first)
  return sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Create 15 fake training sessions
const fakeSessions = generateTrainingSessions(15);
const fakeYearlySessions = generateTrainingSessions(20);

const TrainingSessions: React.FC<TrainingSessionsProps> = ({ viewMode }) => {
  // Use the appropriate data based on view mode
  const sessions = viewMode === 'daily' ? fakeSessions : fakeYearlySessions;
  
  // Format timestamp to readable format
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Get appropriate style for outcome
  const getOutcomeStyle = (outcome: 'WIN' | 'LOSS' | 'DRAW'): React.CSSProperties => {
    switch(outcome) {
      case 'WIN': return { color: '#4cd964' };
      case 'LOSS': return { color: '#ff6b6b' };
      case 'DRAW': return { color: '#ffcc00' };
      default: return {};
    }
  };

  return (
    <div>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TooltipWrapper explanation="Recent AI training sessions and their outcomes">
            Training Sessions
          </TooltipWrapper>
        </h3>
        <div className={styles.viewAll}>
          ALL SESSIONS <span className={styles.viewAllIcon}>→</span>
        </div>
      </div>
      
      {/* Scrollable table of training sessions */}
      <div style={{
        border: '1px dashed rgba(255, 255, 255, 0.3)',
        maxHeight: '450px',
        overflow: 'auto',
        fontFamily: 'var(--pixelated-font), monospace'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '1.1rem' // Increased font size
        }}>
          <thead style={{
            position: 'sticky',
            top: 0,
            backgroundColor: '#111111',
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '1px' }}>Session ID</th>
              <th style={{ padding: '16px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Game Outcome</th>
              <th style={{ padding: '16px', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Score</th>
              <th style={{ padding: '16px', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '1px' }}>Timestamp</th>
              <th style={{ padding: '16px', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '1px' }}>Inputs</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, index) => (
              <motion.tr 
                key={session.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent'
                }}
              >
                <td style={{ padding: '18px', fontWeight: 'bold', borderLeft: '4px solid rgba(255, 255, 255, 0.2)' }}>
                  {session.id}
                </td>
                <td style={{ padding: '18px', textAlign: 'center' }}>
                  <span style={{
                    ...getOutcomeStyle(session.outcome),
                    padding: '6px 12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}>
                    {session.outcome}
                  </span>
                </td>
                <td style={{ padding: '18px', textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.2rem' }}>
                  {session.score.toLocaleString()}
                </td>
                <td style={{ padding: '18px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
                  {formatTimestamp(session.timestamp)}
                </td>
                <td style={{ padding: '18px', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.2rem' }}>
                  {session.inputs}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Session summary */}
      <div style={{ 
        marginTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '0',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontFamily: 'var(--pixelated-font), monospace',
        fontSize: '1.1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Total Sessions:
          </span>
          <span style={{ marginLeft: '8px', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {sessions.length}
          </span>
        </div>
        <div>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Win Rate:
          </span>
          <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#4cd964', fontSize: '1.2rem' }}>
            {Math.round((sessions.filter(s => s.outcome === 'WIN').length / sessions.length) * 100)}%
          </span>
        </div>
        <div>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Avg Score:
          </span>
          <span style={{ marginLeft: '8px', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {Math.round(sessions.reduce((sum, session) => sum + session.score, 0) / sessions.length).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrainingSessions; 