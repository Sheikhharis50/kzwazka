import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  text: string;
}

const Button = ({ text, className = '', ...rest }: ButtonProps) => {
  return (
    <button
      className={`bg-red rounded-full py-2 px-5 text-white block text-xs md:text-sm lg:text-base ${className}`}
      {...rest}
    >
      {text}
    </button>
  );
};

export default Button;
