'use client';
import Image from 'next/image';
import React from 'react';
import MenuIcon from '@/icons/menu.svg';
import Logo from '@/icons/logo-mobile.svg';
import { useAppContext } from 'app/context/appContext';

const Navbar = () => {
  const { toggleSidebar: toggleNavbar } = useAppContext();
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
      <Image
        src={Logo}
        height={300}
        width={300}
        alt="menu"
        className="w-16 md:w-20 h-auto object-contain"
      />
    </div>
  );
};

export default Navbar;
