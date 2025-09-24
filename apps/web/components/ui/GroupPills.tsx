'use client';
import React from 'react';
import Loader from 'components/ui/Loader';
import Paragraph from 'components/ui/Paragraph';
import { useGroup } from 'hooks/useGroup';
import { Previous } from 'svgs';
import { useRouter, useSearchParams } from 'next/navigation';
import { scrollIntoView } from 'utils/scrollIntoView';
import Button from 'components/ui/Button';
import { useQueryString } from 'hooks/useQueryString';

interface GroupPillsProps {
  all?: boolean;
  onClick?: () => void;
}

const GroupPills = ({ all = false, onClick }: GroupPillsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id');
  const { createQueryString, removeSearchParam } = useQueryString();

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
  return (
    <div className="flex gap-2 overflow-x-auto items-center scrollbar-hidden">
      {isLoading || isRefetching ? (
        <Loader black className="!m-0" />
      ) : !groups?.length ? (
        <Paragraph text="No group available" />
      ) : (
        <>
          {all && (
            <Button
              text="All"
              className={`px-10 2xl:!text-base ${!groupId ? '' : '!bg-red/20 !text-black'}`}
              id="group-filter-all"
              onClick={() => {
                removeSearchParam('group_id');
                scrollIntoView(`group-filter-all`);
                if (onClick) onClick();
              }}
            />
          )}
          {groups.map((group) => (
            <Button
              id={`group-filter-${group.id}`}
              text={group.name}
              key={group.id}
              className={`text-nowrap 2xl:!text-base ${groupId === group.id.toString() ? '' : '!bg-red/20 !text-black'}`}
              onClick={() => {
                router.push(
                  `?${createQueryString('group_id', group.id.toString())}`
                );
                scrollIntoView(`group-filter-${group.id}`);
                if (onClick) onClick();
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
  );
};

export default GroupPills;
