import { SvgProp } from 'types';
import React from 'react';

export const Check = ({ className = '' }: SvgProp) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="15"
      viewBox="0 0 16 15"
      fill="none"
      className={className}
    >
      <path
        d="M13.4821 7.93048C13.0289 10.1963 11.3205 12.3298 8.92326 12.8065C7.75409 13.0394 6.54126 12.8974 5.45746 12.4008C4.37367 11.9043 3.47416 11.0785 2.88702 10.0409C2.29988 9.00343 2.05503 7.80712 2.18735 6.62236C2.31966 5.43759 2.8224 4.32477 3.62396 3.44235C5.26804 1.63151 8.04412 1.13303 10.3099 2.03936"
        stroke="#319F43"
        strokeWidth="0.906328"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.77734 7.02424L8.04316 9.29006L13.4811 3.39893"
        stroke="#319F43"
        strokeWidth="0.906328"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
