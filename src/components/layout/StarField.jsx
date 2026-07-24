import React, { useMemo } from 'react';

export default function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
    })), []
  );

  const botanicals = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 85 + 5}%`,
      top: `${Math.random() * 85 + 5}%`,
      scale: 0.4 + Math.random() * 0.5,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 4 + 8}s`,
      variant: i % 3,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      {botanicals.map(plant => (
        <div
          key={plant.id}
          className="absolute animate-float"
          style={{
            left: plant.left,
            top: plant.top,
            transform: `scale(${plant.scale})`,
            animationDelay: plant.delay,
            animationDuration: plant.duration,
            opacity: 0.05,
          }}
        >
          {plant.variant === 0 ? (
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M45 12 A33 33 0 1 0 45 78 A24 33 0 1 1 45 12" fill="currentColor" className="text-violet" />
              <ellipse cx="18" cy="45" rx="7" ry="3.5" transform="rotate(-30 18 45)" fill="currentColor" className="text-teal" />
              <ellipse cx="72" cy="45" rx="7" ry="3.5" transform="rotate(30 72 45)" fill="currentColor" className="text-teal" />
              <ellipse cx="45" cy="8" rx="6" ry="3" fill="currentColor" className="text-teal" />
              <ellipse cx="45" cy="82" rx="6" ry="3" fill="currentColor" className="text-teal" />
            </svg>
          ) : plant.variant === 1 ? (
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 15 L45 35 L60 38 L45 42 L40 62 L35 42 L20 38 L35 35 Z" fill="currentColor" className="text-gold" />
              <circle cx="40" cy="38" r="3" fill="currentColor" className="text-violet" />
            </svg>
          ) : (
            <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 30 Q20 10, 35 30 T65 30 T95 30" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-violet" />
              <ellipse cx="15" cy="22" rx="5" ry="2.5" transform="rotate(-30 15 22)" fill="currentColor" className="text-teal" />
              <ellipse cx="35" cy="38" rx="5" ry="2.5" transform="rotate(30 35 38)" fill="currentColor" className="text-teal" />
              <ellipse cx="55" cy="22" rx="5" ry="2.5" transform="rotate(-30 55 22)" fill="currentColor" className="text-teal" />
              <ellipse cx="75" cy="38" rx="5" ry="2.5" transform="rotate(30 75 38)" fill="currentColor" className="text-teal" />
              <circle cx="50" cy="30" r="2" fill="currentColor" className="text-gold" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}