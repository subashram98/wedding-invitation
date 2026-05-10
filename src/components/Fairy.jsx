import { useEffect, useRef, useState, useCallback } from 'react';
import FairyCharacter from './FairyCharacter';

/**
 * Fairy companion — alive, playful, engaging.
 * 
 * Behaviors:
 * - Entrance: peeks from left, waves, flies in
 * - Cursor dodge: darts away when cursor gets close (like catching a butterfly)
 * - Sitting: lands on elements, legs dangling, wings folded
 * - Guiding: flies to interactive elements when scroll stops, shows bubble
 * - Playful: twirl, giggle, wave, hide-and-peek, backflip, blow kiss
 * - Bored/sleepy: yawns when user idle too long, wakes on scroll
 * - Sparkle trail: leaves sparkles when flying
 * - RSVP reminder: priority bubble if user skips RSVP
 */

const TARGETS = [
  { selector: '.wax-seal-btn', action: 'cast', priority: 1, bounce: false, bubble: 'Psst... tap here! ✨' },
  { selector: '.hero-cta', action: 'tap', priority: 6, bounce: true, bubble: null },
  { selector: '.directions-btn', action: 'tap', priority: 2, bounce: true, bubble: 'Need directions? ✨' },
  { selector: '#rsvp-name', action: 'point', priority: 3, bounce: true, emptyOnly: true, bubble: "Who's coming? ✨" },
  { selector: '#rsvp-message', action: 'point', priority: 4, bounce: true, emptyOnly: true, bubble: 'Leave a wish! ✨' },
  { selector: '.rsvp-submit', action: 'tap', priority: 5, bounce: true, bubble: "Don't forget to RSVP! ✨" },
];

