import React from 'react';

/**
 * Heart-shaped wax seal — customizable text, size, colors.
 * Clean 3D look: convex surface, highlight, rim, embossed text.
 */
export default function WaxSeal({ text = 'S & P', size = 90, className = '' }) {
  const id = `wax-${Math.random().toString(36).slice(2, 8)}`;

  // Heart path centered in 200x200 viewBox
  const heartPath = 'M100 175 C100 175 20 120 20 70 C20 35 45 15 70 15 C88 15 96 28 100 38 C104 28 112 15 130 15 C155 15 180 35 180 70 C180 120 100 175 100 175Z';

  return (
    <div
      className={`wax-seal-container ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Irregular melted wax edge */}
          <filter id={`${id}-rough`}>
            <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
          </filter>

          {/* 3D convex surface gradient */}
          <radialGradient id={`${id}-surface`} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#e84848" />
            <stop offset="25%" stopColor="#cc3333" />
            <stop offset="55%" stopColor="#a52222" />
            <stop offset="80%" stopColor="#7a1515" />
            <stop offset="100%" stopColor="#551010" />
          </radialGradient>

          {/* Gloss highlight */}
          <radialGradient id={`${id}-gloss`} cx="35%" cy="28%" r="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Drop shadow */}
        <path
          d={heartPath}
          fill="rgba(0,0,0,0.3)"
          transform="translate(3, 5)"
          filter={`url(#${id}-rough)`}
        />

        {/* Outer melted wax edge (slightly larger, irregular) */}
        <path
          d={heartPath}
          fill="#7a1515"
          filter={`url(#${id}-rough)`}
          transform="scale(1.04) translate(-4, -4)"
        />

        {/* Main heart body */}
        <path
          d={heartPath}
          fill={`url(#${id}-surface)`}
        />

        {/* Rim — inner border for depth */}
        <path
          d={heartPath}
          fill="none"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="2.5"
          transform="scale(0.88) translate(14, 14)"
        />
        <path
          d={heartPath}
          fill="none"
          stroke="rgba(255,150,150,0.12)"
          strokeWidth="1"
          transform="scale(0.86) translate(16, 16)"
        />

        {/* Gloss highlight */}
        <path
          d={heartPath}
          fill={`url(#${id}-gloss)`}
        />

        {/* Embossed text */}
        <text
          x="100" y="108"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="26"
          fontWeight="700"
          letterSpacing="2"
          fill="rgba(30,5,5,0.45)"
        >
          {text}
        </text>
        {/* Text highlight (offset for emboss look) */}
        <text
          x="100" y="107"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="26"
          fontWeight="700"
          letterSpacing="2"
          fill="rgba(255,180,180,0.15)"
        >
          {text}
        </text>
      </svg>
    </div>
  );
}
