import React from "react";

export function ShieldLogoSvg({ 
  className = "w-10 h-11",
  innerFill = "rgba(245, 158, 11, 0.12)"
}: { 
  className?: string;
  innerFill?: string;
}) {
  return (
    <svg 
      className={`drop-shadow-[0_0_16px_rgba(245,158,11,0.35)] transition-transform duration-300 ${className}`} 
      viewBox="0 0 100 115" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Golden Shield Contour */}
      <path 
        d="M50 6 L88 23 V58 C88 80 68 98 50 106 C32 98 12 80 12 58 V23 L50 6 Z" 
        stroke="url(#img3GoldGrad)" 
        strokeWidth="6" 
        fill={innerFill}
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Image 3 Stylized Interlocking Inner Shield Path */}
      <path 
        d="M50 20 L76 31 V54 C76 70 62 84 50 90 C38 84 24 70 24 54 V34 L50 23 L62 28 C62 28 42 36 38 42 V54 C38 64 45 74 50 77 C55 74 62 64 62 54 V44 H48" 
        stroke="url(#img3GoldGrad)" 
        strokeWidth="5" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <defs>
        <linearGradient id="img3GoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CmsHighlightBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[9px] tracking-[0.2em]",
    md: "px-2.5 py-0.5 text-[11px] md:text-[12px] tracking-[0.25em]",
    lg: "px-4 py-1 text-sm md:text-base tracking-[0.3em]",
  };

  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black uppercase shadow-[0_0_14px_rgba(245,158,11,0.65)] border border-amber-200/80 leading-none pl-1 ${sizeClasses[size]}`}>
      CMS
    </span>
  );
}
