import argparse
import json
import logging
import os
import sys
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import DQN components
from utils.web_interface import WebGameAPI
from models.dqn_model import DQN, ConvDQN
from models.dqn_agent import DQNAgent

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("web_integration.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Web Integration")

# Create Flask app
app = Flask(__name__)

# Create API for data collection
api = WebGameAPI(data_dir="./data")

# Create DQN agent (will be initialized when needed)
agent = None
model_loaded = False

def load_model(model_path):
    """
    Load a trained model
    
    Args:
        model_path: Path to the model
        
    Returns:
        True if successful, False otherwise
    """
    global agent, model_loaded
    
    try:
        # Determine model type from filename
        model_type = "linear" if "linear" in model_path else "conv"
        
        # Example input/output dimensions (should match what was used for training)
        input_dim = 84 * 84  # Example for a flattened 84x84 image
        output_dim = 6  # Example number of actions
        
        # Create model
        if model_type == "linear":
            model = DQN(input_dim=input_dim, output_dim=output_dim)
        else:
            model = ConvDQN(input_channels=1, output_dim=output_dim)
        
        # Create agent
        agent = DQNAgent(model=model)
        
        # Load model weights
        agent.load_model(os.path.dirname(model_path), os.path.basename(model_path))
        
        model_loaded = True
        logger.info(f"Loaded model from {model_path}")
        
        return True
    
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

@app.route('/api/predict', methods=['POST'])
def predict():
    """API endpoint for making predictions with the model"""
    global agent, model_loaded
    
    try:
        # Check if model is loaded
        if not model_loaded:
            return jsonify({
                "success": False,
                "error": "Model not loaded"
            })
        
        # Get state from request
        data = request.json
        
        if 'state' not in data:
            return jsonify({
                "success": False,
                "error": "Missing state"
            })
        
        # Convert state to numpy array
        state = np.array(data['state'])
        
        # Make prediction
        action = agent.select_action(state, epsilon=0.0)
        
        return jsonify({
            "success": True,
            "action": int(action)
        })
    
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.route('/api/record', methods=['POST'])
def record():
    """API endpoint for recording gameplay data"""
    try:
        # Get data from request
        data = request.json
        
        # Validate data
        required_keys = ["state", "action", "reward", "next_state", "done"]
        for key in required_keys:
            if key not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing {key}"
                })
        
        # Record step
        result = api.record_step(data)
        
        return jsonify({
            "success": result
        })
    
    except Exception as e:
        logger.error(f"Error recording data: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.route('/api/stats', methods=['GET'])
def stats():
    """API endpoint for getting statistics about the collected data"""
    try:
        # Get statistics
        statistics = api.get_statistics()
        
        return jsonify({
            "success": True,
            "statistics": statistics
        })
    
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        })

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="Web integration for DQN")
    
    parser.add_argument("--host", type=str, default="127.0.0.1",
                      help="Host to run the server on")
    parser.add_argument("--port", type=int, default=5000,
                      help="Port to run the server on")
    parser.add_argument("--model", type=str, default=None,
                      help="Path to the model to load")
    parser.add_argument("--data_dir", type=str, default="./data",
                      help="Directory to save data to")
    
    return parser.parse_args()

def main():
    """Main function"""
    args = parse_args()
    
    # Set data directory
    global api
    api = WebGameAPI(data_dir=args.data_dir)
    
    # Load model if specified
    if args.model:
        if not load_model(args.model):
            logger.error(f"Failed to load model {args.model}")
    
    # Run server
    logger.info(f"Starting server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port)

if __name__ == "__main__":
    main() 