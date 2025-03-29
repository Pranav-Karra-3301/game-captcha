import { supabase } from './client';

// Types
export interface GameSession {
  id?: string;
  user_id?: string;
  start_time?: Date;
  end_time?: Date | null;
  duration_seconds?: number | null;
  final_score: number;
  enemies_killed: number;
  enemies_missed: number;
  lives_remaining: number;
  game_outcome: 'win' | 'loss' | 'quit';
}

export interface GameEvent {
  session_id: string;
  event_type: string;
  event_time?: Date;
  position_x?: number;
  position_y?: number;
  score_at_event?: number;
  lives_remaining?: number;
  additional_data?: any;
}

export interface PlayerPosition {
  session_id: string;
  position_x: number;
  position_y: number;
  timestamp?: Date;
}

export interface PlayerInput {
  session_id: string;
  input_type: string;
  input_key: string;
  timestamp?: Date;
}

// Service functions
export const gameSessionService = {
  // Create a new game session and return its ID
  async createSession(): Promise<string | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert([{ 
        start_time: new Date(),
        final_score: 0,
        enemies_killed: 0,
        enemies_missed: 0,
        lives_remaining: 3,
        game_outcome: 'loss' // Default, will be updated when game ends
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating game session:', error);
      return null;
    }

    return data?.id || null;
  },

  // Update game session with final results
  async updateSession(session: GameSession): Promise<boolean> {
    const { error } = await supabase
      .from('game_sessions')
      .update({
        end_time: new Date(),
        duration_seconds: session.duration_seconds,
        final_score: session.final_score,
        enemies_killed: session.enemies_killed,
        enemies_missed: session.enemies_missed,
        lives_remaining: session.lives_remaining,
        game_outcome: session.game_outcome
      })
      .eq('id', session.id);

    if (error) {
      console.error('Error updating game session:', error);
      return false;
    }

    return true;
  },

  // Record a game event
  async recordEvent(event: GameEvent): Promise<boolean> {
    const { error } = await supabase
      .from('game_events')
      .insert([{
        session_id: event.session_id,
        event_type: event.event_type,
        event_time: event.event_time || new Date(),
        position_x: event.position_x,
        position_y: event.position_y,
        score_at_event: event.score_at_event,
        lives_remaining: event.lives_remaining,
        additional_data: event.additional_data
      }]);

    if (error) {
      console.error('Error recording game event:', error);
      return false;
    }

    return true;
  },

  // Record player position
  async recordPosition(position: PlayerPosition): Promise<boolean> {
    const { error } = await supabase
      .from('player_positions')
      .insert([{
        session_id: position.session_id,
        position_x: position.position_x,
        position_y: position.position_y,
        timestamp: position.timestamp || new Date()
      }]);

    if (error) {
      console.error('Error recording player position:', error);
      return false;
    }

    return true;
  },

  // Record player input
  async recordInput(input: PlayerInput): Promise<boolean> {
    const { error } = await supabase
      .from('player_inputs')
      .insert([{
        session_id: input.session_id,
        input_type: input.input_type,
        input_key: input.input_key,
        timestamp: input.timestamp || new Date()
      }]);

    if (error) {
      console.error('Error recording player input:', error);
      return false;
    }

    return true;
  },

  // Bulk insert positions for better performance
  async recordPositionsBulk(positions: PlayerPosition[]): Promise<boolean> {
    if (positions.length === 0) return true;
    
    const { error } = await supabase
      .from('player_positions')
      .insert(positions.map(pos => ({
        session_id: pos.session_id,
        position_x: pos.position_x,
        position_y: pos.position_y,
        timestamp: pos.timestamp || new Date()
      })));

    if (error) {
      console.error('Error bulk recording player positions:', error);
      return false;
    }

    return true;
  },

  // Bulk insert inputs for better performance
  async recordInputsBulk(inputs: PlayerInput[]): Promise<boolean> {
    if (inputs.length === 0) return true;
    
    const { error } = await supabase
      .from('player_inputs')
      .insert(inputs.map(input => ({
        session_id: input.session_id,
        input_type: input.input_type,
        input_key: input.input_key,
        timestamp: input.timestamp || new Date()
      })));

    if (error) {
      console.error('Error bulk recording player inputs:', error);
      return false;
    }

    return true;
  }
}; 