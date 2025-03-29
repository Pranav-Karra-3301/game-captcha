"use client";

import { useEffect, useRef } from 'react';
import styles from '../page.module.css';
import mermaid from 'mermaid';

interface TrainingFlowchartProps {
  className?: string;
}

const TrainingFlowchart = ({ className }: TrainingFlowchartProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
      themeVariables: {
        primaryColor: '#1E1E1E',
        primaryTextColor: '#FFFFFF',
        primaryBorderColor: '#8884d8',
        lineColor: '#8884d8',
        secondaryColor: '#121212',
        tertiaryColor: '#121212'
      }
    });

    if (mermaidRef.current) {
      const diagram = `
        flowchart TB
          START[Space Blaster Game Initialization] --> GAME[Game Loop]
          GAME --> COLLECT[Experience Collection]
          COLLECT --> MEMORY[Store in Replay Memory]
          MEMORY --> TRAIN[Training Loop]
          TRAIN --> BATCH[Sample Mini-Batch]
          BATCH --> PREDICT[Forward Pass: Predict Q-Values]
          PREDICT --> LOSS[Calculate Loss]
          LOSS --> BACK[Backpropagation]
          BACK --> UPDATE[Update Q-Network Weights]
          UPDATE --> TARGET{Update Target Network?}
          TARGET -->|Yes| COPY[Copy Weights to Target Network]
          TARGET -->|No| BATCH
          COPY --> BATCH
          BATCH --> EVALUATE{Evaluation Period?}
          EVALUATE -->|Yes| TEST[Test Agent Performance]
          EVALUATE -->|No| BATCH
          TEST --> METRICS[Update Performance Metrics]
          METRICS --> BATCH
          
          class START,GAME,COLLECT,MEMORY,TRAIN,BATCH,PREDICT,LOSS,BACK,UPDATE,TARGET,COPY,EVALUATE,TEST,METRICS flowchart-node;
      `;

      try {
        mermaid.render('mermaid-diagram', diagram).then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        });
      } catch (error) {
        console.error('Error rendering mermaid diagram:', error);
      }
    }
  }, []);

  return (
    <div className={`${styles.flowchartContainer} ${className || ''}`}>
      <h2 className={styles.cardTitle}>
        Training Loop Visualization
        <div className={styles.infoIcon}>ℹ️</div>
      </h2>
      
      <div className={styles.flowchartDescription}>
        <p>
          This diagram illustrates the reinforcement learning training loop that powers our AI agent in the Space Blaster game.
          The process combines gameplay with deep learning to continuously improve the model's performance.
        </p>
        
        <h3>How It Works:</h3>
        <ol>
          <li><strong>Game Initialization</strong>: The space blaster environment is set up with initial parameters</li>
          <li><strong>Game Loop</strong>: The game runs, providing a state to the AI agent at each timestep</li>
          <li><strong>Experience Collection</strong>: The agent interacts with the environment by selecting actions</li>
          <li><strong>Replay Memory</strong>: State transitions, actions, rewards, and next states are stored</li>
          <li><strong>Training Loop</strong>: The deep Q-network is trained on batches of experience</li>
          <li><strong>Forward Pass</strong>: The network predicts Q-values for state-action pairs</li>
          <li><strong>Loss Calculation</strong>: The difference between predicted and target Q-values is computed</li>
          <li><strong>Backpropagation</strong>: The gradient of the loss is calculated</li>
          <li><strong>Weight Update</strong>: The network parameters are updated to minimize the loss</li>
          <li><strong>Target Network Update</strong>: Periodically, the target network is updated to stabilize training</li>
          <li><strong>Evaluation</strong>: The agent is periodically tested to measure performance</li>
          <li><strong>Metrics Update</strong>: Performance metrics are collected and visualized in the dashboard</li>
        </ol>
      </div>
      
      <div className={styles.mermaidWrapper} ref={mermaidRef} />
    </div>
  );
};

export default TrainingFlowchart; 