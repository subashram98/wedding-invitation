import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useConfig } from '../useConfig';

export default function OurStory() {
  const config = useConfig();
  const years = config.story;
  const containerRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);
  const [yearProgress, setYearProgress] = useState(0);

  const breakpoints = useMemo(() => {
    const count = years.length;
    return years.map((_, i) => ({
      start: i / count,
      end: (i + 1) / count,
    }));
  }, [years]);

  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) { ticking = false; return; }

        const now = window.scrollY;
        const goingDown = now > lastY;
        lastY = now;

        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          ticking = false;
          return;
        }

        const scrollableHeight = el.offsetHeight - window.innerHeight;
        if (scrollableHeight <= 0) { ticking = false; return; }
        const scrolled = Math.max(0, -rect.top);
        const progress = Math.min(1, scrolled / scrollableHeight);

        // Update in both directions for smooth experience
        for (let i = breakpoints.length - 1; i >= 0; i--) {
          if (progress >= breakpoints[i].start) {
            setActiveIndex(i);
            setYearProgress(
              Math.min(1, (progress - breakpoints[i].start) / (breakpoints[i].end - breakpoints[i].start))
            );
            break;
          }
        }

        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [breakpoints]);

  const active = years[activeIndex];

  return (
    <section className="story-scroll-container" ref={containerRef}>
      <div className="story-sticky">
        {years.map((y, i) => (
          <div
            key={y.year}
            className={`story-bg ${i === activeIndex ? 'story-bg-active' : ''}`}
            style={{ backgroundImage: `url(${y.image})` }}
          />
        ))}
        <div className="story-overlay" />

        <div className="story-progress-track">
          <div
            className="story-progress-fill"
            style={{ height: `${((activeIndex + yearProgress) / years.length) * 100}%` }}
          />
          {years.map((y, i) => (
            <div
              key={y.year}
              className={`story-progress-dot ${i <= activeIndex ? 'active' : ''} ${i === activeIndex ? 'current' : ''}`}
              style={{ top: `${(i / (years.length - 1)) * 100}%` }}
            >
              <span className="story-progress-year">{y.year}</span>
            </div>
          ))}
        </div>

        <div className="story-content-center">
          <p className="story-label">Our Journey</p>
          <div className="story-year-display">
            <span className="story-year-number" key={active.year}>{active.year}</span>
          </div>
          <p className="story-year-text" key={`text-${active.year}`}>{active.text}</p>
          {activeIndex === years.length - 1 && yearProgress > 0.5 && (
            <div className="story-final-flourish">
              <span className="story-heart">♥</span>
            </div>
          )}
        </div>

        <a href="#events-section" className="story-skip-btn" aria-label="Skip to events"
          onClick={(e) => { e.preventDefault(); document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 2l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
