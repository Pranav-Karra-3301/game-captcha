import argparse
import os
import torch
import numpy as np
import logging
from datetime import datetime

# Import DQN components
from models.dqn_model import DQN, ConvDQN
from models.dqn_agent import DQNAgent
from utils.replay_buffer import ReplayBuffer
from utils.data_processor import GameDataProcessor
from utils.visualization import TrainingVisualizer
from environments.space_game_env import SpaceGameEnvironment
from utils.web_interface import WebGameAPI

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("training.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("DQN Trainer")

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="Train a DQN agent on Space Invaders gameplay data")
    
    # Training options
    parser.add_argument("--mode", type=str, choices=["train", "eval", "collect"], default="train",
                        help="Mode to run the script in")
    parser.add_argument("--epochs", type=int, default=100,
                        help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=64,
                        help="Batch size for training")
    parser.add_argument("--learning_rate", type=float, default=0.0001,
                        help="Learning rate for the optimizer")
    parser.add_argument("--gamma", type=float, default=0.99,
                        help="Discount factor for future rewards")
    
    # Model options
    parser.add_argument("--model_type", type=str, choices=["linear", "conv"], default="linear",
                        help="Type of model to use")
    parser.add_argument("--hidden_dims", type=int, nargs="+", default=[128, 128],
                        help="Hidden layer dimensions")
    parser.add_argument("--load_model", type=str, default=None,
                        help="Path to load a trained model from")
    
    # Environment options
    parser.add_argument("--env_steps", type=int, default=1000,
                        help="Number of steps to run in the environment per episode")
    parser.add_argument("--num_episodes", type=int, default=10,
                        help="Number of episodes to collect data from or evaluate on")
    
    # Data options
    parser.add_argument("--data_dir", type=str, default="./data",
                        help="Directory to save/load data from")
    parser.add_argument("--use_web_data", action="store_true",
                        help="Use data from the web game instead of simulated environment")
    
    # Output options
    parser.add_argument("--save_dir", type=str, default="./models",
                        help="Directory to save models to")
    parser.add_argument("--plot_dir", type=str, default="./plots",
                        help="Directory to save plots to")
    
    return parser.parse_args()

