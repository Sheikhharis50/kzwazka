import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Input from '@/components/ui/Input';
import AuthenticationLayout from '@/components/layouts/AuthenticationLayout';
import Paragraph from '@/components/ui/Paragraph';
import React from 'react';
import ForgotPasswordImage from '@/images/forgot-password.png';

const ForgotPasswordPage = () => {
  return (
    <AuthenticationLayout imageSrc={ForgotPasswordImage}>
      <Heading
        text="Forgot Your Password?"
        className="text-center mb-1 2xl:mb-2"
      />
      <Paragraph
        text={`No worries! Enter your email address and we'll send you instructions to reset your password.`}
        mute
        className="text-center max-w-[85vw] xs:max-w-4/5 sm:max-w-2/3 mx-auto mb-10 md:mb-16 xl:mb-20 2xl:mb-24"
      />
      <form
        action=""
        className="min-w-[90vw] xs:min-w-[300px] md:min-w-[340px] xl:min-w-sm mx-auto space-y-8 md:space-y-12"
      >
        <Input type="email" label="Email Address" id="email" />
        <Button
          type="submit"
          text=" Send Reset Link"
          className="w-3/5 mx-auto"
        />
      </form>
    </AuthenticationLayout>
  );
};

export default ForgotPasswordPage;
