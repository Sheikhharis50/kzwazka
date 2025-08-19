import React from 'react';
import GoogleIcon from '@/icons/google.svg';
import XIcon from '@/icons/x.svg';
import Image from 'next/image';
import Heading from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import LoginForm from './Form';
import AuthenticationLayout from '@/components/layouts/AuthenticationLayout';
import LoginImage from '@/images/login.png';

const LoginPage = () => {
  return (
    <AuthenticationLayout imageSrc={LoginImage}>
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
            alt="X icon"
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
      <LoginForm />
    </AuthenticationLayout>
  );
};

export default LoginPage;
