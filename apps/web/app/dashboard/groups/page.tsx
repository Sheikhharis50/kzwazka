'use client';
import Button from '@/components/Button';
import CreateGroupForm from '@/components/dashboard/group/create-group';
import GroupCard from '@/components/dashboard/group/Card';
import Heading from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import Modal from '@/components/ui/Modal';
import React from 'react';
import { useGroup } from 'hooks/useGroup';
import ImageCardSkeleton from '@/components/ui/ImageCardSkeleton';

const Groups = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const {
    getInfiniteGroups: {
      data,
      isLoading,
      isRefetching,
      hasNextPage,
      fetchNextPage,
    },
  } = useGroup();

  return (
    <>
      <div className="px-3 md:px-5">
        <div className="flex flex-col xs:flex-row justify-between my-5 gap-3 xs:gap-5">
          <div>
            <Heading small text="Groups" />
            <Paragraph text="Select group to count attendance of specific class/team/group." />
          </div>
          <Button
            text="Create New Group"
            className="xl:py-3 xl:px-8 w-fit whitespace-nowrap"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-3 2xl:gap-5 min-[1700px]:gap-8">
          {isLoading || isRefetching
            ? Array.from({ length: 4 }).map((_, index) => (
                <ImageCardSkeleton key={index} />
              ))
            : data?.pages.length
              ? data.pages.flatMap((page) =>
                  page.data.map((group) => (
                    <GroupCard {...group} key={group.id} />
                  ))
                )
              : null}
        </div>
        {hasNextPage && (
          <Button
            text="Load More"
            className="mx-auto my-8"
            onClick={() => fetchNextPage()}
          />
        )}
      </div>
      <Modal
        size="lg"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <CreateGroupForm closeModal={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default Groups;
