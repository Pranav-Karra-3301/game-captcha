"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import React from "react";
import Link from "next/link";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  useGLTF, 
  useAnimations, 
} from "@react-three/drei";
import styles from "./page.module.css";
import ChartDashboard, { ChartDashboardItem } from '../components/ChartDashboard';
import MetricChart from '../components/MetricChart';
import AdvancedChart from '../components/AdvancedChart';
import StatCard from '../components/StatCard';
import { 
  modelAccuracyData, 
  trainingLossData, 
  rewardProgressData, 
  explorationRateData,
  trainingDistributionData,
  resourceUsageData,
  timeLabels, 
  generateLabeledData
} from '../utils/chartData';

// Specify the path to the gltf model
const MODEL_PATH = "/spaceship_-_cb2/scene.gltf";

// Preload the model
useGLTF.preload(MODEL_PATH);

// Model component using built-in animations
function SpaceshipModel() {
  const group = useRef<THREE.Group>(null);
  
  // Load the spaceship model with animations
  const { scene, animations } = useGLTF(MODEL_PATH);
  
  // Set up animations
  const { actions } = useAnimations(animations, group);
  
  // Play animations when component mounts
  useEffect(() => {
    if (scene) {
      // Setup materials but disable shadows which can cause rendering issues
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Disable shadow casting which might cause render issues
          child.castShadow = false;
          child.receiveShadow = false;
          
          // Ensure materials are properly set up
          if (child.material) {
            child.material.needsUpdate = true;
            // Make sure we're not using expensive rendering features
            child.material.transparent = false;
            child.material.fog = false;
          }
        }
      });
      
      console.log("GLTF Model loaded successfully", scene);
      console.log("Available animations:", animations);
      
      // Play all animations if available
      if (animations && animations.length > 0) {
        console.log("Playing animations");
        Object.values(actions).forEach(action => {
          if (action) action.play();
        });
      }
    }
  }, [scene, animations, actions]);
  
  return (
    <>
      {/* Spaceship model */}
      <group ref={group} scale={0.2} position={[0, 1, -5]} rotation={[-1.6, Math.PI/2, 2]}>
        <primitive object={scene} />
      </group>
    </>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("play");
  const [showNotification, setShowNotification] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Load audio but don't try to autoplay
  useEffect(() => {
    // Wait for user interaction before attempting to play
    const userInteraction = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current.play()
          .then(() => {
            console.log("Audio playing successfully");
            setShowNotification(false);
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
          });
      }
      // Don't remove event listeners - needed for mobile browsers
    };
    
    // Add event listeners for user interaction
    window.addEventListener('click', userInteraction);
    window.addEventListener('touchstart', userInteraction);
    window.addEventListener('keydown', userInteraction);
    
    return () => {
      // Clean up event listeners when component unmounts
      window.removeEventListener('click', userInteraction);
      window.removeEventListener('touchstart', userInteraction);
      window.removeEventListener('keydown', userInteraction);
    };
  }, []);
  
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Generate weekly performance data
  const weeklyPerformanceData = generateLabeledData(
    timeLabels.daily,
    50,
    90,
    'up'
  );

  // Get the most recent values for our stat cards
  const currentAccuracy = modelAccuracyData[modelAccuracyData.length - 1];
  const previousAccuracy = modelAccuracyData[modelAccuracyData.length - 2];
  const accuracyChange = ((currentAccuracy - previousAccuracy) / previousAccuracy) * 100;
  
  const currentLoss = trainingLossData[trainingLossData.length - 1];
  const previousLoss = trainingLossData[trainingLossData.length - 2];
  const lossChange = ((currentLoss - previousLoss) / previousLoss) * 100;
  
  const currentReward = rewardProgressData[rewardProgressData.length - 1];
  const previousReward = rewardProgressData[rewardProgressData.length - 2];
  const rewardChange = ((currentReward - previousReward) / previousReward) * 100;
  
  const totalEpisodes = 1250;
  const episodesCompleted = 937;
  const completionPercentage = Math.round((episodesCompleted / totalEpisodes) * 100);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-900 via-space-900 to-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto pb-32">
        {/* Stats Overview */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Model Accuracy"
              value={currentAccuracy.toFixed(1)}
              suffix="%"
              change={accuracyChange}
              trend="up"
              color="#4cd964"
              icon={<span className="text-lg">📈</span>}
            />
            
            <StatCard 
              title="Loss Value"
              value={currentLoss.toFixed(1)}
              change={lossChange}
              trend="down"
              color="#ff3b30"
              icon={<span className="text-lg">📉</span>}
            />
            
            <StatCard 
              title="Average Reward"
              value={currentReward.toFixed(1)}
              change={rewardChange}
              trend="up"
              color="#5ac8fa"
              icon={<span className="text-lg">🏆</span>}
            />
            
            <StatCard 
              title="Training Progress"
              value={completionPercentage}
              suffix="%"
              trend="neutral"
              color="#ffcc00"
              icon={<span className="text-lg">⏱️</span>}
            />
          </div>
        </div>
        
        {/* Dashboard Charts */}
        <ChartDashboard 
          title="Model Training Dashboard" 
          subtitle="Real-time performance metrics for your AI model"
        >
          <ChartDashboardItem 
            title="Model Accuracy" 
            subtitle="Training performance over time"
            accentColor="#4cd964" // Green
          >
            <MetricChart 
              data={modelAccuracyData} 
              color="#4cd964" 
              label="Current Accuracy"
              showDataPoints={true}
            />
          </ChartDashboardItem>
          
          <ChartDashboardItem 
            title="Training Loss" 
            subtitle="Decreasing over training epochs"
            accentColor="#ff3b30" // Red
          >
            <MetricChart 
              data={trainingLossData} 
              color="#ff3b30" 
              label="Current Loss"
              showDataPoints={true}
            />
          </ChartDashboardItem>
          
          <ChartDashboardItem 
            title="Reward Progress" 
            subtitle="Average rewards per episode"
            accentColor="#5ac8fa" // Blue
          >
            <MetricChart 
              data={rewardProgressData} 
              color="#5ac8fa" 
              label="Current Reward"
              showDataPoints={true}
            />
          </ChartDashboardItem>
          
          <ChartDashboardItem 
            title="Exploration Rate" 
            subtitle="Epsilon decay during training"
            accentColor="#ffcc00" // Yellow
          >
            <MetricChart 
              data={explorationRateData} 
              color="#ffcc00" 
              label="Current Epsilon"
              showDataPoints={true}
            />
          </ChartDashboardItem>
          
          <ChartDashboardItem 
            title="Action Distribution" 
            subtitle="Frequency of actions taken by the agent"
            accentColor="#af52de" // Purple
            span="md"
          >
            <AdvancedChart 
              data={trainingDistributionData}
              type="donut"
              color="#af52de"
              height={180}
              showLegend={true}
              formatValue={(v) => `${v}`}
            />
          </ChartDashboardItem>
          
          <ChartDashboardItem 
            title="Resource Usage" 
            subtitle="Current resource utilization"
            accentColor="#5856d6" // Indigo
            span="md"
          >
            <AdvancedChart 
              data={resourceUsageData}
              type="bar"
              color="#5856d6"
              secondaryColor="#34324d"
              height={180}
              showLabels={true}
              formatValue={(v) => `${v}%`}
            />
          </ChartDashboardItem>
          
          <ChartDashboardItem 
            title="Weekly Performance" 
            subtitle="Performance metrics by day"
            accentColor="#007aff" // Blue
            span="full"
            height={280}
          >
            <AdvancedChart 
              data={weeklyPerformanceData}
              type="area"
              color="#007aff"
              height={250}
              showLabels={true}
              showGrid={true}
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
          </ChartDashboardItem>
        </ChartDashboard>
      </div>

      {/* Audio element without autoplay */}
      <audio 
        ref={audioRef}
        src="/spaceship.mp3" 
        loop 
        preload="auto"
        muted={isMuted}
      />
      
      {/* HackPSU emblem */}
      <div className={styles.hackpsuEmblem}>
        <img 
          src="/hackpsu emblem.png" 
          alt="HackPSU Emblem" 
          style={{ width: '180%', height: 'auto' }}
        />
      </div>
      
      {/* Mute button */}
      <button 
        className={styles.muteButton}
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
      
      {/* Sound notification */}
      {showNotification && (
        <div className={styles.soundNotification}>
          <p>Click anywhere to enable sound 🔊</p>
          <button onClick={() => {
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => setShowNotification(false))
                .catch(err => console.error("Play failed:", err));
            }
          }}>
            Play Music
          </button>
        </div>
      )}
      
      {/* Space background */}
      <div className={styles.stars}></div>
      <div className={styles.twinkling}></div>
      <div className={styles.clouds}></div>
      
      {/* 3D model with transparent background */}
      <div className={styles.modelBackground}>
        <div className={styles.stars}></div>
        <Suspense fallback={<div className={styles.loader}>Loading spaceship...</div>}>
          <Canvas
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: 'default',
              failIfMajorPerformanceCaveat: false
            }}
            camera={{ position: [0, 0, 10], fov: 30 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            dpr={[1, 1.5]} // Reduce DPR to improve performance
          >
            {/* <color attach="background" args={['black']} /> */}
            
            <ambientLight intensity={1.2} />
            <directionalLight 
              position={[5, 5, 5]} 
              intensity={3.5} 
              castShadow={false}
            />
            <pointLight position={[-5, 5, 5]} intensity={1.5} color="#6695ff" />
            <pointLight position={[5, -5, -5]} intensity={1.2} color="#ff9966" />
            <pointLight position={[0, 0, 10]} intensity={2} color="#ffffff" />
            
            {/* Spaceship model */}
            <SpaceshipModel />
            
            {/* Interactive controls with limited functionality */}
            <OrbitControls 
              enableDamping={false}
              enableZoom={false}
              enablePan={false}
              rotateSpeed={0.5}
              minDistance={5}
              maxDistance={20}
            />
          </Canvas>
        </Suspense>
      </div>
      
      {/* Content overlay */}
      <div className={styles.contentOverlay}>
        <div className={styles.logoContainer}>
          <img src="/logo.webp" alt="Space Trainer Logo" className={styles.logo} />
        </div>

        <h1 className={styles.title}>
          Train a Model by Playing Space Invader
        </h1>
        
        <nav className={styles.navbar}>
          <ul>
            <li className={activeNav === "play" ? styles.active : ""}>
              <Link href="/play" onClick={() => setActiveNav("play")} prefetch={true} aria-label="Play the game">
                Play Game
              </Link>
            </li>
            <li className={activeNav === "quest3" ? styles.active : ""}>
              <Link href="/quest3" onClick={() => setActiveNav("quest3")} prefetch={true} aria-label="Go to Quest 3">
                Quest 3
              </Link>
            </li>
            <li className={activeNav === "model" ? styles.active : ""}>
              <Link href="/model" onClick={() => setActiveNav("model")} prefetch={true} aria-label="View the model">
                Model
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* 3D Image - Moved to indicate model interactivity */}
        <div className={styles.image3dContainer}>
          <img 
            src="/3d.png" 
            alt="3D" 
            className={`${styles.image3d} ${styles.smallImage}`} 
            width="80" 
            height="80" 
          />
        </div>

        {/* Spacer to separate the 3D UI from the captcha section */}
        <div style={{ marginTop: '25rem' }}></div>
        
        {/* Captcha replacement section */}
        <div className={styles.captchaSection} id="captchaSection">
          <div className={styles.captchaContainer}>
            <div className={styles.captchaImageContainer}>
              <img 
                src="/captcha.png" 
                alt="Captcha Example" 
                className={styles.captchaImage}
                loading="lazy" 
              />
            </div>
            <div className={styles.captchaTextContainer}>
              <h2 className={styles.captchaTitle}>Replace Captcha</h2>
              <ul className={styles.captchaList}>
                <li>Captchas are:</li>
                <li>• Boring</li>
                <li>• inefficient</li>
                <li>• interrupts work</li>
                <li>• getting Harder</li>
                <li>• UGLY</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Multi-Game Support section */}
        <div className={styles.gamesSection} id="gamesSection">
          <h2 className={styles.gamesTitle}>Multi-Game Support</h2>
          
          <div className={styles.gamesCarousel}>
            <div className={styles.carouselTrack}>
              {/* Game Card - Space Invaders (Current) */}
              <Link href="/play" className={styles.gameLinkWrapper} prefetch={true} aria-label="Play Space Invaders">
                <div className={styles.gameCard}>
                  <div className={styles.gameImageContainer}>
                    <img 
                      src="/spaceInvaders.png" 
                      alt="Space Invaders" 
                      className={styles.gameImage}
                      loading="lazy" 
                      width="150"
                      height="100"
                    />
                  </div>
                  <h3 className={styles.gameName}>Space Invaders</h3>
                  <p className={styles.gameDescription}>Classic arcade shoot 'em up game</p>
                  <span className={styles.gameStatus}>Available Now</span>
                </div>
              </Link>
              
              {/* Game Card - Dino Game (Potential) */}
              <div className={styles.gameCard}>
                <div className={styles.gameImageContainer}>
                  <img src="/dinoGame.png" alt="Dino Game" className={styles.gameImage} />
                </div>
                <h3 className={styles.gameName}>Dino Game</h3>
                <p className={styles.gameDescription}>Chrome's offline T-Rex runner game</p>
                <span className={styles.gameStatus}>Coming Soon</span>
              </div>
              
              {/* Game Card - Pac-Man (Potential) */}
              <div className={styles.gameCard}>
                <div className={styles.gameImageContainer}>
                  <img src="/PacMan.png" alt="Pac-Man" className={styles.gameImage} />
                </div>
                <h3 className={styles.gameName}>Pac-Man</h3>
                <p className={styles.gameDescription}>Iconic maze chase arcade game</p>
                <span className={styles.gameStatus}>Coming Soon</span>
              </div>
              
              {/* Game Card - Donkey Kong (Potential) */}
              <div className={styles.gameCard}>
                <div className={styles.gameImageContainer}>
                  <img src="/DonkeyKong.png" alt="Donkey Kong" className={styles.gameImage} />
                </div>
                <h3 className={styles.gameName}>Donkey Kong</h3>
                <p className={styles.gameDescription}>Nintendo's platform arcade classic</p>
                <span className={styles.gameStatus}>Coming Soon</span>
              </div>
              
              {/* Game Card - Tetris (Potential) */}
              <div className={styles.gameCard}>
                <div className={styles.gameImageContainer}>
                  <img src="/tetris.png" alt="Tetris" className={styles.gameImage} />
                </div>
                <h3 className={styles.gameName}>Tetris</h3>
                <p className={styles.gameDescription}>Tile-matching puzzle game</p>
                <span className={styles.gameStatus}>Coming Soon</span>
              </div>
            </div>
            
            {/* Removed carousel dots navigation */}
          </div>
        </div>
      </div>
    </main>
  );
}
