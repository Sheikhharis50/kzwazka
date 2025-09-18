import React, { useEffect } from 'react';
import ModalLayout from '../../kids-and-coaches/ModalLayout';
import { useFileUpload } from 'hooks/useFileUpload';
import Input from '@/components/ui/Input';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGroupFormData, createGroupSchema } from './schema';
import Select from '@/components/ui/Select';
import { useCoach } from 'hooks/useCoach';
import { useLocation } from 'hooks/useLocation';
import { skillLevels } from 'constants/skill-level';
import Button from '@/components/ui/Button';
import { weekdays } from 'constants/weekdays';
import { Cross } from 'svgs';
import ErrorField from '@/components/ui/ErrorField';
import { useGroup } from 'hooks/useGroup';

interface CreateGroupFormProps {
  closeModal: () => void;
}

const CreateGroupForm = ({ closeModal }: CreateGroupFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<createGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      sessions: [{ day: '', time_from: '', time_to: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sessions',
  });

  const { error, handleFileChange, preview, removeFile, file } =
    useFileUpload();
  const { coachOptions } = useCoach();
  const { locationOptions } = useLocation();
  const {
    createGroupMutation: {
      mutateAsync: createGroup,
      isError,
      isPending,
      isSuccess,
    },
  } = useGroup();

  const onSubmit = (data: createGroupFormData) => {
    createGroup({ ...data, photo_url: file || undefined });
  };

  useEffect(() => {
    if (isError || isSuccess) {
      if (isSuccess) reset();
      closeModal();
    }
  }, [isError, isSuccess, closeModal, reset]);

  return (
    <ModalLayout
      error={error}
      handleFileChange={handleFileChange}
      preview={preview}
      removeFile={removeFile}
      heading="Create New Group "
      group
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
          <Input
            label="Enter Group Name"
            placeholder="Please enter group name"
            {...register('name')}
            error={errors?.name?.message}
          />
          <div>
            <div className="grid grid-cols-2 gap-1">
              <Input
                label="Min Age"
                type="number"
                min={0}
                defaultValue={0}
                {...register('min_age', { valueAsNumber: true })}
              />
              <Input
                label="Max Age"
                type="number"
                min={0}
                defaultValue={0}
                {...register('max_age', { valueAsNumber: true })}
              />
            </div>
            {(errors.min_age || errors.max_age) && (
              <ErrorField
                text={errors.min_age?.message || errors.max_age?.message}
              />
            )}
          </div>
          <Input
            label="Maximum members"
            type="number"
            min={0}
            defaultValue={0}
            {...register('max_group_size', { valueAsNumber: true })}
            error={errors?.max_group_size?.message}
          />
          <Select
            defaultValue={0}
            numberValue
            label="Coach"
            options={coachOptions}
            {...register('coach_id', { valueAsNumber: true })}
            error={errors?.coach_id?.message}
          />
          <Select
            defaultValue={0}
            numberValue
            label="Training Address"
            options={locationOptions}
            {...register('location_id', { valueAsNumber: true })}
            error={errors?.location_id?.message}
          />
          <Select
            defaultValue={''}
            label="Skill Level"
            options={skillLevels}
            {...register('skill_level')}
            error={errors?.skill_level?.message}
          />
          {fields.map((field, index) => {
            const isFirstSession = index === 0;

            return (
              <React.Fragment key={field.id}>
                <Select
                  placeholder="Select Day"
                  label={isFirstSession ? 'Training Schedule' : undefined}
                  {...register(`sessions.${index}.day`)}
                  error={errors?.sessions?.[index]?.day?.message}
                  options={weekdays}
                />
                <div>
                  <div className="grid grid-cols-2 gap-1 relative">
                    <Input
                      label={isFirstSession ? 'From' : undefined}
                      type="time"
                      {...register(`sessions.${index}.time_from`)}
                    />
                    <Input
                      label={isFirstSession ? 'To' : undefined}
                      type="time"
                      {...register(`sessions.${index}.time_to`)}
                    />
                    {index > 0 && (
                      <button
                        className={'absolute -right-5 top-1/2 -translate-y-1/2'}
                        onClick={() => remove(index)}
                        type="button"
                      >
                        <Cross className="text-red size-3" />
                      </button>
                    )}
                  </div>
                  {(errors?.sessions?.[index]?.time_from ||
                    errors?.sessions?.[index]?.time_to) && (
                    <ErrorField
                      text={
                        errors?.sessions?.[index]?.time_from?.message ||
                        errors?.sessions?.[index]?.time_to?.message
                      }
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
        {errors?.sessions?.root?.message && (
          <ErrorField text={errors?.sessions?.root?.message} />
        )}
        <button
          type="button"
          className="w-full rounded-sm py-2 px-5 text-sm border border-border mb-8 mt-3"
          onClick={() => append({ day: '', time_from: '', time_to: '' })}
        >
          + Add More
        </button>
        <Button
          isLoading={isPending}
          type="submit"
          text="Create Group"
          className="w-1/2 mx-auto"
        />
      </form>
    </ModalLayout>
  );
};

export default CreateGroupForm;
