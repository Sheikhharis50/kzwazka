'use client';
import Button from '@/components/Button';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import Paragraph from '@/components/Paragraph';
import { Camera, Edit, Trash } from 'svgs';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { profileSchema, updateProfileFormData } from './schema';
import { useUser } from 'hooks/useUser';
import { useFileUpload } from 'hooks/useFileUpload';
import Image from 'next/image';
import ErrorField from '@/components/ui/ErrorField';
import { useAuth } from 'hooks/useAuth';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const { user, child } = useUser();
  const { updateProfile, isLoading } = useAuth();
  const { error, file, preview, handleFileChange, removeFile } =
    useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileVisible = preview || child?.user.photo_url;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<updateProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = (data: updateProfileFormData) => {
    updateProfile({ ...data, photo_url: file || undefined });
  };

  useEffect(() => {
    if (user) {
      reset({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
      });
    }
  }, [reset, user]);

  return (
    <div className="space-y-6 md:scroll-py-10 px-3 md:px-5 lg:px-10 my-5">
      <Heading text="My Profile" small />
      <div className="w-fit">
        <div className="size-24 md:size-40 flex items-center justify-center rounded-full bg-blue mb-1 md:mb-2 relative mx-auto">
          <div
            className={`${profileVisible ? '' : 'hidden'} rounded-full size-full overflow-hidden`}
          >
            <Image
              src={preview || child?.user.photo_url || ''}
              alt="profile"
              width={300}
              height={300}
              className="size-full object-cover"
            />
            {preview ? (
              <button
                className={`bg-red text-white p-1 rounded-full absolute top-[10%] right-[5%]`}
                onClick={removeFile}
              >
                <Trash className="w-3 h-auto" />
              </button>
            ) : child?.user.photo_url ? (
              <button
                className="bg-smoke text-black p-1 rounded-full absolute top-[10%] right-[5%]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Edit className="w-3 h-auto" />
              </button>
            ) : null}
          </div>
          <div className={profileVisible ? 'hidden' : ''}>
            <Camera className="text-white w-7 md:w-10 h-auto" />
            <input
              ref={fileInputRef}
              accept=".png,.jpg,.jpeg"
              type="file"
              className="absolute size-full left-0 top-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <Paragraph text="Profile Photo" className="text-center" />
        {error && <ErrorField text={error} />}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="xl:max-w-[70%]">
        <div className="grid md:grid-cols-2 gap-5 mb-10 md:mb-16">
          <Input
            label="First Name"
            required
            placeholder="Enter your first name"
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          <Input
            label="Last Name"
            required
            placeholder="Enter your last name"
            {...register('last_name')}
            error={errors.last_name?.message}
          />
          <Input
            label="Email"
            type="email"
            required
            placeholder="Enter your email"
            value={user?.email}
            readOnly
          />
          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="Enter your phone number"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>
        <div className="flex gap-3 md:gap-5">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!isDirty || isLoading}
            text="Save"
            className={`min-w-[100px] xs:min-w-[168px] md:min-w-[226px] ${!isDirty ? '!bg-red/20 !text-black' : ''}`}
          />
          <Button
            type="button"
            text="Change Password"
            className="xs:min-w-[168px] md:min-w-[226px]"
            onClick={() =>
              router.push(`/change-password?next=${location.pathname}`)
            }
          />
        </div>
      </form>
    </div>
  );
};

export default Profile;
