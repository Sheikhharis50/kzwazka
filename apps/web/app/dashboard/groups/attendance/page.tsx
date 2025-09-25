'use client';
import Button from 'components/ui/Button';
import AttendanceTable from 'components/dashboard/attendance/Table';
import Heading from 'components/ui/Heading';
import Pagination from 'components/ui/Pagination';
import { useAttendance } from 'hooks/useAttendance';
import { DoubleTick } from 'svgs';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import GroupPills from 'components/ui/GroupPills';
import DateNavigator from 'components/ui/DateNavigator';

const Attendance = () => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id');
  const page = searchParams.get('page');

  const {
    getAttendance: { data: attendanceData, isLoading: isAttendanceLoading },
    markAttendanceMutation,
    markAllPresentMutation,
  } = useAttendance({
    date,
    group_id: groupId || undefined,
    page: parseInt(page || '') || undefined,
  });

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
            <DateNavigator date={date} setDate={setDate} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-3 md:gap-0 justify-between items-center">
          <GroupPills />
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
        handleStatusChange={({ childId, status, onError, onSuccess }) =>
          markAttendanceMutation.mutateAsync(
            {
              children_id: childId,
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
