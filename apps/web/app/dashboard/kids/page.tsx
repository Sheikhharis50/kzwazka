'use client';
import React from 'react';
import Select from '@/components/Select';
import { sortByOptions } from '@/constants/kids';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import { Search } from '@/svgs/Search';
import Button from '@/components/Button';
import KidsTable from './Table';
import AddKidForm from './modal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from 'api';
import { useDebounce } from 'use-debounce';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-toastify';

const Kids = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentModal, setCurrentModal] = React.useState<
    'add' | 'edit' | 'delete'
  >('add');
  const [sortBy, setSortBy] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [idToEditOrDel, setIdToEditOrDel] = React.useState<number | null>(null);
  const [debouncedSearch] = useDebounce(search, 1000);
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.children.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kidsTableData'] });
      toast.success('Kid deleted successfully');
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete kid, please try again later');
      setIsModalOpen(false);
    },
  });

  const handleModalOpen = (type: 'add' | 'edit' | 'delete') => {
    setCurrentModal(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-5 mt-2 px-3 md:px-5">
        <div className="flex justify-between items-center sm:block">
          <Heading text="Kids" />
          <Button
            text="Add Kid"
            className="!font-light !px-10 py-2.5 2xl:py-2 sm:hidden"
            onClick={() => handleModalOpen('add')}
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
            onClick={() => handleModalOpen('add')}
          />
        </div>
      </div>
      <KidsTable
        data={data}
        isLoading={isLoading}
        onEdit={(id) => {
          setIdToEditOrDel(id);
          handleModalOpen('edit');
        }}
        onDelete={(id) => {
          setIdToEditOrDel(id);
          handleModalOpen('delete');
        }}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Delete Kid"
        description="Are you sure you want to delete this kid? This action cannot be undone."
        onConfirm={() => deleteMutation.mutateAsync(idToEditOrDel!)}
        onCancel={() => setIsModalOpen(false)}
        isLoading={deleteMutation.isPending}
      >
        {currentModal === 'add' ? <AddKidForm /> : null}
      </Modal>
    </>
  );
};

export default Kids;
