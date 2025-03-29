// Space Shooter Game - Meta Quest 3 Version
console.log('Meta Quest 3 Space Shooter initializing');

// Attach initialization function to window
if (typeof window !== 'undefined') {
  console.log('Setting up Quest 3 game on window object');
  
  // Clean up any existing game instance when script loads
  if (window.questGameInstance) {
    console.log('Destroying previous Quest 3 game instance');
    window.questGameInstance.destroy(true);
    window.questGameInstance = null;
  }
  
  // Reset the initialization flag
  window.questGameInitialized = false;
  
  // Expose the init function globally
  window.initQuestGame = initQuestGame;
  
  // Set a fallback timeout to ensure the flag gets set even if there are issues
  setTimeout(() => {
    if (!window.questGameInitialized && window.questGameInstance) {
      console.log('Setting questGameInitialized flag via fallback timeout');
      window.questGameInitialized = true;
    }
  }, 10000);
}

// Game variables - declare ONCE globally without 'let' or 'var'
// This prevents redeclaration errors when script reloads
window.questPlayer = null;
window.questScore = 0;
window.questScoreText = null;
window.questLives = 3;
window.questLivesText = null;
window.questLivesSprites = [];
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
window.mousePointer = { x: 0, y: 0 };
window.questAssetLoadingErrors = []; // Track any asset loading errors

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
  console.log('Initializing Quest 3 game...');
  
  // Check if Phaser exists
  if (typeof Phaser === 'undefined') {
    console.error('Phaser not found! Quest 3 game cannot start.');
    document.getElementById('quest-game-container').innerHTML = '<div style="color:white;text-align:center;padding:20px;"><h2>Error: Phaser not loaded</h2><p>Please check console for details</p></div>';
    return;
  }
  
  console.log('Phaser found, version:', Phaser.VERSION);
  
  // Make sure we only initialize once
  if (window.questGameInitialized) {
    console.log('Quest 3 game already initialized, skipping');
    return;
  }
  
  // Check if container exists
  const gameContainer = document.getElementById('quest-game-container');
  if (!gameContainer) {
    console.error('Quest 3 game container not found, retrying in 100ms');
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
  window.questAssetLoadingErrors = [];
  
  // Enhanced game configuration with preload function
  const config = {
    type: Phaser.AUTO,
    width: 550,
    height: 700,
    parent: 'quest-game-container',
    backgroundColor: '#000033',
    scene: {
      preload: preload,
      create: create,
      update: update
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    // Handle WebGL context loss gracefully
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false
    },
    // Add basic scale manager
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };
  
  // Create game instance
  try {
    console.log('Creating Quest 3 game instance');
    window.questGameInstance = new Phaser.Game(config);
    
    // Set the initialization flag immediately
    window.questGameInitialized = true;
    console.log('Quest 3 game initialization flag set to true immediately');
    
    // Additional check after a delay to ensure everything loaded
    setTimeout(() => {
      if (document.querySelector('#quest-game-container canvas')) {
        console.log('Quest 3 game canvas detected, initialization confirmed');
        window.questGameInitialized = true;
      } else {
        console.error('Quest 3 game canvas not found after delay, initialization may have failed');
        // But we'll still consider it initialized so React can proceed
        window.questGameInitialized = true;
      }
    }, 500);
  } catch (error) {
    console.error('Failed to create Quest 3 game:', error);
    gameContainer.innerHTML = '<div style="color:white;text-align:center;padding:20px;"><h2>Error: Could not create game</h2><p>' + error.message + '</p></div>';
    // Even though there was an error, mark as initialized so the spinner goes away
    window.questGameInitialized = true;
  }
}

