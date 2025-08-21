import React from 'react';

interface TitleProps {
  className?: string;
  children: string | React.ReactNode;
}

const Title = ({ className = '', children }: TitleProps) => {
  return (
    <h1
      className={`text-3xl sm:text-4xl lg:text-[40px] min-[1200px]:text-5xl xl:text-[54px] 2xl:text-6xl leading-10 sm:leading-12 lg:leading-14 min-[1200px]:leading-16 xl:leading-[70px] 2xl:leading-20 ${className}`}
    >
      {children}
    </h1>
  );
};

export default Title;
