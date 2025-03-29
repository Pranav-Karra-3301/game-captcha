# Supabase Database Setup for Space Shooter Game

This directory contains SQL scripts to set up the database tables for storing game session data in Supabase.

## How to Run the SQL Script

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project (phzdmhdfasfptfdiquai)
3. Navigate to the SQL Editor (left sidebar)
4. Click the "New Query" button
5. Copy and paste the contents of `create_tables.sql` into the SQL editor
6. Click "Run" to execute the script

## Database Structure

The database includes the following tables:

1. **game_sessions**: Stores basic information about each game session
   - Session ID, start/end time, duration, score, outcome, etc.

2. **game_events**: Records significant events during gameplay
   - Enemy killed, player hit, game over, etc.

3. **player_positions**: Tracks player movement over time
   - X/Y coordinates with timestamps

4. **player_inputs**: Records all player inputs
   - Key presses with timestamps

## Row Level Security

The tables use Row Level Security (RLS) to ensure users can only access their own data. Anonymous sessions are also supported for users who are not logged in.

## API Integration

The React app integrates with these tables through the Supabase client in the `src/lib/supabase` directory. 