'use client';

import React from 'react';
import Image from 'next/image';
import { sidebarLinks } from 'constants/sidebar-links';
import { usePathname } from 'next/navigation';
import Button from './Button';
import { Profile, Logout } from 'svgs';
import Ribbon from '@/images/sidebar-ribbon.png';
import { useSettingsContext } from 'hooks/useSettingsContext';
import Logo from '@/components/ui/Logo';
import { useAuth } from 'hooks/useAuth';
import PermissionGuard from '@/components/guard/PermissionGuard';
import { SidebarLink } from 'types';

const Sidebar = () => {
  const { isSidebarVisible, hideSidebar } = useSettingsContext();
  const pathArr = usePathname()
    .split('/')
    .filter((path) => path);
  const pathname = pathArr.length > 1 ? pathArr[1] : pathArr[0];
  const { logout } = useAuth();

  return (
    <>
      <div
        className={`min-w-[240px] sm:min-w-[273px] bg-yellow rounded-e-3xl lg:rounded-[42px] h-full flex flex-col items-center pt-5 gap-4 xl:gap-6 2xl:gap-8 py-2 pe-2 absolute top-0 lg:relative overflow-hidden transition-transform z-50 ${isSidebarVisible ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'}`}
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
            {sidebarLinks.map((link: SidebarLink) => {
              const isActive = pathname === link.id;
              return (
                <PermissionGuard
                  key={link.id}
                  role={link?.access?.role}
                  permissions={link?.access?.permissions}
                  fallback={false}
                >
                  <Button link={link} isActive={isActive} />
                </PermissionGuard>
              );
            })}
          </div>
          <div className="flex flex-col gap-1 xl:gap-2 2xl:gap-3 w-full items-end">
            <Button
              link={{
                id: 'profile',
                name: 'User Profile',
                icon: <Profile className="size-5 md:size-6" />,
                url: '/dashboard/profile',
              }}
              isActive={pathname === 'profile'}
            />
            <Button
              link={{
                id: 'logout',
                name: 'Sign out',
                icon: <Logout className="size-5 md:size-6" />,
                url: '',
              }}
              isActive={false}
              onClick={logout}
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
