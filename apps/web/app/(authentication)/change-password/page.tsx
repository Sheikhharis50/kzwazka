'use client';
import Heading from 'components/ui/Heading';
import Input from 'components/ui/Input';
import Paragraph from 'components/ui/Paragraph';
import Image from 'next/image';
import React from 'react';
import CheckIcon from '@/icons/check.png';
import { passwordRules } from 'constants/password-rules';
import Button from 'components/ui/Button';
import AuthenticationLayout from 'components/layouts/AuthenticationLayout';
import ChangePasswordImage from '@/images/change-password.png';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChangePasswordFormData, changePasswordSchema } from './schema';
import { useAuth } from 'hooks/useAuth';

const ChangePasswordPage = () => {
  const { changePassword, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'all',
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(data);
  };

  return (
    <AuthenticationLayout imageSrc={ChangePasswordImage}>
      <Heading text="Change Password " className="text-center mb-1 2xl:mb-2" />
      <Paragraph
        text="Update your password by filling in the fields below:"
        mute
        className="text-center mb-5 xl:mb-8 2xl:mb-10"
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 max-w-[90vw] min-w-[90vw] sm:max-w-sm sm:min-w-sm xl:max-w-md xl:min-w-md mx-auto"
      >
        <Input
          type="password"
          label="Current Password"
          required
          {...register('old_password')}
          error={errors.old_password?.message}
        />
        <Input
          type="password"
          label="New Password"
          required
          {...register('new_password')}
          error={errors.new_password?.message}
        />
        <Input
          type="password"
          label="Confirm New Password"
          required
          {...register('confirm_password')}
          error={errors.confirm_password?.message}
        />
        <div className="mb-8 xl:mb-12 2xl:mb-14">
          {passwordRules.map((rule, index) => (
            <div className="flex gap-1" key={`rule-${index}`}>
              <Image
                src={CheckIcon}
                alt="check icon"
                height={50}
                width={50}
                className="size-3 md:size-4 object-contain mt-0.5 xl:mt-1.5"
              />
              <Paragraph text={rule} mute />
            </div>
          ))}
        </div>
        <Button
          isLoading={isLoading}
          text="Update Password"
          type="submit"
          className="w-3/5 mx-auto"
        />
      </form>
    </AuthenticationLayout>
  );
};

export default ChangePasswordPage;
