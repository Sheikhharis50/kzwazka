'use client';

import Heading from '@/components/ui/Heading';
import Paragraph from '@/components/ui/Paragraph';
import React from 'react';
import EditIcon from '@/icons/edit.svg';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from 'hooks/useAuth';
import { useUser } from 'hooks/useUser';
import AuthenticationLayout from '@/components/layouts/AuthenticationLayout';
import VerifyEmailImage from '@/images/verify-email.png';

const VerifyEmailPage = () => {
  const [otp, setOtp] = React.useState<string[]>(Array(6).fill(''));
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const { verifyOtp, isLoading, resendOtp } = useAuth();
  const [canResendOtp, setCanResendOtp] = React.useState(true);
  const [secondsLeft, setSecondsLeft] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user } = useUser();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      setError(null);
      verifyOtp({ otp: otpValue });
    } else {
      setError('Please enter a valid 6-digit OTP.');
    }
  };

  const startOtpCooldown = () => {
    setCanResendOtp(false);
    setSecondsLeft(30);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setCanResendOtp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <AuthenticationLayout imageSrc={VerifyEmailImage}>
      <div className="text-center mb-5">
        <Heading text="Verify Your Email" className="mb-1 lg:mb-2" />{' '}
        <Paragraph
          text="To continue, we need to verify your email address."
          mute
        />
        <Paragraph text="We’ve sent a 6-digit OTP to your email" mute />
      </div>
      <div className="flex gap-2 items-center justify-center">
        <Paragraph text={`“${user?.email}”`} mute />
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
          isLoading={isLoading}
          type="submit"
          text="Verify"
          className="w-1/2 mx-auto mb-2"
        />
        <Button
          text={canResendOtp ? 'Resend OTP' : `Resend in (${secondsLeft}s)`}
          className="hover:underline text-mute! bg-transparent! w-1/2 mx-auto"
          onClick={() => {
            if (!canResendOtp) return;
            resendOtp();
            startOtpCooldown();
          }}
          disabled={!canResendOtp}
        />
      </form>
    </AuthenticationLayout>
  );
};

export default VerifyEmailPage;
