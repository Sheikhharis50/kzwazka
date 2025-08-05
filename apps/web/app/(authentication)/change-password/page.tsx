import Heading from '@/components/Heading';
import Input from '@/components/Input';
import Paragraph from '@/components/Paragraph';
import Image from 'next/image';
import React from 'react';
import CheckIcon from '@/icons/check.png';
import { passwordRules } from 'app/constants/password-rules';
import Button from '@/components/Button';

const ChangePasswordPage = () => {
  return (
    <>
      <Heading text="Change Password " className="text-center mb-1 2xl:mb-2" />
      <Paragraph
        text="Update your password by filling in the fields below:"
        mute
        className="text-center mb-5 xl:mb-8 2xl:mb-10"
      />
      <form action="" className="space-y-3">
        <Input type="password" id="current-password" label="Current Password" />
        <Input type="password" id="new-password" label="New Password" />
        <Input
          type="password"
          id="confirm-password"
          label="Confirm New Password"
        />
        <div className="mb-8 xl:mb-12 2xl:mb-14">
          {passwordRules.map((rule, index) => (
            <div className="flex gap-1 items-center" key={`rule-${index}`}>
              <Image
                src={CheckIcon}
                alt="check icon"
                height={50}
                width={50}
                className="size-3 md:size-4 object-contain"
              />
              <Paragraph text={rule} mute />
            </div>
          ))}
        </div>
        <Button
          text="Update Password"
          type="submit"
          className="w-3/5 mx-auto"
        />
      </form>
    </>
  );
};

export default ChangePasswordPage;
