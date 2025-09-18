import React from 'react';

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

const Container = ({ className = '', children }: ContainerProps) => {
  return (
    <div
      className={`w-[95vw] lg:max-w-[90vw] 2xl:max-w-[1400px] mx-auto ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
