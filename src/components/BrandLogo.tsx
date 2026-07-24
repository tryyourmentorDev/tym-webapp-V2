import React from "react";

interface BrandLogoProps {
  showTagline?: boolean;
  inverted?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  showTagline = true,
  inverted = false,
}) => (
  <span className="inline-flex items-center gap-3 text-left">
    <svg
      viewBox="0 0 44 44"
      className="h-10 w-10 shrink-0 drop-shadow-sm"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tym-brand-gradient" x1="5" y1="4" x2="40" y2="41">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#5b3fe8" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="14" fill="url(#tym-brand-gradient)" />
      <circle cx="13.5" cy="13.5" r="3.5" fill="white" />
      <circle cx="30.5" cy="13.5" r="3.5" fill="white" fillOpacity="0.86" />
      <path
        d="M8.5 31.5c.8-6 4.4-9 10.7-9h5.6c6.3 0 9.9 3 10.7 9"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="m17.5 20 4.5 4.5 4.5-4.5"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>

    <span>
      <span
        className={`block text-[17px] font-black leading-5 tracking-[-0.025em] ${
          inverted ? "text-white" : "text-slate-950"
        }`}
      >
        TryYourMentor
      </span>
      {showTagline && (
        <span
          className={`mt-0.5 hidden text-[10px] font-bold uppercase tracking-[0.12em] sm:block ${
            inverted ? "text-blue-100" : "text-slate-400"
          }`}
        >
          Practical mentorship
        </span>
      )}
    </span>
  </span>
);
