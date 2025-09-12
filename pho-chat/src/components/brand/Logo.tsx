"use client";

import * as React from "react";

export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  // Minimal, clean mark that fits shadcn aesthetics
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="pho.chat logo"
      role="img"
    >
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M7 15c0-3.5 2.5-5 5-5s5 1.5 5 5" fill="none" stroke="url(#g)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9.5" cy="9.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

export default Logo;

