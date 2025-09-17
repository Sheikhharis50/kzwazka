'use client';
import React, { forwardRef, useId } from 'react';
import Label from './Label';
import EyeIcon from '@/icons/eye.svg';
import EyeSlashIcon from '@/icons/eye-slash.svg';
import Image from 'next/image';

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
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelProps,
      error,
      classes = {},
      id,
      type,
      icon = undefined,
      required,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const generatedId = useId();
    const inputId = id || generatedId;
    const isPasswordType = type === 'password';

    const handleTogglePassword = () => {
      setShowPassword((prev) => !prev);
    };

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
        <div className="relative">
          <input
            ref={ref}
            type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
            id={inputId}
            className={`py-1.5 md:py-2 ${isPasswordType ? 'ps-3 pe-8' : icon ? 'pl-8 pr-3' : 'px-3'} rounded-lg border border-border w-full text-sm md:text-base placeholder:text-sm !outline-none ${classes.input}`}
            {...rest}
          />
          {icon && (
            <div className="absolute top-1/2 -translate-y-1/2 left-3">
              {icon}
            </div>
          )}
          {isPasswordType && (
            <Image
              src={showPassword ? EyeSlashIcon : EyeIcon}
              alt="toggle password visibility"
              height={50}
              width={50}
              className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-auto cursor-pointer bg-white"
              onClick={handleTogglePassword}
            />
          )}
        </div>
        {error && (
          <span
            className={`text-[10px] md:text-xs xl:text-sm text-red ${classes.error}`}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
