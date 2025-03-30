# Deep Q-Network (DQN) for Space Game

This project implements a Deep Q-Network (DQN) reinforcement learning agent that can be trained on gameplay data from a Space Invaders-style game. The implementation includes both a traditional training loop with a simulated environment and the ability to train on data collected from a web-based game.

## Project Structure

```
ml_model/
├── dqn_trainer/
│   ├── models/
│   │   ├── dqn_model.py      # DQN neural network models
│   │   └── dqn_agent.py      # DQN agent implementation
│   ├── utils/
│   │   ├── replay_buffer.py  # Experience replay buffer
│   │   ├── data_processor.py # Data processing utilities
│   │   ├── visualization.py  # Training visualization utilities
│   │   └── web_interface.py  # Web API for collecting game data
│   ├── environments/
│   │   └── space_game_env.py # Simulated game environment
│   ├── train.py              # Main training script
│   └── web_integration.py    # Flask API for web integration
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Features

- Deep Q-Network implementation with PyTorch
- Support for both linear and convolutional neural network architectures
- Experience replay for stable training
- Web API for collecting gameplay data and making predictions
- Visualization utilities for monitoring training progress
- Simulated environment for testing and training without real game data

## Installation

1. Clone the repository
2. Install the required packages:

```bash
pip install -r requirements.txt
```

## Usage

### Training with Simulated Environment

```bash
python dqn_trainer/train.py --mode=train --num_episodes=100 --model_type=linear
```

### Training with Web Game Data

1. Collect data from the web game:

```bash
python dqn_trainer/train.py --mode=collect --data_dir=./data
```

2. Train the model on the collected data:

```bash
python dqn_trainer/train.py --mode=train --use_web_data --data_dir=./data --model_type=linear
```

### Evaluating a Trained Model

```bash
python dqn_trainer/train.py --mode=eval --load_model=./models/dqn_model_20230101_120000_q_network.pth
```

### Web Integration

Run the Flask API server:

```bash
python dqn_trainer/web_integration.py --model=./models/dqn_model_20230101_120000_q_network.pth
```

This will start a server with the following endpoints:

- `POST /api/predict`: Make a prediction with the trained model
- `POST /api/record`: Record gameplay data
- `GET /api/stats`: Get statistics about the collected data

## Training Process

1. **Data Collection**: Collect gameplay data either from the simulated environment or from the web game.
2. **Preprocessing**: Process the raw game state into a format suitable for the neural network.
3. **Training**: Train the DQN agent using experience replay and target networks.
4. **Evaluation**: Evaluate the trained model on new game sessions.

## Reinforcement Learning Loop

The DQN agent learns using the following loop:

1. Observe the current state
2. Choose an action (exploration vs. exploitation)
3. Execute the action and observe the reward and next state
4. Store the experience in the replay buffer
5. Sample a batch of experiences from the replay buffer
6. Train the Q-network using the sampled experiences
7. Periodically update the target network with the Q-network weights
8. Repeat

## Customization

- **Neural Network Architecture**: Modify the `DQN` and `ConvDQN` classes in `dqn_model.py` to change the network architecture.
- **Hyperparameters**: Adjust learning rate, discount factor, exploration rate, etc. in the command line arguments or directly in the code.
- **Reward Function**: Customize the reward function in `space_game_env.py` to shape the learning behavior.

## Web Game Integration

To integrate with the web game, you need to:

1. Set up the Flask API server using `web_integration.py`
2. Send HTTP requests from the web game to record gameplay data
3. Train the model using the collected data
4. Deploy the trained model to make predictions for game AI

## License

This project is licensed under the MIT License - see the LICENSE file for details. 