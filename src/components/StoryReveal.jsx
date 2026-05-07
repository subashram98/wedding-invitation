import React, { useState, useCallback, useEffect, useRef } from 'react';
import OurStory from './OurStory';
import WaxSeal from './WaxSeal';

export default function StoryReveal() {
  const [mounted, setMounted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const overlayRef = useRef(null);
  const timersRef = useRef([]);

  const addTimer = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const openCurtain = useCallback(() => {
    setMounted(true);
    setOverlayVisible(true);
    document.body.style.overflow = 'hidden';
    // Tiny delay for DOM to render closed state
    addTimer(() => setCurtainsOpen(true), 50);
    // Enable interaction after transition completes (2.8s + 50ms)
    addTimer(() => setContentVisible(true), 2900);
  }, []);

  const closeCurtain = useCallback(() => {
    setContentVisible(false);
    addTimer(() => setCurtainsOpen(false), 150);
    // Unmount after transition (2.8s + buffer)
    addTimer(() => {
      setOverlayVisible(false);
      setMounted(false);
      document.body.style.overflow = '';
    }, 3100);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && contentVisible) closeCurtain();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [contentVisible, closeCurtain]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  return (
    <>
      <section className="story-trigger-section">
        <div className="story-trigger-content">
          <p className="story-trigger-label">A decade of us</p>
          <h2 className="story-trigger-title">Our Story</h2>
          <p className="story-trigger-subtitle">From college corridors to forever</p>
          <button className="wax-seal-btn" onClick={openCurtain} aria-label="Open our story">
            <WaxSeal text="S & P" size={90} className="wax-seal-bounce" />
          </button>
        </div>
      </section>

      {overlayVisible && (
        <div
          ref={overlayRef}
          className={`curtain-overlay ${curtainsOpen ? 'is-open' : ''}`}
        >
          {/* Story visible behind curtains as they part */}
          <div className={`curtain-content ${contentVisible ? 'is-visible' : ''}`}>
            <button className="curtain-close-btn" onClick={closeCurtain} aria-label="Close story">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            {mounted && <OurStory scrollContainer={overlayRef} />}
          </div>

          {/* Heart wax seal at center seam */}
          <div className={`curtain-seal ${curtainsOpen ? 'curtain-seal-hidden' : ''}`}>
            <WaxSeal text="S & P" size={120} />
          </div>

          {/* Curtain panels */}
          <div className="curtain-panel curtain-left">
            <div className="curtain-fabric"></div>
          </div>
          <div className="curtain-panel curtain-right">
            <div className="curtain-fabric"></div>
          </div>
        </div>
      )}
    </>
  );
}
