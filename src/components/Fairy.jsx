import React, { useEffect, useRef, useState, useCallback } from 'react';
import FairyCharacter from './FairyCharacter';

/**
 * Fairy behavior — autonomous, section-aware.
 * 
 * The fairy moves on its own between visible interactive elements.
 * It does NOT follow the cursor. Instead it:
 * 1. Peeks in on page load
 * 2. Detects which interactive elements are in the viewport
 * 3. Flies to the nearest one, performs an action (cast/tap/point)
 * 4. After a few seconds, moves to the next visible element
 * 5. If no elements visible, floats idle or does playful gestures
 * 6. Randomly hides and peeks for personality
 */

const TARGETS = [
  { selector: '.wax-seal-btn', action: 'cast', priority: 1, bounce: false },
  { selector: '.hero-cta', action: 'tap', priority: 6, bounce: true },
  { selector: '.directions-btn', action: 'tap', priority: 2, bounce: true },
  { selector: '#rsvp-name', action: 'point', priority: 3, bounce: true, emptyOnly: true },
  { selector: '#rsvp-message', action: 'point', priority: 4, bounce: true, emptyOnly: true },
  { selector: '.rsvp-submit', action: 'tap', priority: 5, bounce: true },
];

export default function Fairy() {
  const containerRef = useRef(null);
  const pos = useRef({ x: -30, y: window.innerHeight * 0.3 });
  const target = useRef({ x: -30, y: window.innerHeight * 0.3 });
  const vel = useRef({ x: 0, y: 0 });
  const frame = useRef(null);
  const mood = useRef('hidden');
  const timers = useRef([]);
  const currentTargetSelector = useRef(null);
  const lastActionTime = useRef(0);

  const [pose, setPose] = useState('peek');
  const [flipped, setFlipped] = useState(false);

  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // === ENTRANCE: peek from left edge, wave, fly in ===
  useEffect(() => {
    pos.current = { x: -20, y: window.innerHeight * 0.3 };
    target.current = { x: 15, y: window.innerHeight * 0.3 };
    mood.current = 'peeking';
    setPose('peek');

    addTimer(() => {
      target.current = { x: 30, y: window.innerHeight * 0.3 };
      setPose('wave');
    }, 1800);

    addTimer(() => {
      mood.current = 'fly';
      setPose('fly');
      target.current = { x: window.innerWidth * 0.75, y: window.innerHeight * 0.25 };
    }, 3200);

    addTimer(() => {
      mood.current = 'idle';
      setPose('idle');
      // Start the autonomous behavior loop
      startBehaviorLoop();
    }, 4800);

    return () => clearAllTimers();
  }, [addTimer, clearAllTimers]);

  // === MAIN BEHAVIOR LOOP — hyperactive fairy ===
  function startBehaviorLoop() {
    let actionCount = 0;

    const loop = setInterval(() => {
      if (mood.current === 'acting' || mood.current === 'guiding' || mood.current === 'hiding' || mood.current === 'peeking') return;

      actionCount++;

      // Alternate: guide → play → guide → play
      if (actionCount % 2 === 0) {
        doPlayfulGesture();
      } else {
        const visibleTargets = getVisibleTargets();
        if (visibleTargets.length > 0) {
          const next = visibleTargets.find(t => t.uniqueKey !== currentTargetSelector.current)
            || visibleTargets[0];
          flyToElement(next);
        } else {
          doPlayfulGesture();
        }
      }
    }, 1800);

    timers.current.push(loop);
  }

  // === React to scroll — float alongside, guide only when stopped ===
  useEffect(() => {
    let scrollTimeout;
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const scrollDelta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;

      // During scroll: fairy drifts in scroll direction (stays in viewport)
      if (mood.current === 'idle' || mood.current === 'fly') {
        // Nudge fairy position to follow scroll naturally
        target.current = {
          x: pos.current.x,
          y: Math.max(60, Math.min(window.innerHeight - 60, pos.current.y + scrollDelta * 0.1)),
        };
        // Switch to fly pose while scrolling
        if (mood.current === 'idle') {
          mood.current = 'fly';
          setPose('fly');
        }
      }

      // Glance at important elements that scroll into view
      const visibleTargets = getVisibleTargets();
      if (visibleTargets.length > 0) {
        const nearest = visibleTargets[0];
        // Flip to face the element (glance)
        setFlipped(nearest.rect.left + nearest.rect.width / 2 < pos.current.x);
      }

      // Reset idle timer — guide almost immediately after scroll stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        mood.current = 'idle';
        setPose('idle');

        // Guide right away
        if (Date.now() - lastActionTime.current > 2000) {
          const targets = getVisibleTargets();
          if (targets.length > 0) {
            const next = targets.find(t => t.uniqueKey !== currentTargetSelector.current) || targets[0];
            flyToElement(next);
          }
        }
      }, 600);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Find all interactive elements currently visible in viewport
  function getVisibleTargets() {
    const results = [];
    for (const t of TARGETS) {
      // Use querySelectorAll to get ALL matching elements
      const elements = document.querySelectorAll(t.selector);
      elements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top > 20 && rect.bottom < window.innerHeight - 20 &&
            rect.left > 0 && rect.right < window.innerWidth) {
          // Skip filled form fields
          if (t.emptyOnly && el.value && el.value.trim() !== '') return;
          results.push({ ...t, el, rect, uniqueKey: `${t.selector}-${idx}` });
        }
      });
    }
    return results.sort((a, b) => a.priority - b.priority);
  }

  // Fly to an element and perform action
  function flyToElement({ el, rect, action, selector, bounce, uniqueKey }) {
    mood.current = 'guiding';
    setPose('fly');
    currentTargetSelector.current = uniqueKey || selector;
    lastActionTime.current = Date.now();

    // Position close to element — wand tip nearly touches it
    // Fairy is on LEFT, wand extends right toward element
    const fairyX = rect.left - 20;
    const fairyY = rect.top + rect.height / 2 - 10;
    target.current = { x: Math.max(15, fairyX), y: Math.max(15, fairyY) };
    setFlipped(false);

    // Arrive → act (snappy)
    addTimer(() => {
      mood.current = 'acting';
      setPose(action);

      // Bounce the target element (not the heart seal)
      if (bounce && el) {
        el.classList.add('fairy-tapped');
        addTimer(() => el.classList.remove('fairy-tapped'), 600);
      }
    }, 500);

    // Release — move to next element quickly
    addTimer(() => {
      mood.current = 'idle';
      setPose('idle');
      target.current = {
        x: pos.current.x + 30,
        y: pos.current.y - 25,
      };
    }, 2000);
  }

  // Random playful gestures
  function doPlayfulGesture() {
    const roll = Math.random();
    lastActionTime.current = Date.now();

    if (roll < 0.2) {
      // Hide and peek
      doHideAndPeek();
    } else if (roll < 0.4) {
      // Twirl / spin
      setPose('twirl');
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 1200);
    } else if (roll < 0.6) {
      // Giggle
      setPose('giggle');
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 1500);
    } else if (roll < 0.8) {
      // Wave
      setPose('wave');
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 1200);
    } else {
      // Spin (same as twirl but faster)
      setPose('twirl');
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 800);
    }
  }

  // Hide behind edge, peek, come back
  function doHideAndPeek() {
    mood.current = 'hiding';
    setPose('fly');
    const goLeft = pos.current.x < window.innerWidth / 2;
    target.current = { x: goLeft ? -10 : window.innerWidth + 10, y: pos.current.y };

    addTimer(() => {
      mood.current = 'peeking';
      setPose('peek');
      target.current = { x: goLeft ? 18 : window.innerWidth - 18, y: pos.current.y };
    }, 1200);

    addTimer(() => {
      mood.current = 'fly';
      setPose('fly');
      target.current = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.3 };
    }, 3200);

    addTimer(() => {
      mood.current = 'idle';
      setPose('idle');
    }, 4500);
  }

  // === ANIMATION LOOP — spring physics ===
  useEffect(() => {
    const animate = () => {
      const p = pos.current;
      const t = target.current;
      const v = vel.current;
      const m = mood.current;

      let tx = t.x;
      let ty = t.y;

      // Idle: gentle autonomous drift
      if (m === 'idle') {
        const time = Date.now() * 0.0004;
        tx = p.x + Math.sin(time) * 0.1;
        ty = p.y + Math.cos(time * 0.6) * 0.1;
      }

      // Acting: small hover near target
      if (m === 'acting') {
        const time = Date.now() * 0.003;
        tx = t.x + Math.sin(time) * 3;
        ty = t.y + Math.cos(time) * 2;
      }

      // Clamp to viewport (except when hiding/peeking)
      if (m !== 'peeking' && m !== 'hiding' && m !== 'hidden') {
        tx = Math.max(15, Math.min(window.innerWidth - 15, tx));
        ty = Math.max(15, Math.min(window.innerHeight - 15, ty));
      }

      // Spring — snappy when guiding
      const stiffness = (m === 'guiding') ? 0.12 : (m === 'fly' || m === 'hiding') ? 0.07 : 0.012;
      const damping = 0.78;
      v.x += (tx - p.x) * stiffness;
      v.y += (ty - p.y) * stiffness;
      v.x *= damping;
      v.y *= damping;
      p.x += v.x;
      p.y += v.y;

      // Keep on screen (soft clamp)
      if (m !== 'hiding' && m !== 'peeking') {
        p.x = Math.max(5, Math.min(window.innerWidth - 5, p.x));
        p.y = Math.max(5, Math.min(window.innerHeight - 5, p.y));
      }

      // Flip based on velocity (not during acting/guiding)
      if (m !== 'acting' && m !== 'guiding' && Math.abs(v.x) > 0.3) {
        setFlipped(v.x < 0);
      }

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${p.x - 28}px, ${p.y - 35}px, 0)`;
      }

      frame.current = requestAnimationFrame(animate);
    };
    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  // Show speech bubble when casting at the seal — stays for at least 2s
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const bubbleTimer = useRef(null);

  useEffect(() => {
    const isAtSeal = pose === 'cast' && currentTargetSelector.current?.includes('.wax-seal-btn');
    if (isAtSeal && !bubbleVisible) {
      setBubbleVisible(true);
      clearTimeout(bubbleTimer.current);
      bubbleTimer.current = setTimeout(() => setBubbleVisible(false), 2500);
    }
  }, [pose]);

  return (
    <div ref={containerRef} className={`fairy-companion ${flipped ? 'fairy-flipped' : ''}`} aria-hidden="true">
      {bubbleVisible && (
        <div className="fairy-speech-bubble">
          Tap here, lovely ✨
        </div>
      )}
      <FairyCharacter pose={pose} size={55} />
      <div className="fairy-sparkle-trail">
        <span className="fairy-sp sp1">✦</span>
        <span className="fairy-sp sp2">✧</span>
        <span className="fairy-sp sp3">·</span>
      </div>
    </div>
  );
}