// Preload assets
function preload() {
  const scene = this;
  console.log('Preloading Quest 3 game assets');
  
  // Add loading progress bar
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
  
  const assetText = this.make.text({
    x: width / 2,
    y: height / 2 + 50,
    text: '',
    style: {
      font: '18px Arial',
      fill: '#ffffff'
    }
  });
  assetText.setOrigin(0.5, 0.5);
  
  // Track loading progress
  this.load.on('progress', function (value) {
    percentText.setText(parseInt(value * 100) + '%');
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(150, 335, 300 * value, 30);
  });
  
  this.load.on('fileprogress', function (file) {
    assetText.setText('Loading: ' + file.key);
  });
  
  this.load.on('filecomplete', function (key, type, data) {
    console.log('Loaded asset:', key);
  });
  
  this.load.on('loaderror', function (file) {
    console.error('Error loading asset:', file.key);
    window.questAssetLoadingErrors.push(file.key);
  });
  
  this.load.on('complete', function () {
    console.log('All assets loaded');
    progressBar.destroy();
    progressBox.destroy();
    loadingText.destroy();
    percentText.destroy();
    assetText.destroy();
    
    // Show any asset errors
    if (window.questAssetLoadingErrors.length > 0) {
      console.error('Failed to load these assets:', window.questAssetLoadingErrors);
      const errorText = scene.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Some assets failed to load.\nCheck console for details.',
        style: {
          font: '16px Arial',
          fill: '#ff0000'
        }
      });
      errorText.setOrigin(0.5, 0.5);
      
      // Keep the game running anyway
      setTimeout(() => {
        errorText.destroy();
      }, 5000);
    }
  });
  
  // Load assets with error handling
  try {
    // Load background
    this.load.image('background', '/quest3/assets/images/background_5.png');
    
    // Load player assets
    this.load.image('player', '/quest3/assets/images/spaceship.png');
    
    // Load enemy assets
    this.load.image('enemy1', '/quest3/assets/images/enemy.png');
    this.load.image('enemy2', '/quest3/assets/images/enemy2.png');
    
    // Load bullet assets
    this.load.image('bullet', '/quest3/assets/images/bullet.png');
    this.load.image('bullet-enemy', '/quest3/assets/images/foozle/bullet-enemy.png');
    
    // Load audio assets
    this.load.audio('bgMusic', '/quest3/assets/audio/ansimuz/space_asteroids.wav');
    this.load.audio('shoot', '/quest3/assets/audio/ansimuz/shot_1.wav');
    this.load.audio('enemyShoot', '/quest3/assets/audio/ansimuz/shot_2.wav');
    this.load.audio('explosion', '/quest3/assets/audio/ansimuz/explosion.wav');
    this.load.audio('hit', '/quest3/assets/audio/ansimuz/hit.wav');
    this.load.audio('gameOver', '/quest3/assets/audio/ansimuz/gameover.wav');
  } catch (error) {
    console.error('Error in asset preload:', error);
  }
}

// Create scene
function create() {
  const scene = this;
  console.log('Creating Quest 3 game scene');
  
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
  
  // Track mouse position
  this.input.on('pointermove', function (pointer) {
    window.mousePointer.x = pointer.x;
    window.mousePointer.y = pointer.y;
  });
  
  // Mouse click to shoot
  this.input.on('pointerdown', function (pointer) {
    if (window.questGameState === 'playing' && pointer.leftButtonDown()) {
      shoot(scene);
    } else if (window.questGameState === 'menu' && pointer.leftButtonDown()) {
      startGame(scene);
    } else if (window.questGameState === 'gameover' && pointer.leftButtonDown()) {
      startGame(scene);
    }
  });
  
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
  
  // Play background music on menu
  if (!window.questSounds.bgMusic.isPlaying) {
    window.questSounds.bgMusic.play();
  }
  
  // Setup collisions
  this.physics.add.overlap(this.bulletGroup, this.enemyGroup, bulletHitEnemy, null, this);
  this.physics.add.overlap(this.enemyBulletGroup, this.playerGroup, enemyBulletHitPlayer, null, this);
}

