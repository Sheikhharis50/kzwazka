'use client';
import Button from '@/components/Button';
import AttendanceTable from '@/components/dashboard/attendance/Table';
import Heading from '@/components/Heading';
import Loader from '@/components/Loader';
import DatePicker from '@/components/ui/DatePicker';
import Navigator from '@/components/ui/Navigator';
import { useGroup } from '@/hooks/useGroup';
import { DoubleTick, Filter, Previous } from '@/svgs';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { scrollIntoView } from 'utils/scrollIntoView';

const Attendance = () => {
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id');
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
  } = useGroup({ limit: 2 });

  const groups = data?.pages?.flatMap((page) => page?.data);

  return (
    <>
      <div className="px-3 md:px-5 my-5 md:my-8 space-y-3 md:space-y-5">
        <div className="flex justify-between items-center">
          <Heading text="Mark Attendance" small />
          <div className="flex gap-2 md:gap-3 items-center">
            <Navigator
              handleNext={() => console.log('next')}
              handlePrevious={() => console.log('prev')}
              text="Today"
            />
            <DatePicker onChange={() => console.log('hello')} />
            {/* <Filter /> */}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-3 md:gap-0 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto items-center scrollbar-hidden">
            {isLoading || isRefetching ? (
              <Loader black className="!m-0" />
            ) : !groups?.length ? null : (
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
          <div className="flex gap-3 items-center justify-between md:justify-end w-full ps-2 xl:ps-5">
            <button className="text-xs md:text-sm lg:text-base 2xl:text-lg">
              Clear All
            </button>
            <Button
              text="Mark All Present"
              className="!bg-blue"
              icon={<DoubleTick />}
            />
            {/* <Button text="Add Kid" /> */}
          </div>
        </div>
      </div>
      <AttendanceTable />
    </>
  );
};

export default Attendance;
