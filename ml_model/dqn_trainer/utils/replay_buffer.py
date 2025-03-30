import numpy as np
import random
from collections import deque, namedtuple

# Define a named tuple for storing transitions
Transition = namedtuple('Transition', 
                        ('state', 'action', 'next_state', 'reward', 'done'))

class ReplayBuffer:
    """
    Replay Buffer for storing and sampling experiences
    """
    def __init__(self, capacity=10000):
        """
        Initialize the buffer with a fixed capacity
        
        Args:
            capacity: Maximum number of experiences to store
        """
        self.buffer = deque(maxlen=capacity)
    
    def add(self, state, action, next_state, reward, done):
        """
        Add a new experience to the buffer
        
        Args:
            state: Current state observation
            action: Action taken
            next_state: Next state observation
            reward: Reward received
            done: Whether the episode ended
        """
        experience = Transition(state, action, next_state, reward, done)
        self.buffer.append(experience)
    
    def sample(self, batch_size):
        """
        Sample a batch of experiences from the buffer
        
        Args:
            batch_size: Number of experiences to sample
            
        Returns:
            Batch of experiences
        """
        if len(self.buffer) < batch_size:
            batch_size = len(self.buffer)
            
        # Randomly sample experiences
        experiences = random.sample(self.buffer, batch_size)
        
        # Separate the experiences into separate arrays
        states = np.array([exp.state for exp in experiences])
        actions = np.array([exp.action for exp in experiences])
        next_states = np.array([exp.next_state for exp in experiences])
        rewards = np.array([exp.reward for exp in experiences])
        dones = np.array([exp.done for exp in experiences])
        
        return states, actions, next_states, rewards, dones
    
    def __len__(self):
        """Return the current size of the buffer"""
        return len(self.buffer)
    
    def save(self, filename):
        """Save the buffer to a file"""
        buffer_data = {
            'buffer': list(self.buffer)
        }
        np.save(filename, buffer_data, allow_pickle=True)
        
    def load(self, filename):
        """Load the buffer from a file"""
        buffer_data = np.load(filename, allow_pickle=True).item()
        self.buffer = deque(buffer_data['buffer'], maxlen=self.buffer.maxlen) 