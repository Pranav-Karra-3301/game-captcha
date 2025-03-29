"use client";

import styles from "../page.module.css";

interface LearningMetricsPanelProps {
  timeRange: string;
}

const LearningMetricsPanel = ({ timeRange }: LearningMetricsPanelProps) => {
  // Simplified metrics based on time range
  const getMetrics = () => {
    switch(timeRange) {
      case "7d":
        return {
          winRate: { current: 47.6, previous: 42.3 },
          averageScore: 6490,
          gamesProcessed: 285000,
          explorationRate: 0.27
        };
      case "30d":
        return {
          winRate: { current: 58.9, previous: 42.3 },
          averageScore: 7980,
          gamesProcessed: 469000,
          explorationRate: 0.18
        };
      case "90d":
        return {
          winRate: { current: 65.8, previous: 42.3 },
          averageScore: 10240,
          gamesProcessed: 847000,
          explorationRate: 0.12
        };
      case "all":
        return {
          winRate: { current: 68.7, previous: 42.3 },
          averageScore: 12450,
          gamesProcessed: 1024302,
          explorationRate: 0.09
        };
      default:
        return {
          winRate: { current: 58.9, previous: 42.3 },
          averageScore: 7980,
          gamesProcessed: 469000,
          explorationRate: 0.18
        };
    }
  };

  const metrics = getMetrics();
  
  const formatNumber = (num: number) => {
    return num >= 1000000
      ? `${(num / 1000000).toFixed(2)}M`
      : num >= 1000
      ? `${(num / 1000).toFixed(0)}K`
      : num.toString();
  };
  
  return (
    <div>
      <h2 className={styles.cardTitle}>
        Learning Metrics
      </h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {/* Win Rate Card */}
        <div className={styles.metricCard}>
          <h3 style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            Win Rate
          </h3>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {metrics.winRate.current.toFixed(1)}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgb(64, 216, 132)" }}>
            ↑ {(metrics.winRate.current - metrics.winRate.previous).toFixed(1)}% from {metrics.winRate.previous.toFixed(1)}%
          </div>
        </div>
        
        {/* Average Score Card */}
        <div className={styles.metricCard}>
          <h3 style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            Average Score
          </h3>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {formatNumber(metrics.averageScore)}
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgb(64, 216, 132)" }}>
            ↑ 24.6% this period
          </div>
        </div>
        
        {/* Games Processed Card */}
        <div className={styles.metricCard}>
          <h3 style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            Games Processed
          </h3>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {formatNumber(metrics.gamesProcessed)}
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
            + 50K/day
          </div>
        </div>
        
        {/* Exploration Rate Card */}
        <div className={styles.metricCard}>
          <h3 style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            Exploration Rate
          </h3>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {metrics.explorationRate.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgb(64, 156, 255)" }}>
            ↓ Decreasing (good)
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningMetricsPanel; 