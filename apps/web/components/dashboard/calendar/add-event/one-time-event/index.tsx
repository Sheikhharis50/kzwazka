import React, { useEffect } from 'react';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import { useCoach } from 'hooks/useCoach';
import { useLocation } from 'hooks/useLocation';
import { useGroup } from 'hooks/useGroup';
import { useForm } from 'react-hook-form';
import { OneTimeEventFormData, oneTimeEventSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEvent } from 'hooks/useEvent';
import Button from 'components/ui/Button';

const OneTimeEventForm = ({ closeModal }: { closeModal: () => void }) => {
  const { coachOptions } = useCoach();
  const { locationOptions } = useLocation();
  const { groupOptions } = useGroup();
  const { createEventMutation } = useEvent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    reset,
  } = useForm<OneTimeEventFormData>({
    resolver: zodResolver(oneTimeEventSchema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const startTime = watch('opening_time');
  const endTime = watch('closing_time');

  const onSubmit = (data: OneTimeEventFormData) => {
    createEventMutation.mutateAsync(data, {
      onSuccess: () => {
        reset();
        closeModal();
      },
    });
  };

  useEffect(() => {
    if (startDate && endDate) trigger(['start_date', 'end_date']);
    if (startTime && endTime) trigger(['opening_time', 'closing_time']);
  }, [startDate, endDate, startTime, endTime, trigger]);

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
        label="Event Start Date"
        {...register('start_date')}
        error={errors.start_date?.message}
        required
      />
      <Input
        type="date"
        label="Event End Date"
        {...register('end_date')}
        error={errors.end_date?.message}
        required
      />
      <Select
        numberValue
        defaultValue={0}
        label="Select Coach"
        options={coachOptions}
        placeholder="Select Coach"
        {...register('coach_id', { valueAsNumber: true })}
        error={errors.coach_id?.message}
        required
      />
      <div className="grid grid-cols-2 gap-1 md:gap-3">
        <Input
          type="time"
          label="Event Start Time"
          {...register('opening_time')}
          error={errors.opening_time?.message}
          required
        />
        <Input
          type="time"
          label="Event End Time"
          {...register('closing_time')}
          error={errors.closing_time?.message}
          required
        />
      </div>
      <Select
        numberValue
        defaultValue={0}
        label="Select Location"
        options={locationOptions}
        placeholder="Select Location"
        {...register('location_id', { valueAsNumber: true })}
        error={errors.location_id?.message}
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

export default OneTimeEventForm;
