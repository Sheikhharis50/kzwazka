'use client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';

import { useFileUpload } from 'hooks/useFileUpload';
import React from 'react';
import { useForm } from 'react-hook-form';
import { AddKidFormData, addKidSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import ModalLayout from '../ModalLayout';

const AddKidForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddKidFormData>({
    resolver: zodResolver(addKidSchema),
  });

  const { base64, error, handleFileChange, preview, removeFile } =
    useFileUpload();

  const onSubmit = (data: AddKidFormData) => {
    console.log({ ...data, photo: base64 });
  };

  return (
    <ModalLayout
      error={error}
      handleFileChange={handleFileChange}
      preview={preview}
      removeFile={removeFile}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 md:space-y-5 w-full"
      >
        <Input
          {...register('parent_name')}
          label="Parent Name"
          placeholder={`Enter parent's name`}
          error={errors.parent_name?.message}
        />
        <Input
          {...register('child_name')}
          label="Child Name"
          placeholder={`Enter child's name`}
          error={errors.child_name?.message}
        />
        <Input
          {...register('dob')}
          type="date"
          label="Date of Birth"
          error={errors.dob?.message}
        />
        <Select
          {...register('group')}
          label="Group"
          options={[
            { label: 'Group A', value: 'group_a' },
            { label: 'Group B', value: 'group_b' },
          ]}
          placeholder="Select group"
          error={errors.group?.message}
        />
        <Input
          {...register('email')}
          type="email"
          label="Email of Child"
          placeholder={`Enter child's email`}
          error={errors.email?.message}
        />
        <Input
          {...register('number')}
          type="tel"
          label="Tel Number"
          placeholder={`Enter tel number`}
          error={errors.number?.message}
        />
        <Button
          text="Add"
          type="submit"
          className="w-2/3 mx-auto mt-5 lg:mt-10"
        />
      </form>
    </ModalLayout>
  );
};

export default AddKidForm;
