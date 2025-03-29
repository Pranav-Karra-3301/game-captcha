"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";

interface ActionDistributionProps {
  timeRange: string;
}

// More detailed action data for a single day (March 31)
const actionData = {
  fire: 43.2,
  moveLeft: 16.8,
  moveRight: 18.5,
  moveUp: 9.2,
  moveDown: 6.8,
  specialWeapon: 5.5
};

const ActionDistribution = ({ timeRange }: ActionDistributionProps) => {
  // Hover state
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  
  // Colors for each action type
  const actionColors = {
    fire: '#FF4560',
    moveLeft: '#00E396',
    moveRight: '#0090FF',
    moveUp: '#FFCB2D',
    moveDown: '#8884d8', 
    specialWeapon: '#FF8A65'
  };
  
  return (
    <div>
      <h2 className={styles.cardTitle}>
        Action Distribution
        <div className={styles.infoIcon}>ℹ️</div>
      </h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <p>This chart shows the frequency of actions taken by the AI model on March 31, 2025. The distribution reveals the model's strategic preferences and how it allocates its decision-making across different action types.</p>
      </div>
      
      <div className={styles.chartContainer}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
          {/* Bar Chart */}
          <div style={{ display: 'flex', height: '250px', alignItems: 'flex-end', paddingLeft: '40px', paddingRight: '20px' }}>
            {Object.entries(actionData).map(([action, value], index) => (
              <div 
                key={action}
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  height: '100%',
                  position: 'relative',
                  marginRight: index === Object.entries(actionData).length - 1 ? 0 : '15px'
                }}
                onMouseEnter={() => setHoveredAction(action)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                {/* Y-axis gridlines */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  top: '25%',
                  left: 0
                }} />
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  top: '50%',
                  left: 0
                }} />
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  top: '75%',
                  left: 0
                }} />
                
                {/* Bar */}
                <div style={{ 
                  width: '100%',
                  height: `${value}%`,
                  backgroundColor: actionColors[action as keyof typeof actionColors],
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.5s ease',
                  position: 'relative',
                  opacity: hoveredAction === null || hoveredAction === action ? 1 : 0.5,
                  cursor: 'pointer'
                }}>
                  {/* Value label */}
                  <div style={{ 
                    position: 'absolute',
                    top: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    visibility: hoveredAction === action ? 'visible' : 'hidden'
                  }}>
                    {value}%
                  </div>
                </div>
                
                {/* X-axis Label */}
                <div style={{ 
                  marginTop: '10px', 
                  textAlign: 'center',
                  color: hoveredAction === action ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.75rem',
                  fontWeight: hoveredAction === action ? 'bold' : 'normal',
                  transition: 'color 0.3s ease',
                }}>
                  {action.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
              </div>
            ))}
          </div>
          
          {/* Y-axis labels */}
          <div style={{ 
            position: 'absolute', 
            left: '10px', 
            top: '100px', 
            height: '250px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.7rem'
          }}>
            <div style={{ transform: 'translateY(-50%)' }}>75%</div>
            <div style={{ transform: 'translateY(-50%)' }}>50%</div>
            <div style={{ transform: 'translateY(-50%)' }}>25%</div>
            <div style={{ transform: 'translateY(-50%)' }}>0%</div>
          </div>
        </div>
      </div>
      
      {/* Insights Section */}
      <div style={{ 
        marginTop: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        padding: '0.8rem', 
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Key Insights:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
          <li>The AI heavily favors offensive actions (Fire: 43.2%) over movement or special abilities</li>
          <li>Lateral movement (left/right) is relatively balanced, suggesting good spatial awareness</li>
          <li>Special weapon usage is minimal (5.5%), indicating potential for improved resource management</li>
        </ul>
      </div>
    </div>
  );
};

export default ActionDistribution; 