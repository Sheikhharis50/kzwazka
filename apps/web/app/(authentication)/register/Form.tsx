'use client';

import React from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Image from 'next/image';
import Link from 'next/link';
import Paragraph from '@/components/Paragraph';
import {
  FirstStepCleanData,
  FirstStepFormData,
  firstStepSchema,
  SecondStepFormData,
  secondStepSchema,
} from './schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterPayload } from 'api/auth/type';
import { useAuth } from '@/hooks/useAuth';
import { Trash } from '@/svgs';

interface RegisterFormProps {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  isFirstStep: boolean;
}

const RegisterForm = ({ setStep, isFirstStep }: RegisterFormProps) => {
  const {
    register: registerFirst,
    handleSubmit: handleSubmitFirst,
    formState: { errors: errorsFirst },
    watch: watchFirst,
  } = useForm<FirstStepFormData>({
    resolver: zodResolver(firstStepSchema),
    mode: 'onChange',
  });

  const {
    register: registerSecond,
    handleSubmit: handleSubmitSecond,
    formState: { errors: errorsSecond },
  } = useForm<SecondStepFormData>({
    resolver: zodResolver(secondStepSchema),
    defaultValues: {
      dob: '',
      first_name: '',
      last_name: '',
    },
  });

  const [formData, setFormData] = React.useState<FirstStepCleanData>();
  const [preview, setPreview] = React.useState<string | null>(null);
  const [base64Data, setBase64Data] = React.useState<string>('');
  const [photoError, setPhotoError] = React.useState<string>('');
  const { register, isLoading } = useAuth();
  const passwordValue = watchFirst('password');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleStep1 = (formData: FirstStepFormData) => {
    const data: FirstStepCleanData = {
      parent_first_name: formData.parent_first_name,
      parent_last_name: formData.parent_last_name,
      phone: formData.phone,
      password: formData.password,
      email: formData.email,
    };
    setFormData(data);
    setStep(2);
  };

  const handleStep2 = (data: SecondStepFormData) => {
    const fullData: RegisterPayload = {
      ...formData!,
      ...data,
      photo_url: base64Data || '',
    };
    register(fullData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Only PNG, JPG, and JPEG files are allowed');
      e.target.value = '';
      return;
    }

    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      setPhotoError('File size must not exceed 500KB');
      e.target.value = '';
      return;
    }

    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Data(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const handlePhotoDelete = () => {
    setPreview(null);
    setBase64Data('');
    setPhotoError('');
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
      <form
        onSubmit={handleSubmitFirst(handleStep1)}
        className={`space-y-3 max-w-[90vw] min-w-[90vw] sm:max-w-[340px] sm:min-w-[340px] xl:max-w-sm xl:min-w-sm mx-auto ${isFirstStep ? '' : 'hidden'}`}
      >
        <Input
          label="Email*"
          type="email"
          placeholder="Enter your email"
          id="email"
          {...registerFirst('email')}
          error={errorsFirst.email?.message}
        />
        <Input
          label="Phone Number*"
          type="tel"
          placeholder="031207544744"
          id="phone-number"
          {...registerFirst('phone')}
          error={errorsFirst.phone?.message}
        />
        <Input
          label="Password*"
          type="password"
          placeholder="Enter your password"
          id="password"
          {...registerFirst('password')}
          error={errorsFirst.password?.message}
        />
        <Input
          label="Confirm Password*"
          type="password"
          placeholder="Confirm your password"
          id="confirm-password"
          {...registerFirst('confirm_password', {
            validate: (val) => val === passwordValue || "Passwords don't match",
          })}
          error={errorsFirst.confirm_password?.message}
        />
        <Input
          label="Parent's First Name"
          type="text"
          placeholder="Enter first name"
          id="parent-first-name"
          {...registerFirst('parent_first_name')}
          error={errorsFirst.parent_first_name?.message}
        />
        <Input
          label="Parent's Last Name"
          type="text"
          placeholder="Enter last name"
          id="parent-last-name"
          classes={{ root: 'mb-5 xl:mb-8 2xl:mb-10' }}
          {...registerFirst('parent_last_name')}
          error={errorsFirst.parent_last_name?.message}
        />
        <Button text="Next" type="submit" className="w-4/5 mx-auto mb-1" />
      </form>
      <form
        onSubmit={handleSubmitSecond(handleStep2)}
        className={`space-y-3 min-w-[90vw] sm:min-w-[340px] xl:min-w-sm mx-auto ${isFirstStep ? 'hidden' : ''}`}
      >
        <Input
          label="Kid First Name*"
          type="text"
          placeholder="Enter first name"
          id="kid-first-name"
          {...registerSecond('first_name')}
          error={errorsSecond.first_name?.message}
        />
        <Input
          label="Kid Last Name*"
          type="text"
          placeholder="Enter last name"
          id="kid-last-name"
          {...registerSecond('last_name')}
          error={errorsSecond.last_name?.message}
        />
        <Input
          label="Kid Age*"
          type="date"
          id="kid-age"
          placeholder="Select age"
          {...registerSecond('dob')}
          error={errorsSecond.dob?.message}
        />
        <div>
          <Input
            label="Kid Photo"
            accept=".png,.jpg,.jpeg"
            type="file"
            id="kid-image"
            hidden
            classes={{ root: 'mb-1 pointer-events-none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="mb-5 xl:mb-8 2xl:mb-10">
            <div
              className={`relative w-36 h-20 flex items-center justify-center rounded-lg ${!preview ? 'border-dashed border border-border' : ''} overflow-hidden cursor-pointer`}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <>
                  <Image
                    src={preview}
                    alt="Preview"
                    width={144}
                    height={80}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      handlePhotoDelete();
                      e.stopPropagation();
                    }}
                  >
                    <Trash className="absolute right-1.5 top-1.5 text-white font-bold" />
                  </button>
                </>
              ) : (
                <Paragraph text="+ Upload Image" />
              )}
            </div>
            <span className={`text-[10px] md:text-xs xl:text-sm text-red`}>
              {photoError}
            </span>
          </div>
          <Button
            text="Continue"
            type="submit"
            className="w-4/5 mx-auto mb-1"
            isLoading={isLoading}
          />
        </div>
      </form>
      <div className="flex items-center justify-center gap-1">
        <Paragraph text="Already have account?" mute />
        <Link href="/login">
          <Paragraph text="Login here" className="underline" />
        </Link>
      </div>
    </>
  );
};

export default RegisterForm;
