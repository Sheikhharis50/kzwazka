import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  text: string;
  required?: boolean;
}

const Label = ({
  className = '',
  text,
  required = false,
  ...rest
}: LabelProps) => {
  return (
    <label
      className={className + ' text-[10px] md:text-xs xl:text-sm'}
      {...rest}
    >
      {required ? (
        <>
          {text}
          <span className="text-red">*</span>
        </>
      ) : (
        text
      )}
    </label>
  );
};

export default Label;
