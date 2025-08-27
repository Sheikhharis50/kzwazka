'use client';
import React from 'react';
import Select from '@/components/Select';
import { sortByOptions } from '@/constants/kids';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import { Search } from '@/svgs/Search';
import Button from '@/components/Button';
import KidsTable from './Table';
import AddKidModal from './modal';

const Kids = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-5 mt-2 px-3 md:px-5">
        <div className="flex justify-between items-center sm:block">
          <Heading text="Kids" />
          <Button
            text="Add Kid"
            className="!font-light !px-10 py-2.5 2xl:py-2 sm:hidden"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        <div className="flex justify-end items-center gap-1.5 md:gap-3">
          <Input
            type="text"
            classes={{
              input: '!bg-smoke !rounded-full',
              root: 'w-full xs:w-auto',
            }}
            placeholder="Search"
            icon={<Search className="size-4" />}
          />
          <Select
            options={sortByOptions}
            classes={{
              input: '!bg-smoke !rounded-full',
              root: 'min-w-[100px] xs:min-w-auto',
            }}
            placeholder="Sort by"
          />
          <Button
            text="Add Kid"
            className="!font-light !px-10 py-2.5 2xl:py-2 hidden sm:block"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>
      <KidsTable />
      <AddKidModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Kids;
