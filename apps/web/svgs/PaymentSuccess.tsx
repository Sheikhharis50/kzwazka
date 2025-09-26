import React from 'react';
import { SvgProp } from 'types';

export const PaymentSuccess = ({ className = '' }: SvgProp) => {
  return (
    <svg
      width="117"
      height="142"
      viewBox="0 0 117 142"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="58.5" cy="58.5" r="58.5" fill="#D9D9D9" fillOpacity="0.3" />
      <g filter="url(#filter0_d_1_6)">
        <circle cx="59" cy="59" r="39" fill="#319F43" />
      </g>
      <path
        d="M78.0771 41.208L77.209 42.3389C77.9357 42.8974 78.4113 43.7212 78.5312 44.6299C78.6511 45.538 78.4068 46.4568 77.8506 47.1846L57.2676 74.0273C56.9437 74.4482 56.5266 74.7886 56.0498 75.0225C55.6327 75.227 55.1794 75.3457 54.7168 75.3711L54.5176 75.376H54.5107C53.7685 75.3774 53.0451 75.1376 52.4512 74.6924H52.4521L52.3984 74.6523L40.9775 65.9082C40.6175 65.6323 40.315 65.2882 40.0879 64.8955C39.8608 64.5028 39.7139 64.0688 39.6543 63.6191C39.5948 63.1693 39.6241 62.7118 39.7412 62.2734C39.8583 61.835 40.0609 61.4237 40.3369 61.0635C40.6129 60.7034 40.9569 60.4009 41.3496 60.1738C41.7424 59.9467 42.1762 59.7988 42.626 59.7393C43.0758 59.6797 43.5333 59.71 43.9717 59.8271C44.3552 59.9297 44.718 60.097 45.0439 60.3223L45.1807 60.4219L52.5859 66.1006L53.875 67.0889L54.8633 65.7998L72.3633 42.9766C72.6394 42.6165 72.9841 42.3149 73.377 42.0879C73.7698 41.8609 74.2035 41.7127 74.6533 41.6533C75.1029 41.594 75.5599 41.624 75.998 41.7412C76.4363 41.8585 76.848 42.0609 77.208 42.3369L78.0742 41.2061L78.0771 41.208Z"
        fill="white"
        stroke="#319F43"
        strokeWidth="3.248"
      />
      <defs>
        <filter
          id="filter0_d_1_6"
          x="8"
          y="20"
          width="102"
          height="122"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="32" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1_6"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1_6"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
