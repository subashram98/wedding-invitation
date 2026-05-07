import React, { useEffect, useRef, useState, useCallback } from 'react';
import FairyCharacter from './FairyCharacter';

/**
 * Fairy behavior brain — v3
 * 
 * Fixes:
 * - Proper peek on load (only head visible from edge)
 * - Positions on correct side so wand faces target
 * - Doesn't get stuck — always frees after action
 * - Random hide & peek during idle
 * - Playful gestures: wave, twirl, giggle
 */

const GUIDE_TARGETS = [
  { selector: '.wax-seal-btn', action: 'cast' },
  { selector: '.directions-btn', action: 'tap' },
  { selector: '.rsvp-submit', action: 'tap' },
  { selector: '.rsvp .form-group input', action: 'point' },
];

export default function Fairy() {
  const containerRef = useRef(null);
  const pos = useRef({ x: -30, y: window.innerHeight * 0.3 });
  const target = useRef({ x: -30, y: window.innerHeight * 0.3 });
  const vel = useRef({ x: 0, y: 0 });
  const lastInteraction = useRef(Date.now());
  const lastAction = useRef(0);
  const frame = useRef(null);
  const mood = useRef('hidden');
  const timers = useRef([]);

  const [pose, setPose] = useState('peek');
  const [flipped, setFlipped] = useState(false);
  const [visible, setVisible] = useState(true);

  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  // === ENTRANCE: Hide → peek head → wave → fly in ===
  useEffect(() => {
    // Start hidden off left edge — only head peeking
    pos.current = { x: -15, y: window.innerHeight * 0.3 };
    target.current = { x: 10, y: window.innerHeight * 0.3 };
    mood.current = 'peeking';
    setPose('peek');

    // Peek more
    addTimer(() => {
      target.current = { x: 25, y: window.innerHeight * 0.3 };
    }, 1200);

    // Wave at user
    addTimer(() => {
      setPose('wave');
    }, 2200);

    // Fly in
    addTimer(() => {
      mood.current = 'fly';
      setPose('fly');
      target.current = { x: window.innerWidth * 0.75, y: window.innerHeight * 0.25 };
    }, 3500);

    // Settle
    addTimer(() => {
      mood.current = 'idle';
      setPose('idle');
    }, 5000);

    return () => timers.current.forEach(clearTimeout);
  }, [addTimer]);

  // === CURSOR TRACKING ===
  useEffect(() => {
    const onMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      if (x == null) return;
      target.current = { x, y };
      lastInteraction.current = Date.now();
      if (mood.current === 'idle' || mood.current === 'peeking' || mood.current === 'hidden') {
        mood.current = 'fly';
        setPose('fly');
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, []);

  // === SCROLL: guide to visible elements ===
  useEffect(() => {
    const onScroll = () => {
      lastInteraction.current = Date.now();
      if (mood.current === 'fly') {
        // On scroll, check for targets after a brief delay
        addTimer(() => {
          if (mood.current === 'fly' || mood.current === 'idle') {
            const found = findTarget();
            if (found && Date.now() - lastAction.current > 6000) {
              guideToElement(found);
            }
          }
        }, 1500);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [addTimer]);

  // === STATE MACHINE: idle → play/peek/guide ===
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastInteraction.current;
      const sinceAction = Date.now() - lastAction.current;

      // Fly → idle
      if (mood.current === 'fly' && elapsed > 2500) {
        mood.current = 'idle';
        setPose('idle');
      }

      // Idle behaviors
      if (mood.current === 'idle' && elapsed > 4000) {
        const roll = Math.random();

        // Try to guide to visible element
        if (sinceAction > 8000) {
          const found = findTarget();
          if (found) {
            guideToElement(found);
            return;
          }
        }

        // Random playful gestures
        if (roll < 0.15 && elapsed > 6000) {
          // Hide & peek
          doHideAndPeek();
        } else if (roll < 0.25 && elapsed > 5000) {
          // Twirl
          setPose('twirl');
          addTimer(() => { setPose('idle'); }, 1500);
          lastInteraction.current = Date.now();
        } else if (roll < 0.35 && elapsed > 7000) {
          // Giggle
          setPose('giggle');
          addTimer(() => { setPose('idle'); }, 2000);
          lastInteraction.current = Date.now();
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [addTimer]);

  // Hide behind edge, peek, then come back
  function doHideAndPeek() {
    mood.current = 'hiding';
    setPose('fly');
    // Fly to nearest edge
    const goLeft = pos.current.x < window.innerWidth / 2;
    target.current = { x: goLeft ? -10 : window.innerWidth + 10, y: pos.current.y };

    addTimer(() => {
      // Peek
      mood.current = 'peeking';
      setPose('peek');
      target.current = { x: goLeft ? 15 : window.innerWidth - 15, y: pos.current.y };
    }, 1200);

    addTimer(() => {
      // Come back
      mood.current = 'fly';
      setPose('fly');
      target.current = { x: window.innerWidth * 0.6, y: window.innerHeight * 0.3 };
    }, 3000);

    addTimer(() => {
      mood.current = 'idle';
      setPose('idle');
    }, 4500);

    lastInteraction.current = Date.now();
  }

  // Find visible interactive element
  function findTarget() {
    for (const t of GUIDE_TARGETS) {
      const el = document.querySelector(t.selector);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top > 30 && rect.bottom < window.innerHeight - 30) {
        return { el, rect, action: t.action };
      }
    }
    return null;
  }

  // Guide to element — position on LEFT side so wand points right at it
  function guideToElement({ el, rect, action }) {
    mood.current = 'guiding';
    setPose('fly');
    lastAction.current = Date.now();

    // Position fairy to the LEFT of the element so wand (right hand) points at it
    const fairyX = rect.left - 40;
    const fairyY = rect.top + rect.height / 2 - 20;
    target.current = { x: fairyX, y: fairyY };
    setFlipped(false); // face right toward element

    // Arrive and perform action
    addTimer(() => {
      mood.current = 'acting';
      setPose(action);
    }, 1200);

    // Release — always free up after action
    addTimer(() => {
      mood.current = 'idle';
      setPose('idle');
      target.current = { x: pos.current.x + 50, y: pos.current.y - 40 };
    }, 4500);
  }

  // === ANIMATION LOOP ===
  useEffect(() => {
    const animate = () => {
      const p = pos.current;
      const t = target.current;
      const v = vel.current;
      const m = mood.current;

      let tx = t.x + (m === 'fly' ? 30 : 0);
      let ty = t.y + (m === 'fly' ? -25 : 0);

      if (m === 'idle') {
        const time = Date.now() * 0.0005;
        tx = p.x + Math.sin(time) * 0.1;
        ty = p.y + Math.cos(time * 0.7) * 0.1;
      }

      if (m === 'acting') {
        const time = Date.now() * 0.003;
        tx = t.x + Math.sin(time) * 3;
        ty = t.y + Math.cos(time) * 2;
      }

      // Clamp (allow slightly off-screen for peek)
      if (m !== 'peeking' && m !== 'hiding' && m !== 'hidden') {
        tx = Math.max(10, Math.min(window.innerWidth - 10, tx));
        ty = Math.max(10, Math.min(window.innerHeight - 10, ty));
      }

      const stiffness = (m === 'fly' || m === 'guiding') ? 0.05 : m === 'hiding' ? 0.06 : 0.012;
      const damping = 0.83;
      v.x += (tx - p.x) * stiffness;
      v.y += (ty - p.y) * stiffness;
      v.x *= damping;
      v.y *= damping;
      p.x += v.x;
      p.y += v.y;

      // Flip based on velocity (but not during guiding/acting — we set it manually)
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

  return (
    <div ref={containerRef} className={`fairy-companion ${flipped ? 'fairy-flipped' : ''}`} aria-hidden="true">
      <FairyCharacter pose={pose} size={55} />
      <div className="fairy-sparkle-trail">
        <span className="fairy-sp sp1">✦</span>
        <span className="fairy-sp sp2">✧</span>
        <span className="fairy-sp sp3">·</span>
      </div>
    </div>
  );
}
