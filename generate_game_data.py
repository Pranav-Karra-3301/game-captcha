import csv
import os
import random
import datetime
import time
import uuid
from typing import List, Dict, Any

# Create directory for data files if it doesn't exist
os.makedirs('generated_data', exist_ok=True)

def generate_timestamp(start_time: datetime.datetime, end_time: datetime.datetime) -> str:
    """Generate a random timestamp between start and end time"""
    time_diff = (end_time - start_time).total_seconds()
    random_seconds = random.randint(0, int(time_diff))
    random_time = start_time + datetime.timedelta(seconds=random_seconds)
    return random_time.isoformat()

def generate_game_data(num_records: int) -> List[Dict[Any, Any]]:
    """Generate random game data for Space Invaders"""
    # Define current time and tomorrow 11am
    now = datetime.datetime.now()
    tomorrow = now + datetime.timedelta(days=1)
    tomorrow_11am = datetime.datetime(
        tomorrow.year, 
        tomorrow.month, 
        tomorrow.day, 
        11, 0, 0
    )
    
    game_data = []
    
    for _ in range(num_records):
        # Generate a player ID (either consistent within a game or unique per action)
        player_id = str(uuid.uuid4())[:8]
        
        # Generate random game session data
        game_session = {
            'player_id': player_id,
            'timestamp': generate_timestamp(now, tomorrow_11am),
            'score': random.randint(0, 10000),
            'level': random.randint(1, 10),
            'aliens_destroyed': random.randint(0, 50),
            'shots_fired': random.randint(0, 100),
            'accuracy': round(random.uniform(0, 1), 2),
            'time_played_seconds': random.randint(30, 600),
            'lives_remaining': random.randint(0, 3),
            'player_x_position': random.randint(0, 800),
            'player_movement': random.choice(['left', 'right', 'stationary']),
            'powerups_collected': random.randint(0, 5),
            'game_completed': random.choice([True, False]),
            'device_type': random.choice(['desktop', 'mobile', 'tablet']),
            'browser': random.choice(['chrome', 'firefox', 'safari', 'edge']),
            'os': random.choice(['windows', 'macos', 'linux', 'ios', 'android']),
            'session_id': str(uuid.uuid4())
        }
        
        game_data.append(game_session)
    
    return game_data

def write_csv_file(data: List[Dict[Any, Any]], file_path: str) -> None:
    """Write game data to a CSV file"""
    if not data:
        return
    
    fieldnames = data[0].keys()
    
    with open(file_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def generate_csv_files(num_files: int, records_per_file: int) -> None:
    """Generate multiple CSV files with random game data"""
    for i in range(num_files):
        data = generate_game_data(records_per_file)
        file_path = f'generated_data/game_data_{i+1}.csv'
        write_csv_file(data, file_path)
        print(f'Generated file {i+1}/{num_files}: {file_path} with {records_per_file} records')
        
        # Optional: Add a small delay to prevent overwhelming the system
        if i % 10 == 0 and i > 0:
            time.sleep(0.1)

if __name__ == "__main__":
    # You can adjust these parameters
    NUM_FILES = 100     # Number of CSV files to generate
    RECORDS_PER_FILE = 500  # Number of records per file
    
    start_time = time.time()
    print(f"Generating {NUM_FILES} files with {RECORDS_PER_FILE} records each...")
    
    generate_csv_files(NUM_FILES, RECORDS_PER_FILE)
    
    end_time = time.time()
    print(f"Generation complete! Total time: {end_time - start_time:.2f} seconds")
    print(f"Total records generated: {NUM_FILES * RECORDS_PER_FILE}")
    print(f"Files saved in the 'generated_data' directory") 