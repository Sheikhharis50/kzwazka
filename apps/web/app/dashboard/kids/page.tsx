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
import { useQuery } from '@tanstack/react-query';
import * as api from 'api';
import { useDebounce } from 'use-debounce';

const Kids = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 1000);

  const { data, isLoading } = useQuery({
    queryKey: ['kidsTableData', debouncedSearch, sortBy],
    queryFn: async () => {
      const res = await api.children.getAll({
        search: debouncedSearch,
        sort_by: sortBy,
      });
      return res.data;
    },
  });

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            options={sortByOptions}
            classes={{
              input: '!bg-smoke !rounded-full',
              root: 'min-w-[100px] xs:min-w-auto',
            }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            placeholder="Sort by"
          />
          <Button
            text="Add Kid"
            className="!font-light !px-10 py-2.5 2xl:py-2 hidden sm:block"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>
      <KidsTable data={data} isLoading={isLoading} />
      <AddKidModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Kids;
