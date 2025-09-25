import React, { useRef } from 'react';
import { Calendar } from 'svgs';

const DatePicker = ({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative size-6 md:size-7">
      <input
        ref={dateInputRef}
        type="date"
        className="absolute size-full left-0 top-0 opacity-0"
        {...props}
      />
      <button
        className="relative"
        onClick={() => dateInputRef?.current?.showPicker()}
      >
        <Calendar className="w-6 md:w-7 h-auto" />
      </button>
    </div>
  );
};

export default DatePicker;
