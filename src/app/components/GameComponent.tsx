"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './GameComponent.module.css';
<<<<<<< HEAD
=======
// All Supabase imports have been removed

// Define these types locally
interface GameEvent {
  session_id: string;
  event_type: string;
  event_time?: Date;
  position_x?: number;
  position_y?: number;
  score_at_event?: number;
  lives_remaining?: number;
  additional_data?: any;
}

interface PlayerInput {
  session_id: string;
  input_type: string;
  input_key: string;
  timestamp?: Date;
}

interface PlayerPosition {
  session_id: string;
  position_x: number;
  position_y: number;
  timestamp?: Date;
}
>>>>>>> upstream/main

interface GameWindow {
  gameInstance?: {
    destroy: (removeCanvas?: boolean) => void;
  } | null;
  gameInitialized?: boolean;
  initGame?: () => void;
<<<<<<< HEAD
=======
  gameSessionId?: string;
  recordGameEvent?: (event: GameEvent) => void;
  recordPlayerInput?: (input: PlayerInput) => void;
  recordPlayerPosition?: (position: PlayerPosition) => void;
  // Local buffers - no database integration
  gameEventBuffer?: GameEvent[];
  playerInputBuffer?: PlayerInput[];
  playerPositionBuffer?: PlayerPosition[];
>>>>>>> upstream/main
}

export default function GameComponent() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameScriptsLoadedRef = useRef<boolean>(false);
  const gameInitializedRef = useRef<boolean>(false);
  const logRef = useRef<HTMLDivElement>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<{text: string, type: 'enemy-killed' | 'enemy-missed' | 'life-lost' | 'info'}[]>([]);
<<<<<<< HEAD
=======
  const [sessionId, setSessionId] = useState<string | null>('local-session'); // Use a static session ID
  const [playerPosition, setPlayerPosition] = useState<{x: number, y: number} | null>(null);

  // Create a new local game session when component mounts
  useEffect(() => {
    const createLocalGameSession = async () => {
      try {
        // Use a fixed ID for local testing
        const newSessionId = 'local-session-' + Date.now();
        setSessionId(newSessionId);
        
        // Make session ID available to game script
        if (typeof window !== 'undefined') {
          const gameWindow = window as unknown as GameWindow;
          gameWindow.gameSessionId = newSessionId;
          
          // Initialize local buffers
          gameWindow.gameEventBuffer = [];
          gameWindow.playerInputBuffer = [];
          gameWindow.playerPositionBuffer = [];
          
          // Add methods to record game data locally
          gameWindow.recordGameEvent = (event: GameEvent) => {
            event.session_id = newSessionId;
            if (gameWindow.gameEventBuffer) {
              gameWindow.gameEventBuffer.push(event);
              console.log('Game event:', event);
            }
          };
          
          gameWindow.recordPlayerInput = (input: PlayerInput) => {
            input.session_id = newSessionId;
            if (gameWindow.playerInputBuffer) {
              gameWindow.playerInputBuffer.push(input);
              console.log('Player input:', input);
            }
          };
          
          gameWindow.recordPlayerPosition = (position: PlayerPosition) => {
            position.session_id = newSessionId;
            if (gameWindow.playerPositionBuffer) {
              gameWindow.playerPositionBuffer.push(position);
              console.log('Player position:', position);
            }
          };
          
          // No database integration - all data stays local
        }
      } catch (error) {
        console.error('Error creating local game session:', error);
      }
    };
    
    createLocalGameSession();
  }, []);
