'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import React from 'react';
import * as api from 'api';
import Heading from 'components/ui/Heading';
import Paragraph from 'components/ui/Paragraph';
import { formatDate } from '@fullcalendar/core/index.js';
import { formatTo12Hour } from 'utils/formatDate';
import SessionsAccordion from 'components/ui/SessionsAccordion';
import { safeJoin } from 'utils/safeJoin';
import AttendanceTable from 'components/dashboard/attendance/Table';
import { useInfiniteAttendance } from 'hooks/useInfiniteAttendance';
import Button from 'components/ui/Button';
import { useAttendance } from 'hooks/useAttendance';
import Loader from 'components/ui/Loader';

const EventDetail = () => {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const date = searchParams.get('date');

  const { data, isLoading: eventsLoading } = useQuery({
    queryKey: ['event', params.id],
    queryFn: async () => await api.event.getOne(params.id),
    staleTime: 10 * 60 * 1000,
  });

  const {
    data: attendance,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteAttendance({
    date: date || '',
    group_id: data?.data?.group_id?.toString() || undefined,
  });

  const { markAttendanceMutation } = useAttendance({ date: '' });

  if (eventsLoading)
    return (
      <div className="size-full flex justify-center items-center text-center">
        <Loader black />
      </div>
    );

  if (!data?.data)
    return (
      <div className="size-full flex justify-center items-center text-center">
        <Paragraph text="No record found." />
      </div>
    );

  const attendanceData = attendance?.pages.flatMap((page) => page.data);

  const event = data.data;
  const eventInfo = [
    {
      label: 'Event Name',
      value: event.title,
    },
    {
      label: 'Date',
      value: formatDate(event.start_date, { dateStyle: 'long' }),
    },
    {
      label: 'Time',
      value:
        event.event_type === 'one_time' ? (
          `${formatTo12Hour(event.opening_time || '')}-${formatTo12Hour(event.closing_time || '')}`
        ) : (
          <SessionsAccordion sessions={event.group.sessions} />
        ),
    },
    {
      label: 'Location',
      value: safeJoin([
        event.location.address1,
        event.location.address2,
        event.location.city,
      ]),
    },
    {
      label: 'Age Group',
      value: `${event.group.min_age} - ${event.group.max_age} years`,
    },
    {
      label: 'Coach in Charge',
      value: safeJoin([event.coach_first_name, event.coach_last_name], ' '),
    },
    {
      label: 'Event Type',
      value: event.event_type === 'training' ? 'Training' : 'One Time',
    },
    {
      label: 'Description',
      value: event.description || 'N/A',
    },
  ];

  return (
    <div className="py-5 px-3 md:px-5">
      <Heading text="Event Detail" className="mb-5 md:mb-8" />
      <div className="grid xl:grid-cols-2 gap-5">
        <div className="rounded-xl bg-smoke p-5 space-y-2 md:space-y-4">
          {eventInfo.map((info) => (
            <div
              key={info.label}
              className="grid grid-cols-2 gap-3 text-xs md:text-sm xl:text-base 2xl:text-lg text-mute"
            >
              <Paragraph text={info.label} className="font-medium text-black" />
              {typeof info.value === 'string' ? (
                <Paragraph text={info.value} mute />
              ) : (
                info.value
              )}
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-smoke py-5">
          <Heading
            small
            text="Participant List Preview"
            className="px-5 pb-2"
          />
          <div className="px-5 max-h-[72vh] w-[92vw] xs:w-full overflow-auto">
            <AttendanceTable
              data={attendanceData}
              isLoading={isLoading}
              event
              handleStatusChange={({ childId, status, onError, onSuccess }) =>
                markAttendanceMutation.mutateAsync(
                  {
                    children_id: childId,
                    date: date || '',
                    status,
                  },
                  { onSuccess, onError }
                )
              }
            />
            {hasNextPage && (
              <Button
                isLoading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                text="Load More"
                className="mx-auto mt-3"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
