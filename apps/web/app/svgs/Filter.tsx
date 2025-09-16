import { SvgProp } from '@/types';
import React from 'react';

export const Filter = ({ className = '' }: SvgProp) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      className={className}
    >
      <path
        d="M5.39844 2.83594H18.5984C19.6984 2.83594 20.5984 3.73594 20.5984 4.83594V7.03594C20.5984 7.83594 20.0984 8.83594 19.5984 9.33594L15.2984 13.1359C14.6984 13.6359 14.2984 14.6359 14.2984 15.4359V19.7359C14.2984 20.3359 13.8984 21.1359 13.3984 21.4359L11.9984 22.3359C10.6984 23.1359 8.89844 22.2359 8.89844 20.6359V15.3359C8.89844 14.6359 8.49844 13.7359 8.09844 13.2359L4.29844 9.23594C3.79844 8.73594 3.39844 7.83594 3.39844 7.23594V4.93594C3.39844 3.73594 4.29844 2.83594 5.39844 2.83594Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.93 2.83594L6 10.7359"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
