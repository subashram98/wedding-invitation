import React from 'react';
import { useConfig } from '../useConfig';

function MapHeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Heart shape */}
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Map pin inside */}
      <circle cx="12" cy="9.5" r="2.5" fill="#0a0a1a" opacity="0.8" />
      <circle cx="12" cy="9.5" r="1" fill="currentColor" />
    </svg>
  );
}

export default function DirectionsButton({ className = '' }) {
  const config = useConfig();

  return (
    <a
      href={config.wedding.venueMapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`directions-btn ${className}`}
    >
      <MapHeartIcon />
      <span>Get Directions</span>
    </a>
  );
}