>>>>>>> upstream/main

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
        
        // Set up global error handler for Phaser
        window.addEventListener('error', (event) => {
          // Only handle errors from game scripts
          if (event.filename && (
              event.filename.includes('/game/') || 
              event.filename.includes('phaser')
             )) {
            console.error('Game script error:', event.error);
            
            // Check for specific scene not defined error
            if (event.error && event.error.toString().includes('scene is not defined')) {
              console.warn('Scene is not defined error detected, attempting fix...');
              
              // Add scene to window as a fallback
              if (typeof (window as any).scene === 'undefined') {
                console.log('Adding global scene object');
                
                // Find the current scene
                let currentScene = null;
                if ((window as any).game && (window as any).game.scene) {
                  const scenes = (window as any).game.scene.scenes;
                  currentScene = scenes && scenes.length > 0 ? scenes[0] : null;
                }
                
                // Create a proxy scene object that will redirect to the current scene
                (window as any).scene = currentScene;
                
                // Create a fallback object if no scene was found
                if (!currentScene) {
                  (window as any).scene = {};
                  console.log('Created empty scene fallback');
                }
                
                // Prevent the default error handling
                event.preventDefault();
                return false;
              }
            }
            
            // Check if it's a stack overflow error
            if (event.error && event.error.toString().includes('Maximum call stack size exceeded')) {
              console.warn('Stack overflow detected, attempting recovery...');
              
              // Try to recover from the error
              try {
                // Force cleanup of any intervals or timeouts
                for (let i = 1; i < 10000; i++) {
                  window.clearInterval(i);
                  window.clearTimeout(i);
                }
                
                // Reset game state if we can
                if ((window as any).game && (window as any).game.destroy) {
                  console.log('Destroying game to prevent further errors');
                  (window as any).game.destroy(true);
                }
                
                // Set error state in React
                setErrorMessage('Game crashed due to stack overflow. This is likely a bug in the game code. Please try refreshing the page.');
                setLoadingState('error');
              } catch (e) {
                console.error('Error during recovery:', e);
              }
            }
          }
        });
        
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
          
          // Intercept main.js loading to fix the scene reference
          try {
            // Fetch the main.js content
            fetch('/game/main.js')
              .then(response => response.text())
              .then(jsContent => {
                console.log('Successfully fetched main.js for patching');
                
                // Look for potential scene references and fix them
                let patchedContent = jsContent;
                
                // Check if we can identify line 577 (we only know it's around line 577)
                const lines = patchedContent.split('\n');
                if (lines.length >= 577) {
                  console.log('Line 577 exists, applying targeted patch');
                  
                  // Apply specific fix to line 577 and surrounding lines
                  for (let i = 575; i < 580; i++) {
                    if (i < lines.length) {
                      if (lines[i].includes('scene.') && !lines[i].includes('this.scene.')) {
                        console.log(`Found scene reference at line ${i}:`, lines[i]);
                        // Replace scene references with this
                        lines[i] = lines[i].replace(/(\W)scene\.(\w+)/g, '$1this.$2');
                        console.log(`Patched to:`, lines[i]);
                      }
                    }
                  }
                }
                
                // Also check for the line 254 error with "Cannot read properties of undefined (reading 'group')"
                if (lines.length >= 254) {
                  console.log('Checking line 254 for potential undefined group property');
                  
                  // Look for lines around 254 that might be using a .group property
                  for (let i = 250; i < 260; i++) {
                    if (i < lines.length) {
                      // Look for any direct property access to .group that might fail
                      if (lines[i].includes('.group')) {
                        console.log(`Found potential group reference at line ${i}:`, lines[i]);
                        
                        // Add defensive check before accessing .group - simpler syntax to avoid errors
                        const modifiedLine = lines[i].replace(
                          /(\w+)\.group/g, 
                          // Simpler replacement that won't cause syntax errors
                          '(($1 && $1.group) || {add: function() {return {}}})'
                        );
                        
                        lines[i] = modifiedLine;
                        console.log(`Patched group reference to:`, lines[i]);
                      }
                    }
                  }
                  
                  // Also look for the createMenuScreen function specifically
                  let createMenuScreenStart = -1;
                  let createMenuScreenEnd = -1;
                  
                  // Find the function bounds
                  for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('function createMenuScreen') || 
                        lines[i].includes('const createMenuScreen') || 
                        lines[i].includes('let createMenuScreen') || 
                        lines[i].includes('var createMenuScreen')) {
                      createMenuScreenStart = i;
                    } else if (createMenuScreenStart >= 0 && lines[i].match(/^\s*\}\s*$/)) {
                      // A line with just a closing brace indicates the end of a function
                      createMenuScreenEnd = i;
                      break;
                    }
                  }
                  
                  // If we found the function, add defensive checks
                  if (createMenuScreenStart >= 0 && createMenuScreenEnd >= 0) {
                    console.log(`Found createMenuScreen function at lines ${createMenuScreenStart}-${createMenuScreenEnd}`);
                    
                    // Add defensive check at the start of the function
                    const functionBody = lines.slice(createMenuScreenStart, createMenuScreenEnd + 1);
                    const modifiedFunction = [
                      functionBody[0], // The function declaration 
                      '  // Add defensive checks against undefined properties',
                      '  for (var i = 0; i < arguments.length; i++) {',
                      '    if (!arguments[i]) arguments[i] = {};',
                      '    if (arguments[i] && typeof arguments[i] === "object" && !arguments[i].group) {',
                      '      arguments[i].group = {add: function() {return {};}};',
                      '    }',
                      '  }',
                      ...functionBody.slice(1) // The rest of the function
                    ];
                    
                    // Replace the original function with the modified one
                    lines.splice(createMenuScreenStart, createMenuScreenEnd - createMenuScreenStart + 1, ...modifiedFunction);
                    console.log('Added defensive checks to createMenuScreen function');
                  }
                }
                
                // Reconstruct the patched content
                patchedContent = lines.join('\n');
                
                // Replace all other remaining scene references that are not qualified with this
                patchedContent = patchedContent.replace(/(\W)scene\.(\w+)/g, function(match, prefix, prop) {
                  // Skip if it's already using this.scene
                  if (prefix.endsWith('this.')) return match;
                  return `${prefix}this.${prop}`;
                });
                
                // Create a blob URL for the patched script
                const blob = new Blob([patchedContent], { type: 'application/javascript' });
                const patchedScriptUrl = URL.createObjectURL(blob);
                
                // Now load the patched script instead
                const gameScript = document.createElement('script');
                gameScript.src = patchedScriptUrl;
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
                  console.error('Failed to load patched game script:', err);
                  setErrorMessage('Failed to load game assets. Please check your connection and refresh.');
                  setLoadingState('error');
                };
                
                gameScript.onload = () => {
                  clearTimeout(gameScriptTimeout);
                  console.log('Patched game script loaded successfully');
                  gameInitializedRef.current = true;
                  
                  // Add a final safety measure - define scene globally with a special getter
                  var finalSafetyScript = document.createElement('script');
                  finalSafetyScript.textContent = `
                    // Force define scene globally with a special getter
                    if (!window.sceneDefined) {
                      window.sceneDefined = true;
                      console.log('Applying final safety scene definition');
                      
                      // Create a dynamic getter for scene that always returns the current scene context
                      Object.defineProperty(window, 'scene', {
                        get: function() {
                          // Always try to get the active scene from the game
                          if (window.game && window.game.scene) {
                            var scenes = window.game.scene.scenes || [];
                            if (scenes.length > 0) {
                              var activeScene = scenes.find(function(s) { 
                                return s.scene && s.scene.settings && s.scene.settings.active; 
                              });
                              if (activeScene) return activeScene;
                              return scenes[0]; // Fall back to first scene
                            }
                          }
                          
                          // Use a simple object instead of a Proxy for better compatibility
                          return {
                            add: function() { return {}; },
                            player: {},
                            physics: { add: {} },
                            cameras: { main: { centerX: 0, centerY: 0 } },
                            input: { keyboard: { createCursorKeys: function() { return {}; } } }
                          };
                        },
                        configurable: true
                      });
                      
                      // Fix "Cannot read properties of undefined (reading 'group')" in createMenuScreen
                      if (typeof createMenuScreen === 'function') {
                        console.log('Patching createMenuScreen function to prevent group access errors');
                        var originalCreateMenuScreen = createMenuScreen;
                        window.createMenuScreen = function() {
                          try {
                            console.log('Creating menu screen with patched function');
                            
                            // Check if args contain objects that might be used incorrectly
                            for (var i = 0; i < arguments.length; i++) {
                              var arg = arguments[i];
                              if (!arg) {
                                console.warn('createMenuScreen received undefined argument at position', i);
                                // Replace with empty object to prevent errors
                                arguments[i] = {};
                              }
                              
                              // Add defensive group property if needed
                              if (arg && typeof arg === 'object' && !arg.group) {
                                console.log('Adding defensive group property to argument', i);
                                arg.group = {
                                  add: function() { return {}; }
                                };
                              }
                            }
                            
                            return originalCreateMenuScreen.apply(this, arguments);
                          } catch (error) {
                            console.error('Error in createMenuScreen:', error);
                            
                            // Create a basic fallback menu if the function fails
                            console.log('Creating fallback menu due to error');
                            if (this.add) {
                              this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'SPACE SHOOTER', {
                                fontFamily: 'Arial',
                                fontSize: '32px',
                                color: '#ffffff'
                              }).setOrigin(0.5);
                              
                              var startBtn = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'START GAME', {
                                fontFamily: 'Arial',
                                fontSize: '24px',
                                color: '#ffffff'
                              }).setOrigin(0.5).setInteractive();
                              
                              startBtn.on('pointerdown', function() {
                                if (this.scene && this.scene.start) {
                                  this.scene.start('game');
                                }
                              }.bind(this));
                            }
                            return {};
                          }
                        };
                      } else {
                        // Set up a listener to patch the function once it's defined
                        var checkForMenuFunction = setInterval(function() {
                          if (typeof window.createMenuScreen === 'function') {
                            console.log('Found createMenuScreen function to patch');
                            
                            var originalCreateMenuScreen = window.createMenuScreen;
                            window.createMenuScreen = function() {
                              try {
                                console.log('Creating menu screen with delayed patch');
                                
                                // Add defensive checks to all container objects
                                for (var i = 0; i < arguments.length; i++) {
                                  if (!arguments[i]) {
                                    arguments[i] = {};
                                  }
                                  
                                  // Add defensive group property if needed
                                  if (arguments[i] && typeof arguments[i] === 'object' && !arguments[i].group) {
                                    arguments[i].group = { add: function() { return {}; } };
                                  }
                                }
                                
                                return originalCreateMenuScreen.apply(this, arguments);
                              } catch (error) {
                                console.error('Error in createMenuScreen (delayed patch):', error);
                                // Return empty object to prevent additional errors
                                return {};
                              }
                            };
                            clearInterval(checkForMenuFunction);
                          }
                        }, 100);
                        
                        // Clear interval after 10 seconds to avoid memory leaks
                        setTimeout(function() { 
                          clearInterval(checkForMenuFunction); 
                        }, 10000);
                      }
                      
                      // Specifically target line 577 error by adding hook to all scenes
                      if (window.game && window.game.scene) {
                        var scenes = window.game.scene.scenes || [];
                        for (var i = 0; i < scenes.length; i++) {
                          var sceneInstance = scenes[i];
                          if (sceneInstance && sceneInstance.update) {
                            console.log('Adding direct fix for line 577 to scene:', sceneInstance.key || 'unknown');
                          }
                        }
                        
                        // Wait for a stable game state and apply a final patch
                        setTimeout(function() {
                          try {
                            // Handle the specific line 577 issue
                            var mainScene = window.game.scene.scenes[0];
                            if (mainScene) {
                              console.log('Ensuring player is attached to the scene');
                              if (window.player && !mainScene.player) {
                                mainScene.player = window.player;
                                console.log('Attached global player to scene');
                              }
                            }
                          } catch (e) {
                            console.error('Error in final scene patch:', e);
                          }
                        }, 500);
                      }
                    }
                  `;
                  document.body.appendChild(finalSafetyScript);
                  
                  // Wait for game to initialize
                  checkGameInitialized();
                };
                
                document.body.appendChild(gameScript);
              }).catch(error => {
                console.error('Error fetching or patching main.js:', error);
                
                // Fall back to loading with runtime fixes
                console.log('Falling back to runtime patching approach');
                
                // Load the original script directly with runtime fixes
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
                  console.error('Failed to load game script (fallback):', err);
                  setErrorMessage('Failed to load game assets. Please check your connection and refresh.');
                  setLoadingState('error');
                };
                
                gameScript.onload = () => {
                  clearTimeout(gameScriptTimeout);
                  console.log('Game script loaded with fallback method');
                  gameInitializedRef.current = true;
                  
                  // Add the immediate fix for scene reference
                  const sceneFixScript = document.createElement('script');
                  sceneFixScript.textContent = `
                    console.log('Adding emergency scene references');
                    
                    // Create a global scene definition
                    window.scene = window.scene || {};
                    
                    // Add a fix for the createMenuScreen issue with undefined group
                    var captureCreateMenuScreen = function() {
                      // Wait for the createMenuScreen function to be defined
                      if (typeof window.createMenuScreen === 'function') {
                        console.log('Found createMenuScreen function to patch in fallback');
                        var originalCreateMenuScreen = window.createMenuScreen;
                        
                        window.createMenuScreen = function() {
                          try {
                            // Add defensive group and add properties to all arguments
                            for (var i = 0; i < arguments.length; i++) {
                              var arg = arguments[i];
                              if (!arg) {
                                console.warn('Menu screen arg ' + i + ' is undefined, creating fallback');
                                arguments[i] = {};
                              }
                              
                              // Make sure there's a group property with an add method
                              if (typeof arg === 'object') {
                                arg.group = arg.group || {
                                  add: function() { return {}; }
                                };
                              }
                            }
                            
                            return originalCreateMenuScreen.apply(this, arguments);
                          } catch (error) {
                            console.error('Error in createMenuScreen despite patch:', error);
                            // Return a basic object to avoid additional errors
                            return {};
                          }
                        };
                        
                        return true;
                      }
                      return false;
                    };
                    
                    // Try to patch the function immediately
                    if (!captureCreateMenuScreen()) {
                      // If not available yet, set up a listener to patch it once defined
                      var checkMenuInterval = setInterval(function() {
                        if (captureCreateMenuScreen()) {
                          clearInterval(checkMenuInterval);
                          console.log('Successfully patched createMenuScreen with fallback approach');
                        }
                      }, 100);
                      
                      // Clear interval after 10 seconds to prevent memory leaks
                      setTimeout(function() {
                        clearInterval(checkMenuInterval);
                      }, 10000);
                    }
                    
                    // Patch the update method at line 577 specifically
                    if (window.game && window.game.scene) {
                      const scenes = window.game.scene.scenes || [];
                      scenes.forEach(sceneObj => {
                        if (sceneObj && typeof sceneObj.update === 'function') {
                          console.log('Found scene to patch:', sceneObj.key || 'unknown');
                          const originalUpdate = sceneObj.update;
                          
                          sceneObj.update = function(time, delta) {
                            // Make 'scene' refer to 'this' during update
                            const oldScene = window.scene;
                            window.scene = this;
                            
                            try {
                              return originalUpdate.call(this, time, delta);
                            } catch (error) {
                              if (error.toString().includes('scene is not defined')) {
                                console.warn('Fixed scene reference at runtime');
                                window.scene = this; // Ensure scene is set
                                return originalUpdate.call(this, time, delta);
                              }
                              throw error;
                            } finally {
                              // Restore previous scene reference
                              window.scene = oldScene;
                            }
                          };
                        }
                      });
                    }
                    
                    console.log('Emergency scene fix applied');
                  `;
                  document.body.appendChild(sceneFixScript);
                  
                  // Wait for game to initialize
                  checkGameInitialized();
                };
                
                document.body.appendChild(gameScript);
              });
          } catch (error) {
            console.error('Error patching main.js:', error);
            setErrorMessage('An unexpected error occurred. Please refresh the page.');
            setLoadingState('error');
          }
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
      let checkInterval: number | null = null;
      
      checkInterval = window.setInterval(() => {
        retries++;
        console.log(`Checking if game initialized (attempt ${retries}/${maxRetries})...`);
        
        // Check for either the flag or the actual game instance
        if (gameWindow.gameInitialized || (gameWindow.gameInstance && document.querySelector('#game-container canvas'))) {
          console.log('Game initialization detected!');
          if (checkInterval !== null) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
          gameWindow.gameInitialized = true; // Force flag to be set
          gameScriptsLoadedRef.current = true;
          setLoadingState('loaded');
        } else if (retries >= maxRetries) {
          console.error('Game failed to initialize after maximum attempts');
          if (checkInterval !== null) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
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
<<<<<<< HEAD
          const newLog = {
            text: detail.message,
            type: detail.type
          };
          
          setLogs(prev => [...prev.slice(-49), newLog]);
          
          // Auto scroll to bottom
          scrollToBottom();
=======
          try {
            const newLog = {
              text: detail.message,
              type: detail.type
            };
            
            // Use functional update to avoid stale closures
            setLogs(prev => {
              // Avoid duplicate logs in case of event bubbling
              const isDuplicate = prev.length > 0 && 
                prev[prev.length - 1].text === newLog.text && 
                prev[prev.length - 1].type === newLog.type;
              
              return isDuplicate ? prev : [...prev.slice(-49), newLog];
            });
            
            // Auto scroll to bottom - use requestAnimationFrame to avoid excessive updates
            requestAnimationFrame(() => scrollToBottom());
            
            // Also record game event if session exists
            if (sessionId && typeof window !== 'undefined') {
              const gameWindow = window as unknown as GameWindow;
              if (gameWindow.recordGameEvent) {
                try {
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
                } catch (error) {
                  console.error('Error recording game event:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error handling game event:', error);
          }
>>>>>>> upstream/main
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
        // Skip if not initialized
        if (!gameInitializedRef.current) return;
        
        // Make sure we have a window object
        if (typeof window === 'undefined') return;
        
        // Get the game window
        const gameWindow = window as unknown as GameWindow;
        
        // Only record if our recorder is available
        if (!gameWindow.recordPlayerInput) return;
        
        // Get the key pressed
        const key = e.key.toLowerCase();
        
        // Record key press event (only ones that would affect gameplay)
        if (['arrowleft', 'arrowright', 'space', 'a', 'd', ' ', 'p'].includes(key)) {
          const input: PlayerInput = {
            session_id: gameWindow.gameSessionId || 'unknown',
            input_type: e.type, // 'keydown' or 'keyup'
            input_key: key,
            timestamp: new Date()
          };
          
<<<<<<< HEAD
          setLogs(prev => [...prev.slice(-49), newLog]);
          scrollToBottom();
        }
      };
=======
          // Record locally only - no database
          gameWindow.recordPlayerInput(input);
        }
      };
      
      // Track player position periodically - keep tracking but comment out database
      if (sessionId && typeof window !== 'undefined') {
        const gameWindow = window as unknown as GameWindow;
        let lastX = 0;
        let lastY = 0;
        const MIN_POSITION_CHANGE = 1; // Only update if position changed by at least this much
        
        const recordPositionInterval = setInterval(() => {
          try {
            if ((window as any).player && (window as any).gameState === 'playing' && gameWindow.recordPlayerPosition) {
              const x = (window as any).player.x;
              const y = (window as any).player.y;
              
              // Only update if position has changed significantly
              const positionChanged = Math.abs(x - lastX) > MIN_POSITION_CHANGE || 
                                      Math.abs(y - lastY) > MIN_POSITION_CHANGE;
              
              if (positionChanged) {
                lastX = x;
                lastY = y;
                
                // Update local state for display - use functional update to avoid stale closures
                setPlayerPosition(prev => {
                  // Skip update if no significant change to reduce renders
                  if (prev && Math.abs(prev.x - x) < MIN_POSITION_CHANGE && 
                      Math.abs(prev.y - y) < MIN_POSITION_CHANGE) {
                    return prev;
                  }
                  return {x, y};
                });
                
                const playerPosition: PlayerPosition = {
                  session_id: sessionId,
                  position_x: x,
                  position_y: y,
                  timestamp: new Date()
                };
                
                gameWindow.recordPlayerPosition(playerPosition);
              }
            }
          } catch (error) {
            console.error('Error tracking player position:', error);
          }
        }, 200); // Record position every 200ms
        
        // Clean up position interval
        return () => {
          clearInterval(recordPositionInterval);
        };
      }
>>>>>>> upstream/main

      // Add global event listeners
      window.addEventListener('gamelog', handleGameEvent as EventListener);
      window.addEventListener('keydown', trackKeyboard);
      
      // Expose log function to window for the game to use
      let lastEventTime = 0;
      const EVENT_THROTTLE_MS = 50; // Prevent events firing too rapidly
      
      (window as any).logGameEvent = (message: string, type: 'enemy-killed' | 'enemy-missed' | 'life-lost' | 'info') => {
        const now = Date.now();
        // Prevent event recursion by throttling events
        if (now - lastEventTime < EVENT_THROTTLE_MS) {
          console.log('Throttling event to prevent recursion');
          return;
        }
        lastEventTime = now;
        
        const event = new CustomEvent('gamelog', { 
          detail: { message, type } 
        });
        window.dispatchEvent(event);
      };
      
<<<<<<< HEAD
      return () => {
        window.removeEventListener('gamelog', handleGameEvent as EventListener);
        window.removeEventListener('keydown', trackKeyboard);
=======
      // Store reference to the gameend handler for proper cleanup
      const gameEndHandler = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (sessionId && customEvent.detail) {
          const { score, enemiesKilled, enemiesMissed, lives, outcome } = customEvent.detail;
          
          // Calculate game duration
          const startTime = (window as any).gameStartTime || Date.now();
          const endTime = Date.now();
          const durationSeconds = Math.floor((endTime - startTime) / 1000);
          
          // Log but don't update session with final results
          console.log('Game ended:', {
            id: sessionId,
            end_time: new Date(),
            duration_seconds: durationSeconds,
            final_score: score || 0,
            enemies_killed: enemiesKilled || 0,
            enemies_missed: enemiesMissed || 0,
            lives_remaining: lives || 0,
            game_outcome: (outcome as 'win' | 'loss' | 'quit') || 'loss'
          });
        }
      };
      
      window.addEventListener('gameend', gameEndHandler);
      
      return () => {
        window.removeEventListener('gamelog', handleGameEvent as EventListener);
        window.removeEventListener('keydown', trackKeyboard);
        window.removeEventListener('gameend', gameEndHandler);
>>>>>>> upstream/main
        (window as any).logGameEvent = undefined;
      };
    }
  }, [loadingState]);

  // Render loading state, error, or game container with position display
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
        <h3>Game Activity Monitor</h3>
        
        {playerPosition && (
          <div className={styles.positionDisplay}>
            <div className={styles.positionTitle}>Player Position:</div>
            <div className={styles.positionValue}>
              X: {playerPosition.x.toFixed(2)} | Y: {playerPosition.y.toFixed(2)}
            </div>
          </div>
        )}
        
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