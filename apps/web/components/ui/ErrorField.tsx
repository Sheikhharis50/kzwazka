import React from 'react';

const ErrorField = ({ text = '' }: { text?: string }) => {
  return (
    <span className={`text-[10px] md:text-xs xl:text-sm text-red `}>
      {text}
    </span>
  );
};

export default ErrorField;
