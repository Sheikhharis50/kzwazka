'use client';

import Heading from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import React from 'react';
import EditIcon from '@/icons/edit.svg';
import Image from 'next/image';
import Input from '@/components/Input';
import Button from '@/components/Button';
import * as api from 'api';
import { useMutation } from '@tanstack/react-query';
import { APIError } from 'api/type';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';

const VerifyEmailPage = () => {
  const [otp, setOtp] = React.useState<string[]>(Array(6).fill(''));
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasteData.length === 6) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputsRef.current[5]?.focus();
    }
    e.preventDefault();
  };

  const verifyEmailMutation = useMutation({
    mutationFn: (credentials: { userId: string; otp: string }) =>
      api.auth.verifyOtp(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.data?.access_token || '');
      toast(data.message, { type: 'success' });
      setTimeout(() => {
        redirect('/dashboard');
      }, 1000);
    },
    onError: (error: APIError) => {
      console.error('Login failed:', error);
      toast(error.message, { type: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      setError(null);
      const userId = localStorage.getItem('userId');
      verifyEmailMutation.mutate({ userId: userId || '', otp: otpValue });
    } else {
      setError('Please enter a valid 6-digit OTP.');
    }
  };

  return (
    <>
      <div className="text-center mb-5">
        <Heading text="Verify Your Email" className="mb-1 lg:mb-2" />{' '}
        <Paragraph
          text="To continue, we need to verify your email address."
          mute
        />
        <Paragraph text="We’ve sent a 6-digit OTP to your email" mute />
      </div>
      <div className="flex gap-2 items-center justify-center">
        <Paragraph text="“info@gmail.com”" mute />
        <Image
          src={EditIcon}
          alt="edit"
          width={20}
          height={20}
          className="size-4 md:size-6"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="py-10 md:py-16 text-center">
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <Input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[i]}
                ref={(el: HTMLInputElement | null) => {
                  inputsRef.current[i] = el;
                }}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                classes={{
                  input: 'max-w-10 md:max-w-12 h-12 md:h-14 text-center',
                }}
              />
            ))}
          </div>
          {error && (
            <span className="text-[10px] md:text-xs xl:text-sm text-red mt-1 xl:mt-2">
              {error}
            </span>
          )}
        </div>
        <Button
          isLoading={verifyEmailMutation.isPending}
          type="submit"
          text="Verify"
          className="w-1/2 mx-auto mb-2"
        />
        <Paragraph text="Resend OTP" mute className="text-center" />
      </form>
    </>
  );
};

export default VerifyEmailPage;
