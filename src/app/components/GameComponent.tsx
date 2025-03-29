"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './GameComponent.module.css';
import { gameSessionService, GameEvent, PlayerInput, PlayerPosition } from '@/lib/supabase/gameSession';

// Using type augmentation would require changes to other files
// so we'll use a local interface instead
interface GameWindow {
  gameInstance?: {
    destroy: (removeCanvas?: boolean) => void;
  } | null;
  gameInitialized?: boolean;
  initGame?: () => void;
  gameSessionId?: string; // Add session ID to window for game to access
  recordGameEvent?: (event: GameEvent) => void;
  recordPlayerInput?: (input: PlayerInput) => void;
  recordPlayerPosition?: (position: PlayerPosition) => void;
  // Buffer for collecting inputs/positions to send in batches
  gameEventBuffer?: GameEvent[];
  playerInputBuffer?: PlayerInput[];
  playerPositionBuffer?: PlayerPosition[];
}

export default function GameComponent() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameScriptsLoadedRef = useRef<boolean>(false);
  const gameInitializedRef = useRef<boolean>(false);
  const logRef = useRef<HTMLDivElement>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<{text: string, type: 'enemy-killed' | 'enemy-missed' | 'life-lost' | 'info'}[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Create a new game session when component mounts
  useEffect(() => {
    const createGameSession = async () => {
      try {
        const newSessionId = await gameSessionService.createSession();
        if (newSessionId) {
          setSessionId(newSessionId);
          
          // Make session ID available to game script
          if (typeof window !== 'undefined') {
            const gameWindow = window as unknown as GameWindow;
            gameWindow.gameSessionId = newSessionId;
            
            // Initialize buffers
            gameWindow.gameEventBuffer = [];
            gameWindow.playerInputBuffer = [];
            gameWindow.playerPositionBuffer = [];
            
            // Add methods to record game data
            gameWindow.recordGameEvent = (event: GameEvent) => {
              event.session_id = newSessionId;
              gameWindow.gameEventBuffer?.push(event);
              
              // If buffer gets too large, flush it
              if (gameWindow.gameEventBuffer && gameWindow.gameEventBuffer.length >= 10) {
                flushGameEvents();
              }
            };
            
            gameWindow.recordPlayerInput = (input: PlayerInput) => {
              input.session_id = newSessionId;
              gameWindow.playerInputBuffer?.push(input);
              
              // If buffer gets too large, flush it
              if (gameWindow.playerInputBuffer && gameWindow.playerInputBuffer.length >= 20) {
                flushPlayerInputs();
              }
            };
            
            gameWindow.recordPlayerPosition = (position: PlayerPosition) => {
              position.session_id = newSessionId;
              gameWindow.playerPositionBuffer?.push(position);
              
              // If buffer gets too large, flush it
              if (gameWindow.playerPositionBuffer && gameWindow.playerPositionBuffer.length >= 20) {
                flushPlayerPositions();
              }
            };
            
            // Create functions to send buffered data to Supabase
            const flushGameEvents = async () => {
              if (!gameWindow.gameEventBuffer || gameWindow.gameEventBuffer.length === 0) return;
              
              // Clone the buffer and clear it
              const events = [...gameWindow.gameEventBuffer];
              gameWindow.gameEventBuffer = [];
              
              // Send each event (we don't have bulk insert for events yet)
              for (const event of events) {
                await gameSessionService.recordEvent(event);
              }
            };
            
            const flushPlayerInputs = async () => {
              if (!gameWindow.playerInputBuffer || gameWindow.playerInputBuffer.length === 0) return;
              
              // Clone the buffer and clear it
              const inputs = [...gameWindow.playerInputBuffer];
              gameWindow.playerInputBuffer = [];
              
              // Send inputs in bulk
              await gameSessionService.recordInputsBulk(inputs);
            };
            
            const flushPlayerPositions = async () => {
              if (!gameWindow.playerPositionBuffer || gameWindow.playerPositionBuffer.length === 0) return;
              
              // Clone the buffer and clear it
              const positions = [...gameWindow.playerPositionBuffer];
              gameWindow.playerPositionBuffer = [];
              
              // Send positions in bulk
              await gameSessionService.recordPositionsBulk(positions);
            };
            
            // Set up flush interval
            const flushInterval = setInterval(() => {
              flushGameEvents();
              flushPlayerInputs();
              flushPlayerPositions();
            }, 5000); // Flush every 5 seconds
            
            // Clean up interval on window unload
            window.addEventListener('beforeunload', () => {
              clearInterval(flushInterval);
              flushGameEvents();
              flushPlayerInputs();
              flushPlayerPositions();
            });
          }
        } else {
          console.error('Failed to create game session');
        }
      } catch (error) {
        console.error('Error creating game session:', error);
      }
    };
    
    createGameSession();
  }, []);

  // Check if required files exist
  useEffect(() => {
    // Function to check if a file exists
    const fileExists = async (url: string) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.status === 200;
      } catch (e) {
        return false;
      }
    };

    const checkRequiredFiles = async () => {
      // Check if Phaser exists
      const phaserExists = await fileExists('/game/assets/js/phaser.min.js');
      if (!phaserExists) {
        setErrorMessage('Could not find Phaser.js at "/game/assets/js/phaser.min.js". Please make sure the file exists.');
        setLoadingState('error');
        return false;
      }
      
      // Check if main.js exists
      const mainJsExists = await fileExists('/game/main.js');
      if (!mainJsExists) {
        setErrorMessage('Could not find main.js at "/game/main.js". Please make sure the file exists.');
        setLoadingState('error');
        return false;
      }
      
      return true;
    };
    
    checkRequiredFiles();
  }, []);

  useEffect(() => {
    // Reset state on component mount
    setLoadingState('loading');
    setLogs([]);
    gameInitializedRef.current = false;
    gameScriptsLoadedRef.current = false;
    
    // Skip initialization if we've already detected an error
    if (loadingState === 'error') return;
    
    // Perform thorough cleanup on component mount
    if (typeof window !== 'undefined') {
      const gameWindow = window as unknown as GameWindow;
      
      // Clean up any existing game instance
      if (gameWindow.gameInstance) {
        console.log('Cleaning up previous game instance');
        gameWindow.gameInstance.destroy(true);
        gameWindow.gameInstance = null;
      }
      
      // Reset game initialization status
      gameWindow.gameInitialized = false;
      
      // Clean up any Phaser canvas that might exist
      const existingCanvas = document.querySelector('#game-container canvas');
      if (existingCanvas) {
        console.log('Removing existing game canvas');
        existingCanvas.remove();
      }
      
      // Clean up all old scripts to ensure fresh load
      const removeScript = (src: string) => {
        const oldScript = document.querySelector(`script[src="${src}"]`);
        if (oldScript) {
          console.log(`Removing old script: ${src}`);
          oldScript.remove();
        }
      };
      
      // Remove all game-related scripts
      removeScript('/game/main.js');
      removeScript('/game/assets/js/phaser.min.js');
      
      // Also remove any global Phaser reference
      if (typeof (window as any).Phaser !== 'undefined') {
        console.log('Removing global Phaser reference');
        delete (window as any).Phaser;
      }
    }
    
    // Load the game scripts - with a brief delay to ensure cleanup is complete
    const loadGame = async () => {
      try {
        console.log('Starting to load game scripts...');
        setLoadingState('loading');
        
        // First check if the container exists
        if (!document.getElementById('game-container')) {
          const error = 'Game container not found!';
          console.error(error);
          setErrorMessage(error);
          setLoadingState('error');
          return;
        }
        
        console.log('Game container found, continuing...');

        // Force reload of scripts - always load fresh
        gameScriptsLoadedRef.current = false;
        
        // Load Phaser library first with a timeout
        const phaser = document.createElement('script');
        phaser.src = '/game/assets/js/phaser.min.js';
        phaser.async = true;
        
        // Set a timeout to detect if loading takes too long
        const phaserLoadTimeout = setTimeout(() => {
          console.error('Phaser loading timed out after 8 seconds');
          setErrorMessage('Failed to load game engine (timeout). Please check your network connection and try again.');
          setLoadingState('error');
        }, 8000); // Increased from 5s to 8s
        
        // Handle Phaser loading error
        phaser.onerror = (err) => {
          clearTimeout(phaserLoadTimeout);
          console.error('Failed to load Phaser:', err);
          setErrorMessage('Failed to load game engine. Please check your connection and refresh.');
          setLoadingState('error');
        };
        
        // Once Phaser is loaded, load our game
        phaser.onload = () => {
          clearTimeout(phaserLoadTimeout);
          console.log('Phaser loaded successfully');
          
          // Load our game script with timeout
          const gameScript = document.createElement('script');
          gameScript.src = '/game/main.js';
          gameScript.async = true;
          
          // Set a timeout for game script
          const gameScriptTimeout = setTimeout(() => {
            console.error('Game script loading timed out after 5 seconds');
            setErrorMessage('Failed to load game assets (timeout). Please check your network connection and try again.');
            setLoadingState('error');
          }, 5000);
          
          // Handle game script error
          gameScript.onerror = (err) => {
            clearTimeout(gameScriptTimeout);
            console.error('Failed to load game script:', err);
            setErrorMessage('Failed to load game assets. Please check your connection and refresh.');
            setLoadingState('error');
          };
          
          gameScript.onload = () => {
            clearTimeout(gameScriptTimeout);
            console.log('Game script loaded successfully');
            gameInitializedRef.current = true;
            
            // Wait for game to initialize
            checkGameInitialized();
          };
          
          document.body.appendChild(gameScript);
        };
        
        document.body.appendChild(phaser);
      } catch (error) {
        console.error("Error loading game:", error);
        setErrorMessage('An unexpected error occurred. Please refresh the page.');
        setLoadingState('error');
      }
    };
    
    // Function to check if game is initialized
    const checkGameInitialized = () => {
      const gameWindow = window as unknown as GameWindow;
      
      // Set a max retry count and interval
      let retries = 0;
      const maxRetries = 30; // Increased from 20 to 30 (15 seconds max wait)
      
      const checkInterval = setInterval(() => {
        retries++;
        console.log(`Checking if game initialized (attempt ${retries}/${maxRetries})...`);
        
        // Check for either the flag or the actual game instance
        if (gameWindow.gameInitialized || (gameWindow.gameInstance && document.querySelector('#game-container canvas'))) {
          console.log('Game initialization detected!');
          clearInterval(checkInterval);
          gameWindow.gameInitialized = true; // Force flag to be set
          gameScriptsLoadedRef.current = true;
          setLoadingState('loaded');
        } else if (retries >= maxRetries) {
          console.error('Game failed to initialize after maximum attempts');
          clearInterval(checkInterval);
          setErrorMessage('Game failed to initialize after multiple attempts. Please refresh the page.');
          setLoadingState('error');
        }
      }, 500);
    };

    // Increased delay to ensure DOM is ready (from 200ms to 500ms)
    setTimeout(loadGame, 500);

    // Cleanup function
    return () => {
      console.log('Cleaning up game component...');
      
      // Save scripts as loaded, but cleanup game instance
      if (typeof window !== 'undefined') {
        const gameWindow = window as unknown as GameWindow;
        if (gameWindow.gameInstance) {
          console.log('Destroying game instance on unmount');
          gameWindow.gameInstance.destroy(true);
          gameWindow.gameInstance = null;
        }
        gameWindow.gameInitialized = false;
      }
    };
  }, []);

  // Set up global event listener for game events
  useEffect(() => {
    if (loadingState === 'loaded') {
      const gameContainer = document.getElementById('game-container');
      
      // Create custom event handler for game to communicate with React
      const handleGameEvent = (event: CustomEvent) => {
        const { detail } = event;
        
        if (detail && detail.type) {
          const newLog = {
            text: detail.message,
            type: detail.type
          };
          
          setLogs(prev => [...prev.slice(-49), newLog]);
          
          // Auto scroll to bottom
          scrollToBottom();
          
          // Also record game event to Supabase if session exists
          if (sessionId && typeof window !== 'undefined') {
            const gameWindow = window as unknown as GameWindow;
            if (gameWindow.recordGameEvent) {
              const gameEvent: GameEvent = {
                session_id: sessionId,
                event_type: detail.type,
                event_time: new Date(),
                score_at_event: (window as any).score,
                lives_remaining: (window as any).lives,
                additional_data: { message: detail.message }
              };
              
              // Record position if available
              if ((window as any).player) {
                gameEvent.position_x = (window as any).player.x;
                gameEvent.position_y = (window as any).player.y;
              }
              
              gameWindow.recordGameEvent(gameEvent);
            }
          }
        }
      };
      
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
      
      // Track keyboard inputs
      const trackKeyboard = (e: KeyboardEvent) => {
        // Only track keys when game container is focused
        if (gameContainer && (document.activeElement === document.body || gameContainer.contains(document.activeElement))) {
          const timestamp = new Date().toLocaleTimeString();
          const keyName = e.key === ' ' ? 'Space' : e.key;
          const newLog = {
            text: `${timestamp}: Key press - ${keyName}`,
            type: 'info' as 'enemy-killed' | 'enemy-missed' | 'life-lost' | 'info'
          };
          
          setLogs(prev => [...prev.slice(-49), newLog]);
          scrollToBottom();
          
          // Record keyboard input to Supabase if session exists
          if (sessionId && typeof window !== 'undefined') {
            const gameWindow = window as unknown as GameWindow;
            if (gameWindow.recordPlayerInput) {
              const playerInput: PlayerInput = {
                session_id: sessionId,
                input_type: 'keydown',
                input_key: keyName,
                timestamp: new Date()
              };
              
              gameWindow.recordPlayerInput(playerInput);
            }
          }
        }
      };
      
      // Track player position periodically
      if (sessionId && typeof window !== 'undefined') {
        const gameWindow = window as unknown as GameWindow;
        const recordPositionInterval = setInterval(() => {
          if ((window as any).player && (window as any).gameState === 'playing' && gameWindow.recordPlayerPosition) {
            const playerPosition: PlayerPosition = {
              session_id: sessionId,
              position_x: (window as any).player.x,
              position_y: (window as any).player.y,
              timestamp: new Date()
            };
            
            gameWindow.recordPlayerPosition(playerPosition);
          }
        }, 200); // Record position every 200ms
        
        // Clean up position interval
        return () => {
          clearInterval(recordPositionInterval);
        };
      }

      // Add global event listeners
      window.addEventListener('gamelog', handleGameEvent as EventListener);
      window.addEventListener('keydown', trackKeyboard);
      
      // Expose log function to window for the game to use
      (window as any).logGameEvent = (message: string, type: 'enemy-killed' | 'enemy-missed' | 'life-lost' | 'info') => {
        const event = new CustomEvent('gamelog', { 
          detail: { message, type } 
        });
        window.dispatchEvent(event);
      };
      
      // Save final score and stats when game ends
      window.addEventListener('gameend', async (event: Event) => {
        const customEvent = event as CustomEvent;
        if (sessionId && customEvent.detail) {
          const { score, enemiesKilled, enemiesMissed, lives, outcome } = customEvent.detail;
          
          // Calculate game duration
          const startTime = (window as any).gameStartTime || Date.now();
          const endTime = Date.now();
          const durationSeconds = Math.floor((endTime - startTime) / 1000);
          
          // Update session with final results
          await gameSessionService.updateSession({
            id: sessionId,
            end_time: new Date(),
            duration_seconds: durationSeconds,
            final_score: score || 0,
            enemies_killed: enemiesKilled || 0,
            enemies_missed: enemiesMissed || 0,
            lives_remaining: lives || 0,
            game_outcome: (outcome as 'win' | 'loss' | 'quit') || 'loss'
          });
          
          // Flush any remaining data
          if (typeof window !== 'undefined') {
            const gameWindow = window as unknown as GameWindow;
            if (gameWindow.gameEventBuffer && gameWindow.gameEventBuffer.length > 0) {
              for (const event of gameWindow.gameEventBuffer) {
                await gameSessionService.recordEvent(event);
              }
              gameWindow.gameEventBuffer = [];
            }
            
            if (gameWindow.playerInputBuffer && gameWindow.playerInputBuffer.length > 0) {
              await gameSessionService.recordInputsBulk(gameWindow.playerInputBuffer);
              gameWindow.playerInputBuffer = [];
            }
            
            if (gameWindow.playerPositionBuffer && gameWindow.playerPositionBuffer.length > 0) {
              await gameSessionService.recordPositionsBulk(gameWindow.playerPositionBuffer);
              gameWindow.playerPositionBuffer = [];
            }
          }
        }
      });
      
      return () => {
        window.removeEventListener('gamelog', handleGameEvent as EventListener);
        window.removeEventListener('keydown', trackKeyboard);
        window.removeEventListener('gameend', () => {});
        (window as any).logGameEvent = undefined;
      };
    }
  }, [loadingState, sessionId]);

  // Render loading state, error, or game container
  return (
    <div className={styles.gamePage}>
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
            <div className={styles.buttonGroup}>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
              
              <button 
                className={styles.fallbackButton}
                onClick={() => {
                  // Add an HTML5 canvas with text as fallback
                  const container = document.getElementById('game-container');
                  if (container) {
                    container.innerHTML = `
                      <canvas id="fallback-canvas" width="450" height="640"></canvas>
                    `;
                    
                    const canvas = document.getElementById('fallback-canvas') as HTMLCanvasElement;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        // Draw a simple game screen
                        ctx.fillStyle = '#000099';
                        ctx.fillRect(0, 0, 450, 640);
                        
                        // Title
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 32px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('SPACE SHOOTER', 225, 200);
                        
                        // Message
                        ctx.fillStyle = '#ffff00';
                        ctx.font = '24px Arial';
                        ctx.fillText('Fallback Mode', 225, 300);
                        
                        // Instructions
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '16px Arial';
                        ctx.fillText('Phaser.js could not be loaded', 225, 360);
                        ctx.fillText('Check browser console for details', 225, 390);
                        
                        setLoadingState('loaded');
                      }
                    }
                  }
                }}
              >
                Use Fallback
              </button>
            </div>
          </div>
        )}
        
        <div id="game-container" ref={gameContainerRef} className={styles.gameCanvas}></div>
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
  );
} 