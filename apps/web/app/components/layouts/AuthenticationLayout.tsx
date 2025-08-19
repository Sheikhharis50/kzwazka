'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Ribbon from '@/images/login-ribbon.png';
import Logo from '@/components/Logo';
import LogoMobile from '@/components/LogoMobile';
import { usePreviousPath } from 'app/hooks/usePreviousPath';
import Paragraph from '@/components/Paragraph';
import Link from 'next/link';
import { Arrow } from '@/svgs';

interface AuthenticationLayoutProps {
  children: React.ReactNode;
  imageSrc: string | StaticImageData;
}

const AuthenticationLayout = ({
  children,
  imageSrc,
}: AuthenticationLayoutProps) => {
  const { goBack } = usePreviousPath();

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_2fr] w-full gap-5 md:gap-8 lg:gap-5 lg:h-dvh min-h-dvh lg:min-h-auto lg:overflow-hidden lg:p-1.5">
      <div className="h-fit lg:h-[calc(100dvh-12px)] bg-yellow rounded-b-3xl lg:rounded-[42px] overflow-hidden relative p-3 lg:p-5">
        <Image
          src={Ribbon}
          alt="ribbon"
          width={500}
          height={500}
          className="w-12 sm:w-16 md:w-20 lg:w-4/5 h-auto lg:h-3/5 absolute top-0 right-0"
        />
        <Image
          src={imageSrc}
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
            className="hidden lg:flex gap-1 items-center xl:text-lg text-black"
            onClick={goBack}
          >
            <Arrow />
            Go back
          </button>
        </div>
      </div>
      <div className="flex-1 lg:overflow-y-auto lg:h-[calc(100dvh-12px)] flex flex-col gap-10 lg:gap-5 items-center px-3 lg:px-0 relative">
        <div className="flex-1 flex flex-col justify-start lg:justify-center">
          {children}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1 pb-2 text-mute">
          <Paragraph text="By creating an account, you agree to our" />
          <Link href="/terms-and-condition" className="underline">
            <Paragraph text="terms and conditions" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationLayout;
