// Space Shooter Game - Enhanced Version
console.log('Enhanced Space Shooter (Quest3 Version) initializing');

// Add debugging information about environment
console.log('Environment:', typeof window !== 'undefined' ? window.location.hostname : 'unknown');
console.log('Checking DOM ready state:', document.readyState);

// Attach initialization function to window
if (typeof window !== 'undefined') {
  console.log('Setting up game on window object');
  
  // Clean up any existing game instance when script loads
  if (window.gameInstance) {
    console.log('Destroying previous game instance');
    window.gameInstance.destroy(true);
    window.gameInstance = null;
  }
  
  // Reset the initialization flag
  window.gameInitialized = false;
  
  // Expose the init function globally
  window.initGame = initGame;
}

// Game variables - declare ONCE globally without 'let' or 'var'
// This prevents redeclaration errors when script reloads
window.player = null;
window.cursors = null;
window.shootKey = null;
window.lives = 3;
window.livesText = null;
window.livesSprites = [];
window.score = 0;
window.scoreText = null;
window.enemiesKilled = 0;
window.enemiesKilledText = null;
window.enemiesMissed = 0;
window.enemiesMissedText = null;
window.gameState = 'menu'; // menu, playing, gameover
window.gameOverGroup = null;
window.menuGroup = null;
window.enemyShootTimer = 0;
window.background = null;
// Audio variables
window.sounds = {
  bgMusic: null,
  shoot: null,
  enemyShoot: null,
  explosion: null,
  hit: null,
  gameOver: null
};

