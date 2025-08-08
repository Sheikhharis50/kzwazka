'use client';

import Heading from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import React from 'react';
import RegisterForm from './Form';

const RegisterPage = () => {
  const [step, setStep] = React.useState(1);
  const isFirstStep = step === 1;

  return (
    <>
      <div className="flex gap-3 items-center justify-center mb-5 xl:mb-8 2xl:mb-10 pt-5 2xl:pt-0">
        <div className="rounded-full h-1 lg:h-[5px] bg-blue w-28 lg:w-36" />
        <div
          className={`rounded-full h-1 lg:h-[5px] ${isFirstStep ? 'bg-[#D9D9D9]' : 'bg-blue'} w-28 lg:w-36`}
        />
      </div>
      <Heading
        text="Create your Account"
        className="text-center mb-1 2xl:mb-2"
      />
      <Paragraph
        text={
          isFirstStep
            ? 'Enter your username and password to continue.'
            : 'Enter your kids information to trace their events individually.'
        }
        mute
        className="text-center mb-5 2xl:mb-8"
      />
      <RegisterForm setStep={setStep} isFirstStep={isFirstStep} />
    </>
  );
};

export default RegisterPage;
