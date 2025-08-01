'use client';

import Image from 'next/image';
import React from 'react';
import ImageSrc from '@/images/login.png';
import Ribbon from '@/images/login-ribbon.png';
import Logo from '@/components/Logo';
import ArrowLeft from '@/icons/left-arrow.svg';
import Link from 'next/link';
import GoogleIcon from '@/icons/google.svg';
import XIcon from '@/icons/x.svg';
import { usePreviousPath } from 'app/hooks/usePreviousPath';
import LogoMobile from '@/components/LogoMobile';
import Heading from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import Input from '@/components/Input';
import Button from '@/components/Button';

const LoginPage = () => {
  const goBack = usePreviousPath();
  return (
    <div className="grid lg:grid-cols-[1.5fr_2fr] w-full gap-5 md:gap-8 lg:gap-5 lg:h-dvh lg:overflow-hidden lg:p-1.5">
      <div className="lg:h-[calc(100dvh-12px)] bg-yellow rounded-b-3xl lg:rounded-[42px] overflow-hidden relative p-3 lg:p-5">
        <Image
          src={Ribbon}
          alt="ribbon"
          width={500}
          height={500}
          className="w-12 sm:w-16 md:w-20 lg:w-4/5 h-auto lg:h-3/5 absolute top-0 right-0"
        />
        <Image
          src={ImageSrc}
          height={2000}
          width={2000}
          alt="Kzwazka kids wrestling"
          className="w-full h-[75%] bottom-0 object-contain absolute left-0 hidden lg:block"
          objectFit="contain"
        />
        <div className="flex items-center justify-center lg:justify-between relative">
          <Logo className="hidden lg:block" />
          <LogoMobile className="lg:hidden" />
          <button
            className="hidden lg:flex gap-1 items-center xl:text-lg"
            onClick={goBack}
          >
            <Image
              src={ArrowLeft}
              width={0}
              height={0}
              alt="left arrow"
              className="w-3.5 h-auto"
            />{' '}
            Go back
          </button>
        </div>
      </div>
      <div className="h-full lg:overflow-y-auto lg:h-[calc(100dvh-12px)] flex flex-col gap-10 lg:gap-2 items-center px-3 lg:px-0">
        <div className="flex-1 flex flex-col justify-center">
          <Heading text="Welcome to Wrestling School" />
          <Paragraph
            text="Enter your username and password to continue."
            mute
            className="text-center py-5 2xl:py-8"
          />
          <div className="px-3">
            <button className="flex gap-3 w-full items-center justify-center text-black rounded-lg p-2 border-border border-[1px] mb-3">
              <Image
                src={GoogleIcon}
                alt="Google icon"
                width={24}
                height={24}
                className="w-4 md:w-5 xl:w-6"
              />
              <Paragraph text="Sign in with Google" />
            </button>
            <button className="flex gap-3 w-full items-center justify-center text-black rounded-lg p-2 border-border border-[1px]">
              <Image
                src={XIcon}
                alt="Google icon"
                width={24}
                height={24}
                className="w-4 md:w-5 xl:w-6"
              />
              <Paragraph text="Sign in with X" />
            </button>
          </div>
          <div className="divider-text py-5 2xl:py-7">
            <Paragraph text="or" mute />
          </div>
          <form action="" className="w-full px-3">
            <Input
              label="Email*"
              id="email"
              type="email"
              placeholder="Enter your email"
              classes={{ root: 'mb-3' }}
            />
            <Input
              label="Password*"
              id="password"
              type="password"
              placeholder="Enter your password"
              classes={{ root: 'mb-8 2xl:mb-12' }}
            />
            <Button
              text="Sign In"
              className="w-4/5 mb-2 mx-auto"
              type="submit"
            />
            <div className="flex items-center justify-center gap-1">
              <Paragraph text="Don’t have account?" mute />
              <Link href="/regsiter">
                <Paragraph text="Register here" className="underline" />
              </Link>
            </div>
            <p className="text-mute text-center"> </p>
          </form>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1 mb-2 text-mute">
          <Paragraph text="By creating an account, you agree to our" />
          <Link href="/terms-and-condition" className="underline">
            <Paragraph text="terms and conditions" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