// Initialize game
function initGame() {
  console.log('Initializing game...');
  
  // Check if Phaser exists
  if (typeof Phaser === 'undefined') {
    console.error('Phaser not found! Game cannot start.');
    const container = document.getElementById('game-container');
    if (container) {
      container.innerHTML = '<div style="color:white;text-align:center;padding:20px;"><h2>Error: Phaser not loaded</h2><p>Please check console for details</p><button onclick="window.location.reload()">Reload Page</button></div>';
    } else {
      console.error('Game container not found either!');
    }
    
    // Try to load Phaser dynamically as fallback
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js';
    script.onload = () => {
      console.log('Dynamically loaded Phaser, retrying initialization...');
      setTimeout(initGame, 500);
    };
    document.head.appendChild(script);
    return;
  }
  
  console.log('Phaser found, version:', Phaser.VERSION);
  
  // Make sure we only initialize once
  if (window.gameInitialized) {
    console.log('Game already initialized, skipping');
    return;
  }
  
  // Check if container exists
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    console.error('Game container not found, retrying in 500ms');
    setTimeout(initGame, 500); // Increased delay
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
  
  // Enhanced game configuration with preload function
  const config = {
    type: Phaser.AUTO,
    width: 550,
    height: 700,
    parent: 'game-container',
    backgroundColor: '#000033',
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
  
  // Create game instance
  try {
    console.log('Creating game instance');
    window.gameInstance = new Phaser.Game(config);
    
    // Mark as initialized immediately so React can detect it
    window.gameInitialized = true;
    console.log('Game initialization flag set to true');
    
    // Additional check after a delay to ensure everything loaded
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
    gameContainer.innerHTML = '<div style="color:white;text-align:center;padding:20px;"><h2>Error: Could not create game</h2><p>' + error.message + '</p></div>';
  }
}

// Helper function to log game events
function logGameEvent(message, type) {
  if (window.logGameEvent) {
    const timestamp = new Date().toLocaleTimeString();
    window.logGameEvent(`${timestamp}: ${message}`, type);
  }
}

// Preload assets
function preload() {
  console.log('Preloading Quest3 game assets from correct directory');
  
  // Add error handling for assets
  this.load.on('loaderror', (fileObj) => {
    console.error('Error loading asset:', fileObj.src);
  });
  
  // Add complete event to log successful loading
  this.load.on('complete', () => {
    console.log('All assets loaded successfully');
  });
  
  // Load background - confirmed to exist from our file check
  this.load.image('background', '/quest3/assets/images/background_5.png');
  
  // Load player assets - spaceship.png exists
  this.load.image('player', '/quest3/assets/images/spaceship.png');
  
  // Load enemy assets - enemy.png and enemy2.png exist
  this.load.image('enemy1', '/quest3/assets/images/enemy.png');
  this.load.image('enemy2', '/quest3/assets/images/enemy2.png');
  
  // Load bullet assets
  this.load.image('bullet', '/quest3/assets/images/bullet.png'); // This exists
  this.load.image('bullet-enemy', '/quest3/assets/images/foozle/bullet-enemy.png'); // Using foozle as fallback
  
  // Load audio assets
  this.load.audio('bgMusic', '/quest3/assets/audio/ansimuz/space_asteroids.wav');
  this.load.audio('shoot', '/quest3/assets/audio/ansimuz/shot_1.wav');
  this.load.audio('enemyShoot', '/quest3/assets/audio/ansimuz/shot_2.wav');
  this.load.audio('explosion', '/quest3/assets/audio/ansimuz/explosion.wav');
  this.load.audio('hit', '/quest3/assets/audio/ansimuz/hit.wav');
  this.load.audio('gameOver', '/quest3/assets/audio/ansimuz/gameover.wav'); // Use the gameover.wav file
}

// Create scene
function create() {
  console.log('Creating game scene');
  
  // Create the background as a tiled sprite
  window.background = this.add.tileSprite(275, 350, 550, 700, 'background');
  window.background.setScale(1); // Adjust scale if needed
  
  // Setup keyboard inputs
  window.cursors = this.input.keyboard.createCursorKeys();
  window.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // Create other keys
  const pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  const qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  
  // Setup audio
  window.sounds.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.3 });
  window.sounds.shoot = this.sound.add('shoot', { volume: 0.5 });
  window.sounds.enemyShoot = this.sound.add('enemyShoot', { volume: 0.3 });
  window.sounds.explosion = this.sound.add('explosion', { volume: 0.6 });
  window.sounds.hit = this.sound.add('hit', { volume: 0.7 });
  window.sounds.gameOver = this.sound.add('gameOver', { volume: 0.8 });
  
  // Play background music on menu
  if (!window.sounds.bgMusic.isPlaying) {
    window.sounds.bgMusic.play();
  }
  
  // Listen for p key to start game from menu
  pKey.on('down', () => {
    if (window.gameState === 'menu') {
      startGame(this);
    } else if (window.gameState === 'gameover') {
      startGame(this); // Also allow restarting from game over screen
    }
  });
  
  // Listen for q key to return to menu
  qKey.on('down', () => {
    if (window.gameState === 'playing' || window.gameState === 'gameover') {
      returnToMenu(this);
    }
  });
  
  // Add mouse click to start game
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      if (window.gameState === 'menu') {
        startGame(this);
      } else if (window.gameState === 'gameover') {
        startGame(this);
      } else if (window.gameState === 'playing' && window.player && window.player.active) {
        shoot(this);
      }
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
}

// Create the menu screen
function createMenuScreen(scene) {
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
  
  window.menuGroup.add(scene.add.text(275, 300, 'Move with Mouse', { 
    fontSize: '16px', 
    fill: '#fff' 
  }).setOrigin(0.5));
  
  window.menuGroup.add(scene.add.text(275, 330, 'Left Click to Shoot', { 
    fontSize: '16px', 
    fill: '#fff' 
  }).setOrigin(0.5));
  
  window.menuGroup.add(scene.add.text(275, 360, 'Q: Quit to Menu', { 
    fontSize: '16px', 
    fill: '#fff' 
  }).setOrigin(0.5));
  
  // Start prompt
  window.menuGroup.add(scene.add.text(275, 450, 'Press P or Click to Play', { 
    fontSize: '24px', 
    fill: '#ffff00',
    fontStyle: 'bold'
  }).setOrigin(0.5));
  
  // Create a blinking effect for the prompt
  scene.tweens.add({
    targets: window.menuGroup.getChildren()[5],
    alpha: 0.2,
    duration: 800,
    yoyo: true,
    repeat: -1
  });
}

