'use client';
import React from 'react';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Paragraph from '@/components/Paragraph';
import { LoginFormData, loginSchema } from './schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as api from 'api';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';
import { APIError } from 'api/type';

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) => api.auth.login(credentials),
    onSuccess: (data) => {
      const isVerified = data.data?.user.is_verified;
      if (isVerified) {
        localStorage.setItem('token', data.data?.access_token || '');
        toast(data.message, { type: 'success' });
        setTimeout(() => {
          redirect('/dashboard');
        }, 1000);
      } else {
        const userId = data.data?.user.id;
        api.auth.resendOtp({ userId: userId! });
        localStorage.setItem('userId', userId || '');
        toast(data.message, { type: 'info' });
        setTimeout(() => {
          redirect(`/verify-email`);
        }, 1000);
      }

      reset();
    },
    onError: (error: APIError) => {
      console.error('Login failed:', error);
      toast(error.message, { type: 'error' });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
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
        isLoading={loginMutation.isPending}
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
      <p className="text-mute text-center"> </p>
    </form>
  );
};

export default LoginForm;
