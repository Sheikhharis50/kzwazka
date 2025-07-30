'use client';

import React from 'react';
import Logo from '@/icons/logo.svg';
import Image from 'next/image';
import { sidebarLinks } from 'app/data';
import { usePathname } from 'next/navigation';
import Button from './Button';
import { ProfileIcon, LogoutIcon } from '@/icons/sidebarIcons';
import Ribbon from '@/images/sidebar-ribbon.png';

const Sidebar = () => {
  const pathname = usePathname().split('/').pop();

  return (
    <div className="w-[20vw] max-w-[273px] bg-yellow rounded-[42px] h-full flex flex-col items-center pt-5 gap-4 xl:gap-6 2xl:gap-8 py-2 pe-2 relative overflow-hidden">
      <Image
        src={Ribbon}
        width={1000}
        height={1000}
        alt="ribbon"
        className="absolute bottom-0 right-0 w-4/5 h-1/5 pointer-events-none"
      />
      <Image
        src={Logo}
        width={500}
        height={500}
        alt="kzwazka logo"
        className="w-full max-w-[86px] xl:max-w-24 2xl:max-w-[105px] h-auto object-contain relative"
      />
      <div className="w-full flex flex-col justify-between h-full overflow-y-auto relative pt-1">
        <div className="flex flex-col gap-1 xl:gap-2 2xl:gap-3 w-full items-end">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.id;
            return <Button key={link.id} link={link} isActive={isActive} />;
          })}
        </div>
        <div className="flex flex-col gap-1 xl:gap-2 2xl:gap-3 w-full items-end">
          <Button
            link={{
              id: 'profile',
              name: 'User Profile',
              icon: ProfileIcon,
              url: '/dashboard/profile',
            }}
            isActive={pathname === 'profile'}
          />
          <Button
            link={{
              id: 'logout',
              name: 'Sign out',
              icon: LogoutIcon,
              url: '',
            }}
            isActive={false}
          />
        </div>
        <div />
      </div>
    </div>
  );
};

export default Sidebar;
