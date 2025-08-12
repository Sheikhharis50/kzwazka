import React from 'react';

const Loader = ({ black = false }: { black?: boolean }) => {
  return (
    <div
      className={`size-5 lg:size-6 border-[3px] ${black ? 'border-gray-500 border-t-black' : 'border-gray-300 border-t-white'} rounded-full block mx-auto animate-spin`}
    />
  );
};

export default Loader;