// Start the game
function startGame(scene) {
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
  // Score - updated with specific font family and clear formatting
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
  scene.input.on('pointermove', (pointer) => {
    if (window.gameState === 'playing' && window.player && window.player.active) {
      window.player.x = Phaser.Math.Clamp(pointer.worldX, 25, 525);
    }
  });
  
  // Clear any existing arrays
  scene.bullets = [];
  scene.enemies = [];
  scene.enemyBullets = [];
  
  // Create enemy spawner
  scene.enemySpawner = scene.time.addEvent({
    delay: 2000, // Increased from 1000 to 2000 (less enemies)
    callback: () => {
      if (window.gameState === 'playing') {
        spawnEnemy(scene);
      }
    },
    callbackScope: scene,
    loop: true
  });
  
  // Ensure music is playing
  if (!window.sounds.bgMusic.isPlaying) {
    window.sounds.bgMusic.play();
  }
}

// Update the lives display
function updateLivesDisplay(scene) {
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
function returnToMenu(scene) {
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
  if (!window.sounds.bgMusic.isPlaying) {
    window.sounds.bgMusic.play();
  }
}

// Create game over screen
function showGameOver(scene) {
  window.gameState = 'gameover';
  
  // Log game over
  logGameEvent(`Game Over! Final Score: ${window.score}, Killed: ${window.enemiesKilled}, Missed: ${window.enemiesMissed}`, "info");
  
  // Pause background music during game over sound effect
  if (window.sounds.bgMusic && window.sounds.bgMusic.isPlaying) {
    window.sounds.bgMusic.pause();
  }
  
  // Play game over sound
  const gameOverSound = window.sounds.gameOver.play();
  
  // Resume background music after game over sound finishes
  window.sounds.gameOver.once('complete', function() {
    if (window.sounds.bgMusic) {
      window.sounds.bgMusic.resume();
    }
  });
  
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
  window.gameOverGroup.add(scene.add.text(275, 350, 'Press P or Click to Play Again', { 
    fontSize: '20px', 
    fill: '#ffff00' 
  }).setOrigin(0.5));
  
  window.gameOverGroup.add(scene.add.text(275, 390, 'Press Q to Return to Menu', { 
    fontSize: '20px', 
    fill: '#fff' 
  }).setOrigin(0.5));
}

// Update function
function update(time, delta) {
  // Scroll background for all game states
  if (window.background) {
    window.background.tilePositionY -= 1.5;
  }
  
  // Different behavior based on game state
  if (window.gameState === 'menu') {
    // Nothing to update in menu state
    return;
  } 
  else if (window.gameState === 'gameover') {
    // Nothing to update in game over state
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
  if (Phaser.Input.Keyboard.JustDown(window.shootKey)) {
    shoot(this);
  }
  
  // Random enemy shooting - much less frequent now
  if (this.enemies.length > 0 && Math.random() < 0.008) { // Reduced from 0.02 to 0.008
    enemyShoot(this);
  }
  
  // Update player bullets
  for (let i = this.bullets.length - 1; i >= 0; i--) {
    const bullet = this.bullets[i];
    if (!bullet || !bullet.active) {
      this.bullets.splice(i, 1);
      continue;
    }
    
    // Move bullet up (increased from 10 to 12)
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
      if (Phaser.Geom.Rectangle.Overlaps(
        new Phaser.Geom.Rectangle(bullet.x - 5, bullet.y - 10, 10, 20),
        new Phaser.Geom.Rectangle(enemy.x - 20, enemy.y - 20, 40, 40)
      )) {
        // Increase score
        window.score += 10;
        // Ensure clean text formatting for score
        window.scoreText.setText(`Score: ${window.score}`);
        
        // Increment enemies killed counter
        window.enemiesKilled++;
        if (window.enemiesKilledText) {
          window.enemiesKilledText.setText(`Enemies Killed: ${window.enemiesKilled}`);
        }
        
        // Play explosion sound
        window.sounds.explosion.play();
        
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
    
    // Move bullet down (increased from 7 to 8)
    bullet.y += 8;
    
    // Remove if off screen
    if (bullet.y > 700) {
      bullet.destroy();
      this.enemyBullets.splice(i, 1);
      continue;
    }
    
    // Check collision with player
    if (window.player && window.player.active && Phaser.Geom.Rectangle.Overlaps(
      new Phaser.Geom.Rectangle(bullet.x - 5, bullet.y - 10, 10, 20),
      new Phaser.Geom.Rectangle(window.player.x - 20, window.player.y - 30, 40, 60)
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
    
    // Move enemy down (increased from 2 to 2.5)
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
    if (window.player && window.player.active && Phaser.Geom.Rectangle.Overlaps(
      new Phaser.Geom.Rectangle(window.player.x - 20, window.player.y - 30, 40, 60),
      new Phaser.Geom.Rectangle(enemy.x - 20, enemy.y - 20, 40, 40)
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
function loseLife(scene) {
  // Flash the player
  scene.tweens.add({
    targets: window.player,
    alpha: 0.2,
    duration: 100,
    yoyo: true,
    repeat: 3
  });
  
  // Play hit sound
  window.sounds.hit.play();
  
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
function enemyShoot(scene) {
  if (window.gameState !== 'playing') return;
  
  // Choose random enemies to shoot
  const activeEnemies = scene.enemies.filter(enemy => enemy && enemy.active);
  
  if (activeEnemies.length === 0) return;
  
  // Simplified shooting logic - just select ONE random enemy to shoot
  // No more complex multi-enemy shooting
  const randomIndex = Math.floor(Math.random() * activeEnemies.length);
  const shootingEnemy = activeEnemies[randomIndex];
  
  // Only create a bullet if we have a valid enemy
  if (shootingEnemy && shootingEnemy.active) {
    const bullet = scene.add.sprite(shootingEnemy.x, shootingEnemy.y + 20, 'bullet-enemy').setScale(0.8);
    scene.enemyBullets.push(bullet);
    
    // Play enemy shoot sound
    window.sounds.enemyShoot.play();
  }
}

// Spawn enemy
function spawnEnemy(scene) {
  const x = Phaser.Math.Between(25, 525);
  
  // Randomly choose between enemy types
  const enemyType = Math.random() < 0.3 ? 'enemy2' : 'enemy1';
  
  // Create enemy sprite with appropriate scale
  const enemy = scene.add.sprite(x, -30, enemyType).setScale(0.2);
  scene.enemies.push(enemy);
}

// Player shooting - now manual with spacebar
function shoot(scene) {
  if (window.gameState !== 'playing' || !window.player || !window.player.active) return;
  
  const bullet = scene.add.sprite(window.player.x, window.player.y - 30, 'bullet').setScale(0.3);
  scene.bullets.push(bullet);
  
  // Play shoot sound
  window.sounds.shoot.play();
}

// Start the game with improved initialization
console.log('Setting up game initialization');

// Use a more robust initialization approach
function initializeWhenReady() {
  console.log('Initializing when everything is ready');
  
  // Check if container exists yet
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    console.log('Container not ready, waiting 300ms more...');
    setTimeout(initializeWhenReady, 300);
    return;
  }
  
  // Check if Phaser exists
  if (typeof Phaser === 'undefined') {
    console.log('Phaser not loaded yet, waiting 300ms more...');
    setTimeout(initializeWhenReady, 300);
    return;
  }
  
  console.log('Everything ready, starting game!');
  initGame();
}

// Replace the initialization code at the bottom with:
window.addEventListener('load', function() {
  console.log('Window fully loaded, waiting 500ms to initialize game');
  setTimeout(initializeWhenReady, 500);
});

// Add a fallback initialization in case window.load already fired
if (document.readyState === 'complete') {
  console.log('Document already complete, scheduling initialization');
  setTimeout(initializeWhenReady, 500);
} 