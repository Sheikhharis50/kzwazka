import { Previous } from '@/svgs';
import React from 'react';
import Paragraph from '../Paragraph';

interface NavigatorProps {
  handlePrevious: () => void;
  handleNext: () => void;
  text: string;
}

const Navigator = ({ handleNext, handlePrevious, text }: NavigatorProps) => {
  return (
    <div className="flex items-center gap-1">
      <button onClick={handlePrevious}>
        <Previous />
      </button>
      <Paragraph text={text} />
      <button onClick={handleNext}>
        <Previous className="-scale-x-100" />
      </button>
    </div>
  );
};

export default Navigator;
