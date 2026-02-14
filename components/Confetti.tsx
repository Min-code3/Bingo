'use client';

import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  show: boolean;
  duration?: number;
}

const EMOJIS = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🔥'];
const PARTICLE_COUNT = 24;

export default function Confetti({ show, duration = 2500 }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number; emoji: string; left: number; delay: number; size: number; drift: number;
  }>>([]);

  useEffect(() => {
    if (show) {
      setParticles(
        Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
          id: i,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          left: Math.random() * 100,
          delay: Math.random() * 0.6,
          size: 0.6 + Math.random() * 0.8,
          drift: -30 + Math.random() * 60,
        }))
      );
      const timer = setTimeout(() => setParticles([]), duration);
      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [show, duration]);

  if (particles.length === 0) return null;

  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            fontSize: `${p.size}rem`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
