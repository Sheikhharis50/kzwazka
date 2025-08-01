import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  text: string;
}

const Label = ({ className = '', text, ...rest }: LabelProps) => {
  return (
    <label
      className={className + ' text-[10px] md:text-xs xl:text-sm'}
      {...rest}
    >
      {text}
    </label>
  );
};

export default Label;
