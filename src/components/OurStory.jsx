import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useConfig } from '../useConfig';

export default function OurStory({ scrollContainer }) {
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

    // Determine scroll target: either the passed container or window
    const getScrollElement = () => {
      if (scrollContainer && scrollContainer.current) {
        // The scrollable element is .curtain-content inside the overlay
        const content = scrollContainer.current.querySelector('.curtain-content');
        return content || scrollContainer.current;
      }
      return null;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) { ticking = false; return; }

        const scrollEl = getScrollElement();

        let scrollTop, viewportHeight;
        if (scrollEl) {
          scrollTop = scrollEl.scrollTop;
          viewportHeight = scrollEl.clientHeight;
        } else {
          scrollTop = window.scrollY;
          viewportHeight = window.innerHeight;
        }

        // Calculate how far we've scrolled through the story container
        const containerTop = el.offsetTop;
        const containerHeight = el.offsetHeight;
        const scrollableHeight = containerHeight - viewportHeight;

        if (scrollableHeight <= 0) { ticking = false; return; }

        const scrolled = Math.max(0, scrollTop - containerTop);
        const progress = Math.min(1, scrolled / scrollableHeight);

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

    const scrollEl = getScrollElement();
    const target = scrollEl || window;

    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => target.removeEventListener('scroll', handleScroll);
  }, [breakpoints, scrollContainer]);

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
      </div>
    </section>
  );
}
