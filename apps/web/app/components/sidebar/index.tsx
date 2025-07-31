'use client';

import React from 'react';
import Image from 'next/image';
import { sidebarLinks } from 'app/data';
import { usePathname } from 'next/navigation';
import Button from './Button';
import { ProfileIcon, LogoutIcon } from '@/icons/sidebarIcons';
import Ribbon from '@/images/sidebar-ribbon.png';
import { useAppContext } from 'app/context/appContext';
import Logo from '@/components/Logo';

const Sidebar = () => {
  const { isSidebarVisible, hideSidebar } = useAppContext();
  const pathname = usePathname().split('/').pop();

  return (
    <>
      <div
        className={`w-full lg:w-[20vw] max-w-[240px] sm:max-w-[273px] bg-yellow rounded-e-3xl lg:rounded-[42px] h-full flex flex-col items-center pt-5 gap-4 xl:gap-6 2xl:gap-8 py-2 pe-2 absolute top-0 lg:relative overflow-hidden transition-transform z-50 ${isSidebarVisible ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'}`}
      >
        <Image
          src={Ribbon}
          width={1000}
          height={1000}
          alt="ribbon"
          className="absolute bottom-0 right-0 w-4/5 h-1/5 pointer-events-none"
        />
        <Logo />
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
      {/* blured background below lg to prevent interaction */}
      <div
        className={`size-full absolute top-0 left-0 bg-black/60 z-[49] ${isSidebarVisible ? 'lg:hidden' : 'hidden'}`}
        onClick={hideSidebar}
      />
    </>
  );
};

export default Sidebar;
