import torch
import torch.nn as nn
import torch.nn.functional as F

class DQN(nn.Module):
    """
    Deep Q-Network Model
    """
    def __init__(self, input_dim, output_dim, hidden_dims=[128, 128]):
        super(DQN, self).__init__()
        
        # Build layers dynamically based on hidden_dims
        layers = []
        prev_dim = input_dim
        
        for dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, dim))
            layers.append(nn.ReLU())
            prev_dim = dim
        
        # Output layer
        layers.append(nn.Linear(prev_dim, output_dim))
        
        self.model = nn.Sequential(*layers)
    
    def forward(self, x):
        """Forward pass through the network"""
        return self.model(x)
    
    def act(self, state, epsilon=0.0):
        """
        Choose an action using epsilon-greedy policy
        
        Args:
            state: Current state observation
            epsilon: Exploration rate (0-1)
            
        Returns:
            Chosen action
        """
        if torch.rand(1).item() < epsilon:
            # Explore: choose a random action
            return torch.randint(0, self.model[-1].out_features, (1,)).item()
        else:
            # Exploit: choose the best action
            with torch.no_grad():
                q_values = self.forward(state)
                return torch.argmax(q_values).item()


class ConvDQN(nn.Module):
    """
    Convolutional DQN for image-based inputs (like screenshots of the game)
    """
    def __init__(self, input_channels, output_dim):
        super(ConvDQN, self).__init__()
        
        # Convolutional layers
        self.conv1 = nn.Conv2d(input_channels, 32, kernel_size=8, stride=4)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=4, stride=2)
        self.conv3 = nn.Conv2d(64, 64, kernel_size=3, stride=1)
        
        # Calculate the size of the flattened features
        # This would depend on the input image size in a real implementation
        self.fc_input_dim = 7 * 7 * 64  # Example size, would need to be calculated
        
        # Fully connected layers
        self.fc1 = nn.Linear(self.fc_input_dim, 512)
        self.fc2 = nn.Linear(512, output_dim)
        
    def forward(self, x):
        # Normalize the input (assuming pixel values 0-255)
        x = x / 255.0
        
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        
        # Flatten the output
        x = x.view(x.size(0), -1)
        
        x = F.relu(self.fc1(x))
        return self.fc2(x)
    
    def act(self, state, epsilon=0.0):
        """
        Choose an action using epsilon-greedy policy
        """
        if torch.rand(1).item() < epsilon:
            # Explore: choose a random action
            return torch.randint(0, self.fc2.out_features, (1,)).item()
        else:
            # Exploit: choose the best action
            with torch.no_grad():
                q_values = self.forward(state)
                return torch.argmax(q_values).item() 