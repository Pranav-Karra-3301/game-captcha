// This file will contain game state management
// We'll implement the actual game later

export interface GameState {
  score: number;
  lives: number;
  level: number;
  playerPosition: {
    x: number;
    y: number;
  };
  enemies: Enemy[];
  bullets: Bullet[];
  gameOver: boolean;
}

export interface Enemy {
  id: string;
  position: {
    x: number;
    y: number;
  };
  health: number;
  type: string;
}

export interface Bullet {
  id: string;
  position: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
  damage: number;
  isPlayerBullet: boolean;
}

// Initialize a default game state
export function initGameState(): GameState {
  return {
    score: 0,
    lives: 3,
    level: 1,
    playerPosition: {
      x: 0,
      y: 0,
    },
    enemies: [],
    bullets: [],
    gameOver: false,
  };
}

// Collect game play data for AI training
export function collectTrainingData(gameState: GameState): number[] {
  // This will extract relevant features from the game state
  // for training the AI model
  return [
    gameState.playerPosition.x,
    gameState.playerPosition.y,
    gameState.enemies.length,
    // More features to be added
  ];
}