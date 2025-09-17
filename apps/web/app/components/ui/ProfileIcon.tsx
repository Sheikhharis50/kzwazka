import React from 'react';
import Image from 'next/image';
import { ProfileRound } from '@/svgs';

interface ProfileIconProps {
  photo_url: string | null;
  small?: boolean;
}

const ProfileIcon = ({ photo_url, small }: ProfileIconProps) => {
  return photo_url ? (
    <Image
      src={photo_url}
      alt="profile"
      height={50}
      width={50}
      className={`${small ? 'size-5' : 'size-7 md:size-10'} rounded-full`}
    />
  ) : (
    <div
      className={`${small ? 'size-5' : 'size-7 md:size-10'} rounded-full bg-border p-1`}
    >
      <ProfileRound className="w-full h-auto" />
    </div>
  );
};

export default ProfileIcon;
