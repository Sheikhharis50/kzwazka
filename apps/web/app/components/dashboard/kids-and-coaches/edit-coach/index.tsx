import React from 'react';
import { useForm } from 'react-hook-form';
import { EditCoachFormData, editCoachSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFileUpload } from '@/hooks/useFileUpload';
import ModalLayout from '../ModalLayout';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from 'api';
import { EditCoachPayload, APIError } from 'api/type';
import { toast } from 'react-toastify';
import Loader from '@/components/Loader';

const EditCoachForm = ({
  setIsModalOpen,
  id,
}: {
  setIsModalOpen: (val: boolean) => void;
  id: number;
}) => {
  const { data: coach, isLoading } = useQuery({
    queryKey: ['coach', id],
    queryFn: async () => {
      const res = await api.coach.getOne(id);
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditCoachFormData>({
    resolver: zodResolver(editCoachSchema),
  });

  const { error, handleFileChange, preview, removeFile, file } =
    useFileUpload();
  const queryClient = useQueryClient();

  const editCoachMutation = useMutation({
    mutationFn: async (data: EditCoachPayload) =>
      await api.coach.update({ data, id }),
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

  const onSubmit = (data: EditCoachFormData) => {
    editCoachMutation.mutate({ ...data, photo_url: file || null });
  };

  React.useEffect(() => {
    if (coach) {
      reset({
        first_name: coach.user.first_name || '',
        last_name: coach.user.last_name || '',
        phone: coach.user.phone || '',
      });
    }
  }, [coach, reset]);

  return (
    <ModalLayout
      error={error}
      handleFileChange={handleFileChange}
      preview={preview}
      removeFile={removeFile}
      heading="Edit Coach"
      defaultPhoto={coach?.user.photo_url || undefined}
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
          type="tel"
          {...register('phone')}
          label="Tel Number"
          placeholder={`Enter coach tel number`}
          error={errors.phone?.message}
        />
        <Button
          isLoading={editCoachMutation.isPending}
          text="Update"
          type="submit"
          className="w-2/3 mx-auto mt-5 lg:mt-10"
        />
      </form>
      {isLoading && (
        <div className="absolute left-0 top-0 size-full bg-white/80 flex items-center justify-center">
          <Loader black />
        </div>
      )}
    </ModalLayout>
  );
};

export default EditCoachForm;
