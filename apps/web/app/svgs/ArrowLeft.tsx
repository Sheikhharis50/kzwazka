import React from 'react';

export const Arrow = ({ className }: { className?: string }) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 14 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.50426 12L0.776989 6.27273L6.50426 0.545455L7.48864 1.51705L3.43608 5.5696H13.9318V6.97585H3.43608L7.48864 11.0156L6.50426 12Z"
        fill="currentColor"
      />
    </svg>
  );
};
