'use client';
import Button from '@/components/Button';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import Select from '@/components/Select';

import { useFileUpload } from '@/hooks/useFileUpload';
import { Camera, Trash } from '@/svgs';
import Image from 'next/image';
import React from 'react';
import { useForm } from 'react-hook-form';
import { AddKidFormData, addKidSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';

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
    <div className="flex flex-col gap-5 lg:gap-10 items-center justify-center relative">
      <Heading text="Add Kid" small />
      <div>
        <div className="rounded-full bg-smoke size-24 flex flex-col justify-center gap-1 items-center relative mx-auto">
          {preview ? (
            <div className="rounded-full overflow-hidden">
              <Image
                src={preview}
                alt="kid image"
                height={300}
                width={300}
                className="w-full h-auto object-cover"
              />
              <button
                className="bg-red text-white p-1 rounded-full absolute top-3 right-0"
                onClick={removeFile}
              >
                <Trash className="w-3 h-auto" />
              </button>
            </div>
          ) : (
            <>
              <Camera />
              <p className="text-[10px]">Add Picture</p>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                className="absolute size-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>
        {error && (
          <span
            className={`text-[10px] md:text-xs xl:text-sm text-red text-center`}
          >
            {error}
          </span>
        )}
      </div>
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
    </div>
  );
};

export default AddKidForm;
