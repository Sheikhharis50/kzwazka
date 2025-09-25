import { zodResolver } from '@hookform/resolvers/zod';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import { useGroup } from 'hooks/useGroup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { TrainingEventFormData, trainingEventSchema } from './schema';
import { useEvent } from 'hooks/useEvent';

const TrainingEventForm = ({ closeModal }: { closeModal: () => void }) => {
  const { groupOptions } = useGroup();
  const { createEventMutation } = useEvent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TrainingEventFormData>({
    resolver: zodResolver(trainingEventSchema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const onSubmit = (data: TrainingEventFormData) => {
    createEventMutation.mutateAsync(data, {
      onSuccess: () => {
        reset();
        closeModal();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-3 md:space-y-5"
    >
      <Input
        label="Event Title"
        placeholder="Please enter event title"
        {...register('title')}
        error={errors.title?.message}
        required
      />
      <Input
        type="date"
        label="Event Date"
        {...register('start_date')}
        error={errors.start_date?.message}
        required
      />
      <Select
        numberValue
        defaultValue={0}
        label="Select Group"
        options={groupOptions}
        placeholder="Select Group"
        {...register('group_id', { valueAsNumber: true })}
        error={errors.group_id?.message}
        required
      />
      <Button
        isLoading={createEventMutation.isPending}
        text="Add Event"
        className="w-1/2 mx-auto mt-6 md:mt-10"
      />
    </form>
  );
};

export default TrainingEventForm;
