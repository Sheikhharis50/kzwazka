import React, { useId } from 'react';
import Label from './Label';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  error?: string;
  classes?: {
    label?: string;
    input?: string;
    error?: string;
    root?: string;
  };
}

const Input = ({
  label,
  labelProps,
  error,
  classes = {},
  id,
  ...rest
}: InputProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={'flex flex-col gap-1 ' + classes.root || ''}>
      {label && (
        <Label
          htmlFor={inputId}
          text={label}
          className={classes.label || ''}
          {...labelProps}
        />
      )}
      <input
        id={inputId}
        className={`py-1.5 md:py-2 px-3 rounded-lg border border-border w-full text-sm md:text-base placeholder:text-sm ${classes.input}`}
        {...rest}
      />
      {error && (
        <span
          className={`text-[10px] md:text-xs xl:text-sm text-red ${classes.error}`}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
