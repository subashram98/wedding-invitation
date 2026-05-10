import React from 'react';
import { useConfig } from '../useConfig';
import AnimatedSection from './AnimatedSection';
import DirectionsButton from './DirectionsButton';

export default function Events() {
  const config = useConfig();

  // Generate .ics calendar file and trigger download — works on both iOS and Android
  function addToCalendar(event) {
    const venue = 'AARNA Mahal, Pallikaranai, Chennai';
    let startDate, endDate;
    if (event.name === 'Reception') {
      startDate = '20260528T190000';
      endDate = '20260528T230000';
    } else {
      startDate = '20260529T060000';
      endDate = '20260529T080000';
    }

    const title = `${config.couple.person1} & ${config.couple.person2} - ${event.name}`;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${title}`,
      `LOCATION:${venue}`,
      `DESCRIPTION:${event.description}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name.toLowerCase().replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

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
            <div className="event-actions">
              <DirectionsButton />
              <button
                className="directions-btn"
                onClick={() => addToCalendar(e)}
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Add to Calendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}
