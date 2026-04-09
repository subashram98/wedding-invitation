import React, { useState, useCallback, useRef, useEffect } from 'react';

const BALLOON_COUNT = 6;
const COLORS = ['#e8456b', '#ff6b8a', '#d4a843', '#ff8fa3', '#c75b3a', '#b8860b'];

function randomBalloon(id) {
  return {
    id,
    x: Math.random() * 80 + 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 30,
    duration: Math.random() * 8 + 10,
    delay: Math.random() * 5,
    alive: true,
  };
}

function Glitter({ x, y, color }) {
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * 360,
      distance: Math.random() * 60 + 30,
      size: Math.random() * 5 + 3,
      rotation: Math.random() * 360,
    }))
  ).current;

  return (
    <div className="glitter-burst" style={{ left: x, top: y }}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="glitter-particle"
          style={{
            '--angle': `${p.angle}deg`,
            '--distance': `${p.distance}px`,
            '--size': `${p.size}px`,
            '--rotation': `${p.rotation}deg`,
            background: color,
          }}
        />
      ))}
      <span className="glitter-pop" style={{ color }}>💖</span>
    </div>
  );
}

export default function HeartBalloons() {
  const [balloons, setBalloons] = useState(() =>
    Array.from({ length: BALLOON_COUNT }, (_, i) => randomBalloon(i))
  );
  const [bursts, setBursts] = useState([]);
  const nextId = useRef(BALLOON_COUNT);
  const burstId = useRef(0);

  const popBalloon = useCallback((balloon, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const id = burstId.current++;
    setBursts((prev) => [...prev, { id, x, y, color: balloon.color }]);
    setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 800);

    // Remove balloon and spawn a new one after a delay
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));
    setTimeout(() => {
      setBalloons((prev) => [...prev, randomBalloon(nextId.current++)]);
    }, 3000 + Math.random() * 4000);
  }, []);

  return (
    <div className="heart-balloons" aria-hidden="true">
      {balloons.map((b) => (
        <div
          key={b.id}
          className="heart-balloon"
          onClick={(e) => popBalloon(b, e)}
          onTouchEnd={(e) => {
            e.preventDefault();
            popBalloon(b, e);
          }}
          style={{
            left: `${b.x}vw`,
            '--float-duration': `${b.duration}s`,
            '--float-delay': `${b.delay}s`,
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill={b.color}
            style={{ filter: `drop-shadow(0 2px 6px ${b.color}55)` }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <div className="balloon-string" style={{ borderColor: b.color }} />
        </div>
      ))}
      {bursts.map((b) => (
        <Glitter key={b.id} x={b.x} y={b.y} color={b.color} />
      ))}
    </div>
  );
}
