import matplotlib.pyplot as plt
import numpy as np
import os
from datetime import datetime

class TrainingVisualizer:
    """
    Visualize training progress and results
    """
    def __init__(self, save_dir="./plots"):
        """
        Initialize the visualizer
        
        Args:
            save_dir: Directory to save plots to
        """
        self.save_dir = save_dir
        os.makedirs(save_dir, exist_ok=True)
    
    def plot_rewards(self, rewards, window_size=10, title="Episode Rewards"):
        """
        Plot episode rewards over time
        
        Args:
            rewards: List of episode rewards
            window_size: Size of the smoothing window
            title: Plot title
        """
        plt.figure(figsize=(12, 6))
        
        # Plot raw rewards
        plt.plot(rewards, alpha=0.3, label="Raw")
        
        # Plot smoothed rewards
        if len(rewards) >= window_size:
            smoothed_rewards = self._smooth(rewards, window_size)
            plt.plot(smoothed_rewards, label=f"Smoothed (window={window_size})")
        
        plt.xlabel("Episode")
        plt.ylabel("Reward")
        plt.title(title)
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Save the plot
        filename = f"rewards_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(os.path.join(self.save_dir, filename))
        plt.close()
    
    def plot_losses(self, losses, window_size=100, title="Training Loss"):
        """
        Plot training losses over time
        
        Args:
            losses: List of training losses
            window_size: Size of the smoothing window
            title: Plot title
        """
        plt.figure(figsize=(12, 6))
        
        # Plot raw losses
        plt.plot(losses, alpha=0.3, label="Raw")
        
        # Plot smoothed losses
        if len(losses) >= window_size:
            smoothed_losses = self._smooth(losses, window_size)
            plt.plot(smoothed_losses, label=f"Smoothed (window={window_size})")
        
        plt.xlabel("Training Step")
        plt.ylabel("Loss")
        plt.title(title)
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Save the plot
        filename = f"losses_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(os.path.join(self.save_dir, filename))
        plt.close()
    
    def plot_epsilon(self, epsilons, title="Exploration Rate (Epsilon)"):
        """
        Plot epsilon over time
        
        Args:
            epsilons: List of epsilon values
            title: Plot title
        """
        plt.figure(figsize=(12, 6))
        
        plt.plot(epsilons)
        
        plt.xlabel("Training Step")
        plt.ylabel("Epsilon")
        plt.title(title)
        plt.grid(True, alpha=0.3)
        
        # Save the plot
        filename = f"epsilon_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(os.path.join(self.save_dir, filename))
        plt.close()
    
    def plot_episode_lengths(self, lengths, window_size=10, title="Episode Lengths"):
        """
        Plot episode lengths over time
        
        Args:
            lengths: List of episode lengths
            window_size: Size of the smoothing window
            title: Plot title
        """
        plt.figure(figsize=(12, 6))
        
        # Plot raw lengths
        plt.plot(lengths, alpha=0.3, label="Raw")
        
        # Plot smoothed lengths
        if len(lengths) >= window_size:
            smoothed_lengths = self._smooth(lengths, window_size)
            plt.plot(smoothed_lengths, label=f"Smoothed (window={window_size})")
        
        plt.xlabel("Episode")
        plt.ylabel("Length")
        plt.title(title)
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Save the plot
        filename = f"lengths_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(os.path.join(self.save_dir, filename))
        plt.close()
    
    def plot_action_distribution(self, actions, action_names=None, title="Action Distribution"):
        """
        Plot distribution of actions
        
        Args:
            actions: List of actions
            action_names: Names of actions (if None, use indices)
            title: Plot title
        """
        plt.figure(figsize=(10, 8))
        
        # Count occurrences of each action
        unique_actions, counts = np.unique(actions, return_counts=True)
        
        # Sort by action index
        sort_indices = np.argsort(unique_actions)
        unique_actions = unique_actions[sort_indices]
        counts = counts[sort_indices]
        
        # Create names for actions if not provided
        if action_names is None:
            action_names = [f"Action {a}" for a in unique_actions]
        else:
            action_names = [action_names[a] for a in unique_actions]
        
        # Create bar plot
        plt.bar(action_names, counts)
        
        plt.xlabel("Action")
        plt.ylabel("Count")
        plt.title(title)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # Save the plot
        filename = f"action_distribution_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(os.path.join(self.save_dir, filename))
        plt.close()
    
    def plot_training_summary(self, rewards, losses, epsilons, lengths):
        """
        Create a summary plot of all training metrics
        
        Args:
            rewards: List of episode rewards
            losses: List of training losses
            epsilons: List of epsilon values
            lengths: List of episode lengths
        """
        plt.figure(figsize=(20, 15))
        
        # Plot rewards
        plt.subplot(2, 2, 1)
        window_size = min(10, len(rewards)) if rewards else 1
        plt.plot(rewards, alpha=0.3, label="Raw")
        if len(rewards) >= window_size:
            smoothed_rewards = self._smooth(rewards, window_size)
            plt.plot(smoothed_rewards, label=f"Smoothed (window={window_size})")
        plt.xlabel("Episode")
        plt.ylabel("Reward")
        plt.title("Episode Rewards")
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Plot losses
        plt.subplot(2, 2, 2)
        window_size = min(100, len(losses)) if losses else 1
        plt.plot(losses, alpha=0.3, label="Raw")
        if len(losses) >= window_size:
            smoothed_losses = self._smooth(losses, window_size)
            plt.plot(smoothed_losses, label=f"Smoothed (window={window_size})")
        plt.xlabel("Training Step")
        plt.ylabel("Loss")
        plt.title("Training Loss")
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Plot epsilon
        plt.subplot(2, 2, 3)
        plt.plot(epsilons)
        plt.xlabel("Training Step")
        plt.ylabel("Epsilon")
        plt.title("Exploration Rate (Epsilon)")
        plt.grid(True, alpha=0.3)
        
        # Plot episode lengths
        plt.subplot(2, 2, 4)
        window_size = min(10, len(lengths)) if lengths else 1
        plt.plot(lengths, alpha=0.3, label="Raw")
        if len(lengths) >= window_size:
            smoothed_lengths = self._smooth(lengths, window_size)
            plt.plot(smoothed_lengths, label=f"Smoothed (window={window_size})")
        plt.xlabel("Episode")
        plt.ylabel("Length")
        plt.title("Episode Lengths")
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Save the plot
        filename = f"training_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(os.path.join(self.save_dir, filename))
        plt.close()
    
    def _smooth(self, data, window_size):
        """
        Smooth data using a moving average
        
        Args:
            data: Data to smooth
            window_size: Size of the smoothing window
            
        Returns:
            Smoothed data
        """
        return np.convolve(data, np.ones(window_size) / window_size, mode='valid') 