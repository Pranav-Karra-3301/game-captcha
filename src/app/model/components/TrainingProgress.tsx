"use client";

import styles from "../page.module.css";

interface TrainingProgressProps {
  timeRange: string;
}

const TrainingProgress = ({ timeRange }: TrainingProgressProps) => {
  return (
    <div>
      <h2 className={styles.cardTitle}>
        Training Progress
      </h2>
      <div className={styles.chartContainer} style={{ padding: "20px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Chart Legend */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", marginRight: "15px" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "#82ca9d", marginRight: "5px" }}></div>
              <span style={{ fontSize: "0.8rem" }}>Episodes Completed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "#8884d8", marginRight: "5px" }}></div>
              <span style={{ fontSize: "0.8rem" }}>Rolling Avg Reward</span>
            </div>
          </div>
          
          {/* Simplified Chart - Bars for Episodes */}
          <div style={{ 
            display: "flex", 
            height: "150px",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "20px"
          }}>
            {Array(7).fill(0).map((_, i) => {
              // Calculate height based on time range
              const heightFactor = timeRange === "7d" ? 0.5 + (i * 0.07) :
                                 timeRange === "30d" ? 0.6 + (i * 0.05) :
                                 0.7 + (i * 0.03);
              
              return (
                <div 
                  key={i} 
                  style={{ 
                    width: "12%", 
                    height: `${heightFactor * 100}%`, 
                    backgroundColor: "#82ca9d",
                    borderRadius: "4px 4px 0 0",
                    opacity: 0.7
                  }}
                ></div>
              );
            })}
          </div>
          
          {/* Line for Reward */}
          <div style={{ 
            position: "relative", 
            height: "3px", 
            backgroundColor: "#8884d8",
            borderRadius: "2px",
            marginBottom: "20px",
            backgroundImage: timeRange === "7d" ? 
              "linear-gradient(to right, #8884d8 10%, #8884d8 20%, transparent 20%, #8884d8 20%, #8884d8 40%, transparent 40%, #8884d8 40%, #8884d8 70%, transparent 70%, #8884d8 70%, #8884d8 100%)" :
              "linear-gradient(to right, #8884d8 0%, #8884d8 30%, transparent 30%, #8884d8 30%, #8884d8 60%, transparent 60%, #8884d8 60%, #8884d8 100%)"
          }}>
            <div style={{ 
              position: "absolute", 
              width: "10px", 
              height: "10px", 
              backgroundColor: "#8884d8", 
              borderRadius: "50%", 
              right: "0", 
              top: "-4px" 
            }}></div>
          </div>
          
          {/* Date Range Selector */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className={`${styles.filterButton} ${timeRange === "7d" ? styles.active : ""}`}>7d</button>
            <button className={`${styles.filterButton} ${timeRange === "30d" ? styles.active : ""}`}>30d</button>
            <button className={`${styles.filterButton} ${timeRange === "90d" ? styles.active : ""}`}>90d</button>
            <button className={`${styles.filterButton} ${timeRange === "all" ? styles.active : ""}`}>All</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingProgress; 