import React from 'react';
import Loader from './Loader';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  text: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = ({
  text,
  className = '',
  isLoading = false,
  icon,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={`bg-red rounded-full py-2 px-5 text-white block text-xs md:text-sm lg:text-base 2xl:text-lg h-fit ${className} ${icon ? 'flex items-center gap-2 justify-center' : ''}`}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? (
        <Loader />
      ) : icon ? (
        <>
          {icon} {text}
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default Button;
