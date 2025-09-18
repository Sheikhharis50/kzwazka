'use client';
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Heading from '@/components/Heading';
import Button from '@/components/Button';
import Paragraph from '@/components/Paragraph';
import { months } from 'constants/weekdays';
import { Previous, Calendar as CalendarIcon } from 'svgs';
import { useCalendarApi } from '@/hooks/useCalendar';
import { useEvent } from '@/hooks/useEvent';
import Modal from '@/components/ui/Modal';
import AddEventForm from '@/components/dashboard/calendar/add-event';

const Calendar = () => {
  const [isModalVisible, setModalVisibility] = React.useState(false);
  const [currentDate, setCurrentDate] = React.useState<{
    month?: string;
    year?: number;
  } | null>(null);

  const calendarRef = React.useRef<FullCalendar | null>(null);
  const dateInputRef = React.useRef<HTMLInputElement | null>(null);
  const { withApi } = useCalendarApi(calendarRef);
  const {
    getAllEvents: { data },
  } = useEvent();
  const events = data?.data?.length
    ? data.data.map((event) => ({
        id: event.id.toString(),
        title: event.title,
        date: event.event_date,
      }))
    : [];

  console.log(events, data);

  const updateCurrentDate = () => {
    withApi((api) => {
      const currentCalendarDate = api.getDate();
      const currentMonth = currentCalendarDate.getMonth();
      const currentYear = currentCalendarDate.getFullYear();
      setCurrentDate({ month: months[currentMonth], year: currentYear });
    });
  };

  const handlePrevious = () => {
    withApi((api) => {
      api.prev();
      updateCurrentDate();
    });
  };

  const handleNext = () => {
    withApi((api) => {
      api.next();
      updateCurrentDate();
    });
  };

  const goToDate = (date: string) => {
    withApi((api) => {
      api.gotoDate(new Date(date));
    });
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      updateCurrentDate();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <div className="flex items-center gap-1">
              <button onClick={handlePrevious}>
                <Previous />
              </button>
              <Paragraph text={`${currentDate?.month}-${currentDate?.year}`} />
              <button onClick={handleNext}>
                <Previous className="-scale-x-100" />
              </button>
            </div>
            <div className="relative size-6 md:size-7 md:mb-1">
              <input
                ref={dateInputRef}
                type="date"
                className="absolute size-full left-0 top-0 opacity-0"
                onChange={(e) => goToDate(e.target.value)}
              />
              <button
                className="relative"
                onClick={() => dateInputRef?.current?.showPicker()}
              >
                <CalendarIcon className="w-6 md:w-7 h-auto" />
              </button>
            </div>
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
            dayHeaderClassNames={'bg-blue !border-0 text-white !text-end !pr-5'}
            events={events}
            datesSet={() => {
              updateCurrentDate();
            }}
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
        <AddEventForm />
      </Modal>
    </>
  );
};

export default Calendar;
