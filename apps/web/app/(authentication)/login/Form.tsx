'use client';
import React from 'react';
import Link from 'next/link';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import Paragraph from 'components/ui/Paragraph';
import { LoginFormData, loginSchema } from './schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from 'hooks/useAuth';

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { login, isLoading } = useAuth();

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full px-3">
      <Input
        label="Email*"
        id="email"
        type="email"
        placeholder="Enter your email"
        classes={{ root: 'mb-3' }}
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="Password*"
        id="password"
        type="password"
        placeholder="Enter your password"
        classes={{ root: 'mb-8 2xl:mb-12' }}
        {...register('password')}
        error={errors.password?.message}
      />
      <Button
        isLoading={isLoading}
        text="Sign In"
        className="w-4/5 mb-2 mx-auto"
        type="submit"
      />
      <div className="flex items-center justify-center gap-1">
        <Paragraph text="Don’t have account?" mute />
        <Link href="/register">
          <Paragraph text="Register here" className="underline" />
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
