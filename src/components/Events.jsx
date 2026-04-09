import React from 'react';
import { useConfig } from '../useConfig';
import AnimatedSection from './AnimatedSection';
import DirectionsButton from './DirectionsButton';

export default function Events() {
  const config = useConfig();

  return (
    <AnimatedSection className="events" id="events-section">
      <p className="section-label">Join Us For</p>
      <h2 className="section-title">Wedding Events</h2>
      <div className="events-grid">
        {config.events.map((e, i) => (
          <div className="event-card" key={e.name} style={{ '--card-index': i }}>
            <div className="event-card-glow" aria-hidden="true" />
            <span className="event-icon">{e.icon}</span>
            <h3 className="event-name">{e.name}</h3>
            <p className="event-description">{e.description}</p>
            <div className="event-details">
              <p>📅 {e.date}</p>
              <p>🕐 {e.time}</p>
              <p>📍 {e.venue}</p>
            </div>
            <DirectionsButton />
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}
