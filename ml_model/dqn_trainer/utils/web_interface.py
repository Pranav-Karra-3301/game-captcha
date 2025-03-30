import json
import os
import numpy as np
from datetime import datetime
import logging

class WebGameAPI:
    """
    API for collecting data from the web game and using it to train a model
    """
    def __init__(self, data_dir="./data"):
        """
        Initialize the API
        
        Args:
            data_dir: Directory to save data to
        """
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        
        # Setup logging
        self.logger = logging.getLogger("WebGameAPI")
        self.logger.setLevel(logging.INFO)
        if not self.logger.handlers:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
            self.logger.addHandler(console_handler)
        
        # Current episode data
        self.current_episode = []
        self.episode_counter = 0
        
        # Training data
        self.all_episodes = []
    
    def record_step(self, data):
        """
        Record a step in the game
        
        Args:
            data: Step data (dict with state, action, reward, next_state, done)
        """
        try:
            # Validate data format
            required_keys = ["state", "action", "reward", "next_state", "done"]
            for key in required_keys:
                if key not in data:
                    self.logger.error(f"Missing required key in step data: {key}")
                    return False
            
            # Append to current episode
            self.current_episode.append(data)
            
            # If episode is done, save it
            if data["done"]:
                self.all_episodes.append(self.current_episode)
                self.episode_counter += 1
                self.logger.info(f"Episode {self.episode_counter} completed with {len(self.current_episode)} steps")
                
                # Save to file
                self._save_episode()
                
                # Reset current episode
                self.current_episode = []
            
            return True
        
        except Exception as e:
            self.logger.error(f"Error recording step: {str(e)}")
            return False
    
    def _save_episode(self):
        """Save the current episode to a file"""
        try:
            # Create a unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"episode_{self.episode_counter}_{timestamp}.json"
            filepath = os.path.join(self.data_dir, filename)
            
            # Convert data to JSON-serializable format
            episode_data = []
            for step in self.current_episode:
                json_step = {}
                for key, value in step.items():
                    if isinstance(value, np.ndarray):
                        json_step[key] = value.tolist()
                    else:
                        json_step[key] = value
                episode_data.append(json_step)
            
            # Save to file
            with open(filepath, 'w') as f:
                json.dump(episode_data, f)
            
            self.logger.info(f"Saved episode to {filepath}")
            
            return True
        
        except Exception as e:
            self.logger.error(f"Error saving episode: {str(e)}")
            return False
    
    def get_episodes(self):
        """
        Get all recorded episodes
        
        Returns:
            List of all episodes
        """
        return self.all_episodes
    
    def get_training_data(self):
        """
        Get all data in a format suitable for training
        
        Returns:
            (states, actions, rewards, next_states, dones)
        """
        states = []
        actions = []
        rewards = []
        next_states = []
        dones = []
        
        for episode in self.all_episodes:
            for step in episode:
                states.append(step["state"])
                actions.append(step["action"])
                rewards.append(step["reward"])
                next_states.append(step["next_state"])
                dones.append(step["done"])
        
        return (
            np.array(states),
            np.array(actions),
            np.array(rewards),
            np.array(next_states),
            np.array(dones)
        )
    
    def load_data(self, directory=None):
        """
        Load data from files
        
        Args:
            directory: Directory to load data from (if None, use self.data_dir)
        """
        if directory is None:
            directory = self.data_dir
        
        try:
            # Reset data
            self.all_episodes = []
            self.episode_counter = 0
            
            # Find all episode files
            episode_files = [f for f in os.listdir(directory) if f.startswith("episode_") and f.endswith(".json")]
            
            if not episode_files:
                self.logger.warning(f"No episode files found in {directory}")
                return False
            
            # Load each file
            for filename in episode_files:
                filepath = os.path.join(directory, filename)
                
                with open(filepath, 'r') as f:
                    episode_data = json.load(f)
                
                # Convert lists back to numpy arrays
                processed_episode = []
                for step in episode_data:
                    processed_step = {}
                    for key, value in step.items():
                        if key in ["state", "next_state"]:
                            processed_step[key] = np.array(value)
                        else:
                            processed_step[key] = value
                    processed_episode.append(processed_step)
                
                self.all_episodes.append(processed_episode)
                self.episode_counter += 1
            
            self.logger.info(f"Loaded {self.episode_counter} episodes from {directory}")
            
            return True
        
        except Exception as e:
            self.logger.error(f"Error loading data: {str(e)}")
            return False
    
    def get_statistics(self):
        """
        Get statistics about the collected data
        
        Returns:
            Dictionary of statistics
        """
        if not self.all_episodes:
            return {
                "episodes": 0,
                "total_steps": 0,
                "avg_steps_per_episode": 0,
                "avg_reward_per_episode": 0,
                "action_distribution": {}
            }
        
        total_steps = sum(len(episode) for episode in self.all_episodes)
        avg_steps = total_steps / len(self.all_episodes)
        
        # Calculate average reward per episode
        episode_rewards = []
        all_actions = []
        
        for episode in self.all_episodes:
            episode_reward = sum(step["reward"] for step in episode)
            episode_rewards.append(episode_reward)
            
            # Collect actions for distribution
            for step in episode:
                all_actions.append(step["action"])
        
        avg_reward = sum(episode_rewards) / len(episode_rewards)
        
        # Calculate action distribution
        action_counts = {}
        for action in all_actions:
            if action in action_counts:
                action_counts[action] += 1
            else:
                action_counts[action] = 1
        
        # Convert counts to percentages
        action_distribution = {str(action): count / total_steps * 100 for action, count in action_counts.items()}
        
        return {
            "episodes": len(self.all_episodes),
            "total_steps": total_steps,
            "avg_steps_per_episode": avg_steps,
            "avg_reward_per_episode": avg_reward,
            "action_distribution": action_distribution
        } 