'use client';
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Heading from 'components/ui/Heading';
import Button from 'components/ui/Button';
import { daysArray, months } from 'constants/weekdays';
import { useCalendarApi } from 'hooks/useCalendar';
import { useEvent } from 'hooks/useEvent';
import Modal from 'components/ui/Modal';
import AddEventForm from 'components/dashboard/calendar/add-event';
import DateNavigator from 'components/ui/DateNavigator';
import { useRouter } from 'next/navigation';
import { EventType } from 'api/type';
import { useQueryString } from 'hooks/useQueryString';
import { removeTimestamp } from 'utils/formatDate';

const Calendar = () => {
  const [isModalVisible, setModalVisibility] = React.useState(false);
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const calendarRef = React.useRef<FullCalendar | null>(null);
  const router = useRouter();

  const { createQueryString } = useQueryString();
  const { withApi } = useCalendarApi(calendarRef);
  const {
    getAllEvents: { data: oneTimeEventsData },
  } = useEvent({ date, event_type: EventType.ONE_TIME });
  const {
    getAllEvents: { data: trainingEventsData },
  } = useEvent({ event_type: EventType.TRAINING });

  const oneTimeEvents =
    oneTimeEventsData?.data?.map((event) => ({
      id: event.id.toString(),
      title: event.title,
      date: event.start_date,
      start: event.opening_time || undefined,
      end: event.closing_time || undefined,
    })) || [];

  const trainingEvents =
    trainingEventsData?.data?.flatMap((event) =>
      event.group.sessions.map((session) => ({
        id: event.id.toString(),
        title: event.title,
        startRecur: event.start_date,
        groupId: event.group_id.toString(),
        daysOfWeek: [daysArray.indexOf(session.day.toLocaleLowerCase())],
        startTime: session.start_time,
        endTime: session.end_time,
      }))
    ) || [];

  const events = [...oneTimeEvents, ...trainingEvents];

  React.useEffect(() => {
    withApi((api) => {
      api.gotoDate(new Date(date));
    });
  }, [date, withApi]);

  return (
    <>
      <div className="h-full flex flex-col gap-5 md:gap-10 px-3 md:px-5 pt-5">
        <div className="flex justify-between items-center">
          <Heading text="Calendar" small />
          <div className="flex items-center gap-3 md:gap-5">
            <Button
              text="Add Event"
              className="hidden sm:block"
              onClick={() => setModalVisibility(true)}
            />
            <DateNavigator
              date={date}
              setDate={setDate}
              navigatorText={`${months[new Date(date).getMonth()]}-${new Date(date).getFullYear()}`}
              monthly
            />
          </div>
        </div>
        <div className="rounded-t-2xl overflow-hidden flex-1 sm:pb-5 lg:pb-0">
          <FullCalendar
            ref={calendarRef}
            height={'100%'}
            plugins={[dayGridPlugin, interactionPlugin]}
            dateClick={undefined}
            initialView="dayGridMonth"
            headerToolbar={false}
            dayHeaderClassNames={
              'bg-blue !border-0 !text-white !text-end !pr-5'
            }
            events={events}
            eventClassNames={
              'cursor-pointer !bg-blue text-white hover:!bg-blue/90'
            }
            displayEventTime={true}
            eventClick={(data) =>
              router.push(
                `/dashboard/calendar/event/${data.event.id}?${createQueryString('date', removeTimestamp(data.event.start!) || '')}`
              )
            }
          />
        </div>
        <Button
          text="Add Event"
          className="sm:hidden mb-5 w-fit mx-auto"
          onClick={() => setModalVisibility(true)}
        />
      </div>
      <Modal
        isOpen={isModalVisible}
        onClose={() => setModalVisibility(false)}
        size="md"
      >
        <AddEventForm closeModal={() => setModalVisibility(false)} />
      </Modal>
    </>
  );
};

export default Calendar;
