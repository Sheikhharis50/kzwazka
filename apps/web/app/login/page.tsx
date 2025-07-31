import Image from 'next/image';
import React from 'react';
import ImageSrc from '@/images/login.png';
import Ribbon from '@/images/login-ribbon.png';
import Logo from '@/components/Logo';
import ArrowLeft from '@/icons/left-arrow.svg';
import Link from 'next/link';
import GoogleIcon from '@/icons/google.svg';
import XIcon from '@/icons/X.svg';

const LoginPage = () => {
  return (
    <div className="grid grid-cols-[1.5fr_2fr] w-full gap-5 h-dvh overflow-hidden p-1.5">
      <div className="h-[calc(100dvh-12px)] bg-yellow rounded-[42px] overflow-hidden relative p-5">
        <Image
          src={Ribbon}
          alt="ribbon"
          width={500}
          height={500}
          className="w-4/5 h-3/5 absolute top-0 right-0"
        />
        <Image
          src={ImageSrc}
          height={2000}
          width={2000}
          alt="Kzwazka kids wrestling"
          className="w-full h-[75%] bottom-0 object-contain absolute left-0"
          objectFit="contain"
        />
        <div className="flex items-center justify-between relative">
          <Logo />
          <button className="flex gap-1 items-center text-lg">
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
      <div className="h-full flex flex-col gap-2 items-center">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-4xl">Welcome to Wrestling School</h2>
          <p className="text-mute text-center py-5 2xl:py-8">
            Enter your username and password to continue.
          </p>
          <div className="px-3">
            <button className="flex gap-3 w-full items-center justify-center text-black rounded-lg p-2 border-border border-[1px] mb-3">
              <Image
                src={GoogleIcon}
                alt="Google icon"
                width={24}
                height={24}
              />
              Sign in with Google
            </button>
            <button className="flex gap-3 w-full items-center justify-center text-black rounded-lg p-2 border-border border-[1px]">
              <Image src={XIcon} alt="Google icon" width={24} height={24} />
              Sign in with X
            </button>
          </div>
          <div className="divider-text py-5 2xl:py-7">
            <span>or</span>
          </div>
          <form action="" className="w-full px-3">
            <div className="flex flex-col gap-1 w-full mb-3">
              <label htmlFor="email">Email*</label>
              <input
                className="py-2 px-3 rounded-lg border border-border w-full"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex flex-col gap-1 w-full mb-8 2xl:mb-12">
              <label htmlFor="email">Password*</label>
              <input
                className="py-2 px-3 rounded-lg border border-border w-full"
                type="email"
                placeholder="Enter your password"
              />
            </div>
            <button
              className="bg-red rounded-full p-2 w-4/5 text-white mb-2 mx-auto block"
              type="submit"
            >
              Sign In
            </button>
            <p className="text-mute text-center">
              Don’t have account?{' '}
              <Link className="text-black underline" href="/regsiter">
                Register here
              </Link>
            </p>
          </form>
        </div>
        <p className="text-mute h-fit mb-2">
          By creating an account, you agree to our{' '}
          <Link href="/terms-and-condition" className="underline">
            terms and conditions
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
