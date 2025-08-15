import { SvgProp } from '@/types';
import React from 'react';

export const Logout = ({ className }: SvgProp) => {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18.0957 15.2599L20.6557 12.6999L18.0957 10.1399"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.416 12.7H20.586"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.416 20.6399C7.99602 20.6399 4.41602 17.6399 4.41602 12.6399C4.41602 7.63989 7.99602 4.63989 12.416 4.63989"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
