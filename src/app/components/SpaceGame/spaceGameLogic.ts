// Space Shooter Game Logic - Adapted for React/TypeScript
// Extended window interface for game properties
declare global {
  interface Window {
    player: any;
    cursors: any;
    shootKey: any;
    lives: number;
    livesText: any;
    livesSprites: any[];
    score: number;
    scoreText: any;
    enemiesKilled: number;
    enemiesKilledText: any;
    enemiesMissed: number;
    enemiesMissedText: any;
    gameState: 'menu' | 'playing' | 'gameover';
    gameOverGroup: any;
    menuGroup: any;
    enemyShootTimer: number;
    background: any;
    sounds: {
      bgMusic: any;
      shoot: any;
      enemyShoot: any;
      explosion: any;
      hit: any;
      gameOver: any;
    };
    gameInstance: any;
    gameInitialized: boolean;
    logGameEvent: (message: string, type: 'enemy-killed' | 'enemy-missed' | 'life-lost' | 'info') => void;
    initGame: () => void;
  }
}

// Helper function to log game events
function logGameEvent(message: string, type: 'enemy-killed' | 'enemy-missed' | 'life-lost' | 'info'): void {
  if (window.logGameEvent) {
    const timestamp = new Date().toLocaleTimeString();
    window.logGameEvent(`${timestamp}: ${message}`, type);
  }
}

// Initialize game
export function initGame(): void {
  console.log('Initializing game...');
  
  // Check if Phaser exists
  if (typeof window === 'undefined' || typeof (window as any).Phaser === 'undefined') {
    console.error('Phaser not found! Game cannot start.');
    const container = document.getElementById('game-container');
    if (container) {
      container.innerHTML = `
        <div style="color:white;text-align:center;padding:20px;">
          <h2>Error: Phaser not loaded</h2>
          <p>Please check console for details</p>
          <button onclick="window.location.reload()">Reload Page</button>
        </div>
      `;
    } else {
      console.error('Game container not found either!');
    }
    
    // Load Phaser dynamically
    loadPhaserDynamically();
    return;
  }
  
  console.log('Phaser found, version:', (window as any).Phaser.VERSION);
  
  // Make sure we only initialize once
  if (window.gameInitialized) {
    console.log('Game already initialized, skipping');
    return;
  }
  
  // Check if container exists
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    console.error('Game container not found, retrying in 500ms');
    setTimeout(initGame, 500);
    return;
  }
  
  // Reset game variables
  window.player = null;
  window.lives = 3;
  window.livesSprites = [];
  window.score = 0;
  window.enemiesKilled = 0;
  window.enemiesMissed = 0;
  window.gameState = 'menu';
  window.gameOverGroup = null;
  window.menuGroup = null;
  
  // Game configuration
  const config = {
    type: (window as any).Phaser.AUTO,
    width: 550,
    height: 700,
    parent: 'game-container',
    backgroundColor: '#000033',
    scene: {
      preload: preload,
      create: create,
      update: update
    },
    // Add physics config if needed
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    }
  };
  
  // Create game instance
  try {
    console.log('Creating game instance');
    window.gameInstance = new (window as any).Phaser.Game(config);
    
    // Mark as initialized
    window.gameInitialized = true;
    console.log('Game initialization flag set to true');
    
    // Additional check after a delay
    setTimeout(() => {
      if (document.querySelector('#game-container canvas')) {
        console.log('Game canvas detected, initialization confirmed');
        window.gameInitialized = true;
      } else {
        console.error('Game canvas not found after delay, initialization may have failed');
      }
    }, 1000);
  } catch (error) {
    console.error('Failed to create game:', error);
    if (gameContainer) {
      gameContainer.innerHTML = `
        <div style="color:white;text-align:center;padding:20px;">
          <h2>Error: Could not create game</h2>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      `;
    }
  }
}

// Load Phaser dynamically
function loadPhaserDynamically(): void {
  const script = document.createElement('script');
  script.src = '/game/assets/js/phaser.min.js';
  script.onload = () => {
    console.log('Dynamically loaded Phaser, retrying initialization...');
    setTimeout(initGame, 500);
  };
  document.head.appendChild(script);
}

