import Button from '@/components/Button';
import GroupCard from '@/components/dashboard/group/Card';
import Heading from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import { IGroup } from 'api/type';
import React from 'react';

const Groups = () => {
  return (
    <div className="px-3 md:px-5">
      <div className="flex flex-col xs:flex-row justify-between my-5 gap-3 xs:gap-5">
        <div>
          <Heading small text="Groups" />
          <Paragraph text="Select group to count attendance of specific class/team/group." />
        </div>
        <Button
          text="Create New Group"
          className="xl:py-3 xl:px-8 w-fit whitespace-nowrap"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-3 2xl:gap-5 min-[1700px]:gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <GroupCard key={index} group={{} as IGroup} />
        ))}
      </div>
    </div>
  );
};

export default Groups;
