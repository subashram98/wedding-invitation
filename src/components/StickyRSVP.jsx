import { useState, useEffect } from 'react';

/**
 * Floating RSVP button — visible when RSVP section is not in view.
 * Scrolls to RSVP form on tap.
 */
export default function StickyRSVP() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const check = () => {
      // Hide if RSVP section is in view or form was submitted
      const rsvp = document.getElementById('rsvp');
      const thankYou = document.querySelector('.rsvp-thanks');
      if (thankYou) { setSubmitted(true); setVisible(false); return; }
      if (!rsvp) return;

      const rect = rsvp.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      // Also hide at very top of page (hero section)
      const pastHero = window.scrollY > window.innerHeight * 0.5;
      setVisible(!inView && pastHero);
    };

    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, []);

  if (submitted || !visible) return null;

  return (
    <button
      className="sticky-rsvp-btn"
      onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
      aria-label="Go to RSVP"
    >
      💌 RSVP
    </button>
  );
}
