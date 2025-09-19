import { SvgProp } from 'types';
import React from 'react';

export const Hamburger = ({ className }: SvgProp) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="31"
      height="28"
      viewBox="0 0 31 28"
      fill="none"
      className={className}
    >
      <path
        d="M0.722656 0.661377H30.1979"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M0.722656 13.7146H30.1979"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M0.722656 26.7678H30.1979"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};
