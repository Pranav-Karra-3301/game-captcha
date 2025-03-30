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
import { ArrowUpRight } from "lucide-react";
import styles from "./page.module.css";

// Specify the path to the gltf model
const MODEL_PATH = "/spaceship_-_cb2/scene.gltf";

// Preload the model
useGLTF.preload(MODEL_PATH);

// Model component using built-in animations
function SpaceshipModel() {
  const group = useRef<THREE.Group>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = 
        typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
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
      
      {/* Only show OrbitControls on non-mobile devices */}
      {!isMobile && (
        <OrbitControls 
          enableDamping={false}
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          minDistance={5}
          maxDistance={20}
        />
      )}
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
    // Flag to track if we've already played the audio
    let hasInteracted = false;
    
    // Wait for user interaction before attempting to play
    const userInteraction = () => {
      if (audioRef.current && !hasInteracted) {
        hasInteracted = true;
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

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-900 via-space-900 to-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto pb-32">
        {/* Dashboard and chart related sections removed */}
      </div>

      {/* Audio element without autoplay */}
      <audio 
        ref={audioRef}
        src="/spaceship.mp3" 
        loop 
        preload="auto"
        muted={isMuted}
      />
      
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
            <pointLight position={[0, 0, 10]} intensity={20} color="#ffffff" />
            
            {/* Spaceship model */}
            <SpaceshipModel />
          </Canvas>
        </Suspense>
      </div>
      
      {/* Content overlay */}
      <div className={styles.contentOverlay}>
        {/* Emblems container */}
        <div className={styles.emblemContainer}>
          <div className={styles.hackpsuEmblem}>
            <img 
              src="/hackpsu emblem.png" 
              alt="HackPSU Emblem"
            />
          </div>
          <div className={styles.metaquestEmblem}>
            <img 
              src="/MetaQuest.png" 
              alt="MetaQuest Emblem"
            />
          </div>
        </div>
        
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
            <li className={activeNav === "model" ? styles.active : ""}>
              <Link href="/model" onClick={() => setActiveNav("model")} prefetch={true} aria-label="View the model">
                Model
              </Link>
            </li>
            <li className={activeNav === "data" ? styles.active : ""}>
              <Link href="/data" onClick={() => setActiveNav("data")} prefetch={true} aria-label="View the data">
                Data
              </Link>
            </li>
            <li className={activeNav === "Business Plan" ? styles.active : ""}>
              <Link href="/plan" onClick={() => setActiveNav("Business Plan")} prefetch={true} aria-label="View the Business Plan">
                Business Plan
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
        
        {/* Improved Captcha section */}
        <div className={styles.captchaImprovedSection} id="captchaImprovedSection">
          <div className={styles.captchaImprovedContainer}>
            <div className={styles.captchaImprovedImageContainer}>
              <img src="/captchaImproved.png" alt="Improved Captcha Example" className={styles.captchaImprovedImage} />
            </div>
            <div className={styles.captchaImprovedTextContainer}>
              <h2 className={styles.captchaImprovedTitle}>The Captcha She Told You Not To Worry About</h2>
              <ul className={styles.captchaImprovedList}>
                <li>Our Captcha is:</li>
                <li>• Fun and Engaging</li>
                <li>• Trains AI Models Directly</li>
                <li>• Collects more data in shorter time</li>
                <li>• People play it for fun (a captcha... for fun)</li>
                <li>• Open Source</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Multi-Game Support section */}
        <div className={styles.gamesSection} id="gamesSection">
          <h2 className={styles.gamesTitle}>Possible Games</h2>
          
          <div className={styles.gamesCarousel}>
            {/* Left Navigation Arrow */}
            <div 
              className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
              onClick={() => {
                const track = document.querySelector(`.${styles.carouselTrack}`);
                if (track) {
                  track.scrollBy({ left: -600, behavior: 'smooth' });
                }
              }}
            >
              &#10094;
            </div>
            
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
            
            {/* Right Navigation Arrow */}
            <div 
              className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
              onClick={() => {
                const track = document.querySelector(`.${styles.carouselTrack}`);
                if (track) {
                  track.scrollBy({ left: 600, behavior: 'smooth' });
                }
              }}
            >
              &#10095;
            </div>
          </div>
        </div>
        
        {/* HackPSU Team section */}
        <div className={styles.teamSection} id="teamSection">
          <h2 className={styles.teamTitle}>For The HACKPSU Team</h2>
          
          <div className={styles.teamGrid}>
            {/* Pranav Karra */}
            <div className={styles.teamMember}>
              <div className={styles.teamImageContainer}>
                <img 
                  src="/ppl/Pranav8bit.png" 
                  alt="Pranav Karra 8-bit" 
                  className={styles.teamImage8bit} 
                />
                <img 
                  src="/ppl/Pranav.jpg" 
                  alt="Pranav Karra" 
                  className={styles.teamImageReal} 
                />
              </div>
              <h3 className={styles.teamMemberName}>Pranav Karra</h3>
            </div>
            
            {/* Manit Garg */}
            <div className={styles.teamMember}>
              <div className={styles.teamImageContainer}>
                <img 
                  src="/ppl/Manit8bit.png" 
                  alt="Manit Garg 8-bit" 
                  className={styles.teamImage8bit} 
                />
                <img 
                  src="/ppl/Manit.jpg" 
                  alt="Manit Garg" 
                  className={styles.teamImageReal} 
                />
              </div>
              <h3 className={styles.teamMemberName}>Manit Garg</h3>
            </div>
            
            {/* Dhruva Nagesh */}
            <div className={styles.teamMember}>
              <div className={styles.teamImageContainer}>
                <img 
                  src="/ppl/Dhruva8bit.png" 
                  alt="Dhruva Nagesh 8-bit" 
                  className={styles.teamImage8bit} 
                />
                <img 
                  src="/ppl/Dhruva.jpg" 
                  alt="Dhruva Nagesh" 
                  className={styles.teamImageReal} 
                />
              </div>
              <h3 className={styles.teamMemberName}>Dhruva Nagesh</h3>
            </div>
            
            {/* Pihu Agarwal */}
            <div className={styles.teamMember}>
              <div className={styles.teamImageContainer}>
                <img 
                  src="/ppl/Pihu8bit.png" 
                  alt="Pihu Agarwal 8-bit" 
                  className={styles.teamImage8bit} 
                />
                <img 
                  src="/ppl/Pihu.jpg" 
                  alt="Pihu Agarwal" 
                  className={styles.teamImageReal} 
                />
              </div>
              <h3 className={styles.teamMemberName}>Pihu Agarwal</h3>
            </div>
          </div>
        </div>
        {/* Whiteboard Images - Full Width */}
        <div className="w-full mt-16">
          <img 
            src="/part2.png" 
            alt="Whiteboard Part 2" 
            style={{ width: '100%', height: 'auto', maxWidth: '1200px', margin: '0 auto', display: 'block' }}
            loading="lazy"
          />
        </div>
        <div className="w-full mt-16">
          <img 
            src="/part1.png" 
            alt="Whiteboard Part 1" 
            style={{ width: '100%', height: 'auto', maxWidth: '1200px', margin: '0 auto', display: 'block' }}
            loading="lazy"
          />
        </div>
        {/* Technologies Used section */}
        <div className={styles.techSection} id="techSection">
          <h2 className={styles.techTitle}>Technologies Used</h2>
          
          <div className={styles.techGrid}>
            {/* Cursor */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Cursor</h3>
              <p className={styles.techPurpose}>For Code</p>
            </div>
            
            {/* Modal */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Modal</h3>
              <p className={styles.techPurpose}>Training</p>
            </div>
            
            {/* Node.js */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Node.js</h3>
              <p className={styles.techPurpose}>Web</p>
            </div>
            
            {/* Supabase */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Supabase</h3>
              <p className={styles.techPurpose}>Database</p>
            </div>
            
            {/* Railway */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Railway</h3>
              <p className={styles.techPurpose}>Backend</p>
            </div>
            
            {/* Phaser.js */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Phaser.js</h3>
              <p className={styles.techPurpose}>Game Engine</p>
            </div>
            
            {/* Framer */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Framer</h3>
              <p className={styles.techPurpose}>Animation</p>
            </div>
            
            {/* Claude */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Claude</h3>
              <p className={styles.techPurpose}>Component Generation</p>
            </div>
            
            {/* Canva */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Canva</h3>
              <p className={styles.techPurpose}>Ideation</p>
            </div>
            
            {/* Figma */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Figma</h3>
              <p className={styles.techPurpose}>Prototypes</p>
            </div>
            
            {/* ChatGPT 4o */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>ChatGPT 4o</h3>
              <p className={styles.techPurpose}>Image Generation</p>
            </div>
            
            {/* Three.js */}
            <div className={styles.techCard}>
              <h3 className={styles.techName}>Three.js</h3>
              <p className={styles.techPurpose}>3D Web Model</p>
            </div>
          </div>
        </div>
        
        {/* Footer Section */}
        <div className={styles.footer} id="footer">
          <div className={styles.footerContainer}>
            {/* Navigation Column */}
            <div className={styles.footerNav}>
              <h3 className={styles.footerNavTitle}>Navigation</h3>
              <div className={styles.footerNavLinks}>
                <a 
                  href="#" 
                  className={styles.footerNavLink}
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Back to Top
                </a>
                <Link href="/play" className={styles.footerNavLink}>Play Game</Link>
                <Link href="/model" className={styles.footerNavLink}>Model Dashboard</Link>
                <Link href="/data" className={styles.footerNavLink}>Data</Link>
                <a href="/plan" className={styles.footerNavLink}>Business Plan</a>
                <a href="http://hackpsu.org/" target="_blank" rel="noopener noreferrer" className={styles.footerNavLink}>HackPSU Website</a>
                <a href="https://github.com/Pranav-Karra-3301/game-captcha" target="_blank" rel="noopener noreferrer" className={styles.footerNavLink}>GitHub Repository</a>
              </div>
            </div>
            
            {/* Team Column */}
            <div className={styles.footerTeam}>
              <h3 className={styles.footerTeamTitle}>Team</h3>
              <div className={styles.footerTeamMembers}>
                {/* Pranav Karra */}
                <div className={styles.footerTeamMember}>
                  <img src="/ppl/Pranav.jpg" alt="Pranav Karra" className={styles.footerTeamMemberImage} />
                  <a 
                    href="https://www.linkedin.com/in/pranav-karra-09477228b/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.footerTeamMemberName}
                  >
                    Pranav Karra <ArrowUpRight size={16} />
                  </a>
                </div>
                
                {/* Dhruva Nagesh */}
                <div className={styles.footerTeamMember}>
                  <img src="/ppl/Dhruva.jpg" alt="Dhruva Nagesh" className={styles.footerTeamMemberImage} />
                  <a 
                    href="https://www.linkedin.com/in/dhruva-nagesh/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.footerTeamMemberName}
                  >
                    Dhruva Nagesh <ArrowUpRight size={16} />
                  </a>
                </div>
                
                {/* Manit Garg */}
                <div className={styles.footerTeamMember}>
                  <img src="/ppl/Manit.jpg" alt="Manit Garg" className={styles.footerTeamMemberImage} />
                  <a 
                    href="https://www.linkedin.com/in/manitgarg/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.footerTeamMemberName}
                  >
                    Manit Garg <ArrowUpRight size={16} />
                  </a>
                </div>
                
                {/* Pihu Agarwal */}
                <div className={styles.footerTeamMember}>
                  <img src="/ppl/Pihu.jpg" alt="Pihu Agarwal" className={styles.footerTeamMemberImage} />
                  <a 
                    href="https://www.linkedin.com/in/pihuagarwal/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.footerTeamMemberName}
                  >
                    Pihu Agarwal <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
       
      </div>
    </main>
  );
}
