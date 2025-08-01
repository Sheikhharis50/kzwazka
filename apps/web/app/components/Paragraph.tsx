import React from 'react';

interface ParagraphProps {
  className?: string;
  mute?: boolean;
  text: string;
}

const Paragraph = ({ text, className = '', mute = false }: ParagraphProps) => {
  return (
    <p
      className={`text-xs md:text-sm xl:text-base ${mute ? 'text-mute' : ''} ${className}`}
    >
      {text}
    </p>
  );
};

export default Paragraph;
