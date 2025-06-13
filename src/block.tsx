import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface BlockProps {
  title?: string;
  description?: string;
}

// Planet data with realistic relative sizes and distances
const planetData = [
  { name: 'Mercury', size: 0.1, distance: 2, color: '#8C7853', speed: 0.02 },
  { name: 'Venus', size: 0.15, distance: 3, color: '#FFC649', speed: 0.015 },
  { name: 'Earth', size: 0.16, distance: 4, color: '#6B93D6', speed: 0.01 },
  { name: 'Mars', size: 0.12, distance: 5, color: '#CD5C5C', speed: 0.008 },
  { name: 'Jupiter', size: 0.5, distance: 7, color: '#D8CA9D', speed: 0.005 },
  { name: 'Saturn', size: 0.4, distance: 9, color: '#FAD5A5', speed: 0.004 },
  { name: 'Uranus', size: 0.25, distance: 11, color: '#4FD0E7', speed: 0.003 },
  { name: 'Neptune', size: 0.24, distance: 13, color: '#4B70DD', speed: 0.002 }
];

// Sun component
const Sun: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={sunRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
      <Html distanceFactor={15}>
        <div style={{ 
          color: 'white', 
          fontSize: '12px', 
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: '-40px'
        }}>
          Sun
        </div>
      </Html>
    </mesh>
  );
};

// Planet component
interface PlanetProps {
  name: string;
  size: number;
  distance: number;
  color: string;
  speed: number;
}

const Planet: React.FC<PlanetProps> = ({ name, size, distance, color, speed }) => {
  const planetRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = clock.getElapsedTime() * speed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={planetRef}>
      <mesh ref={meshRef} position={[distance, 0, 0]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} />
        <Html distanceFactor={15}>
          <div style={{ 
            color: 'white', 
            fontSize: '10px', 
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: `${-size * 50}px`
          }}>
            {name}
          </div>
        </Html>
      </mesh>
      {/* Orbit line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.01, distance + 0.01, 64]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

// Saturn's rings component
const SaturnRings: React.FC<{ distance: number }> = ({ distance }) => {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y = clock.getElapsedTime() * 0.004;
    }
  });

  return (
    <group ref={ringsRef}>
      <mesh position={[distance, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshStandardMaterial color="#FAD5A5" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// Control panel component
const ControlPanel: React.FC<{
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  showOrbits: boolean;
  setShowOrbits: (show: boolean) => void;
}> = ({ animationSpeed, setAnimationSpeed, showOrbits, setShowOrbits }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Solar System Controls</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Animation Speed: {animationSpeed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          style={{ width: '150px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showOrbits}
            onChange={(e) => setShowOrbits(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Show Orbit Lines
        </label>
      </div>

      <div style={{ fontSize: '12px', opacity: 0.8 }}>
        <p style={{ margin: '5px 0' }}>🖱️ Click and drag to rotate</p>
        <p style={{ margin: '5px 0' }}>🔍 Scroll to zoom</p>
      </div>
    </div>
  );
};

const Block: React.FC<BlockProps> = ({ title = "3D Solar System", description }) => {
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);

  // Send completion event on first interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      window.postMessage({ type: 'BLOCK_COMPLETION', blockId: 'solar-system-3d', completed: true }, '*');
      window.parent.postMessage({ type: 'BLOCK_COMPLETION', blockId: 'solar-system-3d', completed: true }, '*');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000011' }}>
      <ControlPanel
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
      />
      
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
        style={{ background: 'radial-gradient(circle, #001122 0%, #000000 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="white" />

        {/* Sun */}
        <Sun />

        {/* Planets */}
        {planetData.map((planet, index) => (
          <React.Fragment key={planet.name}>
            <Planet
              name={planet.name}
              size={planet.size}
              distance={planet.distance}
              color={planet.color}
              speed={planet.speed * animationSpeed}
            />
            {planet.name === 'Saturn' && <SaturnRings distance={planet.distance} />}
          </React.Fragment>
        ))}

        {/* Stars background */}
        <mesh>
          <sphereGeometry args={[100, 32, 32]} />
          <meshBasicMaterial color="#000033" side={THREE.BackSide} transparent opacity={0.8} />
        </mesh>

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          autoRotate={false}
        />
      </Canvas>

      {/* Info panel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        maxWidth: '250px'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>About This Solar System</h4>
        <p style={{ margin: '5px 0', lineHeight: '1.4' }}>
          This 3D model shows our solar system with planets orbiting the Sun. 
          Sizes and orbital speeds are adjusted for better visualization.
        </p>
        <p style={{ margin: '5px 0', lineHeight: '1.4', opacity: 0.8 }}>
          Each planet rotates on its axis while orbiting the Sun at different speeds.
        </p>
      </div>
    </div>
  );
};

export default Block;