import React from 'react';

interface HeadingProps {
  className?: string;
  text: string;
  small?: boolean;
}

const Heading = ({ text, className = '', small = false }: HeadingProps) => {
  return (
    <h2
      className={`${small ? 'text-xl md:text-2xl xl:text-3xl' : 'text-2xl md:text-3xl xl:text-4xl'} ${className}`}
    >
      {text}
    </h2>
  );
};

export default Heading;
