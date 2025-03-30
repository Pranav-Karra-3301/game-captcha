import numpy as np
import json
import os
from enum import Enum

class Action(Enum):
    """Possible actions in the space game"""
    LEFT = 0
    RIGHT = 1
    SHOOT = 2
    LEFT_SHOOT = 3
    RIGHT_SHOOT = 4
    IDLE = 5

class SpaceGameEnvironment:
    """
    Environment wrapper for the Space Invaders game
    
    This environment provides an interface between the game and the DQN agent.
    It handles converting game state into observations and rewards that the agent can use.
    """
    def __init__(self, game_state_shape=(84, 84), max_steps=1000):
        """
        Initialize the environment
        
        Args:
            game_state_shape: Shape of the game state
            max_steps: Maximum number of steps per episode
        """
        self.game_state_shape = game_state_shape
        self.max_steps = max_steps
        self.current_step = 0
        self.total_reward = 0.0
        self.current_state = None
        self.action_space = len(Action)
        self.observation_space_shape = game_state_shape
        
        # Game state tracking
        self.player_health = 100
        self.score = 0
        self.enemies_destroyed = 0
        self.player_position = 0.5  # normalized position (0-1)
        
        # Episode information
        self.episode_history = []
    
    def reset(self):
        """
        Reset the environment to start a new episode
        
        Returns:
            Initial observation
        """
        self.current_step = 0
        self.total_reward = 0.0
        
        # Reset game state
        self.player_health = 100
        self.score = 0
        self.enemies_destroyed = 0
        self.player_position = 0.5
        
        # Generate initial state (placeholder)
        self.current_state = np.zeros(self.game_state_shape, dtype=np.float32)
        
        return self.current_state
    
    def step(self, action):
        """
        Take a step in the environment with the given action
        
        Args:
            action: Action to take
            
        Returns:
            (next_state, reward, done, info)
        """
        self.current_step += 1
        
        # Process action
        self._process_action(action)
        
        # Update game state (this would interact with the actual game in a real implementation)
        self._update_game_state()
        
        # Check if episode is done
        done = self._is_episode_done()
        
        # Calculate reward
        reward = self._calculate_reward()
        
        # Update total reward
        self.total_reward += reward
        
        # Generate observation
        next_state = self._get_observation()
        
        # Return step information
        info = {
            "player_health": self.player_health,
            "score": self.score,
            "enemies_destroyed": self.enemies_destroyed,
            "step": self.current_step,
            "total_reward": self.total_reward
        }
        
        return next_state, reward, done, info
    
    def _process_action(self, action):
        """
        Process the action and update the environment accordingly
        
        Args:
            action: Action to take
        """
        # This would interact with the game in a real implementation
        # For now, just update player position based on action
        
        if action == Action.LEFT.value or action == Action.LEFT_SHOOT.value:
            # Move left
            self.player_position = max(0, self.player_position - 0.1)
        
        if action == Action.RIGHT.value or action == Action.RIGHT_SHOOT.value:
            # Move right
            self.player_position = min(1.0, self.player_position + 0.1)
        
        if action == Action.SHOOT.value or action == Action.LEFT_SHOOT.value or action == Action.RIGHT_SHOOT.value:
            # Shoot
            # In a real implementation, this would fire a projectile
            # Here we just simulate a random chance of hitting an enemy
            if np.random.random() < 0.3:
                self.enemies_destroyed += 1
                self.score += 100
    
    def _update_game_state(self):
        """
        Update the game state based on the current action and environment
        """
        # Simulate enemies shooting at player
        if np.random.random() < 0.2:
            damage = np.random.randint(5, 15)
            self.player_health = max(0, self.player_health - damage)
        
        # Simulate score increasing over time
        self.score += 1
    
    def _is_episode_done(self):
        """
        Check if the episode is done
        
        Returns:
            True if the episode is done, False otherwise
        """
        # Episode ends if player health is 0, max steps reached, or all enemies destroyed
        return (
            self.player_health <= 0 or 
            self.current_step >= self.max_steps or 
            self.enemies_destroyed >= 50  # Assuming 50 enemies per level
        )
    
    def _calculate_reward(self):
        """
        Calculate the reward for the current step
        
        Returns:
            Reward value
        """
        reward = 0.0
        
        # Reward for destroying enemies
        reward += self.enemies_destroyed * 1.0
        
        # Reward for staying alive
        reward += 0.1
        
        # Penalty for taking damage
        if self.player_health < 100:
            reward -= 0.5
        
        # Penalty for dying
        if self.player_health <= 0:
            reward -= 10.0
        
        # Reward for completing the level
        if self.enemies_destroyed >= 50:
            reward += 50.0
        
        return reward
    
    def _get_observation(self):
        """
        Get the current observation of the environment
        
        Returns:
            Current observation
        """
        # In a real implementation, this would get the current game screen
        # For now, just return a placeholder state
        observation = np.zeros(self.game_state_shape, dtype=np.float32)
        
        # Add some features to the observation
        # Player position (represented as a bright spot)
        player_x = int(self.player_position * self.game_state_shape[1])
        observation[self.game_state_shape[0] - 10:self.game_state_shape[0], 
                   max(0, player_x - 5):min(self.game_state_shape[1], player_x + 5)] = 1.0
        
        # Enemy positions (represented as scattered dots)
        for _ in range(50 - self.enemies_destroyed):
            x = np.random.randint(0, self.game_state_shape[1])
            y = np.random.randint(0, self.game_state_shape[0] - 20)
            observation[y:y+3, x:x+3] = 0.7
        
        self.current_state = observation
        return observation
    
    def close(self):
        """
        Close the environment
        """
        pass
    
    def render(self):
        """
        Render the environment (does nothing in this implementation)
        """
        pass
    
    def save_episode_data(self, filename):
        """
        Save the current episode data to a file
        
        Args:
            filename: File to save data to
        """
        episode_data = {
            "total_reward": self.total_reward,
            "episode_length": self.current_step,
            "final_score": self.score,
            "enemies_destroyed": self.enemies_destroyed
        }
        
        # Save to file
        with open(filename, 'w') as f:
            json.dump(episode_data, f)


