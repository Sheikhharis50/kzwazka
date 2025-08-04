import React from 'react';
import Link from 'next/link';
import GoogleIcon from '@/icons/google.svg';
import XIcon from '@/icons/x.svg';
import Image from 'next/image';
import Heading from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import Input from '@/components/Input';
import Button from '@/components/Button';

const LoginPage = () => {
  return (
    <>
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
        <Button text="Sign In" className="w-4/5 mb-2 mx-auto" type="submit" />
        <div className="flex items-center justify-center gap-1">
          <Paragraph text="Don’t have account?" mute />
          <Link href="/register">
            <Paragraph text="Register here" className="underline" />
          </Link>
        </div>
        <p className="text-mute text-center"> </p>
      </form>
    </>
  );
};

export default LoginPage;