// Create menu screen
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
  
  const instructions = scene.add.text(275, 350, 'USE MOUSE TO MOVE\nLEFT CLICK TO SHOOT', {
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

// Start game
function startGame(scene) {
  if (window.questGameState === 'playing') return;
  
  // Clear existing elements
  window.questMenuGroup.clear(true, true);
  window.questGameOverGroup.clear(true, true);
  
  // Reset game state and variables
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

function updateLivesDisplay(scene) {
  // Clear existing lives sprites
  window.questLivesSprites.forEach(sprite => sprite.destroy());
  window.questLivesSprites = [];
  
  // Create new lives sprites
  for (let i = 0; i < window.questLives; i++) {
    const sprite = scene.add.sprite(490 + i * 20, 28, 'player');
    sprite.setScale(0.2);
    window.questLivesSprites.push(sprite);
  }
}

function showGameOver(scene) {
  window.questGameState = 'gameover';
  
  const gameOverText = scene.add.text(275, 200, 'GAME OVER', {
    fontFamily: 'Arial',
    fontSize: '36px',
    color: '#ff0000'
  }).setOrigin(0.5);
  
  const scoreText = scene.add.text(275, 270, `FINAL SCORE: ${window.questScore}`, {
    fontFamily: 'Arial',
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  const statsText = scene.add.text(275, 320, 
    `ENEMIES DESTROYED: ${window.questEnemiesKilled}\nENEMIES MISSED: ${window.questEnemiesMissed}`, {
    fontFamily: 'Arial',
    fontSize: '18px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  const clickToRestart = scene.add.text(275, 400, 'CLICK TO RESTART', {
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
  
  window.questGameOverGroup.add(gameOverText);
  window.questGameOverGroup.add(scoreText);
  window.questGameOverGroup.add(statsText);
  window.questGameOverGroup.add(clickToRestart);
  
  // Play game over sound
  window.questSounds.gameOver.play();
}

// Update function - called every frame
function update(time, delta) {
  // Update background regardless of game state
  window.questBackground.tilePositionY -= window.questGameSpeed.backgroundSpeed * (delta / 1000);
  
  if (window.questGameState !== 'playing') return;
  
  // Move player towards mouse position
  if (window.questPlayer && window.mousePointer) {
    const dx = window.mousePointer.x - window.questPlayer.x;
    const dy = window.mousePointer.y - window.questPlayer.y;
    
    if (Math.abs(dx) > 5) {
      const dirX = dx > 0 ? 1 : -1;
      window.questPlayer.x += dirX * window.questGameSpeed.playerSpeed * (delta / 1000);
    }
    
    if (Math.abs(dy) > 5) {
      const dirY = dy > 0 ? 1 : -1;
      window.questPlayer.y += dirY * window.questGameSpeed.playerSpeed * (delta / 1000);
    }
  }
  
  // Spawn enemies
  window.questEnemyShootTimer += delta;
  if (Math.random() < window.questGameSpeed.enemySpawnRate * (delta / 1000)) {
    spawnEnemy(this);
  }
  
  // Enemy shooting
  if (window.questEnemyShootTimer > 2000) {
    enemyShoot(this);
    window.questEnemyShootTimer = 0;
  }
  
  // Update enemy movement
  this.enemyGroup.getChildren().forEach(enemy => {
    enemy.y += window.questGameSpeed.enemySpeed * (delta / 1000);
    
    // Check if enemy has gone offscreen
    if (enemy.y > 750) {
      enemy.destroy();
      window.questEnemiesMissed++;
      window.questEnemiesMissedText.setText(`Missed: ${window.questEnemiesMissed}`);
    }
  });
}

// Bullet hits enemy
function bulletHitEnemy(bullet, enemy) {
  bullet.destroy();
  enemy.destroy();
  
  // Play explosion sound
  window.questSounds.explosion.play();
  
  // Update score and stats
  window.questScore += 10;
  window.questEnemiesKilled++;
  
  window.questScoreText.setText(`Score: ${window.questScore}`);
  window.questEnemiesKilledText.setText(`Destroyed: ${window.questEnemiesKilled}`);
}

// Enemy bullet hits player
function enemyBulletHitPlayer(bullet, player) {
  bullet.destroy();
  
  // Play hit sound
  window.questSounds.hit.play();
  
  // Lose a life
  loseLife(this);
}

// Lose life
function loseLife(scene) {
  window.questLives--;
  updateLivesDisplay(scene);
  
  if (window.questLives <= 0) {
    showGameOver(scene);
  } else {
    // Flash player to indicate damage
    scene.tweens.add({
      targets: window.questPlayer,
      alpha: 0,
      duration: 100,
      ease: 'Linear',
      yoyo: true,
      repeat: 5
    });
  }
}

// Enemy shoots
function enemyShoot(scene) {
  const enemies = scene.enemyGroup.getChildren();
  if (enemies.length === 0) return;
  
  // Randomly select an enemy to shoot
  const enemy = enemies[Math.floor(Math.random() * enemies.length)];
  
  // Create enemy bullet
  const bullet = scene.physics.add.sprite(enemy.x, enemy.y + 20, 'bullet-enemy');
  bullet.setScale(0.7);
  scene.enemyBulletGroup.add(bullet);
  
  // Set velocity towards player
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, window.questPlayer.x, window.questPlayer.y);
  const velocityX = Math.cos(angle) * window.questGameSpeed.enemyBulletSpeed;
  const velocityY = Math.sin(angle) * window.questGameSpeed.enemyBulletSpeed;
  
  bullet.setVelocity(velocityX, velocityY);
  
  // Play sound
  window.questSounds.enemyShoot.play();
}

// Spawn enemy
function spawnEnemy(scene) {
  const x = Phaser.Math.Between(50, 500);
  const enemyType = Math.random() > 0.5 ? 'enemy1' : 'enemy2';
  
  const enemy = scene.physics.add.sprite(x, -50, enemyType);
  enemy.setScale(0.5);
  scene.enemyGroup.add(enemy);
}

// Player shoots
function shoot(scene) {
  if (window.questGameState !== 'playing') return;
  
  // Create bullet at player position
  const bullet = scene.physics.add.sprite(window.questPlayer.x, window.questPlayer.y - 20, 'bullet');
  bullet.setScale(0.5);
  scene.bulletGroup.add(bullet);
  
  // Set upward velocity
  bullet.setVelocityY(-window.questGameSpeed.bulletSpeed);
  
  // Auto-destroy bullet when it goes offscreen
  bullet.checkWorldBounds = true;
  bullet.outOfBoundsKill = true;
  
  // Play sound
  window.questSounds.shoot.play();
} 