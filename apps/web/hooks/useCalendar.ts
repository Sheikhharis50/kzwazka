import { CalendarApi } from '@fullcalendar/core/index.js';
import FullCalendar from '@fullcalendar/react';
import React from 'react';

export const useCalendarApi = (
  calendarRef: React.RefObject<FullCalendar | null>
) => {
  const getApi = React.useCallback(
    () => calendarRef?.current?.getApi(),
    [calendarRef]
  );

  const withApi = React.useCallback(
    (callback: (api: CalendarApi) => void) => {
      const api = getApi();
      if (api) callback(api);
    },
    [getApi]
  );

  return { getApi, withApi };
};
