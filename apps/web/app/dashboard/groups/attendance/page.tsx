'use client';
import Button from 'components/ui/Button';
import AttendanceTable from 'components/dashboard/attendance/Table';
import Heading from 'components/ui/Heading';
import Loader from 'components/ui/Loader';
import Paragraph from 'components/ui/Paragraph';
import DatePicker from 'components/ui/DatePicker';
import Navigator from 'components/ui/Navigator';
import Pagination from 'components/ui/Pagination';
import { useAttendance } from 'hooks/useAttendance';
import { useGroup } from 'hooks/useGroup';
import { DoubleTick, Previous } from 'svgs';
import { formatDate } from '@fullcalendar/core/index.js';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { scrollIntoView } from 'utils/scrollIntoView';

const Attendance = () => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id');
  const page = searchParams.get('page');
  const router = useRouter();

  const {
    getInfiniteGroups: {
      data,
      isLoading,
      isRefetching,
      hasNextPage,
      fetchNextPage,
      isFetchingNextPage,
    },
  } = useGroup();

  const groups = data?.pages?.flatMap((page) => page?.data);

  const {
    getAttendance: { data: attendanceData, isLoading: isAttendanceLoading },
    markAttendanceMutation,
    markAllPresentMutation,
  } = useAttendance({
    date,
    group_id: groupId || undefined,
    page: parseInt(page || '') || undefined,
  });

  const removeTimestamp = (date: Date) => date.toISOString().split('T')[0];

  const changeDate = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(removeTimestamp(d) || '');
  };

  const markAllPresent = () => {
    if (!groupId) {
      toast('Please select a group to mark all as present', {
        type: 'warning',
      });
      return;
    }
    markAllPresentMutation.mutateAsync({ date, group_id: parseInt(groupId) });
  };

  return (
    <>
      <div className="px-3 md:px-5 my-5 md:my-8 space-y-3 md:space-y-5">
        <div className="flex justify-between items-center">
          <Heading text="Mark Attendance" small />
          <div className="flex gap-2 md:gap-3 items-center">
            <Navigator
              handleNext={() => changeDate(1)}
              handlePrevious={() => changeDate(-1)}
              text={formatDate(date, { dateStyle: 'medium' })}
            />
            <DatePicker
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-3 md:gap-0 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto items-center scrollbar-hidden">
            {isLoading || isRefetching ? (
              <Loader black className="!m-0" />
            ) : !groups?.length ? (
              <Paragraph text="No group available" />
            ) : (
              <>
                {groups.map((group) => (
                  <Button
                    id={`attendance-group-filter-${group.id}`}
                    text={group.name}
                    key={group.id}
                    className={`text-nowrap ${groupId === group.id.toString() ? '' : '!bg-red/20 !text-black'}`}
                    onClick={() => {
                      router.push(
                        `/dashboard/groups/attendance?group_id=${group.id}`
                      );
                      scrollIntoView(`attendance-group-filter-${group.id}`);
                    }}
                  />
                ))}
                {isFetchingNextPage ? (
                  <Loader black className="!m-0" />
                ) : hasNextPage ? (
                  <button onClick={() => fetchNextPage()}>
                    <Previous className="-scale-x-100" />
                  </button>
                ) : null}
              </>
            )}
          </div>
          <div className="flex gap-3 items-center justify-end w-full ps-2 xl:ps-5">
            {/* <button className="text-xs md:text-sm lg:text-base 2xl:text-lg">
              Clear All
            </button> */}
            <Button
              disabled={markAllPresentMutation.isPending}
              text="Mark All Present"
              className="!bg-blue min-w-[150px]"
              icon={<DoubleTick />}
              onClick={markAllPresent}
            />
            {/* <Button text="Add Kid" /> */}
          </div>
        </div>
      </div>
      <AttendanceTable
        data={attendanceData?.data}
        isLoading={isAttendanceLoading}
        handleStatusChange={({
          childId,
          groupId,
          status,
          onError,
          onSuccess,
        }) =>
          markAttendanceMutation.mutateAsync(
            {
              children_id: childId,
              group_id: groupId,
              date,
              status,
            },
            { onSuccess, onError }
          )
        }
      />
      <Pagination pageCount={attendanceData?.pagination.totalPages || 0} />
    </>
  );
};

export default Attendance;
