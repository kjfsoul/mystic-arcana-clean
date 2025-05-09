import React, { useEffect, useState, useRef } from 'react';

/**
 * CosmicBackground component
 *
 * This component creates a cosmic background with stars, twinkling effect, shooting stars,
 * and celestial bodies that change perspective over time.
 * It should be placed at the root level of your application.
 */
const CosmicBackground: React.FC = () => {
  const [shootingStars, setShootingStars] = useState<React.ReactNode[]>([]);
  const [celestialBodies, setCelestialBodies] = useState<React.ReactNode[]>([]);
  const [ambientGlows, setAmbientGlows] = useState<React.ReactNode[]>([]);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const timeInAppRef = useRef<number>(Date.now());

  // Create shooting stars at random intervals
  useEffect(() => {
    // Function to create a shooting star
    const createShootingStar = () => {
      const id = Date.now();
      const top = Math.random() * 70; // Random position from top (0-70%)
      const left = Math.random() * 70; // Random position from left (0-70%)
      const rotation = Math.random() * 45 + 15; // Random rotation (15-60 degrees)

      const star = (
        <div
          key={`star-${id}`}
          className="shooting-star"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            transform: `rotate(${rotation}deg)`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 3 + 3}s` // Random duration between 3-6s
          }}
        />
      );

      setShootingStars(prev => [...prev, star]);

      // Remove the shooting star after animation completes
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.key !== `star-${id}`));
      }, 8000); // Slightly longer than the longest possible animation
    };

    // Create initial shooting star
    createShootingStar();

    // Create new shooting stars at random intervals
    const shootingStarInterval = setInterval(() => {
      createShootingStar();
    }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds

    return () => clearInterval(shootingStarInterval);
  }, []);

  // Create celestial bodies that change perspective over time
  useEffect(() => {
    // Calculate time spent in app for perspective changes
    const updateTimeInApp = () => {
      const currentTime = Date.now();
      const timeSpent = (currentTime - timeInAppRef.current) / 1000; // in seconds
      return timeSpent;
    };

    // Function to create a celestial body
    const createCelestialBody = () => {
      const id = Date.now();
      const timeSpent = updateTimeInApp();

      // Celestial body types
      const types = ['planet', 'moon', 'sun', 'black-hole'];
      const type = types[Math.floor(Math.random() * types.length)];

      // Position
      const top = Math.random() * 80; // Random position from top (0-80%)
      const left = Math.random() * 80; // Random position from left (0-80%)

      // Size - larger as time passes in the app
      const baseSize = 30 + Math.min(timeSpent / 10, 30); // Size increases with time, max +30px
      const size = baseSize + Math.random() * 20; // Random variation

      // Perspective - objects appear closer as time passes
      const perspective = 1000 - Math.min(timeSpent * 5, 500); // Perspective decreases with time (objects appear closer)

      // Z-index - objects appear to have more depth as time passes
      const zIndex = -1 - Math.floor(Math.random() * 3); // Random z-index for layering

      const celestial = (
        <div
          key={`celestial-${id}`}
          data-id={id}
          className={`celestial ${type}`}
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            zIndex: zIndex,
            perspective: `${perspective}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 60 + 60}s` // Random duration between 60-120s
          }}
        />
      );

      setCelestialBodies(prev => [...prev, celestial]);

      // Add ambient glow for sun and some planets
      if (type === 'sun' || (type === 'planet' && Math.random() > 0.5)) {
        const glowSize = size * 6;
        const glow = (
          <div
            key={`glow-${id}`}
            data-id={id}
            className="ambient-glow"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${glowSize}px`,
              height: `${glowSize}px`,
              transform: `translate(-50%, -50%)`,
              background: type === 'sun'
                ? 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(138, 43, 226, 0.1) 0%, transparent 70%)'
            }}
          />
        );

        setAmbientGlows(prev => [...prev, glow]);

        // Make glow visible after a delay
        setTimeout(() => {
          // Using data attribute instead of key for DOM selection
          const glowElement = document.querySelector(`.ambient-glow[data-id="${id}"]`);
          if (glowElement) {
            glowElement.classList.add('visible');
          }
        }, 2000);

        // Remove the glow after the celestial body is removed
        setTimeout(() => {
          setAmbientGlows(prev => prev.filter(g => g.key !== `glow-${id}`));
        }, 65000);
      }

      // Make celestial body focused after a delay
      setTimeout(() => {
        // Using data attribute instead of key for DOM selection
        const celestialElement = document.querySelector(`.celestial[data-id="${id}"]`);
        if (celestialElement) {
          celestialElement.classList.add('focused');
        }
      }, 5000);

      // Remove the celestial body after animation completes
      setTimeout(() => {
        setCelestialBodies(prev => prev.filter(c => c.key !== `celestial-${id}`));
      }, 60000);
    };

    // Create initial celestial body
    createCelestialBody();

    // Create new celestial bodies at random intervals
    const celestialInterval = setInterval(() => {
      createCelestialBody();
    }, Math.random() * 10000 + 15000); // Random interval between 15-25 seconds

    // Update time in app periodically
    const timeInterval = setInterval(() => {
      updateTimeInApp();
    }, 1000);

    return () => {
      clearInterval(celestialInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="cosmic-background" ref={backgroundRef}>
      <div className="stars"></div>
      <div className="twinkling"></div>
      {shootingStars}
      {ambientGlows}
      {celestialBodies}
    </div>
  );
};

export default CosmicBackground;
