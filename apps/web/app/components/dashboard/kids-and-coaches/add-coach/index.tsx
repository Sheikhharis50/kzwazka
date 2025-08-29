import React from 'react';
import { useForm } from 'react-hook-form';
import { AddCoachFormData, addCoachSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFileUpload } from '@/hooks/useFileUpload';
import ModalLayout from '../ModalLayout';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from 'api';
import { AddCoachPayload, APIError } from 'api/type';
import { toast } from 'react-toastify';

const AddCoachForm = ({
  setIsModalOpen,
}: {
  setIsModalOpen: (val: boolean) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddCoachFormData>({
    resolver: zodResolver(addCoachSchema),
  });

  const { base64, error, handleFileChange, preview, removeFile } =
    useFileUpload();
  const queryClient = useQueryClient();

  const addCoachMutation = useMutation({
    mutationFn: async (newCoach: AddCoachPayload) =>
      await api.coach.create(newCoach),
    onSuccess: (data) => {
      toast(data.message, { type: 'success' });
      reset();
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['coachesTableData'] });
    },
    onError: (error: APIError) => {
      toast(error.message, { type: 'error' });
    },
  });

  const onSubmit = (data: AddCoachFormData) => {
    if (!error) {
      addCoachMutation.mutate({ ...data, photo_url: base64 });
    }
  };

  return (
    <ModalLayout
      error={error}
      handleFileChange={handleFileChange}
      preview={preview}
      removeFile={removeFile}
      heading="Add Coach"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 md:space-y-5 w-full"
      >
        <Input
          {...register('first_name')}
          label="First Name"
          placeholder={`Enter coach first name`}
          error={errors.first_name?.message}
        />
        <Input
          {...register('last_name')}
          label="Last Name"
          placeholder={`Enter coach last name`}
          error={errors.last_name?.message}
        />
        <Input
          type="email"
          {...register('email')}
          label="Email"
          placeholder={`Enter coach email`}
          error={errors.email?.message}
        />
        <Input
          type="password"
          {...register('password')}
          label="Password"
          placeholder={`Enter password`}
          error={errors.password?.message}
        />
        <Input
          type="tel"
          {...register('phone')}
          label="Tel Number"
          placeholder={`Enter coach tel number`}
          error={errors.phone?.message}
        />
        <Button
          isLoading={addCoachMutation.isPending}
          text="Add"
          type="submit"
          className="w-2/3 mx-auto mt-5 lg:mt-10"
        />
      </form>
    </ModalLayout>
  );
};

export default AddCoachForm;
