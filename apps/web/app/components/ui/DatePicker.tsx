import React, { ChangeEvent, useRef } from 'react';
import { Calendar } from '@/svgs';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const DatePicker = ({ onChange, ...rest }: DatePickerProps) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative size-6 md:size-7">
      <input
        ref={dateInputRef}
        type="date"
        className="absolute size-full left-0 top-0 opacity-0"
        onChange={onChange}
        {...rest}
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
