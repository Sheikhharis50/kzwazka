import React from 'react';
import Navigator from './Navigator';
import DatePicker from './DatePicker';
import { formatDate } from '@fullcalendar/core/index.js';

interface DateNavigatorProps {
  date: string;
  setDate: (date: string) => void;
  navigatorText?: string;
  monthly?: boolean;
}

const DateNavigator = ({
  date,
  setDate,
  navigatorText = '',
  monthly = false,
}: DateNavigatorProps) => {
  const removeTimestamp = (date: Date) => date.toISOString().split('T')[0];

  const changeDate = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(removeTimestamp(d) || '');
  };

  return (
    <>
      <Navigator
        handleNext={() => changeDate(monthly ? 30 : 1)}
        handlePrevious={() => changeDate(monthly ? -30 : -1)}
        text={
          navigatorText
            ? navigatorText
            : formatDate(date, { dateStyle: 'medium' })
        }
      />
      <DatePicker value={date} onChange={(e) => setDate(e.target.value)} />
    </>
  );
};

export default DateNavigator;
