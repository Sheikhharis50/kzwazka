'use client';
import Image from 'next/image';
import React from 'react';
import MenuIcon from '@/icons/menu.svg';
import { useSettingsContext } from '@/hooks/useSettingsContext';
import LogoMobile from './LogoMobile';

const Navbar = () => {
  const { toggleSidebar: toggleNavbar } = useSettingsContext();
  return (
    <div className="px-3 md:px-5 py-3 flex justify-between items-center bg-yellow lg:hidden">
      <Image
        src={MenuIcon}
        height={100}
        width={100}
        alt="menu"
        className="w-8 md:w-10 h-auto object-contain"
        onClick={toggleNavbar}
      />
      <LogoMobile />
    </div>
  );
};

export default Navbar;
