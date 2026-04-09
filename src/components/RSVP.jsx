import React, { useState } from 'react';
import { useConfig } from '../useConfig';
import AnimatedSection from './AnimatedSection';

export default function RSVP() {
  const config = useConfig();
  const [form, setForm] = useState({ name: '', guests: '1', attending: 'yes', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    try {
      await fetch(config.wedding.rsvpEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch (err) {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AnimatedSection className="rsvp" id="rsvp">
        <div className="rsvp-thanks">
          <span className="rsvp-thanks-icon">💌</span>
          <h2>Thank You!</h2>
          <p>We've received your RSVP. We can't wait to celebrate with you.</p>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection className="rsvp" id="rsvp">
      <div className="rsvp-floating-hearts" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="floating-heart" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${Math.random() * 4 + 6}s`,
            fontSize: `${Math.random() * 10 + 8}px`,
            opacity: Math.random() * 0.3 + 0.1,
          }}>♥</span>
        ))}
      </div>
      <p className="section-label">Will You Join Us?</p>
      <h2 className="section-title">RSVP</h2>
      <p className="rsvp-subtitle">Kindly respond by {config.wedding.rsvpDeadline}</p>
      <form className="rsvp-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rsvp-name">Your Name</label>
          <input
            id="rsvp-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rsvp-guests">How many joining?</label>
            <select
              id="rsvp-guests"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="rsvp-attending">Will you attend?</label>
            <select
              id="rsvp-attending"
              value={form.attending}
              onChange={(e) => setForm({ ...form, attending: e.target.value })}
            >
              <option value="yes">Joyfully Accept</option>
              <option value="no">Regretfully Decline</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="rsvp-message">Message for the Couple</label>
          <textarea
            id="rsvp-message"
            rows="3"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Share your wishes..."
          />
        </div>
        {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', textAlign: 'center' }}>Something went wrong. Please try again.</p>}
        <button type="submit" className="rsvp-submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send RSVP'}
        </button>
      </form>
    </AnimatedSection>
  );
}
