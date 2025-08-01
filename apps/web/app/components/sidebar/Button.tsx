import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { SidebarLink } from 'app/types';

interface ButtonProps {
  link: SidebarLink;
  isActive: boolean;
}

const Button = ({ link, isActive }: ButtonProps) => {
  const btn = () => (
    <button
      className={`${isActive ? 'relative before:content-start before:absolute before:left-[-6px] before:w-full before:h-[110%] before:rounded-full before:border-l-2 before:border-red before:pointer-events-none bg-red text-white' : ''} w-full flex gap-3 items-center py-2 px-3 rounded-full cursor-pointer text-sm xl:text-base`}
    >
      <Image
        src={link.icon}
        alt={link.id + 'icon'}
        width={50}
        height={50}
        className={`w-5 2xl:w-6 h-auto object-center ${isActive ? 'invert-100' : ''}`}
      />
      {link.name}
    </button>
  );
  return link.url ? (
    <Link href={link.url} className="w-[96%]">
      {btn()}
    </Link>
  ) : (
    <div className="w-[96%]">{btn()}</div>
  );
};

export default Button;
