import React from 'react';

export default function BotanicalDivider({ className = '' }) {
  return (
    <div className={`flex items-center justify-center my-8 ${className}`}>
      <svg width="100%" height="48" viewBox="0 0 400 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        {/* Left vine */}
        <path d="M10 24 Q40 8, 70 24 T130 24 T190 24" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35" className="text-violet" />
        {/* Left small branches */}
        <path d="M30 24 Q33 16, 36 24" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25" className="text-violet" />
        <path d="M55 24 Q58 32, 61 24" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25" className="text-violet" />
        <path d="M90 24 Q93 16, 96 24" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25" className="text-violet" />
        <path d="M115 24 Q118 32, 121 24" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25" className="text-violet" />

        {/* Left leaves */}
        <ellipse cx="28" cy="16" rx="4" ry="2" transform="rotate(-35 28 16)" fill="currentColor" opacity="0.18" className="text-teal" />
        <ellipse cx="62" cy="32" rx="4" ry="2" transform="rotate(35 62 32)" fill="currentColor" opacity="0.18" className="text-teal" />
        <ellipse cx="95" cy="16" rx="3.5" ry="1.8" transform="rotate(-25 95 16)" fill="currentColor" opacity="0.14" className="text-teal" />
        <ellipse cx="125" cy="32" rx="3.5" ry="1.8" transform="rotate(25 125 32)" fill="currentColor" opacity="0.14" className="text-teal" />

        {/* Left crystal */}
        <path d="M155 24 L160 17 L165 24 L160 31 Z" fill="currentColor" opacity="0.15" className="text-gold" />

        {/* Central moon crescent */}
        <g transform="translate(200, 24)">
          <path d="M0 -11 A11 11 0 1 0 0 11 A8 11 0 1 1 0 -11" fill="currentColor" opacity="0.45" className="text-violet" />
          <circle cx="0" cy="0" r="14" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.15" className="text-violet" />
          <circle cx="0" cy="0" r="18" stroke="currentColor" strokeWidth="0.3" fill="none" opacity="0.08" className="text-violet" />
        </g>

        {/* Right crystal */}
        <path d="M235 24 L240 17 L245 24 L240 31 Z" fill="currentColor" opacity="0.15" className="text-gold" />

        {/* Right vine (mirror) */}
        <path d="M210 24 Q240 40, 270 24 T330 24 T390 24" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35" className="text-violet" />
        {/* Right small branches */}
        <path d="M275 24 Q278 16, 281 24" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25" className="text-violet" />
        <path d="M300 24 Q303 32, 306 24" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25" className="text-violet" />
        <path d="M335 24 Q338 16, 341 24" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25" className="text-violet" />
        <path d="M360 24 Q363 32, 366 24" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25" className="text-violet" />

        {/* Right leaves */}
        <ellipse cx="275" cy="16" rx="4" ry="2" transform="rotate(-35 275 16)" fill="currentColor" opacity="0.18" className="text-teal" />
        <ellipse cx="310" cy="32" rx="4" ry="2" transform="rotate(35 310 32)" fill="currentColor" opacity="0.18" className="text-teal" />
        <ellipse cx="343" cy="16" rx="3.5" ry="1.8" transform="rotate(-25 343 16)" fill="currentColor" opacity="0.14" className="text-teal" />
        <ellipse cx="372" cy="32" rx="3.5" ry="1.8" transform="rotate(25 372 32)" fill="currentColor" opacity="0.14" className="text-teal" />

        {/* Small dots */}
        <circle cx="50" cy="24" r="1" fill="currentColor" opacity="0.3" className="text-violet" />
        <circle cx="110" cy="24" r="1" fill="currentColor" opacity="0.3" className="text-violet" />
        <circle cx="295" cy="24" r="1" fill="currentColor" opacity="0.3" className="text-violet" />
        <circle cx="355" cy="24" r="1" fill="currentColor" opacity="0.3" className="text-violet" />
      </svg>
    </div>
  );
}