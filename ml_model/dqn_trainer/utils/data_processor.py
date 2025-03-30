import numpy as np
import torch
from PIL import Image

class GameDataProcessor:
    """
    Process game data for training a DQN model
    """
    def __init__(self, state_shape=(84, 84), frame_stack=4, device="cpu"):
        """
        Initialize the data processor
        
        Args:
            state_shape: Shape to resize game frames to (height, width)
            frame_stack: Number of frames to stack together
            device: Device to use for tensor operations
        """
        self.state_shape = state_shape
        self.frame_stack = frame_stack
        self.device = device
        self.current_stack = None
    
    def preprocess_frame(self, frame):
        """
        Preprocess a single frame
        
        Args:
            frame: Raw frame from the game
            
        Returns:
            Preprocessed frame
        """
        # Convert frame to grayscale and resize
        if isinstance(frame, np.ndarray):
            # If frame is a numpy array (e.g., screenshot)
            if len(frame.shape) == 3 and frame.shape[2] == 3:  # RGB image
                # Convert to grayscale
                frame = np.mean(frame, axis=2).astype(np.uint8)
            
            # Resize the frame
            frame = Image.fromarray(frame).resize(self.state_shape)
            frame = np.array(frame)
        else:
            # If frame is already a PIL Image or something else
            frame = np.array(Image.fromarray(np.array(frame)).convert("L").resize(self.state_shape))
        
        # Normalize pixel values
        frame = frame / 255.0
        
        return frame
    
    def reset(self):
        """
        Reset the frame stack
        """
        self.current_stack = np.zeros((self.frame_stack, *self.state_shape), dtype=np.float32)
    
    def update_stack(self, frame):
        """
        Update the frame stack with a new frame
        
        Args:
            frame: New frame to add to the stack
            
        Returns:
            Updated frame stack
        """
        if self.current_stack is None:
            self.reset()
        
        # Preprocess the frame
        processed_frame = self.preprocess_frame(frame)
        
        # Shift the stack and add the new frame
        self.current_stack = np.roll(self.current_stack, shift=-1, axis=0)
        self.current_stack[-1] = processed_frame
        
        return self.current_stack
    
    def get_state_tensor(self, state=None):
        """
        Convert state to tensor for the neural network
        
        Args:
            state: State to convert (if None, use current_stack)
            
        Returns:
            State tensor
        """
        if state is None:
            state = self.current_stack
            
        # Convert to tensor and add batch dimension
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        
        # Move to correct device
        return state_tensor.to(self.device)
    
    def process_batch(self, states, actions, next_states, rewards, dones):
        """
        Process a batch of experiences for training
        
        Args:
            states: Batch of states
            actions: Batch of actions
            next_states: Batch of next states
            rewards: Batch of rewards
            dones: Batch of done flags
            
        Returns:
            Processed tensors ready for training
        """
        # Convert to tensors
        states_tensor = torch.FloatTensor(states).to(self.device)
        actions_tensor = torch.LongTensor(actions).unsqueeze(1).to(self.device)
        next_states_tensor = torch.FloatTensor(next_states).to(self.device)
        rewards_tensor = torch.FloatTensor(rewards).unsqueeze(1).to(self.device)
        dones_tensor = torch.FloatTensor(dones).unsqueeze(1).to(self.device)
        
        return states_tensor, actions_tensor, next_states_tensor, rewards_tensor, dones_tensor


class WebGameDataCollector:
    """
    Collect data from web-based games
    """
    def __init__(self, buffer_size=10000):
        """
        Initialize the data collector
        
        Args:
            buffer_size: Size of the replay buffer
        """
        self.gameplay_data = []
        self.max_buffer_size = buffer_size
    
    def add_gameplay_data(self, state, action, next_state, reward, done):
        """
        Add gameplay data to the collector
        
        Args:
            state: Current state
            action: Action taken
            next_state: Next state
            reward: Reward received
            done: Whether the episode is done
        """
        # Convert data to numpy arrays if they're not already
        if not isinstance(state, np.ndarray):
            state = np.array(state)
        if not isinstance(next_state, np.ndarray):
            next_state = np.array(next_state)
            
        # Store the data
        self.gameplay_data.append({
            'state': state,
            'action': action,
            'next_state': next_state,
            'reward': reward,
            'done': done
        })
        
        # If we've exceeded the buffer size, remove the oldest data
        if len(self.gameplay_data) > self.max_buffer_size:
            self.gameplay_data.pop(0)
    
    def save_data(self, filename):
        """
        Save collected data to a file
        
        Args:
            filename: File to save data to
        """
        np.save(filename, self.gameplay_data, allow_pickle=True)
    
    def load_data(self, filename):
        """
        Load collected data from a file
        
        Args:
            filename: File to load data from
        """
        self.gameplay_data = list(np.load(filename, allow_pickle=True))
    
    def get_training_data(self):
        """
        Get all collected data in a format suitable for training
        
        Returns:
            states, actions, next_states, rewards, dones
        """
        states = np.array([data['state'] for data in self.gameplay_data])
        actions = np.array([data['action'] for data in self.gameplay_data])
        next_states = np.array([data['next_state'] for data in self.gameplay_data])
        rewards = np.array([data['reward'] for data in self.gameplay_data])
        dones = np.array([data['done'] for data in self.gameplay_data])
        
        return states, actions, next_states, rewards, dones 