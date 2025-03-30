import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import os
import logging
from datetime import datetime

from ..utils.replay_buffer import ReplayBuffer

class DQNAgent:
    """
    Deep Q-Learning Agent
    """
    def __init__(
        self,
        model,
        target_model=None,
        learning_rate=0.0001,
        gamma=0.99,
        epsilon_start=1.0,
        epsilon_end=0.1,
        epsilon_decay=0.995,
        target_update_freq=1000,
        batch_size=64,
        buffer_size=10000,
        device="cpu"
    ):
        """
        Initialize the DQN Agent
        
        Args:
            model: The Q-Network model
            target_model: The target Q-Network model (if None, will be a copy of model)
            learning_rate: Learning rate for the optimizer
            gamma: Discount factor for future rewards
            epsilon_start: Starting exploration rate
            epsilon_end: Minimum exploration rate
            epsilon_decay: Rate at which epsilon decays
            target_update_freq: How often to update the target network
            batch_size: Batch size for training
            buffer_size: Replay buffer size
            device: Device to use for tensor operations
        """
        self.device = device
        
        # Set up the Q-network
        self.q_network = model.to(self.device)
        
        # Set up target network
        if target_model is None:
            self.target_network = type(model)(*model.init_args, **model.init_kwargs).to(self.device)
            self.target_network.load_state_dict(model.state_dict())
        else:
            self.target_network = target_model.to(self.device)
        
        # Target network is not trained directly
        self.target_network.eval()
        
        # Set up optimizer
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=learning_rate)
        
        # Set up loss function
        self.loss_fn = nn.MSELoss()
        
        # Set up replay buffer
        self.replay_buffer = ReplayBuffer(capacity=buffer_size)
        
        # Store hyperparameters
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_start = epsilon_start
        self.epsilon_end = epsilon_end
        self.epsilon_decay = epsilon_decay
        self.target_update_freq = target_update_freq
        self.batch_size = batch_size
        
        # Training metrics
        self.train_step_counter = 0
        self.episode_rewards = []
        self.episode_lengths = []
        self.epsilon_history = []
        self.loss_history = []
        
        # Set up logging
        self.logger = logging.getLogger("DQNAgent")
        self.logger.setLevel(logging.INFO)
        if not self.logger.handlers:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
            self.logger.addHandler(console_handler)
    
    def select_action(self, state, epsilon=None):
        """
        Select an action using epsilon-greedy policy
        
        Args:
            state: Current state
            epsilon: Exploration rate (if None, use self.epsilon)
            
        Returns:
            Selected action
        """
        if epsilon is None:
            epsilon = self.epsilon
            
        # Convert state to tensor
        if not isinstance(state, torch.Tensor):
            state = torch.FloatTensor(state).unsqueeze(0).to(self.device)
        
        # Epsilon-greedy action selection
        if np.random.random() < epsilon:
            # Explore: choose a random action
            return torch.randint(0, self.q_network.model[-1].out_features, (1,)).item()
        else:
            # Exploit: choose the best action
            with torch.no_grad():
                q_values = self.q_network(state)
                return torch.argmax(q_values).item()
    
    def update_epsilon(self):
        """
        Update the exploration rate
        """
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)
        self.epsilon_history.append(self.epsilon)
    
    def update_target_network(self):
        """
        Update the target network with the current Q-network weights
        """
        self.target_network.load_state_dict(self.q_network.state_dict())
    
    def add_experience(self, state, action, next_state, reward, done):
        """
        Add an experience to the replay buffer
        
        Args:
            state: Current state
            action: Action taken
            next_state: Next state
            reward: Reward received
            done: Whether the episode is done
        """
        self.replay_buffer.add(state, action, next_state, reward, done)
    
    def train_step(self):
        """
        Perform a single training step
        
        Returns:
            Loss value for this step
        """
        # Check if we have enough samples in the buffer
        if len(self.replay_buffer) < self.batch_size:
            return None
        
        # Sample a batch of experiences
        states, actions, next_states, rewards, dones = self.replay_buffer.sample(self.batch_size)
        
        # Convert to tensors
        states = torch.FloatTensor(states).to(self.device)
        actions = torch.LongTensor(actions).unsqueeze(1).to(self.device)
        next_states = torch.FloatTensor(next_states).to(self.device)
        rewards = torch.FloatTensor(rewards).unsqueeze(1).to(self.device)
        dones = torch.FloatTensor(dones).unsqueeze(1).to(self.device)
        
        # Compute current Q values
        current_q_values = self.q_network(states).gather(1, actions)
        
        # Compute next Q values using the target network
        with torch.no_grad():
            next_q_values = self.target_network(next_states).max(1, keepdim=True)[0]
            
        # Compute target Q values
        target_q_values = rewards + (1 - dones) * self.gamma * next_q_values
        
        # Compute loss
        loss = self.loss_fn(current_q_values, target_q_values)
        
        # Optimize the model
        self.optimizer.zero_grad()
        loss.backward()
        # Clip gradients to stabilize training
        torch.nn.utils.clip_grad_norm_(self.q_network.parameters(), max_norm=1.0)
        self.optimizer.step()
        
        # Update counter and check if we should update the target network
        self.train_step_counter += 1
        if self.train_step_counter % self.target_update_freq == 0:
            self.update_target_network()
            self.logger.info(f"Updated target network at step {self.train_step_counter}")
        
        # Update epsilon
        self.update_epsilon()
        
        # Store loss
        loss_value = loss.item()
        self.loss_history.append(loss_value)
        
        return loss_value
    
    def train_from_buffer(self, num_steps):
        """
        Train the model for a specified number of steps
        
        Args:
            num_steps: Number of training steps
            
        Returns:
            Average loss over all steps
        """
        total_loss = 0.0
        steps_with_loss = 0
        
        for step in range(num_steps):
            loss = self.train_step()
            
            if loss is not None:
                total_loss += loss
                steps_with_loss += 1
            
            if step % 100 == 0:
                self.logger.info(f"Training step {step}/{num_steps}")
        
        if steps_with_loss > 0:
            avg_loss = total_loss / steps_with_loss
            self.logger.info(f"Average loss over {steps_with_loss} steps: {avg_loss:.4f}")
            return avg_loss
        else:
            self.logger.warning("No training steps had enough data for loss calculation")
            return None
    
    def save_model(self, path, name=None):
        """
        Save the model and training state
        
        Args:
            path: Directory to save to
            name: Base name for files (if None, use timestamp)
        """
        if name is None:
            name = f"dqn_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
        # Create directory if it doesn't exist
        os.makedirs(path, exist_ok=True)
        
        # Save model state
        model_path = os.path.join(path, f"{name}_q_network.pth")
        torch.save(self.q_network.state_dict(), model_path)
        
        # Save target model state
        target_model_path = os.path.join(path, f"{name}_target_network.pth")
        torch.save(self.target_network.state_dict(), target_model_path)
        
        # Save training state
        training_state = {
            "epsilon": self.epsilon,
            "train_step_counter": self.train_step_counter,
            "episode_rewards": self.episode_rewards,
            "episode_lengths": self.episode_lengths,
            "epsilon_history": self.epsilon_history,
            "loss_history": self.loss_history
        }
        
        training_path = os.path.join(path, f"{name}_training_state.pth")
        torch.save(training_state, training_path)
        
        self.logger.info(f"Saved model and training state to {path}")
    
    def load_model(self, path, name):
        """
        Load the model and training state
        
        Args:
            path: Directory to load from
            name: Base name for files
        """
        # Load model state
        model_path = os.path.join(path, f"{name}_q_network.pth")
        self.q_network.load_state_dict(torch.load(model_path, map_location=self.device))
        
        # Load target model state
        target_model_path = os.path.join(path, f"{name}_target_network.pth")
        self.target_network.load_state_dict(torch.load(target_model_path, map_location=self.device))
        
        # Load training state
        training_path = os.path.join(path, f"{name}_training_state.pth")
        training_state = torch.load(training_path, map_location=self.device)
        
        self.epsilon = training_state["epsilon"]
        self.train_step_counter = training_state["train_step_counter"]
        self.episode_rewards = training_state["episode_rewards"]
        self.episode_lengths = training_state["episode_lengths"]
        self.epsilon_history = training_state["epsilon_history"]
        self.loss_history = training_state["loss_history"]
        
        self.logger.info(f"Loaded model and training state from {path}")
    
    def record_episode_metrics(self, total_reward, episode_length):
        """
        Record metrics for a completed episode
        
        Args:
            total_reward: Total reward for the episode
            episode_length: Number of steps in the episode
        """
        self.episode_rewards.append(total_reward)
        self.episode_lengths.append(episode_length)
        
        # Log recent performance
        avg_reward = np.mean(self.episode_rewards[-10:]) if self.episode_rewards else 0
        avg_length = np.mean(self.episode_lengths[-10:]) if self.episode_lengths else 0
        
        self.logger.info(f"Episode: {len(self.episode_rewards)}, "
                        f"Reward: {total_reward:.2f}, "
                        f"Avg Reward (10 ep): {avg_reward:.2f}, "
                        f"Length: {episode_length}, "
                        f"Avg Length (10 ep): {avg_length:.2f}, "
                        f"Epsilon: {self.epsilon:.4f}") 