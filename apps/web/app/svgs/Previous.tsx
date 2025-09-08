import { SvgProp } from '@/types';
import React from 'react';

export const Previous = ({ className = '' }: SvgProp) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="31"
      viewBox="0 0 15 31"
      fill="none"
      className={className}
    >
      <path
        d="M11.8815 22.3741L10.5618 23.6926L3.37345 16.5067C3.25758 16.3916 3.16562 16.2547 3.10287 16.1039C3.04012 15.953 3.00781 15.7913 3.00781 15.6279C3.00781 15.4646 3.04012 15.3029 3.10287 15.152C3.16562 15.0012 3.25758 14.8643 3.37345 14.7492L10.5618 7.55957L11.8803 8.87808L5.13353 15.6261L11.8815 22.3741Z"
        fill="currentColor"
      />
    </svg>
  );
};
