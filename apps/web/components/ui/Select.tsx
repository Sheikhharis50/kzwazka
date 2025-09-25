import React, { useId } from 'react';
import Label from './Label';
import { Option } from 'types';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  error?: string;
  classes?: {
    label?: string;
    input?: string;
    error?: string;
    root?: string;
  };
  placeholder?: string;
  options: Option[];
  numberValue?: boolean;
  required?: boolean;
}

const Select = ({
  label,
  labelProps,
  error,
  classes = {},
  id,
  placeholder,
  options,
  numberValue = false,
  required = false,
  ...rest
}: SelectProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`flex flex-col gap-1 ${classes.root || ''}`}>
      {label && (
        <Label
          htmlFor={inputId}
          text={label}
          className={classes.label || ''}
          required={required}
          {...labelProps}
        />
      )}
      <select
        id={inputId}
        className={`py-[7px] md:py-[9px] ps-2 pe-3 rounded-lg border border-border w-full text-sm md:text-base placeholder:text-sm ${classes.input}`}
        {...rest}
      >
        <option value={numberValue ? 0 : ''} disabled className="text-mute!">
          {placeholder || 'Select option'}
        </option>
        {options.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

export default Select;
