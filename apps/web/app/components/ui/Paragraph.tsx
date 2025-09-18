import React from 'react';

interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  mute?: boolean;
  text: string;
}

const Paragraph = ({
  text,
  className = '',
  mute = false,
  ...rest
}: ParagraphProps) => {
  return (
    <p
      className={`text-xs md:text-sm xl:text-base 2xl:text-lg ${mute ? 'text-mute' : ''} ${className}`}
      {...rest}
    >
      {text}
    </p>
  );
};

export default Paragraph;