// Elements the fairy can "sit" on
const SIT_TARGETS = [
  '.section-title',
  '.event-card',
  '.countdown-item',
  '.hero-divider',
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
  const guidedRecently = useRef(new Set());
  const lastCursorPos = useRef({ x: -100, y: -100 });
  const idleStartTime = useRef(Date.now());
  const isScrolling = useRef(false);
  const sparkleTrail = useRef([]);

  const [pose, setPose] = useState('peek');
  const [flipped, setFlipped] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  // Bubble state
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  const [bubbleClickAction, setBubbleClickAction] = useState(null);
  const bubblePriorityRef = useRef(false);
  const bubbleTimer = useRef(null);
  const rsvpReminded = useRef(false);
  const rsvpSeen = useRef(false);

  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // === ENTRANCE ===
  useEffect(() => {
    pos.current = { x: -20, y: window.innerHeight * 0.3 };
    target.current = { x: 15, y: window.innerHeight * 0.3 };
    mood.current = 'peeking';
    setPose('peek');

    addTimer(() => { target.current = { x: 30, y: window.innerHeight * 0.3 }; setPose('wave'); }, 1800);
    addTimer(() => { mood.current = 'fly'; setPose('fly'); target.current = { x: window.innerWidth * 0.75, y: window.innerHeight * 0.25 }; }, 3200);
    addTimer(() => { mood.current = 'idle'; setPose('idle'); idleStartTime.current = Date.now(); startBehaviorLoop(); }, 4800);

    return () => clearAllTimers();
  }, [addTimer, clearAllTimers]);

  // === CURSOR TRACKING — for dodge behavior ===
  useEffect(() => {
    const onMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      if (x != null) lastCursorPos.current = { x, y };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, []);

  // === CURSOR DODGE — dart away when cursor gets close ===
  useEffect(() => {
    const checkProximity = setInterval(() => {
      if (mood.current !== 'idle' && mood.current !== 'sitting') return;
      const cursor = lastCursorPos.current;
      const dist = Math.hypot(cursor.x - pos.current.x, cursor.y - pos.current.y);

      if (dist < 60) {
        // Dart away from cursor
        mood.current = 'dodging';
        setPose('fly');
        const angle = Math.atan2(pos.current.y - cursor.y, pos.current.x - cursor.x);
        const dodgeDist = 100 + Math.random() * 60;
        target.current = {
          x: Math.max(30, Math.min(window.innerWidth - 30, pos.current.x + Math.cos(angle) * dodgeDist)),
          y: Math.max(30, Math.min(window.innerHeight - 30, pos.current.y + Math.sin(angle) * dodgeDist)),
        };
        // Giggle after dodging
        addTimer(() => {
          setPose('giggle');
          addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 800);
        }, 500);
      }
    }, 200);
    return () => clearInterval(checkProximity);
  }, [addTimer]);

  // === SCROLL HANDLER ===
  useEffect(() => {
    let scrollTimeout;
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const scrollDelta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;

      isScrolling.current = true;
      idleStartTime.current = Date.now();

      // Hide non-priority bubble
      if (Math.abs(scrollDelta) > 2 && !bubblePriorityRef.current) {
        setBubbleVisible(false);
      }

      // Wake up if sleeping
      if (mood.current === 'sleeping') {
        mood.current = 'fly';
        setPose('fly');
      }

      // Drift with scroll
      if (mood.current === 'idle' || mood.current === 'sitting') {
        mood.current = 'fly';
        setPose('fly');
      }
      target.current = {
        x: pos.current.x + (Math.random() - 0.5) * 3,
        y: Math.max(50, Math.min(window.innerHeight - 50, pos.current.y + scrollDelta * 0.06)),
      };

      // When scroll stops — just go idle, let behavior loop handle guiding
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling.current = false;
        mood.current = 'idle';
        setPose('idle');
      }, 400);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(scrollTimeout); };
  }, []);

  // === MAIN BEHAVIOR LOOP ===
  function startBehaviorLoop() {
    let actionCount = 0;

    const loop = setInterval(() => {
      if (mood.current === 'acting' || mood.current === 'guiding' || mood.current === 'hiding' ||
          mood.current === 'peeking' || mood.current === 'dodging') return;

      // Check for sleep
      if (mood.current === 'sleeping') return;
      const idleTime = Date.now() - idleStartTime.current;
      if (idleTime > 15000 && mood.current === 'idle' && !isScrolling.current) {
        mood.current = 'sleeping';
        setPose('idle');
        return;
      }

      actionCount++;

      // Cycle: guide → play → balloon → sit → guide → play → balloon → sit...
      const action = actionCount % 5;
      if (action === 0 || action === 3) {
        // Guide — but skip recently guided elements
        const visibleTargets = getVisibleTargets().filter(t => !guidedRecently.current.has(t.uniqueKey));
        if (visibleTargets.length > 0) {
          const next = visibleTargets[0];
          guidedRecently.current.add(next.uniqueKey);
          // Clear guided set after 15s so it can guide again
          setTimeout(() => guidedRecently.current.delete(next.uniqueKey), 15000);
          flyToElement(next);
        } else {
          doPlayfulGesture();
        }
      } else if (action === 1) {
        doPlayfulGesture();
      } else if (action === 2) {
        // Chase balloon
        chaseBalloon();
      } else {
        sitOnElement();
      }
    }, 2200);

    timers.current.push(loop);
  }

  // === SIT ON ELEMENT ===
  function sitOnElement() {
    for (const selector of SIT_TARGETS) {
      const els = document.querySelectorAll(selector);
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        if (rect.top > 30 && rect.top < window.innerHeight - 80) {
          mood.current = 'sitting';
          setPose('idle'); // sitting pose = idle with position on top of element
          target.current = {
            x: rect.left + rect.width * 0.7,
            y: rect.top - 15, // sit on top edge
          };
          setFlipped(Math.random() > 0.5);
          // Get up after a bit
          addTimer(() => {
            if (mood.current === 'sitting') {
              mood.current = 'idle';
              setPose('idle');
              target.current = { x: pos.current.x + 40, y: pos.current.y - 30 };
            }
          }, 2500);
          return;
        }
      }
    }
    // Nothing to sit on — do a gesture instead
    doPlayfulGesture();
  }

  // === FLY TO ELEMENT ===
  function flyToElement({ el, rect, action, selector, bounce, uniqueKey, bubble }) {
    mood.current = 'guiding';
    setPose('fly');
    currentTargetSelector.current = uniqueKey || selector;
    lastActionTime.current = Date.now();

    const fairyX = rect.left - 20;
    const fairyY = rect.top + rect.height / 2 - 10;
    target.current = { x: Math.max(15, fairyX), y: Math.max(15, fairyY) };
    setFlipped(false);

    addTimer(() => {
      mood.current = 'acting';
      setPose(action);

      if (bubble && !isScrolling.current && !bubblePriorityRef.current) {
        setBubbleText(bubble);
        setBubbleClickAction(null);
        setBubbleVisible(true);
        clearTimeout(bubbleTimer.current);
        bubbleTimer.current = setTimeout(() => setBubbleVisible(false), 2500);
      }

      if (bounce && el) {
        el.classList.add('fairy-tapped');
        addTimer(() => el.classList.remove('fairy-tapped'), 600);
      }
    }, 500);

    addTimer(() => {
      mood.current = 'idle';
      setPose('idle');
      idleStartTime.current = Date.now();
      target.current = { x: pos.current.x + 30, y: pos.current.y - 25 };
    }, 2000);
  }

  // === PLAYFUL GESTURES ===
  function doPlayfulGesture() {
    const roll = Math.random();
    lastActionTime.current = Date.now();

    if (roll < 0.15) {
      doHideAndPeek();
    } else if (roll < 0.3) {
      setPose('twirl');
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 1200);
    } else if (roll < 0.45) {
      setPose('giggle');
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 1500);
    } else if (roll < 0.6) {
      setPose('wave');
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 1200);
    } else if (roll < 0.75) {
      // Backflip (fast twirl)
      setPose('twirl');
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 600);
    } else if (roll < 0.8) {
      // Random fly to a new spot
      mood.current = 'fly';
      setPose('fly');
      target.current = {
        x: Math.random() * (window.innerWidth - 100) + 50,
        y: Math.random() * (window.innerHeight * 0.6) + 50,
      };
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 1500);
    } else {
      // Chase a heart balloon
      chaseBalloon();
    }
  }

  // === CHASE A BALLOON ===
  function chaseBalloon() {
    const balloons = document.querySelectorAll('.heart-balloon');
    let targetBalloon = null;

    for (const b of balloons) {
      const rect = b.getBoundingClientRect();
      if (rect.top > 50 && rect.top < window.innerHeight - 100 && rect.left > 20 && rect.right < window.innerWidth - 20) {
        targetBalloon = b;
        break;
      }
    }

    if (!targetBalloon) {
      mood.current = 'fly';
      setPose('fly');
      target.current = { x: Math.random() * (window.innerWidth - 100) + 50, y: Math.random() * (window.innerHeight * 0.5) + 50 };
      addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 1500);
      return;
    }

    // Chase: update target position every 100ms to follow the moving balloon
    mood.current = 'fly';
    setPose('fly');
    let chaseCount = 0;
    const chaseInterval = setInterval(() => {
      chaseCount++;
      const rect = targetBalloon.getBoundingClientRect();
      target.current = { x: rect.left + 15, y: rect.top + 15 };

      // After getting close enough or 1s of chasing, pop it
      const dist = Math.hypot(pos.current.x - (rect.left + 15), pos.current.y - (rect.top + 15));
      if (dist < 40 || chaseCount > 10) {
        clearInterval(chaseInterval);
        setPose('cast');
        addTimer(() => {
          targetBalloon.click();
          setPose('giggle');
          addTimer(() => { mood.current = 'idle'; setPose('idle'); }, 1000);
        }, 200);
      }
    }, 100);

    // Safety: clear chase after 2s no matter what
    addTimer(() => {
      clearInterval(chaseInterval);
      if (mood.current === 'fly') { mood.current = 'idle'; setPose('idle'); }
    }, 2000);
  }

  // === HIDE AND PEEK ===
  function doHideAndPeek() {
    mood.current = 'hiding';
    setPose('fly');
    const goLeft = pos.current.x < window.innerWidth / 2;
    target.current = { x: goLeft ? -10 : window.innerWidth + 10, y: pos.current.y };

    addTimer(() => { mood.current = 'peeking'; setPose('peek'); target.current = { x: goLeft ? 18 : window.innerWidth - 18, y: pos.current.y }; }, 1200);
    addTimer(() => { mood.current = 'fly'; setPose('fly'); target.current = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.3 }; }, 3000);
    addTimer(() => { mood.current = 'idle'; setPose('idle'); idleStartTime.current = Date.now(); }, 4200);
  }

  // === SPARKLE TRAIL — emit sparkles when flying ===
  useEffect(() => {
    const sparkleInterval = setInterval(() => {
      const m = mood.current;
      const speed = Math.hypot(vel.current.x, vel.current.y);
      if ((m === 'fly' || m === 'guiding' || m === 'dodging') && speed > 0.8) {
        const newSparkle = {
          id: Date.now() + Math.random(),
          x: pos.current.x + (Math.random() - 0.5) * 10,
          y: pos.current.y + (Math.random() - 0.5) * 10,
          born: Date.now(),
        };
        sparkleTrail.current.push(newSparkle);
        // Keep max 12 sparkles
        if (sparkleTrail.current.length > 12) sparkleTrail.current.shift();
        setSparkles([...sparkleTrail.current]);
      }
      // Remove old sparkles
      sparkleTrail.current = sparkleTrail.current.filter(s => Date.now() - s.born < 800);
      setSparkles([...sparkleTrail.current]);
    }, 80);
    return () => clearInterval(sparkleInterval);
  }, []);

  // === ANIMATION LOOP ===
  useEffect(() => {
    const animate = () => {
      const p = pos.current;
      const t = target.current;
      const v = vel.current;
      const m = mood.current;

      let tx = t.x;
      let ty = t.y;

      // Idle: gentle figure-8 drift
      if (m === 'idle' || m === 'sitting') {
        const time = Date.now() * 0.0006;
        tx = t.x + Math.sin(time) * 8;
        ty = t.y + Math.cos(time * 1.3) * 5;
      }

      // Acting: small hover
      if (m === 'acting') {
        const time = Date.now() * 0.003;
        tx = t.x + Math.sin(time) * 3;
        ty = t.y + Math.cos(time) * 2;
      }

      // Sleeping: very slow drift
      if (m === 'sleeping') {
        const time = Date.now() * 0.0002;
        tx = p.x + Math.sin(time) * 0.3;
        ty = p.y + Math.cos(time) * 0.2;
      }

      // Clamp
      if (m !== 'peeking' && m !== 'hiding' && m !== 'hidden') {
        tx = Math.max(15, Math.min(window.innerWidth - 15, tx));
        ty = Math.max(15, Math.min(window.innerHeight - 15, ty));
      }

      // Spring physics
      const stiffness = (m === 'guiding' || m === 'dodging') ? 0.12 : (m === 'fly' || m === 'hiding') ? 0.07 : 0.025;
      const damping = 0.78;
      v.x += (tx - p.x) * stiffness;
      v.y += (ty - p.y) * stiffness;
      v.x *= damping;
      v.y *= damping;
      p.x += v.x;
      p.y += v.y;

      // Soft clamp
      if (m !== 'hiding' && m !== 'peeking') {
        p.x = Math.max(5, Math.min(window.innerWidth - 5, p.x));
        p.y = Math.max(5, Math.min(window.innerHeight - 5, p.y));
      }

      // Flip
      if (m !== 'acting' && m !== 'guiding' && m !== 'sitting' && Math.abs(v.x) > 0.3) {
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

  // === RSVP REMINDER ===
  useEffect(() => {
    let rsvpTimer;
    const scrollHandler = () => {
      const rsvp = document.getElementById('rsvp');
      if (!rsvp) return;
      const rect = rsvp.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) rsvpSeen.current = true;
      else if (rsvpSeen.current && !rsvpReminded.current) {
        setTimeout(() => { if (!rsvpReminded.current) showRsvpReminder(); }, 1000);
      }
    };

    const showRsvpReminder = () => {
      if (rsvpReminded.current) return;
      if (document.querySelector('.rsvp-thanks')) return;
      rsvpReminded.current = true;
      clearTimeout(bubbleTimer.current);
      setBubbleText("Oops, did you forget to RSVP? 💌");
      bubblePriorityRef.current = true;
      setBubbleClickAction(() => () => {
        document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
        setBubbleVisible(false);
        bubblePriorityRef.current = false;
      });
      setBubbleVisible(true);
      bubbleTimer.current = setTimeout(() => { setBubbleVisible(false); bubblePriorityRef.current = false; }, 15000);
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    rsvpTimer = setTimeout(() => { if (!rsvpSeen.current && !rsvpReminded.current) showRsvpReminder(); }, 30000);
    return () => { window.removeEventListener('scroll', scrollHandler); clearTimeout(rsvpTimer); };
  }, []);

  // === VISIBLE TARGETS ===
  function getVisibleTargets() {
    const results = [];
    for (const t of TARGETS) {
      const elements = document.querySelectorAll(t.selector);
      elements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top > 20 && rect.bottom < window.innerHeight - 20 && rect.left > 0 && rect.right < window.innerWidth) {
          if (t.emptyOnly && el.value && el.value.trim() !== '') return;
          results.push({ ...t, el, rect, uniqueKey: `${t.selector}-${idx}` });
        }
      });
    }
    return results.sort((a, b) => a.priority - b.priority);
  }

  return (
    <>
      {/* Sparkle trail — rendered outside fairy container for correct positioning */}
      {sparkles.map(s => {
        const age = (Date.now() - s.born) / 800;
        return (
          <div
            key={s.id}
            className="fairy-trail-sparkle"
            style={{
              position: 'fixed',
              left: s.x - 5,
              top: s.y - 5,
              opacity: 1 - age,
              transform: `scale(${1 - age * 0.7})`,
            }}
          >
            ✦
          </div>
        );
      })}
      <div ref={containerRef} className={`fairy-companion ${flipped ? 'fairy-flipped' : ''}`} aria-hidden="true">
        {bubbleVisible && (
          <div
            className={`fairy-speech-bubble ${bubbleClickAction ? 'fairy-bubble-clickable' : ''}`}
            onClick={bubbleClickAction || undefined}
            style={bubbleClickAction ? { pointerEvents: 'auto', cursor: 'pointer' } : undefined}
          >
            {bubbleText}
          </div>
        )}
        <FairyCharacter pose={pose} size={55} />
        <div className="fairy-sparkle-trail">
          <span className="fairy-sp sp1">✦</span>
          <span className="fairy-sp sp2">✧</span>
          <span className="fairy-sp sp3">·</span>
        </div>
      </div>
    </>
  );
}
