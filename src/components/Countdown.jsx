import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../useConfig';

function getTimeLeft(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown() {
  const config = useConfig();
  const [time, setTime] = useState(() => getTimeLeft(config.wedding.date));
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(config.wedding.date)), 1000);
    return () => clearInterval(id);
  }, [config.wedding.date]);

  useEffect(() => {
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`countdown ${visible ? 'anim-visible' : ''}`} ref={ref}>
      <div className="countdown-bg-pattern" aria-hidden="true" />
      <p className="section-label countdown-anim countdown-anim-1">Counting Down To</p>
      <h2 className="section-title countdown-anim countdown-anim-2">Our Big Day</h2>
      <div className="countdown-grid">
        {Object.entries(time).map(([label, value], i) => (
          <div className={`countdown-item countdown-anim countdown-anim-${i + 3}`} key={label}>
            <span className="countdown-number">{String(value).padStart(2, '0')}</span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
