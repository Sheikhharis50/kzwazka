import React from 'react';
import Loader from './Loader';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  text: string;
  isLoading?: boolean;
}

const Button = ({
  text,
  className = '',
  isLoading = false,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={`bg-red rounded-full py-2 px-5 text-white block text-xs md:text-sm lg:text-base ${className}`}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? <Loader /> : text}
    </button>
  );
};

export default Button;
