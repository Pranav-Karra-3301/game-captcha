"use client";

import styles from "../page.module.css";

interface ModelDiagnosticsProps {
  timeRange: string;
}

const ModelDiagnostics = ({ timeRange }: ModelDiagnosticsProps) => {
  // Mock data for recent training sessions
  const trainingSessions = [
    {
      id: "session-105",
      date: "2025-03-25",
      episodes: 2000,
      duration: "3h 25m",
      avgReward: 530,
      improvements: "Dodge rate"
    },
    {
      id: "session-104",
      date: "2025-03-20",
      episodes: 1800,
      duration: "2h 40m",
      avgReward: 480,
      improvements: "Target acquisition"
    },
    {
      id: "session-103",
      date: "2025-03-15",
      episodes: 1600,
      duration: "2h 10m",
      avgReward: 425,
      improvements: "Resource management"
    },
    {
      id: "session-102",
      date: "2025-03-10",
      episodes: 1400,
      duration: "1h 55m",
      avgReward: 380,
      improvements: "Dodge rate"
    }
  ];
  
  // Only show 2 sessions for 7d, all for others
  const sessionsToShow = timeRange === "7d" ? trainingSessions.slice(0, 2) : trainingSessions;
  
  return (
    <div>
      <h2 className={styles.cardTitle}>
        Model Diagnostics
      </h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Left side: Q-value heatmap */}
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "rgba(255,255,255,0.7)" }}>
            Q-Value Distribution
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px" }}>
            {Array(5).fill(0).map((_, rowIdx) => (
              Array(5).fill(0).map((_, colIdx) => {
                // Generate a value between 10 and 90 based on position
                const value = 10 + ((rowIdx + colIdx) * 10) + (Math.random() * 20);
                // Color based on value
                const color = `hsl(${240 - (value * 2)}, 70%, 60%)`;
                
                return (
                  <div
                    key={`cell-${rowIdx}-${colIdx}`}
                    style={{
                      backgroundColor: color,
                      padding: "1rem",
                      borderRadius: "4px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      aspectRatio: "1/1"
                    }}
                  >
                    <span style={{ 
                      color: value > 50 ? "#000" : "#fff",
                      fontSize: "0.7rem",
                      fontWeight: "bold"
                    }}>
                      {Math.round(value)}
                    </span>
                  </div>
                );
              })
            ))}
          </div>
          
          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ 
              background: "linear-gradient(to right, #313695, #4575b4, #74add1, #abd9e9, #e0f3f8, #fee090, #fdae61, #f46d43, #d73027)",
              height: "10px",
              width: "100%",
              borderRadius: "5px",
              marginTop: "0.5rem",
              marginRight: "1rem"
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
        
        {/* Right side: TD Error dots */}
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "rgba(255,255,255,0.7)" }}>
            TD Error vs Episode
          </h3>
          
          <div style={{ 
            height: "200px", 
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: "8px",
            padding: "1rem",
            position: "relative"
          }}>
            {/* Dots representing TD errors */}
            {Array(20).fill(0).map((_, i) => {
              const x = (i / 20) * 100; // x position as percentage
              // y position - errors should trend down over time
              const errorBase = 2 - (i / 20) * 1.5;
              const error = Math.max(0.1, errorBase + (Math.random() * 0.5 - 0.25));
              const y = (error / 2) * 100; // scaled to fit height
              
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${x}%`,
                    bottom: `${y}%`,
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: `rgba(136, 132, 216, ${1 - (error / 2)})`,
                    transform: "translate(-50%, 50%)"
                  }}
                />
              );
            })}
            
            {/* Axis labels */}
            <div style={{ position: "absolute", left: 0, bottom: "-25px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              Episode 1
            </div>
            <div style={{ position: "absolute", right: 0, bottom: "-25px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              Episode 30
            </div>
            <div style={{ position: "absolute", left: "-40px", top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              TD Error
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent training sessions table */}
      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "rgba(255,255,255,0.7)" }}>
          Recent Training Sessions
        </h3>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Date</th>
                <th>Episodes</th>
                <th>Duration</th>
                <th>Avg Reward</th>
                <th>Key Improvements</th>
              </tr>
            </thead>
            <tbody>
              {sessionsToShow.map((session) => (
                <tr key={session.id}>
                  <td>{session.id}</td>
                  <td>{session.date}</td>
                  <td>{session.episodes.toLocaleString()}</td>
                  <td>{session.duration}</td>
                  <td>{session.avgReward.toLocaleString()}</td>
                  <td>{session.improvements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModelDiagnostics; 