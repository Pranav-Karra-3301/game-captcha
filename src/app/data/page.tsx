'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type PlayerPosition = {
  id: string;
  player_id?: string;
  x?: number;
  y?: number;
  timestamp?: string;
  // Add other fields as needed
};

export default function DataPage() {
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayerPositions() {
      try {
        const { data, error } = await supabase
          .from('player_positions')
          .select('*');

        if (error) {
          throw error;
        }

        setPlayerPositions(data || []);
      } catch (err) {
        console.error('Error fetching player positions:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerPositions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Player Positions Data</h1>
      
      {playerPositions.length === 0 ? (
        <p>No player position data found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Player ID</th>
                <th className="px-4 py-2 text-left">X</th>
                <th className="px-4 py-2 text-left">Y</th>
                <th className="px-4 py-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {playerPositions.map((position) => (
                <tr 
                  key={position.id} 
                  className="border-b border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-2">{position.id}</td>
                  <td className="px-4 py-2">{position.player_id || '-'}</td>
                  <td className="px-4 py-2">{position.x !== undefined ? position.x : '-'}</td>
                  <td className="px-4 py-2">{position.y !== undefined ? position.y : '-'}</td>
                  <td className="px-4 py-2">{position.timestamp || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-8">
        <a 
          href="/" 
          className="inline-block px-4 py-2 border border-white/20 hover:bg-white/10 transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
} 