class WebGameEnvironment:
    """
    Environment wrapper for web-based Space Invaders game
    
    This environment provides an interface for collecting data from the web game
    and using it to train a DQN agent.
    """
    def __init__(self):
        """Initialize the environment"""
        self.action_space = len(Action)
        self.current_episode_data = []
        self.all_episodes_data = []
    
    def record_step(self, state, action, next_state, reward, done):
        """
        Record a step in the environment
        
        Args:
            state: Current state
            action: Action taken
            next_state: Next state
            reward: Reward received
            done: Whether the episode is done
        """
        self.current_episode_data.append({
            "state": state,
            "action": action,
            "next_state": next_state,
            "reward": reward,
            "done": done
        })
        
        # If episode is done, add to all episodes data
        if done:
            self.all_episodes_data.append(self.current_episode_data)
            self.current_episode_data = []
    
    def get_all_data(self):
        """
        Get all recorded data
        
        Returns:
            List of all episodes' data
        """
        return self.all_episodes_data
    
    def save_data(self, filename):
        """
        Save all recorded data to a file
        
        Args:
            filename: File to save data to
        """
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        # Save data to file
        np.save(filename, self.all_episodes_data, allow_pickle=True)
    
    def load_data(self, filename):
        """
        Load data from a file
        
        Args:
            filename: File to load data from
        """
        self.all_episodes_data = list(np.load(filename, allow_pickle=True))
    
    def get_training_samples(self):
        """
        Get all data as training samples
        
        Returns:
            states, actions, next_states, rewards, dones
        """
        states = []
        actions = []
        next_states = []
        rewards = []
        dones = []
        
        for episode in self.all_episodes_data:
            for step in episode:
                states.append(step["state"])
                actions.append(step["action"])
                next_states.append(step["next_state"])
                rewards.append(step["reward"])
                dones.append(step["done"])
        
        return np.array(states), np.array(actions), np.array(next_states), np.array(rewards), np.array(dones) 