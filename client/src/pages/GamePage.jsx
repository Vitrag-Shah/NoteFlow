import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Icons } from '../components/Icons';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Game Constants ---
const ROAD_WIDTH = 10;
const ROAD_LENGTH = 100;
const OBSTACLE_COUNT = 10;

const Player = ({ playerX }) => {
  const mesh = useRef();

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, playerX, 0.15);
  });

  return (
    <mesh ref={mesh} position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={2} toneMapped={false} />
      <pointLight intensity={2} distance={5} color="#6366f1" />
    </mesh>
  );
};

const Road = () => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -ROAD_LENGTH / 2 + 5]}>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
        <meshStandardMaterial color="#0a0a0f" />
      </mesh>
      {/* Grid lanes */}
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} position={[x, 0.01, -ROAD_LENGTH / 2 + 5]}>
          <boxGeometry args={[0.05, 0.01, ROAD_LENGTH]} />
          <meshStandardMaterial color="#1d1d2a" />
        </mesh>
      ))}
      {/* Side Rails */}
      <mesh position={[ROAD_WIDTH / 2, 0.1, -ROAD_LENGTH / 2 + 5]}>
        <boxGeometry args={[0.2, 0.2, ROAD_LENGTH]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-ROAD_WIDTH / 2, 0.1, -ROAD_LENGTH / 2 + 5]}>
        <boxGeometry args={[0.2, 0.2, ROAD_LENGTH]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

const GameContent = ({ playerX, isPlaying, onGameOver, onScoreUpdate }) => {
  const [obs, setObs] = useState([]);
  const scoreRef = useRef(0);
  const internalPlayerX = useRef(0);

  useEffect(() => {
    const initialObs = Array.from({ length: OBSTACLE_COUNT }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * (ROAD_WIDTH - 1),
      z: -((i + 1) * (ROAD_LENGTH / OBSTACLE_COUNT)) - 10,
      speed: Math.random() * 0.2 + 0.4
    }));
    setObs(initialObs);
    scoreRef.current = 0;
  }, [isPlaying]);

  useFrame((state) => {
    if (!isPlaying) return;

    // Update internal player X for collision
    internalPlayerX.current = THREE.MathUtils.lerp(internalPlayerX.current, playerX, 0.15);

    scoreRef.current += 1;
    if (scoreRef.current % 10 === 0) onScoreUpdate(Math.floor(scoreRef.current / 10));

    setObs(prev => prev.map(o => {
      let newZ = o.z + o.speed + (state.clock.elapsedTime * 0.01);
      let newX = o.x;

      if (newZ > 1) {
        newZ = -ROAD_LENGTH;
        newX = (Math.random() - 0.5) * (ROAD_WIDTH - 1);
      }

      // Collision Check (Sphere vs Box roughly)
      const dx = Math.abs(newX - internalPlayerX.current);
      const dz = Math.abs(newZ - 0); // Player is at Z=0
      if (dx < 0.8 && dz < 0.8) {
        onGameOver();
      }

      return { ...o, z: newZ, x: newX };
    }));
  });

  return (
    <>
      <Road />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Player playerX={playerX} />
      {obs.map((o) => (
        <mesh key={o.id} position={[o.x, 0.5, o.z]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={1} />
      <PerspectiveCamera makeDefault position={[0, 4, 7]} rotation={[-0.4, 0, 0]} />
    </>
  );
};

const GamePage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('game_highscore') || '0'));
  const [playerX, setPlayerX] = useState(0);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('game_highscore', score.toString());
    }
  };

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    setPlayerX(x * (ROAD_WIDTH / 2));
  };

  useEffect(() => {
    if (isPlaying) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : ''}`} style={{ background: '#000' }}>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Icons.Note className="brand-icon" size={24} />
          <span className="brand-name">NoteFlow</span>
          <button className="btn btn-theme" onClick={toggleTheme} style={{ marginLeft: 'auto', marginRight: '8px' }}>
            {theme === 'dark' ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
          </button>
          <button className="mobile-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <Icons.Close size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <Icons.Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/notes" className="nav-item">
            <Icons.Note size={18} />
            <span>My Notes</span>
          </Link>
          {(user?.role === 'admin' || user?.email === 'n@gmail.com') && (
            <Link to="/users" className="nav-item">
              <Icons.User size={18} />
              <span>Users</span>
            </Link>
          )}
          <Link to="/game" className="nav-item active">
            <Icons.Gamepad size={18} />
            <span>Game Zone</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>
            <Icons.Logout size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '30px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 10, 
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            margin: 0, 
            color: '#fff', 
            letterSpacing: '4px',
            textShadow: '0 0 20px rgba(99,102,241,0.8)'
          }}>NEON RUNNER</h1>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '8px' }}>
            SCORE: <span style={{ color: '#fff', fontSize: '1.5rem' }}>{score}</span> | BEST: {highScore}
          </div>
        </div>

        <button 
          className="mobile-toggle" 
          onClick={() => setSidebarOpen(true)}
          style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 20 }}
        >
          <Icons.Menu />
        </button>

        <div style={{ width: '100%', height: '100%', cursor: isPlaying ? 'none' : 'default' }}>
          <Canvas>
            <Suspense fallback={null}>
              <GameContent 
                playerX={playerX} 
                isPlaying={isPlaying} 
                onGameOver={handleGameOver}
                onScoreUpdate={setScore}
              />
              <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Suspense>
          </Canvas>
        </div>

        <AnimatePresence>
          {!isPlaying && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.85)',
                zIndex: 100,
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 0 50px rgba(0,0,0,1)' }}>
                {gameOver ? (
                  <>
                    <Icons.Alert size={64} style={{ color: 'var(--danger)', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '8px' }}>GAME OVER</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Final Score: <span style={{ color: '#fff' }}>{score}</span></p>
                  </>
                ) : (
                  <>
                    <Icons.Gamepad size={64} style={{ color: 'var(--accent)', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '8px' }}>NEON RUNNER</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Dodge the obstacles to survive!</p>
                  </>
                )}
                <button className="btn btn-primary btn-full" onClick={startGame} style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                  {gameOver ? 'TRY AGAIN' : 'START MISSION'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default GamePage;
