import React from 'react';
import Image from 'next/image';
import Logo from '@/icons/logo-mobile.svg';

const LogoMobile = ({ className = '' }: { className?: string }) => {
  return (
    <Image
      src={Logo}
      height={300}
      width={300}
      alt="kzwaska logo"
      className={`w-[50px] sm:w-16 md:w-20 h-auto object-contain ${className}`}
    />
  );
};

export default LogoMobile;
