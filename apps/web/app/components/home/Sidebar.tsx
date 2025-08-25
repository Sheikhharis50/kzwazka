import React from 'react';
import Logo from '@/icons/logo-home.png';
import { navLinks } from '@/constants/nav-links';
import Image from 'next/image';
import Link from 'next/link';
import HomeButton from '@/components/home/Button';
import { ProfileRound } from '@/svgs';

interface HomeSidebarProps {
  isOpen: boolean;
  setOpen: (state: boolean) => void;
}

const HomeSidebar = ({ isOpen, setOpen }: HomeSidebarProps) => {
  return (
    <>
      <div
        className={`h-dvh min-w-[240px] sm:min-w-[273px] bg-white rounded-e-3xl absolute left-0 top-0 z-50 flex flex-col gap-10 items-center py-5 transition-transform ${isOpen ? 'lg:hidden translate-x-0' : '-translate-x-full'}`}
      >
        <Image
          src={Logo}
          alt="Kzwazka logo"
          height={500}
          width={500}
          className="w-24 sm:w-28 h-auto object-contain"
        />
        <div className="flex flex-col text-sm md:text-base font-medium w-full">
          {navLinks.map((link) => (
            <Link
              href={link.url}
              key={link.id}
              className="p-3 border-b border-border hover:bg-red hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="px-3 w-full">
          <Link href={'/login'}>
            <HomeButton
              text="LOGOWANIE"
              icon={<ProfileRound />}
              className="!bg-transparent !text-black w-full mb-2"
            />
          </Link>
          <Link href={'/register'}>
            <HomeButton text="ZAPISZ SIĘ" className="w-full" />
          </Link>
        </div>
      </div>
      <div
        className={`size-full absolute left-0 top-0 bg-black/60 z-[49] ${isOpen ? 'lg:hidden flex' : 'hidden'}`}
        onClick={() => setOpen(false)}
      />
    </>
  );
};

export default HomeSidebar;
