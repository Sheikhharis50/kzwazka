import React from 'react';
import Button, { ButtonProps } from '@/components/Button';

const HomeButton = ({
  text,
  className = '',
  isLoading,
  icon,
  ...rest
}: ButtonProps) => {
  return (
    <Button
      text={text}
      className={`!rounded-lg ${className}`}
      isLoading={isLoading || false}
      icon={icon || undefined}
      {...rest}
    />
  );
};

export default HomeButton;
