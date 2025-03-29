"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './QuestGameComponent.module.css';

export default function QuestGameComponent() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('QuestGameComponent mounted');

    // Clean up any existing game instance
    if (typeof window !== 'undefined') {
      if ((window as any).questGameInstance) {
        console.log('Destroying previous Quest game instance');
        (window as any).questGameInstance.destroy(true);
        (window as any).questGameInstance = null;
      }
    }

    const loadGame = async () => {
      if (!gameContainerRef.current) {
        console.error('Game container not available');
        setErrorMessage('Game container not ready');
        setLoadingState('error');
        return;
      }

      try {
        // First, ensure the container is clear
        gameContainerRef.current.innerHTML = '';
        
        // Create game container div
        const gameContainer = document.createElement('div');
        gameContainer.id = 'quest-game-container';
        gameContainer.style.width = '100%';
        gameContainer.style.height = '100%';
        gameContainerRef.current.appendChild(gameContainer);

        // Load Phaser
        await loadPhaserScript();
        
        // Load game script (copy of original game)
        await loadGameScript();
      } catch (error) {
        console.error('Failed to load game:', error);
        setErrorMessage((error as Error).message || 'Failed to load game');
        setLoadingState('error');
      }
    };

    const loadPhaserScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Skip if already loaded
        if (typeof (window as any).Phaser !== 'undefined') {
          console.log('Phaser already loaded');
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = '/game/assets/js/phaser.min.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Phaser loaded successfully');
          resolve();
        };
        
        script.onerror = () => {
          console.error('Failed to load Phaser');
          reject(new Error('Failed to load Phaser'));
        };
        
        document.body.appendChild(script);
      });
    };

    const loadGameScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Create a script tag with copy of the original game code
        const gameScript = document.createElement('script');
        gameScript.innerHTML = `
        // Space Shooter Game - Quest 3 Version (Exact Copy of Original)
        console.log('Quest 3 Space Shooter initializing');
        
        // Attach initialization function to window
        if (typeof window !== 'undefined') {
          console.log('Setting up Quest game on window object');
          
          // Clean up any existing game instance when script loads
          if (window.questGameInstance) {
            console.log('Destroying previous Quest game instance');
            window.questGameInstance.destroy(true);
            window.questGameInstance = null;
          }
          
          // Reset the initialization flag
          window.questGameInitialized = false;
          
          // Expose the init function globally
          window.initQuestGame = initQuestGame;
        }
        
        // Game variables - declare ONCE globally without 'let' or 'var'
        // This prevents redeclaration errors when script reloads
        window.questPlayer = null;
        window.questCursors = null;
        window.questShootKey = null;
        window.questLives = 3;
        window.questLivesText = null;
        window.questLivesSprites = [];
        window.questScore = 0;
        window.questScoreText = null;
        window.questEnemiesKilled = 0;
        window.questEnemiesKilledText = null;
        window.questEnemiesMissed = 0;
        window.questEnemiesMissedText = null;
        window.questGameState = 'menu'; // menu, playing, gameover
        window.questGameOverGroup = null;
        window.questMenuGroup = null;
        window.questEnemyShootTimer = 0;
        window.questBackground = null;
        window.questGameStartTime = null; // Track when game starts
        window.questMousePointer = { x: 0, y: 0 }; // For mouse movement
        
        // Audio variables
        window.questSounds = {
          bgMusic: null,
          shoot: null,
          enemyShoot: null,
          explosion: null,
          hit: null,
          gameOver: null
        };
        
        // Game speed constants - base values for 60fps
        window.questGameSpeed = {
          backgroundSpeed: 60, // pixels per second
          playerSpeed: 300,    // pixels per second
          bulletSpeed: 600,    // pixels per second
          enemySpeed: 120,     // pixels per second
          enemyBulletSpeed: 420, // pixels per second
          enemySpawnRate: 0.5  // enemies per second
        };
        
        // Initialize game
        function initQuestGame() {
          console.log('Initializing Quest game...');
          
          // Check if Phaser exists
          if (typeof Phaser === 'undefined') {
            console.error('Phaser not found! Quest game cannot start.');
            document.getElementById('quest-game-container').innerHTML = '<div style="color:white;text-align:center;padding:20px;"><h2>Error: Phaser not loaded</h2><p>Please check console for details</p></div>';
            return;
          }
          
          console.log('Phaser found, version:', Phaser.VERSION);
          
          // Make sure we only initialize once
          if (window.questGameInitialized) {
            console.log('Quest game already initialized, skipping');
            return;
          }
          
          // Check if container exists
          const gameContainer = document.getElementById('quest-game-container');
          if (!gameContainer) {
            console.error('Quest game container not found, retrying in 100ms');
            setTimeout(initQuestGame, 100);
            return;
          }
          
          // Reset game variables
          window.questPlayer = null;
          window.questLives = 3;
          window.questLivesSprites = [];
          window.questScore = 0;
          window.questEnemiesKilled = 0;
          window.questEnemiesMissed = 0;
          window.questGameState = 'menu';
          window.questGameOverGroup = null;
          window.questMenuGroup = null;
          window.questGameStartTime = null;
          window.questMousePointer = { x: 0, y: 0 };
          
          // Game configuration with physics
          const config = {
            type: Phaser.AUTO,
            width: 550,
            height: 700,
            parent: 'quest-game-container',
            backgroundColor: '#000033',
            physics: {
              default: 'arcade',
              arcade: {
                gravity: { y: 0 },
                debug: false
              }
            },
            scene: {
              preload: preload,
              create: create,
              update: update
            }
          };
          
          // Create game instance
          try {
            console.log('Creating Quest game instance');
            window.questGameInstance = new Phaser.Game(config);
            
            // Mark as initialized immediately so React can detect it
            window.questGameInitialized = true;
            console.log('Quest game initialization flag set to true');
            
            // Additional check after a delay to ensure everything loaded
            setTimeout(() => {
              if (document.querySelector('#quest-game-container canvas')) {
                console.log('Quest game canvas detected, initialization confirmed');
                window.questGameInitialized = true;
              } else {
                console.error('Quest game canvas not found after delay, initialization may have failed');
              }
            }, 1000);
          } catch (error) {
            console.error('Failed to create Quest game:', error);
            gameContainer.innerHTML = '<div style="color:white;text-align:center;padding:20px;"><h2>Error: Could not create game</h2><p>' + error.message + '</p></div>';
          }
        }
        
        // Preload assets
        function preload() {
          console.log('Preloading Quest game assets');
          
          // Show loading progress
          const progressBar = this.add.graphics();
          const progressBox = this.add.graphics();
          progressBox.fillStyle(0x222222, 0.8);
          progressBox.fillRect(140, 325, 320, 50);
          
          const width = this.cameras.main.width;
          const height = this.cameras.main.height;
          const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
              font: '20px Arial',
              fill: '#ffffff'
            }
          });
          loadingText.setOrigin(0.5, 0.5);
          
          const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
              font: '18px Arial',
              fill: '#ffffff'
            }
          });
          percentText.setOrigin(0.5, 0.5);
          
          // Update progress bar
          this.load.on('progress', function (value) {
            percentText.setText(parseInt(String(value * 100)) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(150, 335, 300 * value, 30);
          });
          
          // Clean up when loading complete
          this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
          });
          
          // Load all assets from the original game assets directory
          this.load.image('background', '/game/assets/images/background_5.png');
          this.load.image('player', '/game/assets/images/spaceship.png');
          this.load.image('enemy1', '/game/assets/images/enemy.png');
          this.load.image('enemy2', '/game/assets/images/enemy2.png');
          this.load.image('bullet', '/game/assets/images/bullet.png');
          this.load.image('bullet-enemy', '/game/assets/images/foozle/bullet-enemy.png');
          
          // Load audio
          this.load.audio('bgMusic', '/game/assets/audio/ansimuz/space_asteroids.wav');
          this.load.audio('shoot', '/game/assets/audio/ansimuz/shot_1.wav');
          this.load.audio('enemyShoot', '/game/assets/audio/ansimuz/shot_2.wav');
          this.load.audio('explosion', '/game/assets/audio/ansimuz/explosion.wav');
          this.load.audio('hit', '/game/assets/audio/ansimuz/hit.wav');
          this.load.audio('gameOver', '/game/assets/audio/ansimuz/gameover.wav');
        }
        
        // Create scene
        function create() {
          console.log('Creating Quest game scene');
          
          // Create the background as a tiled sprite
          window.questBackground = this.add.tileSprite(275, 350, 550, 700, 'background');
          window.questBackground.setScale(1);
          
          // Set up physics groups
          this.playerGroup = this.physics.add.group();
          this.bulletGroup = this.physics.add.group();
          this.enemyGroup = this.physics.add.group();
          this.enemyBulletGroup = this.physics.add.group();
          
          // Create player
          window.questPlayer = this.physics.add.sprite(275, 600, 'player');
          window.questPlayer.setScale(0.5);
          window.questPlayer.setCollideWorldBounds(true);
          this.playerGroup.add(window.questPlayer);
          
          // Track mouse position for movement
          this.input.on('pointermove', function (pointer) {
            window.questMousePointer = { x: pointer.x, y: pointer.y };
          });
          
          // Mouse click for shooting
          this.input.on('pointerdown', function (pointer) {
            if (window.questGameState === 'playing' && pointer.leftButtonDown()) {
              shoot(this);
            } else if ((window.questGameState === 'menu' || window.questGameState === 'gameover') && pointer.leftButtonDown()) {
              startGame(this.scene);
            }
          }, this);
          
          // Create the menu screen
          createMenuScreen(this);
          
          // Initialize empty group for game over screen
          window.questGameOverGroup = this.add.group();
          
          // Setup audio
          window.questSounds.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.3 });
          window.questSounds.shoot = this.sound.add('shoot', { volume: 0.5 });
          window.questSounds.enemyShoot = this.sound.add('enemyShoot', { volume: 0.3 });
          window.questSounds.explosion = this.sound.add('explosion', { volume: 0.6 });
          window.questSounds.hit = this.sound.add('hit', { volume: 0.7 });
          window.questSounds.gameOver = this.sound.add('gameOver', { volume: 0.8 });
          
          // Play background music
          if (!window.questSounds.bgMusic.isPlaying) {
            window.questSounds.bgMusic.play();
          }
          
          // Setup collisions
          this.physics.add.overlap(this.bulletGroup, this.enemyGroup, bulletHitEnemy, null, this);
          this.physics.add.overlap(this.enemyBulletGroup, this.playerGroup, enemyBulletHitPlayer, null, this);
        }
        
        // Update function - runs every frame
        function update(time, delta) {
          // Skip if not in playing state
          if (window.questGameState !== 'playing') return;
          
          // Scroll the background
          window.questBackground.tilePositionY -= window.questGameSpeed.backgroundSpeed * (delta / 1000);
          
          // Mouse movement for the player
          if (window.questMousePointer) {
            const targetX = window.questMousePointer.x;
            const playerX = window.questPlayer.x;
            
            // Smooth movement towards mouse
            if (Math.abs(targetX - playerX) > 5) {
              if (targetX > playerX) {
                window.questPlayer.x += window.questGameSpeed.playerSpeed * (delta / 1000);
              } else {
                window.questPlayer.x -= window.questGameSpeed.playerSpeed * (delta / 1000);
              }
            }
          }
          
          // Ensure player stays in bounds
          window.questPlayer.x = Phaser.Math.Clamp(window.questPlayer.x, 25, 525);
          
          // Spawn enemies randomly
          if (Phaser.Math.Between(0, 100) < window.questGameSpeed.enemySpawnRate * (delta / 10)) {
            spawnEnemy(this);
          }
          
          // Enemy shooting
          window.questEnemyShootTimer += delta;
          if (window.questEnemyShootTimer > 2000) { // Every 2 seconds
            enemyShoot(this);
            window.questEnemyShootTimer = 0;
          }
        }
        
        // Menu screen
        function createMenuScreen(scene) {
          window.questMenuGroup = scene.add.group();
          
          const titleText = scene.add.text(275, 200, 'SPACE TRAINER', {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffffff'
          }).setOrigin(0.5);
          
          const questText = scene.add.text(275, 250, 'QUEST 3 EDITION', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffff00'
          }).setOrigin(0.5);
          
          const instructions = scene.add.text(275, 350, 'USE MOUSE TO MOVE\\nLEFT CLICK TO SHOOT', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
          }).setOrigin(0.5);
          
          const clickToStart = scene.add.text(275, 450, 'CLICK TO START', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
          }).setOrigin(0.5);
          
          // Make text blink
          scene.tweens.add({
            targets: clickToStart,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
          });
          
          window.questMenuGroup.add(titleText);
          window.questMenuGroup.add(questText);
          window.questMenuGroup.add(instructions);
          window.questMenuGroup.add(clickToStart);
        }
        
        // Start game function
        function startGame(scene) {
          if (window.questGameState === 'playing') return;
          
          // Clear menu and game over screens
          window.questMenuGroup.clear(true, true);
          window.questGameOverGroup.clear(true, true);
          
          // Reset game state
          window.questGameState = 'playing';
          window.questScore = 0;
          window.questLives = 3;
          window.questEnemiesKilled = 0;
          window.questEnemiesMissed = 0;
          window.questGameStartTime = new Date().getTime();
          
          // Create score text
          window.questScoreText = scene.add.text(20, 20, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
          });
          
          // Create enemies killed text
          window.questEnemiesKilledText = scene.add.text(20, 50, 'Destroyed: 0', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#00ff00'
          });
          
          // Create enemies missed text
          window.questEnemiesMissedText = scene.add.text(20, 80, 'Missed: 0', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ff0000'
          });
          
          // Create lives text
          window.questLivesText = scene.add.text(450, 20, 'Lives:', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
          });
          
          // Create lives sprites
          updateLivesDisplay(scene);
        }
        
        // Helper functions
        function updateLivesDisplay(scene) {
          // Clear existing sprites
          window.questLivesSprites.forEach(sprite => sprite.destroy());
          window.questLivesSprites = [];
          
          // Create new sprites
          for (let i = 0; i < window.questLives; i++) {
            const sprite = scene.add.image(490 + i * 25, 30, 'player').setScale(0.3);
            window.questLivesSprites.push(sprite);
          }
        }
        
        function spawnEnemy(scene) {
          const x = Phaser.Math.Between(50, 500);
          const enemyType = Phaser.Math.Between(0, 1) ? 'enemy1' : 'enemy2';
          const enemy = scene.physics.add.sprite(x, 0, enemyType).setScale(0.5);
          
          // Set velocity for downward movement
          enemy.body.velocity.y = window.questGameSpeed.enemySpeed;
          
          scene.enemyGroup.add(enemy);
          
          // Destroy enemy when it goes out of bounds and count as missed
          enemy.checkWorldBounds = true;
          enemy.outOfBoundsKill = true;
          enemy.on('outOfBounds', function() {
            window.questEnemiesMissed++;
            window.questEnemiesMissedText.setText('Missed: ' + window.questEnemiesMissed);
          });
        }
        
        function shoot(scene) {
          if (window.questGameState !== 'playing') return;
          
          // Create bullet
          const bullet = scene.physics.add.sprite(window.questPlayer.x, window.questPlayer.y - 20, 'bullet').setScale(0.5);
          
          // Set velocity for upward movement
          bullet.body.velocity.y = -window.questGameSpeed.bulletSpeed;
          
          scene.bulletGroup.add(bullet);
          
          // Play sound
          window.questSounds.shoot.play();
          
          // Destroy bullet when it goes out of bounds
          bullet.checkWorldBounds = true;
          bullet.outOfBoundsKill = true;
        }
        
        function enemyShoot(scene) {
          // Get a random enemy
          const enemies = scene.enemyGroup.getChildren();
          if (enemies.length === 0) return;
          
          const randomEnemy = Phaser.Utils.Array.GetRandom(enemies);
          
          // Create bullet
          const bullet = scene.physics.add.sprite(randomEnemy.x, randomEnemy.y + 20, 'bullet-enemy').setScale(0.5);
          
          // Set velocity for downward movement
          bullet.body.velocity.y = window.questGameSpeed.enemyBulletSpeed;
          
          scene.enemyBulletGroup.add(bullet);
          
          // Play sound
          window.questSounds.enemyShoot.play();
          
          // Destroy bullet when it goes out of bounds
          bullet.checkWorldBounds = true;
          bullet.outOfBoundsKill = true;
        }
        
        function bulletHitEnemy(bullet, enemy) {
          bullet.destroy();
          enemy.destroy();
          
          // Play explosion sound
          window.questSounds.explosion.play();
          
          // Update score
          window.questScore += 10;
          window.questScoreText.setText('Score: ' + window.questScore);
          
          // Update enemies killed
          window.questEnemiesKilled++;
          window.questEnemiesKilledText.setText('Destroyed: ' + window.questEnemiesKilled);
        }
        
        function enemyBulletHitPlayer(bullet, player) {
          bullet.destroy();
          
          // Play hit sound
          window.questSounds.hit.play();
          
          // Lose a life
          window.questLives--;
          updateLivesDisplay(bullet.scene);
          
          // Check if game over
          if (window.questLives <= 0) {
            showGameOver(bullet.scene);
          }
        }
        
        function showGameOver(scene) {
          // Set game state
          window.questGameState = 'gameover';
          
          // Play game over sound
          window.questSounds.gameOver.play();
          
          // Create game over screen
          const gameOverText = scene.add.text(275, 200, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ff0000'
          }).setOrigin(0.5);
          
          const scoreText = scene.add.text(275, 300, 'Final Score: ' + window.questScore, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
          }).setOrigin(0.5);
          
          const statsText = scene.add.text(275, 350, 
            'Enemies Destroyed: ' + window.questEnemiesKilled + '\\n' +
            'Enemies Missed: ' + window.questEnemiesMissed,
            {
              fontFamily: 'Arial',
              fontSize: '18px',
              color: '#ffffff',
              align: 'center'
            }
          ).setOrigin(0.5);
          
          const clickToRestart = scene.add.text(275, 450, 'CLICK TO RESTART', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
          }).setOrigin(0.5);
          
          // Make text blink
          scene.tweens.add({
            targets: clickToRestart,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
          });
          
          // Add to group
          window.questGameOverGroup.add(gameOverText);
          window.questGameOverGroup.add(scoreText);
          window.questGameOverGroup.add(statsText);
          window.questGameOverGroup.add(clickToRestart);
        }
        
        // Call init function after script loads
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            if (typeof window.initQuestGame === 'function') {
              window.initQuestGame();
            }
          }, 100);
        }
        `;
        
        document.body.appendChild(gameScript);
        
        // Set a timeout to wait for initialization
        setTimeout(() => {
          if ((window as any).questGameInitialized) {
            console.log('Quest game initialized via script');
            setLoadingState('loaded');
            resolve();
          } else {
            if (typeof (window as any).initQuestGame === 'function') {
              console.log('Manually initializing Quest game');
              (window as any).initQuestGame();
              setTimeout(() => {
                setLoadingState('loaded');
                resolve();
              }, 1000);
            } else {
              console.error('Quest game initialization function not found');
              reject(new Error('Game initialization function not found'));
            }
          }
        }, 500);
      });
    };

    loadGame();

    // Clean up when component unmounts
    return () => {
      if (typeof window !== 'undefined' && (window as any).questGameInstance) {
        console.log('Destroying Quest game instance');
        (window as any).questGameInstance.destroy(true);
        (window as any).questGameInstance = null;
      }
    };
  }, []); // Only run once on mount

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
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}
      
      <div 
        ref={gameContainerRef} 
        className={styles.questGameContainer}
        style={{ visibility: loadingState === 'loaded' ? 'visible' : 'hidden' }}
      />
    </div>
  );
} 