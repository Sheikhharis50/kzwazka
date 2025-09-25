'use client';
import React, { useRef, useState } from 'react';
import ProfileIcon from '../ui/ProfileIcon';
import { useUser } from 'hooks/useUser';
import Paragraph from '../ui/Paragraph';
import { Previous } from 'svgs';
import { safeJoin } from 'utils/safeJoin';
import { useClickOutside } from 'hooks/useClickOutside';
import { useRouter } from 'next/navigation';
import { useAuth } from 'hooks/useAuth';

const ProfileDropdown = () => {
  const { user } = useUser();
  const { logout } = useAuth();
  const [isOptionsVisible, setOptionsVisibility] = useState(false);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useClickOutside(optionsRef, () => setOptionsVisibility(false));

  return (
    <div className="relative">
      <div
        className="rounded-2xl border-[1.33px] border-[#BFBFBF57] bg-[#F8FAFC] flex items-center gap-2 p-1.5 pr-5 relative cursor-pointer"
        onClick={() => setOptionsVisibility(!isOptionsVisible)}
        id="profileDropdownButton"
        data-dropdown-toggle="profileDropdown"
      >
        <ProfileIcon photo_url={user?.photo_url || ''} />
        <Paragraph
          text={safeJoin([user?.first_name, user?.last_name], ' ', 'User')}
          className="max-w-[100px] truncate"
        />
        <Previous className="-rotate-90 w-3" />
      </div>
      {isOptionsVisible && (
        <div
          ref={optionsRef}
          className="absolute w-full min-w-fit bg-white z-10 rounded-md shadow-md mt-2 text-sm 2xl:text-base"
        >
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="border-b border-border p-2 text-nowrap w-full hover:bg-smoke"
          >
            Profile Settings
          </button>
          <button onClick={logout} className="p-2 w-full hover:bg-smoke">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
