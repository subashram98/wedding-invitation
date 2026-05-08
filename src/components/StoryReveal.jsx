import React, { useState, useCallback, useEffect, useRef } from 'react';
import OurStory from './OurStory';
import WaxSeal from './WaxSeal';
import ClothCurtain from './ClothCurtain';

export default function StoryReveal() {
  const [mounted, setMounted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const overlayRef = useRef(null);
  const timersRef = useRef([]);

  const addTimer = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const [showSeal, setShowSeal] = useState(true);

  const openCurtain = useCallback(() => {
    setMounted(true);
    setOverlayVisible(true);
    setShowSeal(true);
    document.body.style.overflow = 'hidden';
    addTimer(() => {
      setCurtainsOpen(true);
      setShowSeal(false);
    }, 80);
    // contentVisible set by ClothCurtain onOpenComplete
  }, []);

  const closeCurtain = useCallback(() => {
    setContentVisible(false);
    setCurtainsOpen(false);
    // Show seal only after curtain has started closing (avoids delay on mobile)
    addTimer(() => setShowSeal(true), 300);
    // Wait for cloth to close then flash and unmount
    addTimer(() => {
      setOverlayVisible(false);
      setMounted(false);
      setShowFlash(true);
      document.body.style.overflow = '';
      addTimer(() => setShowFlash(false), 600);
    }, 5500);
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
          {/* Story visible behind curtains */}
          <div className={`curtain-content ${contentVisible ? 'is-visible' : ''}`}>
            <button className="curtain-close-btn" onClick={closeCurtain} aria-label="Close story">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            {mounted && <OurStory scrollContainer={overlayRef} />}
          </div>

          {/* Heart wax seal at center */}
          <div className={`curtain-seal ${!showSeal ? 'curtain-seal-hidden' : ''}`}>
            <WaxSeal text="S & P" size={120} />
          </div>

          {/* Canvas cloth curtain */}
          <ClothCurtain isOpen={curtainsOpen} onOpenComplete={() => setContentVisible(true)} />
        </div>
      )}

      {showFlash && <div className="curtain-flash" />}
    </>
  );
}
