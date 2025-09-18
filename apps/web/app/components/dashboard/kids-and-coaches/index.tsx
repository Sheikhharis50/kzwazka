'use client';
import React from 'react';
import Select from '@/components/Select';
import { sortByOptions } from 'constants/kids';
import { sortByOptions as coachSortByOpt } from 'constants/coaches';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import { Search } from '@/svgs/Search';
import Button from '@/components/Button';
import Table from './Table';
import AddKidForm from './add-kid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from 'api';
import { useDebounce } from 'use-debounce';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-toastify';
import { APIError, ICoach } from 'api/type';
import AddCoachForm from './add-coach';
import { Dashboard, ListView } from '@/svgs';
import Loader from '@/components/Loader';
import CoachGridView from './coach-grid-view';
import EditCoachForm from './edit-coach';

const KidsAndCoaches = ({ coach = false }: { coach?: boolean }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isListView, setIsListView] = React.useState(true);
  const [currentModal, setCurrentModal] = React.useState<
    'add' | 'edit' | 'delete'
  >('add');

  const [sortBy, setSortBy] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [idToEditOrDel, setIdToEditOrDel] = React.useState<number | null>(null);
  const [debouncedSearch] = useDebounce(search, 1000);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: coach
      ? ['coachesTableData', debouncedSearch, sortBy]
      : ['kidsTableData', debouncedSearch, sortBy],
    queryFn: async () => {
      const res = coach
        ? await api.coach.getAll({
            search: debouncedSearch,
            sort_by: sortBy,
          })
        : await api.children.getAll({
            search: debouncedSearch,
            sort_by: sortBy,
          });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      coach ? api.coach.delete(id) : api.children.delete(id),
    onSuccess: (data) => {
      if (coach) {
        queryClient.invalidateQueries({ queryKey: ['coachesTableData'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['kidsTableData'] });
      }
      toast.success(data.message, { type: 'success' });
      setIsModalOpen(false);
    },
    onError: (error: APIError) => {
      toast.error(error.message, { type: 'error' });
      setIsModalOpen(false);
    },
  });

  const handleModalOpen = (type: 'add' | 'edit' | 'delete') => {
    setCurrentModal(type);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number) => {
    setIdToEditOrDel(id);
    handleModalOpen('edit');
  };

  const handleDelete = (id: number) => {
    setIdToEditOrDel(id);
    handleModalOpen('delete');
  };

  return (
    <>
      <div
        className={`flex flex-col ${coach ? 'md:flex-row md:items-center' : 'sm:flex-row sm:items-center'} gap-3 justify-between mb-5 mt-2 px-3 md:px-5`}
      >
        <div
          className={`flex ${coach ? 'md:block' : 'sm:block'} justify-between items-center`}
        >
          <Heading text={coach ? 'Coaches' : 'Kids'} />
          <div className="flex gap-2 xs:gap-3 items-center">
            {coach && (
              <>
                <button
                  onClick={() => setIsListView(true)}
                  className="md:hidden"
                >
                  <ListView
                    className={`w-5 sm:w-6 h-auto ${isListView ? 'text-black' : 'text-black/20'}`}
                  />
                </button>
                <button
                  onClick={() => setIsListView(false)}
                  className="md:hidden"
                >
                  <Dashboard
                    className={`w-5 sm:w-6 h-auto ${isListView ? 'text-black/20' : 'text-black'}`}
                  />
                </button>
              </>
            )}
            <Button
              text={coach ? 'Add Coach' : 'Add Kid'}
              className={`!font-light py-2.5 2xl:py-2 ${coach ? 'md:hidden sm:!px-10' : 'sm:hidden !px-10'}`}
              onClick={() => handleModalOpen('add')}
            />
          </div>
        </div>
        <div className="flex justify-end items-center gap-1.5 md:gap-3">
          {coach && (
            <>
              <button
                onClick={() => setIsListView(true)}
                className="hidden md:block"
              >
                <ListView
                  className={`w-7 h-auto ${isListView ? 'text-black' : 'text-black/20'}`}
                />
              </button>
              <button
                onClick={() => setIsListView(false)}
                className="hidden md:block"
              >
                <Dashboard
                  className={`w-7 h-auto ${isListView ? 'text-black/20' : 'text-black'}`}
                />
              </button>
            </>
          )}
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
            options={coach ? coachSortByOpt : sortByOptions}
            classes={{
              input: '!bg-smoke !rounded-full',
              root: 'min-w-[100px] xs:min-w-auto',
            }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            placeholder="Sort by"
          />
          <Button
            text={coach ? 'Add Coach' : 'Add Kid'}
            className={`!font-light !px-10 py-2.5 2xl:py-2 hidden ${coach ? 'md:block' : 'sm:block'}`}
            onClick={() => handleModalOpen('add')}
          />
        </div>
      </div>
      {!coach || (coach && isListView) ? (
        <Table
          coach={coach}
          data={data}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : !data ? (
        <div className="size-full flex justify-center items-center">
          <Loader black />
        </div>
      ) : (
        <CoachGridView
          data={data as ICoach[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Delete ${coach ? 'Coach' : 'Kid'}`}
        description={`Are you sure you want to delete this ${coach ? 'coach' : 'kid'}? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutateAsync(idToEditOrDel!)}
        onCancel={() => setIsModalOpen(false)}
        isLoading={deleteMutation.isPending}
      >
        {currentModal === 'add' && coach ? (
          <AddCoachForm setIsModalOpen={setIsModalOpen} />
        ) : currentModal === 'add' && !coach ? (
          <AddKidForm />
        ) : currentModal === 'edit' && coach ? (
          <>
            {idToEditOrDel != null && (
              <EditCoachForm
                setIsModalOpen={setIsModalOpen}
                id={idToEditOrDel}
              />
            )}
          </>
        ) : null}
      </Modal>
    </>
  );
};

export default KidsAndCoaches;