// Preload assets
function preload(this: any): void {
  console.log('Preloading game assets');
  
  // Create loading text
  const loadingText = this.add.text(
    this.cameras.main.width / 2, 
    this.cameras.main.height / 2 - 50,
    'Loading assets...', 
    { 
      font: '20px Arial', 
      fill: '#ffffff' 
    }
  ).setOrigin(0.5);
  
  // Create loading progress bar
  const progressBar = this.add.graphics();
  const progressBox = this.add.graphics();
  progressBox.fillStyle(0x222222, 0.8);
  progressBox.fillRect(
    this.cameras.main.width / 2 - 160, 
    this.cameras.main.height / 2 - 25, 
    320, 
    50
  );
  
  // Add progress events
  this.load.on('progress', (value: number) => {
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(
      this.cameras.main.width / 2 - 150, 
      this.cameras.main.height / 2 - 15, 
      300 * value, 
      30
    );
    loadingText.setText(`Loading assets: ${Math.floor(value * 100)}%`);
  });
  
  // Add error handling for assets
  this.load.on('loaderror', (fileObj: any) => {
    console.error('Error loading asset:', fileObj.src);
    console.error('Asset key that failed:', fileObj.key);
    
    // Try to continue with a fallback if possible
    if (fileObj.key === 'background') {
      // Try a solid color as fallback for background
      this.cameras.main.setBackgroundColor('#000033');
    }
  });
  
  // Try loading with error handling
  try {
    // Add a counter to track how many assets we're expecting to load
    let totalAssets = 0;
    let loadedAssets = 0;
    
    const trackAsset = () => {
      totalAssets++;
    };
    
    // Load game assets with updated paths and fallbacks
    trackAsset();
    this.load.image('background', '/game/assets/images/background_5.png')
      .on('fileerror', () => {
        console.warn('Failed to load background.png, trying JPG instead');
        this.load.image('background', '/game/assets/images/background_5.jpg');
      });
    
    trackAsset();
    this.load.image('player', '/game/assets/images/spaceship.png')
      .on('fileerror', () => {
        console.warn('Failed to load spaceship.png, trying alternative'); 
        // Try other common formats
        this.load.image('player', '/game/assets/images/player.png');
      });
    
    trackAsset();
    this.load.image('enemy1', '/game/assets/images/enemy.png')
      .on('fileerror', () => {
        console.warn('Failed to load enemy.png, trying alternative');
        this.load.image('enemy1', '/game/assets/images/enemy.jpg');
      });
    
    trackAsset();
    this.load.image('enemy2', '/game/assets/images/enemy2.png')
      .on('fileerror', () => {
        console.warn('Failed to load enemy2.png, trying alternative');
        this.load.image('enemy2', '/game/assets/images/enemy1.png');
      });
    
    trackAsset();
    this.load.image('bullet', '/game/assets/images/bullet.png')
      .on('fileerror', () => {
        console.warn('Failed to load bullet.png, trying alternative');
        this.load.image('bullet', '/game/assets/images/foozle/bullet.png');
      });
    
    trackAsset();
    this.load.image('bullet-enemy', '/game/assets/images/foozle/bullet-enemy.png')
      .on('fileerror', () => {
        console.warn('Failed to load bullet-enemy.png, trying alternative');
        this.load.image('bullet-enemy', '/game/assets/images/foozle/bullet.png');
      });
    
    // Load audio assets
    trackAsset();
    this.load.audio('bgMusic', '/game/assets/audio/ansimuz/space_asteroids.wav');
    
    trackAsset();
    this.load.audio('shoot', '/game/assets/audio/ansimuz/shot_1.wav');
    
    trackAsset();
    this.load.audio('enemyShoot', '/game/assets/audio/ansimuz/shot_2.wav');
    
    trackAsset();
    this.load.audio('explosion', '/game/assets/audio/ansimuz/explosion.wav');
    
    trackAsset();
    this.load.audio('hit', '/game/assets/audio/ansimuz/hit.wav');
    
    trackAsset();
    this.load.audio('gameOver', '/game/assets/audio/ansimuz/Gameover.wav');
    
    console.log(`Attempting to load ${totalAssets} assets...`);
    
    // Add individual file complete handler
    this.load.on('filecomplete', (key: string) => {
      loadedAssets++;
      console.log(`Loaded asset ${key} (${loadedAssets}/${totalAssets})`);
    });
    
    // Add complete event to log successful loading
    this.load.on('complete', () => {
      console.log('All assets loaded successfully');
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
    
  } catch (error) {
    console.error('Error during asset preload:', error);
    // Try to continue anyway
  }
}

// Create scene
function create(this: any): void {
  console.log('Creating game scene');
  
  // Try-catch for the creation to handle errors gracefully
  try {
    // Create the background as a tiled sprite
    try {
      window.background = this.add.tileSprite(275, 350, 550, 700, 'background');
      window.background.setScale(1);
      console.log("Background created successfully");
    } catch (bgError) {
      console.error("Failed to create background:", bgError);
      // Fallback to a basic rectangle if background texture fails
      window.background = this.add.rectangle(275, 350, 550, 700, 0x000033);
    }
    
    // Setup keyboard inputs
    window.cursors = this.input.keyboard.createCursorKeys();
    window.shootKey = this.input.keyboard.addKey((window as any).Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Create other keys
    const pKey = this.input.keyboard.addKey((window as any).Phaser.Input.Keyboard.KeyCodes.P);
    const qKey = this.input.keyboard.addKey((window as any).Phaser.Input.Keyboard.KeyCodes.Q);
    
    // Add mouse click for shooting
    this.input.on('pointerdown', (pointer: any) => {
      if (window.gameState === 'playing' && pointer.button === 0) { // Left button
        shoot(this);
      }
    });
    
    // Setup audio with error handling
    window.sounds = {};
    try {
      window.sounds = {
        bgMusic: this.sound.add('bgMusic', { loop: true, volume: 0.3 }),
        shoot: this.sound.add('shoot', { volume: 0.5 }),
        enemyShoot: this.sound.add('enemyShoot', { volume: 0.3 }),
        explosion: this.sound.add('explosion', { volume: 0.6 }),
        hit: this.sound.add('hit', { volume: 0.7 }),
        gameOver: this.sound.add('gameOver', { volume: 0.8 })
      };
      
      // Play background music on menu
      if (window.sounds.bgMusic && !window.sounds.bgMusic.isPlaying) {
        window.sounds.bgMusic.play();
      }
      console.log("Audio initialized successfully");
    } catch (audioError) {
      console.error("Failed to initialize audio:", audioError);
      // Continue without sound
      window.sounds = {
        bgMusic: null,
        shoot: null,
        enemyShoot: null,
        explosion: null,
        hit: null,
        gameOver: null
      };
    }
    
    // Listen for p key to start game from menu
    pKey.on('down', () => {
      if (window.gameState === 'menu' || window.gameState === 'gameover') {
        startGame(this);
      }
    });
    
    // Listen for q key to return to menu
    qKey.on('down', () => {
      if (window.gameState === 'playing' || window.gameState === 'gameover') {
        returnToMenu(this);
      }
    });
    
    // Create the menu screen
    createMenuScreen(this);
    
    // Initialize empty group for game over screen
    window.gameOverGroup = this.add.group();
    
    // Create bullet group
    this.bullets = [];
    
    // Create enemies array
    this.enemies = [];
    
    // Create enemy bullets array
    this.enemyBullets = [];
    
    // Log successful creation
    console.log('Game scene created successfully');
    
    // Explicitly mark the game as initialized
    window.gameInitialized = true;
  } catch (error) {
    console.error('Error during game scene creation:', error);
    // Try to continue anyway with limited functionality
    window.gameInitialized = true;
  }
}

// Create the menu screen
function createMenuScreen(scene: any): void {
  window.menuGroup = scene.add.group();
  
  // Title
  window.menuGroup.add(scene.add.text(275, 150, 'SPACE SHOOTER', { 
    fontSize: '36px', 
    fill: '#fff',
    fontStyle: 'bold'
  }).setOrigin(0.5));
  
  // Instructions
  window.menuGroup.add(scene.add.text(275, 250, 'Controls:', { 
    fontSize: '24px', 
    fill: '#fff' 
  }).setOrigin(0.5));
  
  window.menuGroup.add(scene.add.text(275, 300, 'Arrow Keys: Move', { 
    fontSize: '16px', 
    fill: '#fff' 
  }).setOrigin(0.5));
  
  window.menuGroup.add(scene.add.text(275, 330, 'SPACE or CLICK: Shoot', { 
    fontSize: '16px', 
    fill: '#fff' 
  }).setOrigin(0.5));
  
  window.menuGroup.add(scene.add.text(275, 360, 'Q: Quit to Menu', { 
    fontSize: '16px', 
    fill: '#fff' 
  }).setOrigin(0.5));
  
  // Start prompt
  const startText = scene.add.text(275, 450, 'Press P or Click Here to Play', { 
    fontSize: '24px', 
    fill: '#ffff00',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // Make the text interactive so it can be clicked
  startText.setInteractive({ useHandCursor: true });
  startText.on('pointerdown', () => {
    if (window.gameState === 'menu' || window.gameState === 'gameover') {
      startGame(scene);
    }
  });
  
  // Add to group
  window.menuGroup.add(startText);
  
  // Add event listener for whole game area click to start
  scene.input.once('pointerdown', () => {
    if (window.gameState === 'menu') {
      startGame(scene);
    }
  });
}

// Start the game
function startGame(scene: any): void {
  window.gameState = 'playing';
  
  // Reset game variables
  window.score = 0;
  window.lives = 3;
  window.enemiesKilled = 0;
  window.enemiesMissed = 0;
  
  // Hide menu
  window.menuGroup.setVisible(false);
  
  // Clear and hide game over group
  if (window.gameOverGroup) {
    window.gameOverGroup.clear(true, true);
    window.gameOverGroup.setVisible(false);
  }
  
  // Clean up previous UI elements if they exist
  if (window.scoreText && window.scoreText.active) {
    window.scoreText.destroy();
  }
  
  if (window.livesText && window.livesText.active) {
    window.livesText.destroy();
  }
  
  if (window.enemiesKilledText && window.enemiesKilledText.active) {
    window.enemiesKilledText.destroy();
  }
  
  if (window.enemiesMissedText && window.enemiesMissedText.active) {
    window.enemiesMissedText.destroy();
  }
  
  // Add UI elements
  window.scoreText = scene.add.text(16, 16, 'Score: 0', { 
    fontSize: '18px', 
    fill: '#fff',
    fontFamily: 'Arial, sans-serif',
    resolution: 2
  });
  
  // Lives text
  window.livesText = scene.add.text(16, 50, 'Lives:', { 
    fontSize: '18px', 
    fill: '#fff',
    fontFamily: 'Arial, sans-serif',
    resolution: 2
  });
  
  // Enemies killed text
  window.enemiesKilledText = scene.add.text(16, 90, 'Enemies Killed: 0', { 
    fontSize: '18px', 
    fill: '#28a745',
    fontFamily: 'Arial, sans-serif',
    resolution: 2
  });
  
  // Enemies missed text
  window.enemiesMissedText = scene.add.text(16, 120, 'Enemies Missed: 0', { 
    fontSize: '18px', 
    fill: '#ffc107',
    fontFamily: 'Arial, sans-serif',
    resolution: 2
  });
  
  // Lives sprites
  updateLivesDisplay(scene);
  
  // Log game start
  logGameEvent("Game started", "info");
  
  // Create player using spaceship sprite
  window.player = scene.add.sprite(275, 610, 'player').setScale(0.2);
  
  // Make player interactive with mouse
  scene.input.on('pointermove', (pointer: any) => {
    if (window.gameState === 'playing') {
      window.player.x = (window as any).Phaser.Math.Clamp(pointer.x, 25, 525);
    }
  });
  
  // Clear any existing arrays
  scene.bullets = [];
  scene.enemies = [];
  scene.enemyBullets = [];
  
  // Create enemy spawner
  scene.enemySpawner = scene.time.addEvent({
    delay: 2000,
    callback: () => {
      if (window.gameState === 'playing') {
        spawnEnemy(scene);
      }
    },
    callbackScope: scene,
    loop: true
  });
  
  // Ensure music is playing
  if (window.sounds.bgMusic && !window.sounds.bgMusic.isPlaying) {
    window.sounds.bgMusic.play();
  }
}

// Update the lives display
function updateLivesDisplay(scene: any): void {
  // Clear existing sprites
  for (const sprite of window.livesSprites) {
    if (sprite && sprite.active) {
      sprite.destroy();
    }
  }
  window.livesSprites = [];
  
  // Create new sprites using player image
  for (let i = 0; i < window.lives; i++) {
    const lifeSprite = scene.add.sprite(90 + (i * 30), 55, 'player').setScale(0.07);
    window.livesSprites.push(lifeSprite);
  }
}

// Return to menu
function returnToMenu(scene: any): void {
  window.gameState = 'menu';
  
  // Show menu
  window.menuGroup.setVisible(true);
  
  // Hide game over if it was visible
  window.gameOverGroup.setVisible(false);
  
  // Destroy game objects
  if (window.player && window.player.active) {
    window.player.destroy();
  }
  
  if (window.scoreText && window.scoreText.active) {
    window.scoreText.destroy();
  }
  
  if (window.livesText && window.livesText.active) {
    window.livesText.destroy();
  }
  
  if (window.enemiesKilledText && window.enemiesKilledText.active) {
    window.enemiesKilledText.destroy();
  }
  
  if (window.enemiesMissedText && window.enemiesMissedText.active) {
    window.enemiesMissedText.destroy();
  }
  
  // Clear lives sprites
  for (const sprite of window.livesSprites) {
    if (sprite && sprite.active) {
      sprite.destroy();
    }
  }
  window.livesSprites = [];
  
  // Clear bullets
  for (const bullet of scene.bullets) {
    if (bullet && bullet.active) {
      bullet.destroy();
    }
  }
  scene.bullets = [];
  
  // Clear enemy bullets
  for (const bullet of scene.enemyBullets) {
    if (bullet && bullet.active) {
      bullet.destroy();
    }
  }
  scene.enemyBullets = [];
  
  // Clear enemies
  for (const enemy of scene.enemies) {
    if (enemy && enemy.active) {
      enemy.destroy();
    }
  }
  scene.enemies = [];
  
  // Stop enemy spawner if it exists
  if (scene.enemySpawner) {
    scene.enemySpawner.remove();
  }
  
  // Ensure music is playing
  if (window.sounds.bgMusic && !window.sounds.bgMusic.isPlaying) {
    window.sounds.bgMusic.play();
  }
}

// Create game over screen
function showGameOver(scene: any): void {
  window.gameState = 'gameover';
  
  // Log game over
  logGameEvent(`Game Over! Final Score: ${window.score}, Killed: ${window.enemiesKilled}, Missed: ${window.enemiesMissed}`, "info");
  
  // Pause background music during game over sound effect
  if (window.sounds.bgMusic && window.sounds.bgMusic.isPlaying) {
    window.sounds.bgMusic.pause();
  }
  
  // Play game over sound
  if (window.sounds.gameOver) {
    window.sounds.gameOver.play();
    
    // Resume background music after game over sound finishes
    window.sounds.gameOver.once('complete', function() {
      if (window.sounds.bgMusic) {
        window.sounds.bgMusic.resume();
      }
    });
  }
  
  // Clear previous game over group if it exists
  if (window.gameOverGroup) {
    window.gameOverGroup.clear(true, true);
  }
  
  // Create new group
  window.gameOverGroup = scene.add.group();
  
  // Game over text
  window.gameOverGroup.add(scene.add.text(275, 200, 'GAME OVER', { 
    fontSize: '48px', 
    fill: '#ff0000',
    fontStyle: 'bold'
  }).setOrigin(0.5));
  
  // Score text
  window.gameOverGroup.add(scene.add.text(275, 280, `Final Score: ${window.score}`, { 
    fontSize: '24px', 
    fill: '#fff' 
  }).setOrigin(0.5));
  
  // Instructions
  window.gameOverGroup.add(scene.add.text(275, 350, 'Press P to Play Again', { 
    fontSize: '20px', 
    fill: '#ffff00' 
  }).setOrigin(0.5));
  
  window.gameOverGroup.add(scene.add.text(275, 390, 'Press Q to Return to Menu', { 
    fontSize: '20px', 
    fill: '#fff' 
  }).setOrigin(0.5));
}

// Update function
function update(this: any, time: number, delta: number): void {
  // Scroll background for all game states
  if (window.background) {
    window.background.tilePositionY -= 1.5;
  }
  
  // Different behavior based on game state
  if (window.gameState === 'menu' || window.gameState === 'gameover') {
    return;
  }
  
  // Game is in playing state
  
  // Handle keyboard input for movement
  if (window.cursors.left.isDown) {
    window.player.x = Math.max(25, window.player.x - 6);
  } 
  else if (window.cursors.right.isDown) {
    window.player.x = Math.min(525, window.player.x + 6);
  }
  
  // Handle shooting with spacebar
  if ((window as any).Phaser.Input.Keyboard.JustDown(window.shootKey)) {
    shoot(this);
  }
  
  // Random enemy shooting - much less frequent now
  if (this.enemies.length > 0 && Math.random() < 0.008) {
    enemyShoot(this);
  }
  
  // Update player bullets
  for (let i = this.bullets.length - 1; i >= 0; i--) {
    const bullet = this.bullets[i];
    if (!bullet || !bullet.active) {
      this.bullets.splice(i, 1);
      continue;
    }
    
    // Move bullet up
    bullet.y -= 12;
    
    // Remove if off screen
    if (bullet.y < -10) {
      bullet.destroy();
      this.bullets.splice(i, 1);
      continue;
    }
    
    // Check collision with enemies
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const enemy = this.enemies[j];
      if (!enemy || !enemy.active) {
        this.enemies.splice(j, 1);
        continue;
      }
      
      // Simple rectangle collision
      if ((window as any).Phaser.Geom.Rectangle.Overlaps(
        new (window as any).Phaser.Geom.Rectangle(bullet.x - 5, bullet.y - 10, 10, 20),
        new (window as any).Phaser.Geom.Rectangle(enemy.x - 20, enemy.y - 20, 40, 40)
      )) {
        // Increase score
        window.score += 10;
        window.scoreText.setText(`Score: ${window.score}`);
        
        // Increment enemies killed counter
        window.enemiesKilled++;
        if (window.enemiesKilledText) {
          window.enemiesKilledText.setText(`Enemies Killed: ${window.enemiesKilled}`);
        }
        
        // Play explosion sound
        if (window.sounds.explosion) {
          window.sounds.explosion.play();
        }
        
        // Log enemy killed
        logGameEvent(`Enemy destroyed at x:${Math.floor(enemy.x)}, y:${Math.floor(enemy.y)} (+10 pts)`, "enemy-killed");
        
        // Destroy enemy
        enemy.destroy();
        this.enemies.splice(j, 1);
        
        bullet.destroy();
        this.bullets.splice(i, 1);
        
        break;
      }
    }
  }
  
  // Update enemy bullets
  for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
    const bullet = this.enemyBullets[i];
    if (!bullet || !bullet.active) {
      this.enemyBullets.splice(i, 1);
      continue;
    }
    
    // Move bullet down
    bullet.y += 8;
    
    // Remove if off screen
    if (bullet.y > 700) {
      bullet.destroy();
      this.enemyBullets.splice(i, 1);
      continue;
    }
    
    // Check collision with player
    if (window.player && window.player.active && (window as any).Phaser.Geom.Rectangle.Overlaps(
      new (window as any).Phaser.Geom.Rectangle(bullet.x - 5, bullet.y - 10, 10, 20),
      new (window as any).Phaser.Geom.Rectangle(window.player.x - 20, window.player.y - 30, 40, 60)
    )) {
      // Player hit by bullet
      bullet.destroy();
      this.enemyBullets.splice(i, 1);
      
      // Lose a life
      loseLife(this);
      
      break;
    }
  }
  
  // Update enemies
  for (let i = this.enemies.length - 1; i >= 0; i--) {
    const enemy = this.enemies[i];
    if (!enemy || !enemy.active) {
      this.enemies.splice(i, 1);
      continue;
    }
    
    // Move enemy down
    enemy.y += 2.5;
    
    // Remove if off screen (enemy missed)
    if (enemy.y > 700) {
      enemy.destroy();
      this.enemies.splice(i, 1);
      
      // Increment enemies missed counter
      window.enemiesMissed++;
      if (window.enemiesMissedText) {
        window.enemiesMissedText.setText(`Enemies Missed: ${window.enemiesMissed}`);
      }
      
      // Log enemy missed
      logGameEvent(`Enemy escaped at x:${Math.floor(enemy.x)}`, "enemy-missed");
      
      continue;
    }
    
    // Check collision with player
    if (window.player && window.player.active && (window as any).Phaser.Geom.Rectangle.Overlaps(
      new (window as any).Phaser.Geom.Rectangle(window.player.x - 20, window.player.y - 30, 40, 60),
      new (window as any).Phaser.Geom.Rectangle(enemy.x - 20, enemy.y - 20, 40, 40)
    )) {
      // Destroy enemy
      enemy.destroy();
      this.enemies.splice(i, 1);
      
      // Player loses a life
      loseLife(this);
    }
  }
}

// Handle losing a life
function loseLife(scene: any): void {
  // Flash the player
  scene.tweens.add({
    targets: window.player,
    alpha: 0.2,
    duration: 100,
    yoyo: true,
    repeat: 3
  });
  
  // Play hit sound
  if (window.sounds.hit) {
    window.sounds.hit.play();
  }
  
  // Decrease lives
  window.lives--;
  
  // Log life lost
  logGameEvent(`Life lost! ${window.lives} remaining`, "life-lost");
  
  // Update lives display
  updateLivesDisplay(scene);
  
  // Check for game over
  if (window.lives <= 0) {
    // Handle game over
    setTimeout(() => {
      // Clear all bullets and enemies
      for (const bullet of scene.bullets) {
        if (bullet && bullet.active) {
          bullet.destroy();
        }
      }
      scene.bullets = [];
      
      for (const bullet of scene.enemyBullets) {
        if (bullet && bullet.active) {
          bullet.destroy();
        }
      }
      scene.enemyBullets = [];
      
      for (const enemy of scene.enemies) {
        if (enemy && enemy.active) {
          enemy.destroy();
        }
      }
      scene.enemies = [];
      
      if (window.player && window.player.active) {
        window.player.destroy();
      }
      
      showGameOver(scene);
    }, 500);
  }
}

// Enemy shooting function
function enemyShoot(scene: any): void {
  if (window.gameState !== 'playing') return;
  
  // Choose random enemies to shoot
  const activeEnemies = scene.enemies.filter((enemy: any) => enemy && enemy.active);
  
  if (activeEnemies.length === 0) return;
  
  // Simplified shooting logic - just select ONE random enemy to shoot
  const randomIndex = Math.floor(Math.random() * activeEnemies.length);
  const shootingEnemy = activeEnemies[randomIndex];
  
  // Only create a bullet if we have a valid enemy
  if (shootingEnemy && shootingEnemy.active) {
    const bullet = scene.add.sprite(shootingEnemy.x, shootingEnemy.y + 20, 'bullet-enemy').setScale(0.8);
    scene.enemyBullets.push(bullet);
    
    // Play enemy shoot sound
    if (window.sounds.enemyShoot) {
      window.sounds.enemyShoot.play();
    }
  }
}

// Spawn enemy
function spawnEnemy(scene: any): void {
  const x = (window as any).Phaser.Math.Between(25, 525);
  
  // Randomly choose between enemy types
  const enemyType = Math.random() < 0.3 ? 'enemy2' : 'enemy1';
  
  // Create enemy sprite with appropriate scale
  const enemy = scene.add.sprite(x, -30, enemyType).setScale(0.2);
  scene.enemies.push(enemy);
}

// Player shooting - manual with spacebar or mouse click
function shoot(scene: any): void {
  if (window.gameState !== 'playing' || !window.player || !window.player.active) return;
  
  const bullet = scene.add.sprite(window.player.x, window.player.y - 30, 'bullet').setScale(0.3);
  scene.bullets.push(bullet);
  
  // Play shoot sound
  if (window.sounds.shoot) {
    window.sounds.shoot.play();
  }
}

// Set up global window.initGame reference for backward compatibility
if (typeof window !== 'undefined') {
  window.initGame = initGame;
}