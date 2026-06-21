import type { CSSProperties } from 'react';

export function FoxMark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      style={style}
      fill="none"
      aria-label="MetaSpend"
    >
      {/* Main fox head */}
      <path d="M24 3 L40 10 L44 26 L36 40 L24 45 L12 40 L4 26 L8 10 Z" fill="#F6851B" />
      {/* Left ear */}
      <path d="M8 10 L14 3 L20 12 Z" fill="#E2761B" />
      {/* Right ear */}
      <path d="M40 10 L34 3 L28 12 Z" fill="#E2761B" />
      {/* Forehead shadow band */}
      <path d="M20 12 L28 12 L32 20 L24 22 L16 20 Z" fill="#CD6116" />
      {/* Left eye white */}
      <ellipse cx="16.5" cy="19" rx="3.5" ry="4" fill="white" />
      {/* Right eye white */}
      <ellipse cx="31.5" cy="19" rx="3.5" ry="4" fill="white" />
      {/* Left pupil */}
      <circle cx="17.5" cy="19.5" r="2" fill="#1D1D1D" />
      {/* Right pupil */}
      <circle cx="32.5" cy="19.5" r="2" fill="#1D1D1D" />
      {/* Muzzle */}
      <ellipse cx="24" cy="32" rx="7" ry="5.5" fill="#FCD0A3" />
      {/* Nose */}
      <ellipse cx="24" cy="29.5" rx="2.2" ry="1.4" fill="#1D1D1D" />
      {/* Mouth */}
      <path d="M19 33 Q24 37 29 33" stroke="#CD6116" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Chin */}
      <path d="M12 40 L24 45 L36 40 L31 35 L24 37 L17 35 Z" fill="#E2761B" />
    </svg>
  );
}
