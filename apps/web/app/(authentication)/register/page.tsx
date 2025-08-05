'use client';

import Button from '@/components/Button';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import Paragraph from '@/components/Paragraph';
import Select from '@/components/Select';
import { kidAgeOptions } from 'app/constants/kid-age';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const RegisterPage = () => {
  const [step, setStep] = React.useState(1);
  const isFirstStep = step === 1;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  console.log('prview' + preview);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep(2);
    e.currentTarget.reset();
  };

  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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
      <form
        action=""
        onSubmit={handleSubmit}
        className="space-y-3 min-w-[90vw] sm:min-w-[340px] xl:min-w-sm mx-auto"
      >
        {isFirstStep ? (
          <>
            <Input
              label="Email*"
              type="email"
              placeholder="Enter your email"
              id="email"
            />
            <Input
              label="Phone Number*"
              type="tel"
              placeholder="31207544744"
              id="phone-number"
            />
            <Input
              label="Password*"
              type="password"
              placeholder="Enter your password"
              id="password"
            />
            <Input
              label="Parent's First Name"
              type="text"
              placeholder="Enter first name"
              id="parent-first-name"
            />
            <Input
              label="Parent's Last Name"
              type="text"
              placeholder="Enter last name"
              id="parent-last-name"
              classes={{ root: 'mb-5 xl:mb-8 2xl:mb-10' }}
            />
          </>
        ) : (
          <>
            <Input
              label="Kid First Name*"
              type="text"
              placeholder="Enter first name"
              id="kid-first-name"
            />
            <Input
              label="Kid Last Name*"
              type="text"
              placeholder="Enter last name"
              id="kid-last-name"
            />
            <Select
              label="Kid Age*"
              id="kid-age"
              options={kidAgeOptions}
              placeholder="Select age"
            />
            <div>
              <Input
                label="Kid Photo"
                ref={fileInputRef}
                accept="image/*"
                type="file"
                id="kid-image"
                hidden
                onChange={handleFileChange}
                classes={{ root: 'mb-1' }}
              />
              <div
                className={`w-36 h-20 flex items-center justify-center rounded-lg ${!preview ? 'border-dashed border border-border' : ''} overflow-hidden cursor-pointer mb-5 xl:mb-8 2xl:mb-10`}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    width={144}
                    height={80}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Paragraph text="+ Upload Image" />
                )}
              </div>
            </div>
          </>
        )}
        <Button
          text={isFirstStep ? 'Next' : 'Continue'}
          type="submit"
          className="w-4/5 mx-auto mb-1"
        />
        <div className="flex items-center justify-center gap-1">
          <Paragraph text="Already have account?" mute />
          <Link href="/login">
            <Paragraph text="Login here" className="underline" />
          </Link>
        </div>
      </form>
    </>
  );
};

export default RegisterPage;
