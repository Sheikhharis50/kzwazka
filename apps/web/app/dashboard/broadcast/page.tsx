'use client';
import ChildrenIcons from 'components/dashboard/broadcast/ChildrenIcons';
import GroupPills from 'components/ui/GroupPills';
import Heading from 'components/ui/Heading';
import { useChildren } from 'hooks/useChildren';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import SendMessage from 'components/dashboard/broadcast/SendMessage';
import Messages from 'components/dashboard/broadcast/Messages';

const Broadcast = () => {
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id');

  const {
    getAllChildren: { data, isLoading },
  } = useChildren({ group_id: groupId || undefined });

  return (
    <div className="flex flex-col h-full">
      <div className="my-5 space-y-3 md:space-y-4 px-3 md:px-5">
        <div className="flex justify-between items-center">
          <Heading text="Broadcast" small />
          <ChildrenIcons
            data={data?.data || []}
            isLoading={isLoading}
            count={data?.pagination.count || 0}
          />
        </div>
        <GroupPills all />
      </div>
      <hr className="border-border" />
      <Messages />
      <SendMessage />
    </div>
  );
};

export default Broadcast;
