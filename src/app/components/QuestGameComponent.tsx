"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './QuestGameComponent.module.css';

export default function QuestGameComponent() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameScriptsLoadedRef = useRef<boolean>(false);
  const gameInitializedRef = useRef<boolean>(false);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const mainJsExists = await fileExists('/quest3/main.js');
      if (!mainJsExists) {
        setErrorMessage('Could not find main.js at "/quest3/main.js". Please make sure the file exists.');
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
    gameInitializedRef.current = false;
    gameScriptsLoadedRef.current = false;
    
    // Skip initialization if we've already detected an error
    if (loadingState === 'error') return;
    
    // Perform thorough cleanup on component mount
    if (typeof window !== 'undefined') {
      const gameWindow = window as any;
      
      // Clean up any existing game instance
      if (gameWindow.questGameInstance) {
        console.log('Cleaning up previous Quest 3 game instance');
        gameWindow.questGameInstance.destroy(true);
        gameWindow.questGameInstance = null;
      }
      
      // Reset game initialization status
      gameWindow.questGameInitialized = false;
      
      // Clean up any Phaser canvas that might exist
      const existingCanvas = document.querySelector('#quest-game-container canvas');
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
      removeScript('/quest3/main.js');
      
      // Also remove any global Phaser reference if needed
      if (typeof gameWindow.Phaser !== 'undefined' && !gameScriptsLoadedRef.current) {
        console.log('Resetting global Phaser reference');
        // Note: We don't want to delete Phaser as it may be used by other components
      }
    }
    
    // Load the game scripts - with a brief delay to ensure cleanup is complete
    const loadGame = async () => {
      try {
        console.log('Starting to load Quest 3 game scripts...');
        setLoadingState('loading');
        
        // First check if the container exists
        if (!document.getElementById('quest-game-container')) {
          const error = 'Quest 3 game container not found!';
          console.error(error);
          setErrorMessage(error);
          setLoadingState('error');
          return;
        }
        
        console.log('Quest 3 game container found, continuing...');

        // Only load Phaser if it's not already loaded
        if (typeof (window as any).Phaser === 'undefined') {
          const phaserScript = document.createElement('script');
          phaserScript.src = '/game/assets/js/phaser.min.js';
          phaserScript.async = true;
          phaserScript.onload = () => {
            console.log('Phaser loaded successfully');
            loadQuestGameScript();
          };
          phaserScript.onerror = () => {
            const error = 'Failed to load Phaser.js';
            console.error(error);
            setErrorMessage(error);
            setLoadingState('error');
          };
          document.body.appendChild(phaserScript);
        } else {
          console.log('Phaser already loaded, continuing to game script');
          loadQuestGameScript();
        }
      } catch (error) {
        console.error('Error loading game scripts:', error);
        setErrorMessage('Failed to initialize game: ' + (error as Error).message);
        setLoadingState('error');
      }
    };
    
    // Function to load the main game script
    const loadQuestGameScript = () => {
      // Check if already loaded
      if (gameScriptsLoadedRef.current) {
        console.log('Quest 3 game scripts already loaded, initializing...');
        initializeQuestGame();
        return;
      }
      
      const gameScript = document.createElement('script');
      gameScript.src = '/quest3/main.js';
      gameScript.async = true;
      gameScript.onload = () => {
        console.log('Quest 3 game script loaded successfully');
        gameScriptsLoadedRef.current = true;
        initializeQuestGame();
      };
      gameScript.onerror = () => {
        const error = 'Failed to load Quest 3 game script';
        console.error(error);
        setErrorMessage(error);
        setLoadingState('error');
      };
      document.body.appendChild(gameScript);
    };
    
    // Function to initialize the game
    const initializeQuestGame = () => {
      console.log('Initializing Quest 3 game...');
      
      // Check if the initQuestGame function exists
      if (typeof (window as any).initQuestGame !== 'function') {
        const error = 'Quest 3 game initialization function not found';
        console.error(error);
        setErrorMessage(error);
        setLoadingState('error');
        return;
      }
      
      // Start checking for game initialization
      (window as any).initQuestGame();
      checkQuestGameInitialized();
    };
    
    // Function to check if the game has been initialized
    const checkQuestGameInitialized = () => {
      if ((window as any).questGameInitialized) {
        console.log('Quest 3 game initialized successfully');
        gameInitializedRef.current = true;
        setLoadingState('loaded');
        return;
      }
      
      console.log('Waiting for Quest 3 game to initialize...');
      // Check again in 100ms
      setTimeout(checkQuestGameInitialized, 100);
    };
    
    // Start loading the game
    setTimeout(loadGame, 300); // Short delay to ensure cleanup is complete
    
    // Cleanup when component unmounts
    return () => {
      console.log('QuestGameComponent unmounting, cleaning up...');
      
      if (typeof window !== 'undefined') {
        const gameWindow = window as any;
        
        // Clean up game instance
        if (gameWindow.questGameInstance) {
          console.log('Destroying Quest 3 game instance');
          gameWindow.questGameInstance.destroy(true);
          gameWindow.questGameInstance = null;
        }
        
        // Remove scripts
        const removeScript = (src: string) => {
          const script = document.querySelector(`script[src="${src}"]`);
          if (script) {
            script.remove();
          }
        };
        
        // Only remove our game script, not Phaser (might be used elsewhere)
        removeScript('/quest3/main.js');
      }
    };
  }, [loadingState]);

  return (
    <div className={styles.questGameComponentContainer}>
      {loadingState === 'loading' && (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Loading Quest 3 game...</p>
        </div>
      )}
      
      {loadingState === 'error' && (
        <div className={styles.error}>
          <h2>Error Loading Game</h2>
          <p>{errorMessage || 'An unknown error occurred'}</p>
        </div>
      )}
      
      <div 
        id="quest-game-container" 
        ref={gameContainerRef} 
        className={styles.questGameContainer}
        style={{ visibility: loadingState === 'loaded' ? 'visible' : 'hidden' }}
      ></div>
    </div>
  );
} 