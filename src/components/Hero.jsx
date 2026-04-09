import React, { useEffect, useRef, useState } from 'react';
import { useConfig } from '../useConfig';

function Particles({ count = 30 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2,
    }))
  ).current;

  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function MountainLayers() {
  return (
    <div className="mountain-layers" aria-hidden="true">
      <div className="stars-layer">
        {Array.from({ length: 50 }, (_, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
      </div>
      <div className="moon" />
      <svg className="mountain-layer mountain-far" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0,400 L0,280 Q120,180 240,250 Q360,140 480,220 Q600,100 720,200 Q840,80 960,180 Q1080,120 1200,210 Q1320,160 1440,240 L1440,400 Z" fill="#1a1a2e" />
      </svg>
      <svg className="mountain-layer mountain-mid" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0,400 L0,300 Q100,220 200,280 Q320,160 440,260 Q520,180 640,240 Q760,140 880,230 Q1000,170 1100,250 Q1200,190 1300,260 Q1380,220 1440,270 L1440,400 Z" fill="#16213e" />
      </svg>
      <svg className="mountain-layer mountain-near" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0,400 L0,320 Q80,260 180,310 Q280,220 400,290 Q500,230 600,280 Q720,200 840,270 Q940,220 1060,280 Q1160,240 1260,290 Q1360,260 1440,300 L1440,400 Z" fill="#0f3460" />
      </svg>
      <svg className="mountain-layer mountain-front" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0,400 L0,340 Q40,320 80,335 Q120,310 160,330 Q200,315 240,335 Q280,305 340,330 Q380,320 420,340 Q460,310 520,335 Q560,325 600,340 Q640,315 700,335 Q740,320 780,338 Q820,310 880,332 Q920,322 960,340 Q1000,312 1060,335 Q1100,325 1140,340 Q1180,315 1240,335 Q1280,320 1320,338 Q1360,310 1400,330 Q1420,325 1440,335 L1440,400 Z" fill="#0a0a1a" />
      </svg>
      <div className="fog fog-1" />
      <div className="fog fog-2" />
    </div>
  );
}

export default function Hero() {
  const config = useConfig();
  const heroRef = useRef();
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={`hero ${loaded ? 'hero-loaded' : ''}`} ref={heroRef}>
      <MountainLayers />
      <Particles />
      <style>{`
        .mountain-far { transform: translateY(${scrollY * 0.1}px); }
        .mountain-mid { transform: translateY(${scrollY * 0.2}px); }
        .mountain-near { transform: translateY(${scrollY * 0.3}px); }
        .mountain-front { transform: translateY(${scrollY * 0.4}px); }
        .moon { transform: translateY(${scrollY * 0.05}px); }
        .stars-layer { transform: translateY(${scrollY * 0.03}px); }
      `}</style>
      <div className="hero-content">
        <p className="hero-subtitle hero-anim hero-anim-1">{config.couple.tagline}</p>
        <h1 className="hero-names">
          <span className="name hero-anim hero-anim-2">{config.couple.person1}</span>
          <span className="ampersand hero-anim hero-anim-3">&</span>
          <span className="name hero-anim hero-anim-4">{config.couple.person2}</span>
        </h1>
        <div className="hero-divider hero-anim hero-anim-5">
          <span className="divider-line" />
          <span className="divider-icon">♥</span>
          <span className="divider-line" />
        </div>
        <p className="hero-date hero-anim hero-anim-6">{config.wedding.dateDisplay}</p>
        <p className="hero-venue hero-anim hero-anim-7">{config.wedding.venue}</p>
        <a href="#rsvp" className="hero-cta hero-anim hero-anim-8">RSVP Now</a>
      </div>
    </section>
  );
}
