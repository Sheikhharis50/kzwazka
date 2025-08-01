import React from 'react';

interface HeadingProps {
  className?: string;
  text: string;
}

const Heading = ({ text, className = '' }: HeadingProps) => {
  return (
    <h2 className={`text-2xl md:text-3xl xl:text-4xl ${className}`}>{text}</h2>
  );
};

export default Heading;
