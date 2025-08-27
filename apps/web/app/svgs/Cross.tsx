import { SvgProp } from '@/types';
import React from 'react';

export const Cross = ({ className = '' }: SvgProp) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M0.417969 1.27344L16.7114 17.5668M16.7114 1.27344L0.417969 17.5668"
        stroke="currentColor"
        strokeWidth="0.737443"
        strokeLinecap="round"
      />
    </svg>
  );
};
