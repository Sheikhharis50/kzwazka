'use client';

import Heading from '@/components/Heading';
import Paragraph from '@/components/Paragraph';
import React from 'react';
import RegisterForm from './Form';
import { Arrow } from 'svgs';
import AuthenticationLayout from '@/components/layouts/AuthenticationLayout';
import RegisterImage1 from '@/images/register1.png';
import RegisterImage2 from '@/images/register2.png';

const RegisterPage = () => {
  const [step, setStep] = React.useState(1);
  const isFirstStep = step === 1;

  return (
    <AuthenticationLayout
      imageSrc={isFirstStep ? RegisterImage1 : RegisterImage2}
    >
      <div className="flex gap-3 items-center justify-center mb-5 xl:mb-8 2xl:mb-10 pt-5 2xl:pt-0">
        <div className="rounded-full h-1 lg:h-[5px] bg-blue w-28 lg:w-36" />
        <div
          className={`rounded-full h-1 lg:h-[5px] ${isFirstStep ? 'bg-[#D9D9D9]' : 'bg-blue'} w-28 lg:w-36`}
        />
      </div>
      <div className="flex items-center gap-3 justify-center">
        {!isFirstStep && (
          <button onClick={() => setStep(1)}>
            <Arrow className="size-5 md:size-6" />
          </button>
        )}
        <Heading
          text="Create your Account"
          className="text-center mb-1 2xl:mb-2"
        />
      </div>
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
    </AuthenticationLayout>
  );
};

export default RegisterPage;
