# Gameplay Data Collection for Reinforcement Learning

This document outlines how gameplay data is captured during Space Shooter gameplay sessions and how it can be used for reinforcement learning (RL) model training.

## Data Collection Overview

The game automatically collects several types of data during gameplay that can be used to train an RL model:

1. **Player Positions** - Tracked at regular intervals (every 100ms)
2. **Game Events** - Key gameplay moments (shooting, destroying enemies, getting hit, game over)
3. **Session Metadata** - Information about when the game started, how long it was played
4. **Lives System** - The player has 3 lives, and events track when lives are lost

All data is collected in a structured JSON format and stored in the `window.gameData` object during gameplay.

## Data Structure

The gameplay data is structured as follows:

```javascript
window.gameData = {
  sessionId: "game-1621234567890",  // Unique identifier for the game session
  startTime: 1621234567890,         // Timestamp when the game started
  lastPositionRecord: 1621234567990, // Timestamp for tracking position recording intervals
  events: [                         // Array of gameplay events
    {
      type: "player_shot",          // Type of event
      position: { x: 225, y: 550 }, // Position where event occurred
      timestamp: 1621234568100      // When the event occurred
    },
    {
      type: "enemy_shot",           // Enemy shooting event
      position: { x: 180, y: 120 },
      timestamp: 1621234568200
    },
    {
      type: "enemy_destroyed",
      position: { x: 180, y: 120 },
      score: 10,                    // Current score when event occurred
      timestamp: 1621234568500
    },
    {
      type: "player_hit",           // Player was hit by enemy or bullet
      livesRemaining: 2,            // Number of lives remaining after hit
      timestamp: 1621234570000
    },
    {
      type: "game_over",
      finalScore: 50,               // Final score when game ended
      playtime: 15000,              // Total playtime in milliseconds
      timestamp: 1621234582890
    }
  ],
  positions: [                      // Array of player positions over time
    {
      x: 225,
      y: 550,
      timestamp: 1621234567990
    },
    {
      x: 230,
      y: 550,
      timestamp: 1621234568090
    }
    // More position entries...
  ]
};
```

## Event Types

The following event types are tracked:

1. **player_shot** - When the player fires a bullet
   - Includes player position
   - Can be used to learn firing patterns

2. **enemy_shot** - When an enemy fires a bullet
   - Includes enemy position
   - Useful for learning enemy behavior patterns

3. **enemy_destroyed** - When an enemy is destroyed by the player
   - Includes enemy position
   - Includes current score
   - Can be used as a positive reward signal

4. **player_hit** - When the player is hit by an enemy or enemy bullet
   - Includes number of lives remaining
   - Can be used as a negative reward signal
   - Triggers temporary invulnerability

5. **game_over** - When the player loses all lives
   - Includes final score
   - Includes total playtime
   - Represents terminal state in RL

## Game Mechanics

The game has the following key mechanics relevant to RL:

1. **Player Ship** - A single player-controlled ship at the bottom of the screen
2. **Lives System** - Player starts with 3 lives, displayed as small ships at the bottom
3. **Enemy Ships** - Multiple enemy ships that move downward and shoot
4. **Shooting** - Both player and enemies can shoot bullets
5. **Collisions** - Bullets destroy ships, player gets temporary invulnerability after being hit

## Using the Data for RL Training

This data is well-suited for various RL approaches:

### State Representation

The state at any point can be represented as:
- Player position (x, y)
- Enemy positions (multiple x, y pairs)
- Bullet positions (player and enemy bullets)
- Current score
- Remaining lives

### Actions

The possible actions include:
- Move left
- Move right
- Stay still
- Shoot
- Combined actions (move and shoot)
- Defensive maneuvers (avoiding enemy bullets)

### Rewards

Reward signals can be derived from:
- +10 points for each destroyed enemy (positive reward)
- -1 for being hit and losing a life (negative reward)
- Game over state (larger negative reward)
- Survival time (small continuous positive reward)
- Dodging enemy bullets (small positive reward)

### Training Pipeline

To use this data for RL:

1. **Data Collection**: Capture gameplay data from human players
2. **Preprocessing**: Convert raw data into state-action-reward sequences
3. **Model Training**: Use techniques like DQN, PPO, or A3C with the processed data
4. **Evaluation**: Test the trained model in the game environment
5. **Iteration**: Refine the model based on performance metrics

## Implementation Details

In our current implementation, gameplay data is collected in the browser during gameplay. In a production system, this data would be:

1. Sent to a server endpoint after each game session
2. Stored in a database for later analysis
3. Processed in batches for model training
4. Used to continuously improve the AI player behavior

## Future Improvements

Potential enhancements to the data collection:

1. Add heatmaps of player positions and enemy spawns
2. Track near-misses (bullets that almost hit enemies or player)
3. Record input sequences (not just positions but actual key/mouse inputs)
4. Segment data by player skill level
5. Implement A/B testing of different RL model versions
6. Track power-up collection and usage 