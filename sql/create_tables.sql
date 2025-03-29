-- Create game_sessions table to store basic session information
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,  -- Can be null for anonymous sessions
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  final_score INTEGER DEFAULT 0,
  enemies_killed INTEGER DEFAULT 0,
  enemies_missed INTEGER DEFAULT 0,
  lives_remaining INTEGER DEFAULT 0,
  game_outcome VARCHAR(50) CHECK (game_outcome IN ('win', 'loss', 'quit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_events table to store detailed events that occurred during the game
CREATE TABLE game_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  position_x FLOAT,
  position_y FLOAT,
  score_at_event INTEGER,
  lives_remaining INTEGER,
  additional_data JSONB, -- For any other event-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_positions table to track player movement over time
CREATE TABLE player_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_inputs table to track all user inputs during the game
CREATE TABLE player_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  input_type VARCHAR(50) NOT NULL, -- e.g., 'keydown', 'keyup'
  input_key VARCHAR(50) NOT NULL,  -- e.g., 'ArrowLeft', 'Space'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_events_session_id ON game_events(session_id);
CREATE INDEX idx_game_events_event_type ON game_events(event_type);
CREATE INDEX idx_player_positions_session_id ON player_positions(session_id);
CREATE INDEX idx_player_inputs_session_id ON player_inputs(session_id);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inputs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to access their own data
CREATE POLICY "Users can view their own sessions" 
  ON game_sessions FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert new sessions" 
  ON game_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions" 
  ON game_sessions FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policies for game events
CREATE POLICY "Users can view events from their sessions" 
  ON game_events FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM game_sessions 
    WHERE game_sessions.id = game_events.session_id 
    AND (game_sessions.user_id = auth.uid() OR game_sessions.user_id IS NULL)
  ));

CREATE POLICY "Users can insert events to their sessions" 
  ON game_events FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM game_sessions 
    WHERE game_sessions.id = game_events.session_id 
    AND (game_sessions.user_id = auth.uid() OR game_sessions.user_id IS NULL)
  ));

-- Create similar policies for player_positions and player_inputs
CREATE POLICY "Users can view positions from their sessions" 
  ON player_positions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM game_sessions 
    WHERE game_sessions.id = player_positions.session_id 
    AND (game_sessions.user_id = auth.uid() OR game_sessions.user_id IS NULL)
  ));

CREATE POLICY "Users can insert positions to their sessions" 
  ON player_positions FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM game_sessions 
    WHERE game_sessions.id = player_positions.session_id 
    AND (game_sessions.user_id = auth.uid() OR game_sessions.user_id IS NULL)
  ));

CREATE POLICY "Users can view inputs from their sessions" 
  ON player_inputs FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM game_sessions 
    WHERE game_sessions.id = player_inputs.session_id 
    AND (game_sessions.user_id = auth.uid() OR game_sessions.user_id IS NULL)
  ));

CREATE POLICY "Users can insert inputs to their sessions" 
  ON player_inputs FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM game_sessions 
    WHERE game_sessions.id = player_inputs.session_id 
    AND (game_sessions.user_id = auth.uid() OR game_sessions.user_id IS NULL)
  )); 