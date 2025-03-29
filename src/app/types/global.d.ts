// Global type declarations
interface Window {
  gameInitialized?: boolean;
  gameInstance?: object; // The Phaser game instance
  initGame?: () => void;
  gameData?: {
    sessionId: string;
    startTime: number;
    lastPositionRecord: number;
    events: Array<{
      type: string;
      position?: { x: number; y: number };
      score?: number;
      finalScore?: number;
      playtime?: number;
      livesRemaining?: number;
      timestamp: number;
    }>;
    positions: Array<{
      x: number;
      y: number;
      timestamp: number;
    }>;
  };
} 