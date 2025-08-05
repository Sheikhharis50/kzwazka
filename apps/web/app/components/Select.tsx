import React, { useId } from 'react';
import Label from './Label';
import { Option } from 'app/types';

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
}

const Select = ({
  label,
  labelProps,
  error,
  classes = {},
  id,
  placeholder,
  options,
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
          {...labelProps}
        />
      )}
      <select
        id={inputId}
        className={`py-2 md:py-2.5 ps-2 pe-3 rounded-lg border border-border w-full text-sm md:text-base placeholder:text-sm ${classes.input}`}
        defaultValue={''}
        {...rest}
      >
        <option value={''} disabled className="text-mute!">
          {placeholder || 'Select option'}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
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
