"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";

interface ModelVersionHistoryProps {
  timeRange: string;
}

const ModelVersionHistory = ({ timeRange }: ModelVersionHistoryProps) => {
  const [selectedVersion, setSelectedVersion] = useState("v1.5");
  
  // Generate version data based on time range
  const getVersions = () => {
    if (timeRange === "7d") {
      return [
        {
          version: "v1.5",
          date: "2025-03-25",
          performance: 165,
          winRate: "68%",
          key_improvements: ["Improved target prioritization", "Enhanced dodge mechanics"]
        },
        {
          version: "v1.4",
          date: "2025-03-20",
          performance: 140,
          winRate: "62%",
          key_improvements: ["Enhanced dodge mechanics", "Optimized resource usage"]
        }
      ];
    } else if (timeRange === "30d") {
      return [
        {
          version: "v1.5",
          date: "2025-03-25",
          performance: 165,
          winRate: "68%",
          key_improvements: ["Improved target prioritization", "Enhanced dodge mechanics"]
        },
        {
          version: "v1.4",
          date: "2025-03-20",
          performance: 140,
          winRate: "62%",
          key_improvements: ["Enhanced dodge mechanics", "Optimized resource usage"]
        },
        {
          version: "v1.3",
          date: "2025-03-10",
          performance: 130,
          winRate: "56%",
          key_improvements: ["Better combo execution", "Reduced exploration noise"]
        },
        {
          version: "v1.2",
          date: "2025-03-01",
          performance: 120,
          winRate: "51%",
          key_improvements: ["Optimized resource usage"]
        }
      ];
    } else {
      return [
        {
          version: "v1.5",
          date: "2025-03-25",
          performance: 165,
          winRate: "68%",
          key_improvements: ["Improved target prioritization", "Enhanced dodge mechanics"]
        },
        {
          version: "v1.4",
          date: "2025-03-20",
          performance: 140,
          winRate: "62%",
          key_improvements: ["Enhanced dodge mechanics", "Optimized resource usage"]
        },
        {
          version: "v1.3",
          date: "2025-03-10",
          performance: 130,
          winRate: "56%",
          key_improvements: ["Better combo execution", "Reduced exploration noise"]
        },
        {
          version: "v1.2",
          date: "2025-03-01",
          performance: 120,
          winRate: "51%",
          key_improvements: ["Optimized resource usage"]
        },
        {
          version: "v1.1",
          date: "2025-02-15",
          performance: 115,
          winRate: "47%",
          key_improvements: ["Fixed oscillation patterns"]
        },
        {
          version: "v1.0",
          date: "2025-02-01",
          performance: 100,
          winRate: "39%",
          key_improvements: ["Initial release"]
        }
      ];
    }
  };
  
  const versions = getVersions();
  const selectedData = versions.find(v => v.version === selectedVersion) || versions[0];
  
  useEffect(() => {
    // Select newest version by default
    if (versions.length > 0) {
      setSelectedVersion(versions[0].version);
    }
  }, [timeRange]);
  
  return (
    <div>
      <h2 className={styles.cardTitle}>
        Model Version History
      </h2>
      
      <div style={{ display: "flex", marginBottom: "1.5rem", gap: "0.5rem", flexWrap: "wrap" }}>
        {versions.map((version) => (
          <button
            key={version.version}
            className={`${styles.filterButton} ${selectedVersion === version.version ? styles.active : ""}`}
            onClick={() => setSelectedVersion(version.version)}
          >
            {version.version}
          </button>
        ))}
      </div>
      
      <div className={styles.metricCard} style={{ padding: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Version</h3>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{selectedData.version}</div>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>{selectedData.date}</div>
          </div>
          
          <div>
            <h3 style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Performance</h3>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{selectedData.performance}</div>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
              Win Rate: {selectedData.winRate}
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Key Improvements</h3>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {selectedData.key_improvements.map((improvement, index) => (
                <li 
                  key={index}
                  style={{ 
                    padding: "0.5rem 0",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.9rem"
                  }}
                >
                  • {improvement}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1rem", 
          backgroundColor: "rgba(255,255,255,0.03)",
          borderRadius: "8px"
        }}>
          <h3 style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Version Comparison</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>Current vs Previous</div>
            </div>
            <div style={{ width: "60%" }}>
              <div style={{ 
                width: "100%", 
                height: "12px", 
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "6px",
                overflow: "hidden",
                position: "relative"
              }}>
                <div style={{ 
                  width: `${(selectedData.performance - 100) / 2}%`,
                  height: "100%",
                  backgroundColor: "#8884d8",
                  borderRadius: "6px",
                  transition: "width 0.5s ease-out"
                }} />
              </div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontSize: "0.8rem", 
                color: "rgba(255,255,255,0.4)",
                marginTop: "0.25rem"
              }}>
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelVersionHistory; 