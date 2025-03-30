"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from './SpaceGame.module.css';
import { initGame } from './spaceGameLogic';

interface GameLog {
  text: string;
  type: 'enemy-killed' | 'enemy-missed' | 'life-lost' | 'info';
}

export default function SpaceGameComponent() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [lastKeypress, setLastKeypress] = useState<string | null>(null);
  const [gameActions, setGameActions] = useState<{action: string, timestamp: string}[]>([]);

  useEffect(() => {
    // Reset state on component mount
    setLoadingState('loading');
    setLogs([]);
    setGameActions([]);
    
    try {
      // Make sure we have a container
      if (!gameContainerRef.current) {
        throw new Error('Game container not found');
      }
      
      // Clean up any previous game instance
      if (typeof window !== 'undefined' && window.gameInstance) {
        console.log('Cleaning up previous game instance');
        window.gameInstance.destroy(true);
        window.gameInstance = null;
      }
      
      // Initialize the game
      console.log('Initializing game...');
      
      // Add a short delay to make sure Phaser is fully loaded
      setTimeout(() => {
        try {
          initGame();
        
          // Track initialization status
          const checkGameInitialized = () => {
            let retries = 0;
            const maxRetries = 30; // Increased maximum retries
            
            const checkInterval = setInterval(() => {
              retries++;
              console.log(`Checking if game initialized (attempt ${retries}/${maxRetries})...`);
              
              if (window.gameInitialized || 
                  (window.gameInstance && document.querySelector('#game-container canvas'))) {
                console.log('Game initialization detected!');
                clearInterval(checkInterval);
                window.gameInitialized = true;
                setLoadingState('loaded');
                // Log game start
                addGameAction('Game initialized successfully');
              } else if (retries >= maxRetries) {
                console.error('Game failed to initialize after maximum attempts');
                clearInterval(checkInterval);
                setErrorMessage('Game failed to initialize. Please refresh the page.');
                setLoadingState('error');
              }
            }, 500);
          };
          
          checkGameInitialized();
        } catch (err) {
          console.error("Error during game initialization:", err);
          setErrorMessage(err instanceof Error ? err.message : 'Unknown error during initialization');
          setLoadingState('error');
        }
      }, 500);
    } catch (error) {
      console.error("Error preparing game:", error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setLoadingState('error');
    }
    
    // Cleanup function
    return () => {
      console.log('Cleaning up game component...');
      if (typeof window !== 'undefined' && window.gameInstance) {
        window.gameInstance.destroy(true);
        window.gameInstance = null;
      }
      window.gameInitialized = false;
    };
  }, []);

  // Helper function to add game actions to the list
  const addGameAction = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setGameActions(prev => [...prev.slice(-9), {action, timestamp}]);
  };

  // Set up global event listener for game events
  useEffect(() => {
    if (loadingState === 'loaded') {
      // Helper function to scroll log to bottom
      const scrollToBottom = () => {
        if (logRef.current) {
          setTimeout(() => {
            if (logRef.current) {
              logRef.current.scrollTop = logRef.current.scrollHeight;
            }
          }, 10);
        }
      };
      
      // Create custom event handler for game to communicate with React
      const handleGameEvent = (event: CustomEvent) => {
        const { detail } = event;
        
        if (detail && detail.type) {
          const newLog = {
            text: detail.message,
            type: detail.type
          };
          
          setLogs(prev => [...prev.slice(-19), newLog]);
          scrollToBottom();
          
          // Add to game actions for key events
          if (detail.type === 'info' && detail.message.includes('Game started')) {
            addGameAction('Game started');
          } else if (detail.type === 'enemy-killed') {
            addGameAction('Enemy destroyed +10 points');
          } else if (detail.type === 'enemy-missed') {
            addGameAction('Enemy escaped');
          } else if (detail.type === 'life-lost') {
            addGameAction('Player lost a life');
          }
        }
      };
      
      // Track keyboard inputs
      const trackKeyboard = (e: KeyboardEvent) => {
        // Only track keys when game container is focused
        const gameContainer = document.getElementById('game-container');
        if (gameContainer && (document.activeElement === document.body || gameContainer.contains(document.activeElement))) {
          const timestamp = new Date().toLocaleTimeString();
          const keyName = e.key === ' ' ? 'Space' : e.key;
          
          // Set last keypress for display
          setLastKeypress(keyName);
          
          // Add to actions list
          if (keyName === 'ArrowLeft') {
            addGameAction('Move Left');
          } else if (keyName === 'ArrowRight') {
            addGameAction('Move Right');
          } else if (keyName === 'Space') {
            addGameAction('Fire Weapon');
          } else if (keyName === 'p' || keyName === 'P') {
            addGameAction('Start Game');
          } else if (keyName === 'q' || keyName === 'Q') {
            addGameAction('Quit to Menu');
          }
          
          // Log the key press
          const newLog = {
            text: `${timestamp}: Key press - ${keyName}`,
            type: 'info' as const
          };
          
          setLogs(prev => [...prev.slice(-19), newLog]);
          scrollToBottom();
        }
      };

      // Add global event listeners
      window.addEventListener('gamelog', handleGameEvent as EventListener);
      window.addEventListener('keydown', trackKeyboard);
      
      // Mouse movement tracking
      const trackMouseMovement = (e: MouseEvent) => {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer && gameContainer.contains(e.target as Node)) {
          // We don't want to flood the log with every tiny mouse move
          // Instead, we'll just update the last keypress with current position
          setLastKeypress(`Mouse at X: ${e.clientX}`);
        }
      };
      
      // Add mouse movement listener with throttling
      let lastMoveTime = 0;
      window.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMoveTime > 100) { // Only process every 100ms
          lastMoveTime = now;
          trackMouseMovement(e);
        }
      });
      
      // Expose log function to window for the game to use
      window.logGameEvent = (message: string, type: 'enemy-killed' | 'enemy-missed' | 'life-lost' | 'info') => {
        const event = new CustomEvent('gamelog', { 
          detail: { message, type } 
        });
        window.dispatchEvent(event);
      };
      
      // Initial game action
      addGameAction('Game loaded successfully');
      
      return () => {
        window.removeEventListener('gamelog', handleGameEvent as EventListener);
        window.removeEventListener('keydown', trackKeyboard);
        window.removeEventListener('mousemove', trackMouseMovement);
        window.logGameEvent = undefined;
      };
    }
  }, [loadingState]);

  // Add this new effect to handle auto-recovery
  useEffect(() => {
    if (loadingState === 'loaded') {
      // Create an auto-recovery interval that checks the game state
      const recoveryInterval = setInterval(() => {
        // Check if game is in a valid state
        if (window.gameInitialized && window.gameInstance) {
          const canvas = document.querySelector('#game-container canvas');
          if (!canvas) {
            console.log('Canvas lost, attempting recovery...');
            // Canvas might be lost, try re-initializing
            try {
              if (window.gameInstance) {
                window.gameInstance.destroy(true);
                window.gameInstance = null;
              }
              window.gameInitialized = false;
              setLoadingState('loading');
              
              // Attempt recovery after a short delay
              setTimeout(() => {
                try {
                  initGame();
                  addGameAction('Game auto-recovered');
                } catch (err) {
                  console.error('Recovery failed:', err);
                  setErrorMessage('Auto-recovery failed. Please refresh the page.');
                  setLoadingState('error');
                }
              }, 1000);
            } catch (err) {
              console.error('Error during recovery:', err);
            }
          }
        }
      }, 10000); // Check every 10 seconds
      
      return () => {
        clearInterval(recoveryInterval);
      };
    }
  }, [loadingState]);

  return (
    <div className={styles.gamePageContainer}>
      <div className={styles.gameSection}>
        <div className={styles.gameContainer}>
          {loadingState === 'loading' && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
              <p>Loading Space Shooter...</p>
            </div>
          )}
          
          {loadingState === 'error' && (
            <div className={styles.errorOverlay}>
              <h3>Error</h3>
              <p>{errorMessage || 'Failed to load the game. Please try again.'}</p>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}
          
          <div id="game-container" ref={gameContainerRef} className={styles.gameCanvas}></div>
        </div>
      </div>
      
      <div className={styles.sidePanel}>
        <div className={styles.currentAction}>
          <h3>Current Input</h3>
          <div className={styles.lastKeypress}>
            {lastKeypress || 'No input detected'}
          </div>
        </div>
        
        <div className={styles.actionsContainer}>
          <h3>Game Actions</h3>
          <div className={styles.actionsList}>
            {gameActions.length === 0 ? (
              <div className={styles.noActions}>No actions yet</div>
            ) : (
              gameActions.map((action, index) => (
                <div key={index} className={styles.actionItem}>
                  <span className={styles.actionTime}>{action.timestamp}</span>
                  <span className={styles.actionText}>{action.action}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className={styles.logContainer}>
          <h3>Game Log</h3>
          <div className={styles.gameLog} ref={logRef}>
            {logs.map((log, index) => (
              <div key={index} className={`${styles.logEntry} ${styles[log.type]}`}>
                {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 