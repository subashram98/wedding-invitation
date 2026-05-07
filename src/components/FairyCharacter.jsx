import React from 'react';

/**
 * Fairy character SVG — Tinkerbell-style woodland fairy.
 * Long flowing hair, petal dress, iridescent wings, wand with star tip.
 * Poses: idle, fly, peek, point, cast, tap
 */
export default function FairyCharacter({ pose = 'idle', size = 60 }) {
  return (
    <svg
      viewBox="0 0 100 130"
      width={size}
      height={size * 1.3}
      className={`fairy-body fairy-pose-${pose}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pixie dust aura */}
      <circle className="fairy-aura" cx="50" cy="55" r="42" fill="rgba(212,168,67,0.06)" />

      {/* Wings — large, iridescent, veined */}
      <g className="fairy-wings">
        {/* Left upper wing */}
        <path className="fairy-wing-l" d="M42 45 Q20 20 12 35 Q5 50 20 58 Q30 62 42 55 Z"
          fill="rgba(180,220,255,0.15)" stroke="rgba(212,168,67,0.3)" strokeWidth="0.4" />
        {/* Left lower wing */}
        <path className="fairy-wing-l-sm" d="M40 55 Q22 55 18 65 Q15 75 28 72 Q36 70 40 62 Z"
          fill="rgba(200,180,255,0.12)" stroke="rgba(212,168,67,0.25)" strokeWidth="0.3" />
        {/* Right upper wing */}
        <path className="fairy-wing-r" d="M58 45 Q80 20 88 35 Q95 50 80 58 Q70 62 58 55 Z"
          fill="rgba(180,220,255,0.15)" stroke="rgba(212,168,67,0.3)" strokeWidth="0.4" />
        {/* Right lower wing */}
        <path className="fairy-wing-r-sm" d="M60 55 Q78 55 82 65 Q85 75 72 72 Q64 70 60 62 Z"
          fill="rgba(200,180,255,0.12)" stroke="rgba(212,168,67,0.25)" strokeWidth="0.3" />
        {/* Wing veins */}
        <path d="M42 48 Q28 35 18 42" fill="none" stroke="rgba(212,168,67,0.15)" strokeWidth="0.3" />
        <path d="M58 48 Q72 35 82 42" fill="none" stroke="rgba(212,168,67,0.15)" strokeWidth="0.3" />
      </g>

      {/* Long flowing hair (behind body) */}
      <g className="fairy-hair-back">
        <path d="M35 38 Q30 55 28 75 Q27 85 30 90" fill="none" stroke="#c8860b" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M38 40 Q34 58 33 78 Q32 88 34 93" fill="none" stroke="#d4a030" strokeWidth="3" strokeLinecap="round" />
        <path d="M62 38 Q68 55 70 72 Q71 82 69 88" fill="none" stroke="#c8860b" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M60 40 Q65 56 67 70 Q68 80 66 86" fill="none" stroke="#d4a030" strokeWidth="3" strokeLinecap="round" />
        {/* Extra flowing strands */}
        <path className="fairy-hair-flow-1" d="M32 42 Q26 60 24 80 Q23 90 26 95" fill="none" stroke="#b87a08" strokeWidth="2.5" strokeLinecap="round" />
        <path className="fairy-hair-flow-2" d="M65 40 Q72 58 75 75 Q76 85 73 92" fill="none" stroke="#b87a08" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Head */}
      <g className="fairy-head">
        <ellipse cx="50" cy="38" rx="12" ry="13" fill="#ffe0bd" />
        {/* Pointed ears */}
        <path d="M37 36 L33 32 L38 35" fill="#ffe0bd" stroke="#f5d0a0" strokeWidth="0.3" />
        <path d="M63 36 L67 32 L62 35" fill="#ffe0bd" stroke="#f5d0a0" strokeWidth="0.3" />
        {/* Cheek blush */}
        <ellipse cx="42" cy="41" rx="3" ry="2" fill="rgba(255,130,130,0.25)" />
        <ellipse cx="58" cy="41" rx="3" ry="2" fill="rgba(255,130,130,0.25)" />
        {/* Eyes — large, expressive */}
        <g className="fairy-eyes">
          <ellipse cx="44" cy="37" rx="3" ry="3.5" fill="#2d1b0e" />
          <ellipse cx="56" cy="37" rx="3" ry="3.5" fill="#2d1b0e" />
          {/* Iris color */}
          <ellipse cx="44" cy="37.5" rx="2" ry="2.5" fill="#4a7a3a" />
          <ellipse cx="56" cy="37.5" rx="2" ry="2.5" fill="#4a7a3a" />
          {/* Pupil */}
          <circle cx="44" cy="37.5" r="1.2" fill="#1a0a00" />
          <circle cx="56" cy="37.5" r="1.2" fill="#1a0a00" />
          {/* Eye sparkle */}
          <circle cx="45.5" cy="36" r="1" fill="#fff" opacity="0.9" />
          <circle cx="57.5" cy="36" r="1" fill="#fff" opacity="0.9" />
          <circle cx="43" cy="38.5" r="0.5" fill="#fff" opacity="0.5" />
          <circle cx="55" cy="38.5" r="0.5" fill="#fff" opacity="0.5" />
        </g>
        {/* Eyebrows — arched */}
        <path d="M40 33 Q44 31 47 33" fill="none" stroke="#8a5a20" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M53 33 Q56 31 60 33" fill="none" stroke="#8a5a20" strokeWidth="0.7" strokeLinecap="round" />
        {/* Nose */}
        <path d="M50 39 L49 41 Q50 41.5 51 41" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
        {/* Mouth — mischievous smile */}
        <path className="fairy-mouth" d="M45 44 Q50 47 55 44" fill="none" stroke="#c0555a" strokeWidth="0.9" strokeLinecap="round" />
      </g>

      {/* Front hair / bangs */}
      <g className="fairy-hair-front">
        <path d="M38 30 Q42 24 50 25 Q58 24 62 30 Q64 34 62 36 Q58 32 50 31 Q42 32 38 36 Q36 34 38 30 Z"
          fill="#d4a030" />
        <path d="M40 28 Q45 23 50 24 Q55 23 60 28" fill="none" stroke="#c8860b" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Petal dress */}
      <g className="fairy-dress">
        {/* Bodice */}
        <path d="M43 52 Q50 50 57 52 L58 62 Q50 63 42 62 Z" fill="#4a9e4a" />
        {/* Petal skirt layers */}
        <path className="fairy-petal-1" d="M38 62 Q42 60 50 62 Q58 60 62 62 Q65 72 60 78 Q50 82 40 78 Q35 72 38 62 Z"
          fill="#5cb85c" opacity="0.9" />
        <path className="fairy-petal-2" d="M36 65 Q43 63 50 65 Q57 63 64 65 Q67 74 62 80 Q50 84 38 80 Q33 74 36 65 Z"
          fill="#3d8b3d" opacity="0.7" />
        {/* Petal tips — asymmetric */}
        <path d="M36 75 Q34 80 37 82" fill="none" stroke="#2d6b2d" strokeWidth="0.5" />
        <path d="M64 75 Q66 80 63 82" fill="none" stroke="#2d6b2d" strokeWidth="0.5" />
        {/* Leaf/vine detail on bodice */}
        <path d="M45 54 Q50 52 55 54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
      </g>

      {/* Left arm */}
      <g className="fairy-arm-l">
        <path d="M42 54 Q36 60 33 66" fill="none" stroke="#ffe0bd" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="32" cy="67" r="2.5" fill="#ffe0bd" />
      </g>

      {/* Right arm + wand */}
      <g className="fairy-arm-r">
        <path d="M58 54 Q64 58 68 54" fill="none" stroke="#ffe0bd" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="69" cy="53" r="2.5" fill="#ffe0bd" />
        {/* Wand */}
        <g className="fairy-wand">
          <line x1="70" y1="52" x2="84" y2="36" stroke="var(--color-gold)" strokeWidth="1.2" strokeLinecap="round" />
          {/* Star tip */}
          <polygon className="fairy-star" points="84,32 85.8,35.5 89.5,35.5 86.5,38 87.5,41.5 84,39.5 80.5,41.5 81.5,38 78.5,35.5 82.2,35.5"
            fill="var(--color-gold-light)" />
          {/* Glow at star */}
          <circle className="fairy-wand-glow" cx="84" cy="36" r="5" fill="rgba(212,168,67,0.2)" />
        </g>
      </g>

      {/* Legs — bare feet */}
      <g className="fairy-legs">
        <path d="M45 78 L44 92 Q43 94 45 94" fill="none" stroke="#ffe0bd" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M55 78 L56 92 Q57 94 55 94" fill="none" stroke="#ffe0bd" strokeWidth="2.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
