import React from 'react';
import { SvgProp } from 'types';

export const Send = ({ className = '' }: SvgProp) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="41"
      height="35"
      viewBox="0 0 41 35"
      fill="none"
      className={className}
    >
      <path
        d="M0 34.3636V20.7398L15.3513 17.1818L0 13.6239V0L40.5 17.1818L0 34.3636Z"
        fill="currentColor"
      />
    </svg>
  );
};
