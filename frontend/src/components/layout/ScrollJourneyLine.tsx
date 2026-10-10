import React from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress.js';

export const ScrollJourneyLine: React.FC = () => {
  const { progress, prefersReducedMotion } = useScrollProgress();

  if (prefersReducedMotion) {
    return null;
  }

  // Path length for 100vh calculation
  const pathLength = 1000;
  const strokeDashoffset = pathLength - progress * pathLength;

  return (
    <div
      className="fixed left-3 top-0 bottom-0 w-8 pointer-events-none z-30 hidden lg:flex flex-col items-center justify-between py-12"
      aria-hidden="true"
    >
      {/* Starting dot */}
      <div className="w-2.5 h-2.5 rounded-full border-2 border-teal-500 bg-surface shadow-sm" />

      {/* SVG vertical journey line */}
      <svg className="h-full w-4 overflow-visible" viewBox="0 0 16 1000" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="50%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track line */}
        <line
          x1="8"
          y1="0"
          x2="8"
          y2="1000"
          stroke="var(--border)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Animated active journey line */}
        <line
          x1="8"
          y1="0"
          x2="8"
          y2="1000"
          stroke="url(#journeyGradient)"
          strokeWidth="2.5"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#glow)"
        />
      </svg>

      {/* Finishing anchor point */}
      <div
        className={`w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300 ${
          progress >= 0.98
            ? 'border-teal-400 bg-teal-500 shadow-md shadow-teal-500/50'
            : 'border-border bg-surface'
        }`}
      />
    </div>
  );
};
