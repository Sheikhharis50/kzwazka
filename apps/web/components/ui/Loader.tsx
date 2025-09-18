import React from 'react';

interface LoaderProps {
  black?: boolean;
  className?: string;
}

const Loader = ({ black = false, className = '' }: LoaderProps) => {
  return (
    <div
      className={`size-5 lg:size-6 border-[3px] ${black ? 'border-gray-500 border-t-black' : 'border-gray-300 border-t-white'} rounded-full block mx-auto animate-spin ${className}`}
    />
  );
};

export default Loader;
