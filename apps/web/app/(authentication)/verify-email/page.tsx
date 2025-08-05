'use client';

import Heading from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import React from 'react';
import EditIcon from '@/icons/edit.svg';
import Image from 'next/image';
import Input from '@/components/Input';
import Button from '@/components/Button';

const VerifyEmailPage = () => {
  const [otp, setOtp] = React.useState<string[]>(Array(6).fill(''));
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

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
      pasteData.split('').forEach((char, i) => {
        if (inputsRef.current[i]) inputsRef.current[i]!.value = char;
      });
      inputsRef.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      // Handle OTP verification
      console.log('OTP:', otpValue);
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
        <div className="flex gap-2 py-10 md:py-16 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <Input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
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
        <Button type="submit" text="Verify" className="w-1/2 mx-auto mb-2" />
        <Paragraph text="Resend OTP" mute className="text-center" />
      </form>
    </>
  );
};

export default VerifyEmailPage;