def train_from_web_data(args):
    """Train a DQN agent using data collected from the web game"""
    logger.info("Training from web game data")
    
    # Load data
    api = WebGameAPI(data_dir=args.data_dir)
    if not api.load_data():
        logger.error("No data found. Please collect data first using --mode=collect")
        return
    
    # Get statistics
    stats = api.get_statistics()
    logger.info(f"Loaded {stats['episodes']} episodes with {stats['total_steps']} total steps")
    logger.info(f"Average steps per episode: {stats['avg_steps_per_episode']:.2f}")
    logger.info(f"Average reward per episode: {stats['avg_reward_per_episode']:.2f}")
    logger.info(f"Action distribution: {stats['action_distribution']}")
    
    # Get data for training
    states, actions, rewards, next_states, dones = api.get_training_data()
    
    # Determine input and output dimensions
    input_dim = states[0].size if hasattr(states[0], 'size') else len(states[0])
    output_dim = len(np.unique(actions))
    
    logger.info(f"Input dimension: {input_dim}")
    logger.info(f"Output dimension: {output_dim}")
    
    # Create device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device}")
    
    # Create model
    if args.model_type == "linear":
        model = DQN(input_dim=input_dim, output_dim=output_dim, hidden_dims=args.hidden_dims)
    else:
        # Assume input is image-like for conv model
        model = ConvDQN(input_channels=states[0].shape[0] if len(states[0].shape) > 2 else 1, output_dim=output_dim)
    
    # Create agent
    agent = DQNAgent(
        model=model,
        learning_rate=args.learning_rate,
        gamma=args.gamma,
        batch_size=args.batch_size,
        device=device
    )
    
    # Create replay buffer
    buffer = ReplayBuffer()
    
    # Add data to replay buffer
    for i in range(len(states)):
        buffer.add(states[i], actions[i], next_states[i], rewards[i], dones[i])
    
    # Train agent
    logger.info(f"Training for {args.epochs} epochs")
    for epoch in range(args.epochs):
        loss = agent.train_from_buffer(num_steps=len(states) // args.batch_size + 1)
        logger.info(f"Epoch {epoch+1}/{args.epochs}, Loss: {loss:.4f}")
    
    # Create directory for saving model
    os.makedirs(args.save_dir, exist_ok=True)
    
    # Save model
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_name = f"dqn_web_{timestamp}"
    agent.save_model(args.save_dir, model_name)
    logger.info(f"Model saved as {model_name}")
    
    # Create visualizations
    visualizer = TrainingVisualizer(save_dir=args.plot_dir)
    visualizer.plot_losses(agent.loss_history)
    visualizer.plot_epsilon(agent.epsilon_history)
    
    # Plot action distribution from data
    visualizer.plot_action_distribution(actions)
    
    logger.info("Training complete")

def train_with_environment(args):
    """Train a DQN agent using a simulated environment"""
    logger.info("Training with simulated environment")
    
    # Create environment
    env = SpaceGameEnvironment(max_steps=args.env_steps)
    
    # Determine input and output dimensions
    state_shape = env.observation_space_shape
    input_dim = np.prod(state_shape)  # Flatten
    output_dim = env.action_space
    
    logger.info(f"Input dimension: {input_dim}")
    logger.info(f"Output dimension: {output_dim}")
    
    # Create device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device}")
    
    # Create model
    if args.model_type == "linear":
        model = DQN(input_dim=input_dim, output_dim=output_dim, hidden_dims=args.hidden_dims)
    else:
        # Use convolutional model with image-like input
        model = ConvDQN(input_channels=1, output_dim=output_dim)
    
    # Create agent
    agent = DQNAgent(
        model=model,
        learning_rate=args.learning_rate,
        gamma=args.gamma,
        batch_size=args.batch_size,
        device=device
    )
    
    # Load model if specified
    if args.load_model:
        agent.load_model(os.path.dirname(args.load_model), os.path.basename(args.load_model))
        logger.info(f"Loaded model from {args.load_model}")
    
    # Train agent
    logger.info(f"Training for {args.num_episodes} episodes")
    
    for episode in range(args.num_episodes):
        logger.info(f"Episode {episode+1}/{args.num_episodes}")
        
        # Reset environment
        state = env.reset()
        
        # Flatten state for linear model
        if args.model_type == "linear":
            state = state.flatten()
        
        done = False
        total_reward = 0
        step = 0
        
        while not done:
            # Select action
            action = agent.select_action(state)
            
            # Take step in environment
            next_state, reward, done, info = env.step(action)
            
            # Flatten next state for linear model
            if args.model_type == "linear":
                next_state = next_state.flatten()
            
            # Add experience to replay buffer
            agent.add_experience(state, action, next_state, reward, done)
            
            # Train agent
            loss = agent.train_step()
            
            # Update state
            state = next_state
            total_reward += reward
            step += 1
            
            # Log progress
            if step % 100 == 0:
                logger.info(f"Step {step}, Total Reward: {total_reward:.2f}")
        
        # Record episode metrics
        agent.record_episode_metrics(total_reward, step)
        
        # Save episode data
        os.makedirs(args.data_dir, exist_ok=True)
        env.save_episode_data(os.path.join(args.data_dir, f"episode_{episode+1}.json"))
        
        logger.info(f"Episode {episode+1} complete, Total Reward: {total_reward:.2f}, Steps: {step}")
    
    # Create directory for saving model
    os.makedirs(args.save_dir, exist_ok=True)
    
    # Save model
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_name = f"dqn_env_{timestamp}"
    agent.save_model(args.save_dir, model_name)
    logger.info(f"Model saved as {model_name}")
    
    # Create visualizations
    visualizer = TrainingVisualizer(save_dir=args.plot_dir)
    visualizer.plot_rewards(agent.episode_rewards)
    visualizer.plot_losses(agent.loss_history)
    visualizer.plot_epsilon(agent.epsilon_history)
    visualizer.plot_episode_lengths(agent.episode_lengths)
    visualizer.plot_training_summary(
        agent.episode_rewards,
        agent.loss_history,
        agent.epsilon_history,
        agent.episode_lengths
    )
    
    logger.info("Training complete")

def evaluate_model(args):
    """Evaluate a trained DQN agent"""
    if not args.load_model:
        logger.error("No model specified for evaluation. Use --load_model to specify a model.")
        return
    
    logger.info(f"Evaluating model {args.load_model}")
    
    # Create environment
    env = SpaceGameEnvironment(max_steps=args.env_steps)
    
    # Determine input and output dimensions
    state_shape = env.observation_space_shape
    input_dim = np.prod(state_shape)  # Flatten
    output_dim = env.action_space
    
    # Create device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device}")
    
    # Create model
    if args.model_type == "linear":
        model = DQN(input_dim=input_dim, output_dim=output_dim, hidden_dims=args.hidden_dims)
    else:
        # Use convolutional model with image-like input
        model = ConvDQN(input_channels=1, output_dim=output_dim)
    
    # Create agent
    agent = DQNAgent(
        model=model,
        device=device
    )
    
    # Load model
    agent.load_model(os.path.dirname(args.load_model), os.path.basename(args.load_model))
    logger.info(f"Loaded model from {args.load_model}")
    
    # Evaluate agent
    logger.info(f"Evaluating for {args.num_episodes} episodes")
    
    episode_rewards = []
    episode_lengths = []
    
    for episode in range(args.num_episodes):
        logger.info(f"Episode {episode+1}/{args.num_episodes}")
        
        # Reset environment
        state = env.reset()
        
        # Flatten state for linear model
        if args.model_type == "linear":
            state = state.flatten()
        
        done = False
        total_reward = 0
        step = 0
        
        while not done:
            # Select action (no exploration)
            action = agent.select_action(state, epsilon=0.0)
            
            # Take step in environment
            next_state, reward, done, info = env.step(action)
            
            # Flatten next state for linear model
            if args.model_type == "linear":
                next_state = next_state.flatten()
            
            # Update state
            state = next_state
            total_reward += reward
            step += 1
        
        episode_rewards.append(total_reward)
        episode_lengths.append(step)
        
        logger.info(f"Episode {episode+1} complete, Total Reward: {total_reward:.2f}, Steps: {step}")
    
    # Calculate statistics
    avg_reward = np.mean(episode_rewards)
    avg_length = np.mean(episode_lengths)
    
    logger.info(f"Evaluation complete")
    logger.info(f"Average Reward: {avg_reward:.2f}")
    logger.info(f"Average Episode Length: {avg_length:.2f}")

def collect_web_data(args):
    """Set up environment for collecting data from web game"""
    logger.info("Setting up for web data collection")
    
    # Create API
    api = WebGameAPI(data_dir=args.data_dir)
    
    # Log instructions
    logger.info(f"Data will be saved to {args.data_dir}")
    logger.info("Data should be collected through the web interface")
    logger.info("The web game should call the API's record_step method for each step")
    
    # Log API statistics
    logger.info(f"API initialized. Current statistics:")
    stats = api.get_statistics()
    logger.info(f"Episodes: {stats['episodes']}")
    logger.info(f"Total steps: {stats['total_steps']}")
    
    # In a real implementation, this would set up a web server or other interface
    # for the game to submit data to. For this demonstration, we just print instructions.
    logger.info("\nInstructions for web integration:")
    logger.info("1. Integrate the API with your web game")
    logger.info("2. For each step in the game, call the record_step method with:")
    logger.info("   - state: Current game state (e.g. screenshot)")
    logger.info("   - action: Action taken (integer)")
    logger.info("   - next_state: Next game state")
    logger.info("   - reward: Reward received")
    logger.info("   - done: Whether the episode is done (boolean)")
    logger.info("3. Data will be automatically saved to the specified directory")
    logger.info("4. Run train.py with --mode=train and --use_web_data to train on the collected data")

def main():
    """Main function"""
    args = parse_args()
    
    # Create directories
    os.makedirs(args.data_dir, exist_ok=True)
    os.makedirs(args.save_dir, exist_ok=True)
    os.makedirs(args.plot_dir, exist_ok=True)
    
    # Run in specified mode
    if args.mode == "train":
        if args.use_web_data:
            train_from_web_data(args)
        else:
            train_with_environment(args)
    elif args.mode == "eval":
        evaluate_model(args)
    elif args.mode == "collect":
        collect_web_data(args)

if __name__ == "__main__":
    main() 